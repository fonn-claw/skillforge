"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";

type NodeData = {
  id: string;
  name: string;
  description: string;
  branchName: string | null;
  positionX: number;
  positionY: number;
  iconKey: string | null;
};

type EdgeData = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  requiredMasteryLevel: string;
};

type ChallengeData = {
  id: string;
  title: string;
  type: string;
  masteryLevel: string;
  description: string | null;
};

type Props = {
  node?: NodeData;
  allNodes: NodeData[];
  onSave: () => void;
  onCancel: () => void;
};

const MASTERY_LEVELS = ["novice", "apprentice", "journeyman", "expert", "master"];
const CHALLENGE_TYPES = ["quiz", "project_submission"];

const inputCls =
  "w-full bg-anvil-gray border border-steel-edge text-moonlight rounded-lg p-2 text-sm focus:border-arcane-blue/50 focus:outline-none";
const labelCls = "text-mist text-sm uppercase tracking-wide mb-1 block";

export default function NodeEditor({ node, allNodes, onSave, onCancel }: Props) {
  const [name, setName] = useState(node?.name ?? "");
  const [description, setDescription] = useState(node?.description ?? "");
  const [branchName, setBranchName] = useState(node?.branchName ?? "");
  const [positionX, setPositionX] = useState(node?.positionX ?? 0);
  const [positionY, setPositionY] = useState(node?.positionY ?? 0);
  const [saving, setSaving] = useState(false);

  // Edge management (existing nodes only)
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [newEdgeTarget, setNewEdgeTarget] = useState("");
  const [newEdgeMastery, setNewEdgeMastery] = useState("novice");

  // Challenge management (existing nodes only)
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [newChTitle, setNewChTitle] = useState("");
  const [newChType, setNewChType] = useState("quiz");
  const [newChMastery, setNewChMastery] = useState("novice");
  const [newChDesc, setNewChDesc] = useState("");

  useEffect(() => {
    if (!node) return;
    // Fetch edges for this node
    fetch("/api/tree/edges")
      .then((r) => r.json())
      .then((allEdges: EdgeData[]) => {
        setEdges(
          allEdges.filter(
            (e) => e.sourceNodeId === node.id || e.targetNodeId === node.id
          )
        );
      })
      .catch(() => {});

    // Fetch challenges for this node
    fetch(`/api/tree/nodes/${node.id}/challenges`)
      .then((r) => r.json())
      .then((data: ChallengeData[]) => setChallenges(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [node]);

  async function handleSave() {
    setSaving(true);
    try {
      const body = { name, description, branchName: branchName || null, positionX, positionY };
      if (node) {
        await fetch(`/api/admin/nodes/${node.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/admin/nodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      onSave();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEdge(edgeId: string) {
    await fetch(`/api/admin/edges/${edgeId}`, { method: "DELETE" });
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  }

  async function handleAddEdge() {
    if (!newEdgeTarget || !node) return;
    const res = await fetch("/api/admin/edges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceNodeId: node.id,
        targetNodeId: newEdgeTarget,
        requiredMasteryLevel: newEdgeMastery,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setEdges((prev) => [...prev, created]);
      setNewEdgeTarget("");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add edge");
    }
  }

  async function handleDeleteChallenge(id: string) {
    await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAddChallenge() {
    if (!newChTitle || !node) return;
    const res = await fetch("/api/admin/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodeId: node.id,
        masteryLevel: newChMastery,
        type: newChType,
        title: newChTitle,
        description: newChDesc || null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setChallenges((prev) => [...prev, created]);
      setNewChTitle("");
      setNewChDesc("");
      setShowAddChallenge(false);
    }
  }

  function getNodeName(id: string) {
    return allNodes.find((n) => n.id === id)?.name ?? id.slice(0, 8);
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg text-moonlight">
        {node ? "Edit Node" : "New Node"}
      </h3>

      {/* Basic fields */}
      <div>
        <label className={labelCls}>Name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${inputCls} min-h-[80px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Branch Name</label>
        <input
          className={inputCls}
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Position X</label>
          <input
            type="number"
            className={inputCls}
            value={positionX}
            onChange={(e) => setPositionX(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>Position Y</label>
          <input
            type="number"
            className={inputCls}
            value={positionY}
            onChange={(e) => setPositionY(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Edges section (existing node only) */}
      {node && (
        <div>
          <label className={labelCls}>Prerequisite Edges</label>
          {edges.length === 0 ? (
            <p className="text-mist/70 text-xs mb-2">No edges</p>
          ) : (
            <div className="space-y-1 mb-2">
              {edges.map((edge) => (
                <div
                  key={edge.id}
                  className="flex items-center justify-between bg-deep-void rounded-lg px-3 py-1.5 text-xs"
                >
                  <span className="text-moonlight">
                    {getNodeName(edge.sourceNodeId)} &rarr;{" "}
                    {getNodeName(edge.targetNodeId)}{" "}
                    <span className="text-mist capitalize">
                      ({edge.requiredMasteryLevel})
                    </span>
                  </span>
                  <button
                    onClick={() => handleDeleteEdge(edge.id)}
                    className="text-mist hover:text-ember transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <select
              className={`${inputCls} flex-1`}
              value={newEdgeTarget}
              onChange={(e) => setNewEdgeTarget(e.target.value)}
            >
              <option value="">Select target node...</option>
              {allNodes
                .filter((n) => n.id !== node.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
            </select>
            <select
              className={`${inputCls} w-28`}
              value={newEdgeMastery}
              onChange={(e) => setNewEdgeMastery(e.target.value)}
            >
              {MASTERY_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddEdge}
              className="px-2 py-2 bg-arcane-blue/20 text-arcane-blue rounded-lg hover:bg-arcane-blue/30 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Challenges section (existing node only) */}
      {node && (
        <div>
          <label className={labelCls}>Challenges</label>
          {challenges.length === 0 ? (
            <p className="text-mist/70 text-xs mb-2">No challenges</p>
          ) : (
            <div className="space-y-1 mb-2">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between bg-deep-void rounded-lg px-3 py-1.5 text-xs"
                >
                  <span className="text-moonlight">
                    {ch.title}{" "}
                    <span className="text-mist capitalize">
                      ({ch.type === "project_submission" ? "project" : ch.type},{" "}
                      {ch.masteryLevel})
                    </span>
                  </span>
                  <button
                    onClick={() => handleDeleteChallenge(ch.id)}
                    className="text-mist hover:text-ember transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAddChallenge ? (
            <div className="space-y-2 bg-deep-void rounded-lg p-3">
              <input
                className={inputCls}
                placeholder="Challenge title"
                value={newChTitle}
                onChange={(e) => setNewChTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className={inputCls}
                  value={newChType}
                  onChange={(e) => setNewChType(e.target.value)}
                >
                  {CHALLENGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "project_submission" ? "Project" : "Quiz"}
                    </option>
                  ))}
                </select>
                <select
                  className={inputCls}
                  value={newChMastery}
                  onChange={(e) => setNewChMastery(e.target.value)}
                >
                  {MASTERY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                placeholder="Description (optional)"
                value={newChDesc}
                onChange={(e) => setNewChDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddChallenge}
                  className="px-3 py-1.5 text-xs bg-verdant/20 text-verdant rounded-lg hover:bg-verdant/30 transition-colors"
                >
                  Add Challenge
                </button>
                <button
                  onClick={() => setShowAddChallenge(false)}
                  className="px-3 py-1.5 text-xs text-mist hover:text-moonlight transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddChallenge(true)}
              className="flex items-center gap-1 text-xs text-arcane-blue hover:text-arcane-blue/80 transition-colors"
            >
              <Plus size={14} /> Add Challenge
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !name || !description}
          className="flex-1 px-4 py-2 text-sm font-heading bg-arcane-blue text-moonlight rounded-lg hover:bg-arcane-blue/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : node ? "Update Node" : "Create Node"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-mist hover:text-moonlight transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
