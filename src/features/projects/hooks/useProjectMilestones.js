import { useMemo, useState, useCallback } from 'react';
import { createMilestoneModel, MILESTONE_STATUS, calculateMilestoneProgress } from '../model/projectMilestones';

/**
 * useProjectMilestones Hook (PRJ-004)
 *
 * Manages project-owned delivery gates:
 * - Query: Ordered sequence of milestones belonging to the project.
 * - Progress calculation per milestone over canonical WorkItems.
 * - Non-destructive archive semantics.
 * - WorkItem association validation (0..1 milestone per item).
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {Array<Object>} options.initialMilestones
 * @param {Array<Object>} options.workItems
 * @param {Function} [options.isAccessible]
 * @returns {Object}
 */
export function useProjectMilestones({
  projectId,
  initialMilestones = [],
  workItems = [],
  isAccessible = () => true
} = {}) {
  const [milestones, setMilestones] = useState(() => initialMilestones || []);

  const projectMilestones = useMemo(() => {
    return (milestones || [])
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((m) => {
        const progress = calculateMilestoneProgress(m.id, workItems, isAccessible);
        return {
          ...m,
          progress
        };
      });
  }, [milestones, projectId, workItems, isAccessible]);

  const addMilestone = useCallback(
    ({ name, description = '', targetDate = null }) => {
      const newMls = createMilestoneModel({
        projectId,
        name,
        description,
        targetDate,
        sortOrder: projectMilestones.length + 1
      });
      setMilestones((prev) => [...prev, newMls]);
      return newMls;
    },
    [projectId, projectMilestones.length]
  );

  const updateMilestone = useCallback((milestoneId, patch) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m))
    );
  }, []);

  const archiveMilestone = useCallback((milestoneId) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, status: MILESTONE_STATUS.ARCHIVED, updatedAt: new Date().toISOString() }
          : m
      )
    );
  }, []);

  const completeMilestone = useCallback((milestoneId) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, status: MILESTONE_STATUS.COMPLETED, updatedAt: new Date().toISOString() }
          : m
      )
    );
  }, []);

  return {
    milestones: projectMilestones,
    addMilestone,
    updateMilestone,
    archiveMilestone,
    completeMilestone
  };
}
