import { useState, useCallback, useMemo } from 'react';
import { createProjectUpdateModel } from '../model/projectUpdates';

/**
 * useProjectUpdates Hook (PRJ-001)
 *
 * Authoritative, immutable historical narrative snapshots:
 * - Publishing an update updates current Project health.
 * - Does NOT mutate authoritative Project target date.
 * - Snapshots target date at publication time for history.
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {Array<Object>} [options.initialUpdates=[]]
 * @param {Function} options.onUpdateProjectHealth - (projectId, health) => void
 * @param {string} [options.currentUserId='usr-1']
 * @returns {Object}
 */
export function useProjectUpdates({
  projectId,
  initialUpdates = [],
  onUpdateProjectHealth,
  currentUserId = 'usr-1'
} = {}) {
  const [updates, setUpdates] = useState(() => initialUpdates || []);

  const projectUpdates = useMemo(() => {
    return (updates || [])
      .filter((u) => u.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [updates, projectId]);

  const latestUpdate = projectUpdates.length > 0 ? projectUpdates[0] : null;

  const postUpdate = useCallback(
    ({ narrative, health, targetDateSnapshot = null, highlights = [], blockers = [] }) => {
      const newUpdate = createProjectUpdateModel({
        projectId,
        authorId: currentUserId,
        narrative,
        health,
        targetDateSnapshot,
        highlights,
        blockers
      });

      setUpdates((prev) => [newUpdate, ...prev]);

      // Side-effect: updates project health intentionally
      if (onUpdateProjectHealth) {
        onUpdateProjectHealth(projectId, health);
      }

      return newUpdate;
    },
    [projectId, currentUserId, onUpdateProjectHealth]
  );

  return {
    updates: projectUpdates,
    latestUpdate,
    postUpdate
  };
}
