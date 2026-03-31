/**
 * Skill tree unlock computation utilities.
 *
 * Pure functions that determine node lock/unlock status and edge animation
 * states based on prerequisite mastery levels. No React dependencies.
 */

export const MASTERY_ORDER = [
  "locked",
  "novice",
  "apprentice",
  "journeyman",
  "expert",
  "master",
] as const;

export type MasteryLevel = (typeof MASTERY_ORDER)[number];

/** Return the numeric index of a mastery level (locked=0 ... master=5). */
export function masteryIndex(level: MasteryLevel): number {
  return MASTERY_ORDER.indexOf(level);
}

/**
 * Does `current` meet or exceed the `required` mastery level?
 * e.g. meetsRequirement('expert', 'novice') => true
 */
export function meetsRequirement(
  current: MasteryLevel,
  required: MasteryLevel
): boolean {
  return masteryIndex(current) >= masteryIndex(required);
}

// -- Node unlock computation --

export interface MinimalNode {
  id: string;
}

export interface MinimalEdge {
  sourceNodeId: string;
  targetNodeId: string;
  requiredMasteryLevel: MasteryLevel;
}

export interface NodeUnlockStatus {
  /** Whether the node currently has mastery (not locked). */
  isUnlocked: boolean;
  /** Whether all prerequisite conditions are met (parents at required levels). */
  shouldBeUnlocked: boolean;
}

/**
 * For every node, compute whether it is currently unlocked and whether its
 * prerequisites are satisfied.
 *
 * A node with no incoming edges (root) is always considered "shouldBeUnlocked".
 * A node with incoming edges is "shouldBeUnlocked" only when ALL source nodes
 * meet their respective requiredMasteryLevel.
 */
export function computeNodeUnlockStatus(
  nodes: MinimalNode[],
  edges: MinimalEdge[],
  masteryMap: Map<string, MasteryLevel>
): Map<string, NodeUnlockStatus> {
  // Pre-build a map of incoming edges per node (target -> edges[])
  const incomingEdges = new Map<string, MinimalEdge[]>();
  for (const edge of edges) {
    const existing = incomingEdges.get(edge.targetNodeId) ?? [];
    existing.push(edge);
    incomingEdges.set(edge.targetNodeId, existing);
  }

  const result = new Map<string, NodeUnlockStatus>();

  for (const node of nodes) {
    const currentMastery = masteryMap.get(node.id) ?? "locked";
    const isUnlocked = currentMastery !== "locked";

    const incoming = incomingEdges.get(node.id);
    if (!incoming || incoming.length === 0) {
      // Root node — always eligible to be unlocked
      result.set(node.id, { isUnlocked, shouldBeUnlocked: true });
      continue;
    }

    // All sources must meet their required mastery
    const shouldBeUnlocked = incoming.every((edge) => {
      const sourceMastery = masteryMap.get(edge.sourceNodeId) ?? "locked";
      return meetsRequirement(sourceMastery, edge.requiredMasteryLevel);
    });

    result.set(node.id, { isUnlocked, shouldBeUnlocked });
  }

  return result;
}

// -- Edge status computation --

export type EdgeStatus = "inactive" | "active" | "completed" | "unlocking";

/**
 * Compute the visual status of a single prerequisite edge.
 *
 * - inactive:   source doesn't meet required mastery level
 * - active:     source meets required level AND target already has mastery
 * - completed:  both source and target have mastery, source meets requirement
 * - unlocking:  source meets required level but target is still locked
 */
export function computeEdgeStatus(
  edge: MinimalEdge,
  masteryMap: Map<string, MasteryLevel>
): EdgeStatus {
  const sourceMastery = masteryMap.get(edge.sourceNodeId) ?? "locked";
  const targetMastery = masteryMap.get(edge.targetNodeId) ?? "locked";

  const sourceMetRequirement = meetsRequirement(
    sourceMastery,
    edge.requiredMasteryLevel
  );

  if (!sourceMetRequirement) {
    return "inactive";
  }

  // Source meets requirement — now check target state
  if (targetMastery === "locked") {
    return "unlocking";
  }

  // Target has mastery — completed
  return "completed";
}
