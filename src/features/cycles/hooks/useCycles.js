import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  validateCycleActivation,
  deriveCycleProgress
} from '../model/cycleModel';
import {
  executeCycleCompletion,
  ROLLOVER_DESTINATIONS
} from '../model/rolloverEngine';
import { isWorkItemCompleted } from '../../teams/model/backlogClassifier';

/**
 * useCycles Hook (CYC-001 / CYC-002)
 *
 * Provides team cycle state, lifecycle mutations, scheduling operations, and progress rollups.
 *
 * @param {Object} options
 * @param {string} options.teamId - Active team identifier
 * @param {Array<Object>} [options.cycles=[]] - Canonical cycles collection
 * @param {Array<Object>} [options.workItems=[]] - Canonical workspace items
 * @param {Function} [options.onUpdateWorkItem] - Canonical WorkItem update function
 * @param {boolean} [options.estimatesEnabled=true] - Whether estimates are active
 * @returns {Object} Cycle state and mutation methods
 */
export function useCycles({
  teamId,
  cycles: inputCycles = [],
  workItems = [],
  onUpdateWorkItem,
  estimatesEnabled = true
}) {
  const [localCycles, setLocalCycles] = useState(() => inputCycles);
  const [rolloverModalState, setRolloverModalState] = useState(null); // { cycle, incompleteItems, error }

  // Synchronize when inputCycles changes or teamId changes
  useEffect(() => {
    setLocalCycles(inputCycles);
  }, [inputCycles, teamId]);

  // Active cycles list
  const cycles = localCycles;

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

      setLocalCycles((prev) =>
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
        (it) => it.cycleId === targetCycle.id && !isWorkItemCompleted(it)
      );

      setRolloverModalState({
        cycle: targetCycle,
        incompleteItems: uncompleted,
        error: null
      });
    },
    [cycles, workItems]
  );

  // Lifecycle Step 2: Confirm Cycle Completion with Rollover Decisions and Rollback
  const confirmCompleteCycle = useCallback(
    async ({ cycleId, destination = ROLLOVER_DESTINATIONS.BACKLOG, nextCycleId = null }) => {
      const targetCycle = cycles.find((c) => c.id === cycleId);
      if (!targetCycle) return;

      const incomplete = (workItems || []).filter(
        (it) => it.cycleId === targetCycle.id && !isWorkItemCompleted(it)
      );

      let cycleUpdate;
      let workItemUpdates;

      try {
        const result = executeCycleCompletion({
          cycle: targetCycle,
          incompleteItems: incomplete,
          destination,
          nextCycleId,
          cycles
        });
        cycleUpdate = result.cycleUpdate;
        workItemUpdates = result.workItemUpdates;
      } catch (validationErr) {
        setRolloverModalState((prev) => prev ? { ...prev, error: validationErr.message } : null);
        return;
      }

      // Snapshot previous state for rollback on mutation failure
      const previousCycles = cycles;

      // 1. Optimistically update local cycle state
      setLocalCycles((prev) =>
        prev.map((c) => (c.id === cycleId ? cycleUpdate : c))
      );

      // 2. Mutate WorkItems sequentially; detect synchronous or Promise rejection
      const appliedMutations = [];
      try {
        for (const update of workItemUpdates) {
          const res = onUpdateWorkItem?.(update.id, { cycleId: update.cycleId });
          if (res && typeof res.then === 'function') {
            await res;
          }
          appliedMutations.push(update);
        }

        // Successfully completed transition
        setRolloverModalState(null);
      } catch (err) {
        // Rollback optimistic cycle state
        setLocalCycles(previousCycles);

        // Attempt best-effort rollback of applied item mutations
        appliedMutations.forEach(({ id }) => {
          onUpdateWorkItem?.(id, { cycleId });
        });

        // Keep rollover review open with explicit error
        setRolloverModalState({
          cycle: targetCycle,
          incompleteItems: incomplete,
          error: err.message || 'Failed to update work items during rollover. Cycle completion rolled back.'
        });
      }
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
