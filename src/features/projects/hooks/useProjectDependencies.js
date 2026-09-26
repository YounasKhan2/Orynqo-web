import { useMemo } from 'react';
import { resolveProjectDependencies } from '../model/projectDependencies';

/**
 * useProjectDependencies Hook (PRJ-001 / PRJ-006)
 *
 * Resolves inbound blockers and outbound dependencies from the single canonical edge model:
 * A blocks B (A is blocker, B is dependent; B depends on A).
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {Array<Object>} options.allProjects
 * @param {Array<Object>} options.dependencies - Canonical edges [{ blockerId, dependentId }]
 * @param {Function} [options.isAccessible]
 * @returns {{ blockedBy: Array<Object>, blocks: Array<Object> }}
 */
export function useProjectDependencies({
  projectId,
  allProjects = [],
  dependencies = [],
  isAccessible = () => true
} = {}) {
  return useMemo(() => {
    return resolveProjectDependencies(projectId, allProjects, dependencies, isAccessible);
  }, [projectId, allProjects, dependencies, isAccessible]);
}
