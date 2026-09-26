import { useMemo, useState, useCallback } from 'react';
import { CYCLES } from '../../../data/mockData';
import {
  validateCycleActivation,
  deriveCycleProgress
} from '../model/cycleModel';
import {
  executeCycleCompletion,
  ROLLOVER_DESTINATIONS
} from '../model/rolloverEngine';

/**
 * useCycles Hook (CYC-001 / CYC-002)
 *
 * Provides team cycle state, lifecycle mutations, scheduling operations, and progress rollups.
 *
 * @param {string} teamId - Active team identifier
 * @param {Array<Object>} workItems - Canonical workspace items
 * @param {Function} onUpdateWorkItem - Canonical WorkItem update function
 * @param {boolean} estimatesEnabled - Whether estimates are active
 * @returns {Object} Cycle state and mutation methods
 */
export function useCycles({
  teamId,
  workItems = [],
  onUpdateWorkItem,
  estimatesEnabled = true
}) {
  const [cycles, setCycles] = useState(() => CYCLES);
  const [rolloverModalState, setRolloverModalState] = useState(null); // { cycle, incompleteItems }

  // Team-scoped cycles
  const teamCycles = useMemo(() => {
    return cycles.filter((c) => c.teamId === teamId);
  }, [cycles, teamId]);

  // Active Cycle
  const activeCycle = useMemo(() => {
    return teamCycles.find((c) => c.status === 'active') || null;
  }, [teamCycles]);

  // Upcoming Cycles
  const upcomingCycles = useMemo(() => {
    return teamCycles.filter((c) => c.status === 'upcoming');
  }, [teamCycles]);

  // Primary upcoming cycle (next sprint candidate)
  const nextUpcomingCycle = upcomingCycles[0] || null;

  // Active Cycle Progress
  const activeCycleProgress = useMemo(() => {
    return deriveCycleProgress(activeCycle, workItems, estimatesEnabled);
  }, [activeCycle, workItems, estimatesEnabled]);

  // Active Cycle committed work items
  const activeCycleItems = useMemo(() => {
    if (!activeCycle) return [];
    return (workItems || []).filter((it) => it.cycleId === activeCycle.id && !it.parentId);
  }, [activeCycle, workItems]);

  // Upcoming Cycle candidate items
  const upcomingCycleItems = useMemo(() => {
    if (!nextUpcomingCycle) return [];
    return (workItems || []).filter((it) => it.cycleId === nextUpcomingCycle.id && !it.parentId);
  }, [nextUpcomingCycle, workItems]);

  // Semantic Operation: Schedule item to Cycle
  const assignWorkItemToCycle = useCallback(
    (workItemId, cycleId) => {
      onUpdateWorkItem?.(workItemId, { cycleId });
    },
    [onUpdateWorkItem]
  );

  // Semantic Operation: Remove item from Cycle (return to Backlog)
  const removeWorkItemFromCycle = useCallback(
    (workItemId) => {
      onUpdateWorkItem?.(workItemId, { cycleId: null });
    },
    [onUpdateWorkItem]
  );

  // Batch scheduling
  const batchAssignToCycle = useCallback(
    (workItemIds, cycleId) => {
      workItemIds.forEach((id) => onUpdateWorkItem?.(id, { cycleId }));
    },
    [onUpdateWorkItem]
  );

  // Lifecycle Mutation: Start/Activate a Cycle
  const startCycle = useCallback(
    (cycleId) => {
      const validation = validateCycleActivation(cycles, cycleId, teamId);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setCycles((prev) =>
        prev.map((c) => (c.id === cycleId ? { ...c, status: 'active' } : c))
      );
    },
    [cycles, teamId]
  );

  // Lifecycle Step 1: Initiate Cycle Completion (triggers rollover review)
  const promptCompleteCycle = useCallback(
    (cycleId) => {
      const targetCycle = cycles.find((c) => c.id === cycleId);
      if (!targetCycle) return;

      const uncompleted = (workItems || []).filter(
        (it) => it.cycleId === targetCycle.id && it.status !== 'done'
      );

      setRolloverModalState({
        cycle: targetCycle,
        incompleteItems: uncompleted
      });
    },
    [cycles, workItems]
  );

  // Lifecycle Step 2: Confirm Cycle Completion with Rollover Decisions
  const confirmCompleteCycle = useCallback(
    ({ cycleId, destination = ROLLOVER_DESTINATIONS.BACKLOG, nextCycleId = null }) => {
      const targetCycle = cycles.find((c) => c.id === cycleId);
      if (!targetCycle) return;

      const incomplete = (workItems || []).filter(
        (it) => it.cycleId === targetCycle.id && it.status !== 'done'
      );

      const { cycleUpdate, workItemUpdates } = executeCycleCompletion({
        cycle: targetCycle,
        incompleteItems: incomplete,
        destination,
        nextCycleId
      });

      // Atomic mutation from user perspective:
      // 1. Update cycle state in cycle store
      setCycles((prev) =>
        prev.map((c) => (c.id === cycleId ? cycleUpdate : c))
      );

      // 2. Mutate WorkItems via canonical boundary
      workItemUpdates.forEach(({ id, cycleId: newCycleId }) => {
        onUpdateWorkItem?.(id, { cycleId: newCycleId });
      });

      // Dismiss review modal
      setRolloverModalState(null);
    },
    [cycles, workItems, onUpdateWorkItem]
  );

  const cancelRollover = useCallback(() => {
    setRolloverModalState(null);
  }, []);

  return {
    cycles,
    teamCycles,
    activeCycle,
    upcomingCycles,
    nextUpcomingCycle,
    activeCycleProgress,
    activeCycleItems,
    upcomingCycleItems,
    assignWorkItemToCycle,
    removeWorkItemFromCycle,
    batchAssignToCycle,
    startCycle,
    promptCompleteCycle,
    confirmCompleteCycle,
    cancelRollover,
    rolloverModalState
  };
}
