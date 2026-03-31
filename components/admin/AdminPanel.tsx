"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Trash2, Plus } from "lucide-react";
import NodeEditor from "./NodeEditor";
import AnalyticsDashboard from "./AnalyticsDashboard";

type NodeData = {
  id: string;
  name: string;
  description: string;
  branchName: string | null;
  positionX: number;
  positionY: number;
  iconKey: string | null;
};

type Tab = "nodes" | "analytics";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminPanel({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("nodes");
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNode, setEditingNode] = useState<NodeData | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);

  function fetchNodes() {
    setLoading(true);
    fetch("/api/tree/nodes")
      .then((r) => r.json())
      .then((data: NodeData[]) => setNodes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (open) fetchNodes();
  }, [open]);

  async function handleDeleteNode(id: string) {
    if (!window.confirm("Delete this node? This will also remove its edges and challenges.")) return;
    await fetch(`/api/admin/nodes/${id}`, { method: "DELETE" });
    fetchNodes();
  }

  function handleEditNode(node: NodeData) {
    setEditingNode(node);
    setShowEditor(true);
  }

  function handleAddNode() {
    setEditingNode(undefined);
    setShowEditor(true);
  }

  function handleEditorSave() {
    setShowEditor(false);
    setEditingNode(undefined);
    fetchNodes();
  }

  function handleEditorCancel() {
    setShowEditor(false);
    setEditingNode(undefined);
  }

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-heading transition-colors ${
      tab === t
        ? "text-arcane-blue border-b-2 border-arcane-blue"
        : "text-mist hover:text-moonlight"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: -420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -420, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-12 left-0 w-[420px] h-[calc(100vh-48px)] z-40 bg-[#151A28]/95 backdrop-blur-[20px] border-r border-steel-edge overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-heading text-lg text-moonlight">Admin Panel</h2>
            <button
              onClick={onClose}
              className="text-mist hover:text-moonlight transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-steel-edge px-4">
            <button className={tabCls("nodes")} onClick={() => setTab("nodes")}>
              Nodes
            </button>
            <button className={tabCls("analytics")} onClick={() => setTab("analytics")}>
              Analytics
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {tab === "nodes" && (
              <>
                {showEditor ? (
                  <NodeEditor
                    node={editingNode}
                    allNodes={nodes}
                    onSave={handleEditorSave}
                    onCancel={handleEditorCancel}
                  />
                ) : (
                  <>
                    <button
                      onClick={handleAddNode}
                      className="flex items-center gap-2 w-full px-4 py-2 mb-3 text-sm font-heading bg-arcane-blue/20 text-arcane-blue rounded-lg hover:bg-arcane-blue/30 transition-colors"
                    >
                      <Plus size={16} /> Add Node
                    </button>

                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-anvil-gray rounded-lg h-12 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {nodes.map((node) => (
                          <div
                            key={node.id}
                            className="flex items-center justify-between bg-anvil-gray rounded-lg px-3 py-2 border border-steel-edge hover:border-arcane-blue/30 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-moonlight text-sm font-medium truncate">
                                {node.name}
                              </p>
                              {node.branchName && (
                                <p className="text-mist text-xs truncate">
                                  {node.branchName}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                onClick={() => handleEditNode(node)}
                                className="p-1.5 text-mist hover:text-arcane-blue transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteNode(node.id)}
                                className="p-1.5 text-mist hover:text-ember transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {tab === "analytics" && <AnalyticsDashboard />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
