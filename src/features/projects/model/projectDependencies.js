/**
 * Project Dependencies & Cycle Detection Engine (UI-07A / UI-07B)
 *
 * Implements the single canonical directional relationship:
 * A blocks B (meaning Project A blocks Project B; Project B depends on Project A).
 *
 * Requirements:
 * - Single canonical edge storage: { blockerId, dependentId }
 * - Inverse projection: "depends on" is derived dynamically, not duplicated in storage.
 * - Self-dependency rejection: A cannot block A.
 * - Duplicate edge rejection: Edge A -> B cannot be added if it already exists.
 * - Directed cycle rejection: Adding A -> B is rejected if B already reaches A via transitive edges.
 */

/**
 * Validates whether adding a proposed dependency edge creates a cycle, duplicate, or self-dependency.
 *
 * @param {string} blockerId - Project ID that acts as blocker
 * @param {string} dependentId - Project ID that is blocked
 * @param {Array<Object>} existingDependencies - Existing edges [{ blockerId, dependentId }]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateProjectDependency(blockerId, dependentId, existingDependencies = []) {
  if (!blockerId || !dependentId) {
    return { valid: false, error: 'Both blocker and dependent project handles are required.' };
  }

  if (blockerId === dependentId) {
    return { valid: false, error: 'Self-dependency is prohibited: A project cannot block itself.' };
  }

  // Check for duplicate edge
  const isDuplicate = (existingDependencies || []).some(
    (dep) => dep.blockerId === blockerId && dep.dependentId === dependentId
  );
  if (isDuplicate) {
    return { valid: false, error: 'Dependency edge already exists.' };
  }

  // Graph reachability: Adding blockerId -> dependentId creates a cycle if blockerId is ALREADY reachable from dependentId.
  // We perform Breadth-First Search (BFS) starting from dependentId to see if we can reach blockerId.
  const adjacencyList = new Map();
  (existingDependencies || []).forEach(({ blockerId: from, dependentId: to }) => {
    if (!adjacencyList.has(from)) {
      adjacencyList.set(from, []);
    }
    adjacencyList.get(from).push(to);
  });

  const queue = [dependentId];
  const visited = new Set([dependentId]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === blockerId) {
      return {
        valid: false,
        error: `Directed cycle detected: Project "${dependentId}" already transitively blocks Project "${blockerId}".`
      };
    }

    const neighbors = adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return { valid: true };
}

/**
 * Resolves both inbound and outbound dependencies for a given project from the canonical edge list.
 *
 * @param {string} projectId - Target project ID
 * @param {Array<Object>} allProjects - Canonical projects collection
 * @param {Array<Object>} allDependencies - Canonical edges [{ blockerId, dependentId }]
 * @param {Function} [isAccessible] - Zero-leakage access resolver
 * @returns {{
 *   blockedBy: Array<{ project: Object, dependencyId: string }>,
 *   blocks: Array<{ project: Object, dependencyId: string }>
 * }}
 */
export function resolveProjectDependencies(
  projectId,
  allProjects = [],
  allDependencies = [],
  isAccessible = () => true
) {
  if (!projectId) {
    return { blockedBy: [], blocks: [] };
  }

  const blockedBy = []; // Projects that block this project (projectId is dependent)
  const blocks = [];    // Projects that this project blocks (projectId is blocker)

  (allDependencies || []).forEach((dep) => {
    if (dep.dependentId === projectId) {
      // Inbound blocker: dep.blockerId blocks target
      const blockerProj = allProjects.find((p) => p.id === dep.blockerId);
      if (blockerProj && isAccessible(blockerProj, 'project')) {
        blockedBy.push({
          dependencyId: dep.id || `${dep.blockerId}->${dep.dependentId}`,
          project: blockerProj
        });
      }
    } else if (dep.blockerId === projectId) {
      // Outbound blocked: target blocks dep.dependentId
      const dependentProj = allProjects.find((p) => p.id === dep.dependentId);
      if (dependentProj && isAccessible(dependentProj, 'project')) {
        blocks.push({
          dependencyId: dep.id || `${dep.blockerId}->${dep.dependentId}`,
          project: dependentProj
        });
      }
    }
  });

  return { blockedBy, blocks };
}
