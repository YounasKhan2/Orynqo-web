/**
 * Cycle Rollover Engine (UI-05A Section 11 & UI-05B)
 *
 * Implements the frozen rollover invariant:
 * Incomplete committed items do NOT silently auto-roll into the next cycle.
 * They require explicit review with choice of destination:
 * 1. Move to Backlog (clears cycle association)
 * 2. Move to eligible Upcoming Cycle
 *
 * Atomic transition: Prevents partial / corrupted cycle states.
 */

export const ROLLOVER_DESTINATIONS = {
  BACKLOG: 'backlog',
  UPCOMING_CYCLE: 'upcoming_cycle'
};

/**
 * Prepares the rollover review snapshot when completing a cycle.
 *
 * @param {Object} cycle - Cycle being completed
 * @param {Array<Object>} workItems - All work items
 * @param {Array<Object>} upcomingCycles - Available upcoming cycles for this team
 * @returns {{ incompleteItems: Array<Object>, completedItems: Array<Object>, defaultDestination: string }}
 */
export function prepareCycleRollover(cycle, workItems = [], upcomingCycles = []) {
  if (!cycle) return { incompleteItems: [], completedItems: [], nextCycle: null };

  const cycleItems = (workItems || []).filter((item) => item.cycleId === cycle.id);
  const completedItems = cycleItems.filter((item) => item.status === 'done');
  const incompleteItems = cycleItems.filter((item) => item.status !== 'done');
  const nextCycle = (upcomingCycles || []).find((c) => c.teamId === cycle.teamId && c.status === 'upcoming') || null;

  return {
    cycleId: cycle.id,
    cycleName: cycle.name || `Cycle ${cycle.number}`,
    completedCount: completedItems.length,
    incompleteCount: incompleteItems.length,
    incompleteItems,
    nextCycle
  };
}

/**
 * Computes atomic batch updates for executing a cycle completion with rollover review.
 *
 * @param {Object} cycle - Cycle being completed
 * @param {Array<Object>} incompleteItems - Items selected for rollover
 * @param {'backlog'|'upcoming_cycle'} destination - Chosen destination
 * @param {string|null} nextCycleId - Target upcoming cycle ID (if destination === upcoming_cycle)
 * @returns {{ cycleUpdate: Object, workItemUpdates: Array<{ id: string, cycleId: string|null }> }}
 */
export function executeCycleCompletion({
  cycle,
  incompleteItems = [],
  destination = ROLLOVER_DESTINATIONS.BACKLOG,
  nextCycleId = null
}) {
  if (!cycle) {
    throw new Error('Cycle is required for completion');
  }

  const targetCycleId = destination === ROLLOVER_DESTINATIONS.UPCOMING_CYCLE && nextCycleId ? nextCycleId : null;

  const workItemUpdates = incompleteItems.map((item) => ({
    id: item.id,
    cycleId: targetCycleId
  }));

  const cycleUpdate = {
    ...cycle,
    status: 'completed',
    completedAt: new Date().toISOString()
  };

  return {
    cycleUpdate,
    workItemUpdates
  };
}
