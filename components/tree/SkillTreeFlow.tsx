"use client";

import { useEffect, useState, useCallback, createContext } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import HexagonNode from "./HexagonNode";
import PrerequisiteEdge from "./PrerequisiteEdge";

// CRITICAL: Define outside component for stable reference
const nodeTypes = { hexagon: HexagonNode } as const;
const edgeTypes = { prerequisite: PrerequisiteEdge } as const;

const MASTERY_ORDER = [
  "locked",
  "novice",
  "apprentice",
  "journeyman",
  "expert",
  "master",
] as const;

type MasteryLevel = (typeof MASTERY_ORDER)[number];

// -- Context for selected node (used by NodeDetailPanel in Plan 02-02) --
export const TreeSelectionContext = createContext<{
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}>({
  selectedNodeId: null,
  setSelectedNodeId: () => {},
});

// -- API types --
type ApiNode = {
  id: string;
  name: string;
  description: string;
  iconKey: string | null;
  positionX: number;
  positionY: number;
  branchName: string | null;
  mastery: {
    currentLevel: MasteryLevel;
    xpCurrent: number;
    xpRequired: number;
  } | null;
};

type ApiEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  requiredMasteryLevel: MasteryLevel;
};

// -- Helpers --

function getMasteryIndex(level: MasteryLevel): number {
  return MASTERY_ORDER.indexOf(level);
}

function getEdgeStatus(
  edge: ApiEdge,
  masteryMap: Map<string, MasteryLevel>
): "inactive" | "active" | "completed" {
  const sourceMastery = masteryMap.get(edge.sourceNodeId) ?? "locked";
  const targetMastery = masteryMap.get(edge.targetNodeId) ?? "locked";

  // If target already has mastery (not locked), the path is completed
  if (targetMastery !== "locked") {
    return "completed";
  }

  // If source meets the required level, path is active
  if (getMasteryIndex(sourceMastery) >= getMasteryIndex(edge.requiredMasteryLevel)) {
    return "active";
  }

  return "inactive";
}

function getMasteryColor(mastery: string | undefined): string {
  switch (mastery) {
    case "novice":
      return "rgba(74,124,255,0.4)";
    case "apprentice":
      return "#4A7CFF";
    case "journeyman":
      return "#14B8A6";
    case "expert":
      return "#F0A830";
    case "master":
      return "#FFF7DB";
    default:
      return "#2A3150";
  }
}

function toFlowNodes(apiNodes: ApiNode[]): Node[] {
  return apiNodes.map((n) => ({
    id: n.id,
    type: "hexagon",
    position: { x: n.positionX, y: n.positionY },
    data: {
      name: n.name,
      mastery: n.mastery?.currentLevel ?? "locked",
      iconKey: n.iconKey,
      branchName: n.branchName,
      description: n.description,
      xpCurrent: n.mastery?.xpCurrent ?? 0,
      xpRequired: n.mastery?.xpRequired ?? 100,
    },
  }));
}

function toFlowEdges(
  apiEdges: ApiEdge[],
  masteryMap: Map<string, MasteryLevel>
): Edge[] {
  return apiEdges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    type: "prerequisite",
    data: {
      status: getEdgeStatus(e, masteryMap),
    },
  }));
}

function buildMasteryMap(apiNodes: ApiNode[]): Map<string, MasteryLevel> {
  const map = new Map<string, MasteryLevel>();
  for (const n of apiNodes) {
    map.set(n.id, n.mastery?.currentLevel ?? "locked");
  }
  return map;
}

// -- Component --

export default function SkillTreeFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tree/nodes").then((r) => r.json()),
      fetch("/api/tree/edges").then((r) => r.json()),
    ])
      .then(([apiNodes, apiEdges]: [ApiNode[], ApiEdge[]]) => {
        const masteryMap = buildMasteryMap(apiNodes);
        setNodes(toFlowNodes(apiNodes));
        setEdges(toFlowEdges(apiEdges, masteryMap));
      })
      .catch((err) => {
        console.error("Failed to load skill tree:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-void-black">
        <p className="text-mist animate-pulse text-lg">Loading skill tree...</p>
      </div>
    );
  }

  return (
    <TreeSelectionContext.Provider value={{ selectedNodeId, setSelectedNodeId }}>
      <div className="relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          minZoom={0.3}
          maxZoom={2.0}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          className="bg-void-black"
        >
          <MiniMap
            style={{ width: 160, height: 120 }}
            nodeColor={(node) =>
              getMasteryColor(
                (node.data as Record<string, unknown>)?.mastery as
                  | string
                  | undefined
              )
            }
            maskColor="rgba(10, 14, 23, 0.8)"
            className="!bg-forge-gray/80 !border-steel-edge"
          />
          <Controls
            className="!bg-forge-gray !border-steel-edge !rounded"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </TreeSelectionContext.Provider>
  );
}
