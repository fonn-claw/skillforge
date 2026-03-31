"use client";

import { useEffect, useState, useCallback, useRef, createContext } from "react";
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
import { AnimatePresence } from "framer-motion";

import HexagonNode from "./HexagonNode";
import PrerequisiteEdge from "./PrerequisiteEdge";
import NodeDetailPanel from "./NodeDetailPanel";
import {
  computeNodeUnlockStatus,
  computeEdgeStatus,
  MASTERY_ORDER,
  type MasteryLevel,
} from "@/lib/tree-utils";

// CRITICAL: Define outside component for stable reference
const nodeTypes = { hexagon: HexagonNode } as const;
const edgeTypes = { prerequisite: PrerequisiteEdge } as const;

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

function toFlowNodes(
  apiNodes: ApiNode[],
  apiEdges: ApiEdge[],
  masteryMap: Map<string, MasteryLevel>,
  justUnlockedIds?: Set<string>
): Node[] {
  const unlockStatus = computeNodeUnlockStatus(apiNodes, apiEdges, masteryMap);

  return apiNodes.map((n) => {
    const status = unlockStatus.get(n.id);
    const mastery = n.mastery?.currentLevel ?? "locked";
    const canUnlock =
      mastery === "locked" && (status?.shouldBeUnlocked ?? false);
    const justUnlocked = justUnlockedIds?.has(n.id) ?? false;

    return {
      id: n.id,
      type: "hexagon",
      position: { x: n.positionX, y: n.positionY },
      data: {
        name: n.name,
        mastery,
        iconKey: n.iconKey,
        branchName: n.branchName,
        description: n.description,
        xpCurrent: n.mastery?.xpCurrent ?? 0,
        xpRequired: n.mastery?.xpRequired ?? 100,
        canUnlock,
        justUnlocked,
      },
    };
  });
}

function toFlowEdges(
  apiEdges: ApiEdge[],
  masteryMap: Map<string, MasteryLevel>,
  justUnlockedIds?: Set<string>
): Edge[] {
  return apiEdges.map((e) => {
    let status = computeEdgeStatus(e, masteryMap);

    // Override to 'unlocking' for edges targeting a just-unlocked node
    if (justUnlockedIds?.has(e.targetNodeId) && status === "unlocking") {
      status = "unlocking";
    }

    return {
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      type: "prerequisite",
      data: { status, requiredMasteryLevel: e.requiredMasteryLevel },
    };
  });
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

  // Track previous lock states to detect unlock transitions
  const prevLockMapRef = useRef<Map<string, boolean>>(new Map());
  // Track previous mastery levels to detect mastery changes
  const prevMasteryMapRef = useRef<Map<string, MasteryLevel>>(new Map());
  // Store raw API data for re-rendering after animation timeout
  const apiDataRef = useRef<{ nodes: ApiNode[]; edges: ApiEdge[] } | null>(
    null
  );

  const refreshTree = useCallback(async () => {
    const [apiNodes, apiEdges]: [ApiNode[], ApiEdge[]] = await Promise.all([
      fetch("/api/tree/nodes").then((r) => r.json()),
      fetch("/api/tree/edges").then((r) => r.json()),
    ]);

    const masteryMap = buildMasteryMap(apiNodes);
    apiDataRef.current = { nodes: apiNodes, edges: apiEdges };

    // Detect nodes that just transitioned from locked to unlocked
    const justUnlockedIds = new Set<string>();
    const prevMap = prevLockMapRef.current;

    for (const n of apiNodes) {
      const currentMastery = n.mastery?.currentLevel ?? "locked";
      const wasLocked = prevMap.get(n.id) ?? true;
      const isNowUnlocked = currentMastery !== "locked";

      if (wasLocked && isNowUnlocked && prevMap.size > 0) {
        justUnlockedIds.add(n.id);
      }
    }

    // Detect mastery level changes (for potential future animation)
    const masteryChangedIds = new Set<string>();
    const prevMastery = prevMasteryMapRef.current;
    if (prevMastery.size > 0) {
      for (const n of apiNodes) {
        const current = n.mastery?.currentLevel ?? "locked";
        const previous = prevMastery.get(n.id);
        if (previous && previous !== current) {
          masteryChangedIds.add(n.id);
        }
      }
    }

    // Update previous lock state tracking
    const newLockMap = new Map<string, boolean>();
    for (const n of apiNodes) {
      newLockMap.set(
        n.id,
        (n.mastery?.currentLevel ?? "locked") === "locked"
      );
    }
    prevLockMapRef.current = newLockMap;
    prevMasteryMapRef.current = masteryMap;

    // Render with animation flags if any just-unlocked nodes
    const unlockSet = justUnlockedIds.size > 0 ? justUnlockedIds : undefined;
    setNodes(toFlowNodes(apiNodes, apiEdges, masteryMap, unlockSet));
    setEdges(toFlowEdges(apiEdges, masteryMap, unlockSet));

    // After 800ms, clear animation flags
    if (justUnlockedIds.size > 0) {
      setTimeout(() => {
        if (apiDataRef.current) {
          const { nodes: an, edges: ae } = apiDataRef.current;
          const mm = buildMasteryMap(an);
          setNodes(toFlowNodes(an, ae, mm));
          setEdges(toFlowEdges(ae, mm));
        }
      }, 800);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    refreshTree()
      .catch((err) => {
        console.error("Failed to load skill tree:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshTree]);

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
        <AnimatePresence>
          {selectedNodeId && (
            <NodeDetailPanel
              nodeId={selectedNodeId}
              nodesData={nodes}
              edgesData={edges}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </TreeSelectionContext.Provider>
  );
}
