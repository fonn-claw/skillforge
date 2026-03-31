/**
 * DAG validation utility using Kahn's algorithm (topological sort).
 * Used by the seed script and API routes to ensure the skill tree
 * never contains circular prerequisites.
 */

export function validateDAG(
  edges: { sourceNodeId: string; targetNodeId: string }[]
): { valid: boolean; cycle?: string[] } {
  // Collect all nodes referenced in edges
  const nodes = new Set<string>();
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const edge of edges) {
    nodes.add(edge.sourceNodeId);
    nodes.add(edge.targetNodeId);
  }

  // Initialize
  for (const node of nodes) {
    adjacency.set(node, []);
    inDegree.set(node, 0);
  }

  // Build adjacency list and in-degree counts
  for (const edge of edges) {
    adjacency.get(edge.sourceNodeId)!.push(edge.targetNodeId);
    inDegree.set(
      edge.targetNodeId,
      inDegree.get(edge.targetNodeId)! + 1
    );
  }

  // Kahn's algorithm: start with nodes that have no incoming edges
  const queue: string[] = [];
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  const sorted: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    for (const neighbor of adjacency.get(current)!) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If we processed all nodes, no cycle exists
  if (sorted.length === nodes.size) {
    return { valid: true };
  }

  // Find nodes involved in the cycle (those not in sorted output)
  const cycle = [...nodes].filter((n) => !sorted.includes(n));
  return { valid: false, cycle };
}
