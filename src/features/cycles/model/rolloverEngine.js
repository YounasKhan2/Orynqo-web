import { isWorkItemCompleted } from '../../teams/model/backlogClassifier';

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
 * @returns {{ cycleId: string, cycleName: string, incompleteItems: Array<Object>, completedItems: Array<Object>, completedCount: number, incompleteCount: number, nextCycle: Object|null }}
 */
export function prepareCycleRollover(cycle, workItems = [], upcomingCycles = []) {
  if (!cycle) return { incompleteItems: [], completedItems: [], nextCycle: null, completedCount: 0, incompleteCount: 0 };

  const cycleItems = (workItems || []).filter((item) => item.cycleId === cycle.id);
  const completedItems = cycleItems.filter((item) => isWorkItemCompleted(item));
  const incompleteItems = cycleItems.filter((item) => !isWorkItemCompleted(item));
  const nextCycle = (upcomingCycles || []).find((c) => c.teamId === cycle.teamId && c.status === 'upcoming') || null;

  return {
    cycleId: cycle.id,
    cycleName: cycle.name || `Cycle ${cycle.number}`,
    completedCount: completedItems.length,
    incompleteCount: incompleteItems.length,
    incompleteItems,
    completedItems,
    nextCycle
  };
}

/**
 * Computes atomic batch updates for executing a cycle completion with rollover review.
 * Strictly validates rollover destination and target cycle eligibility.
 *
 * @param {Object} params
 * @param {Object} params.cycle - Cycle being completed
 * @param {Array<Object>} [params.incompleteItems=[]] - Items selected for rollover
 * @param {'backlog'|'upcoming_cycle'} [params.destination='backlog'] - Chosen destination
 * @param {string|null} [params.nextCycleId=null] - Target upcoming cycle ID (required if destination === upcoming_cycle)
 * @param {Array<Object>} [params.cycles=[]] - Available workspace/team cycles for validation
 * @returns {{ cycleUpdate: Object, workItemUpdates: Array<{ id: string, cycleId: string|null }> }}
 */
export function executeCycleCompletion({
  cycle,
  incompleteItems = [],
  destination = ROLLOVER_DESTINATIONS.BACKLOG,
  nextCycleId = null,
  cycles = [],
  availableCycles = []
}) {
  const candidateCycles = cycles.length > 0 ? cycles : availableCycles;
  if (!cycle) {
    throw new Error('Cycle is required for completion');
  }

  if (destination !== ROLLOVER_DESTINATIONS.BACKLOG && destination !== ROLLOVER_DESTINATIONS.UPCOMING_CYCLE) {
    throw new Error(`Unsupported rollover destination: "${destination}". Must be "backlog" or "upcoming_cycle".`);
  }

  let targetCycleId = null;

  if (destination === ROLLOVER_DESTINATIONS.UPCOMING_CYCLE) {
    if (!nextCycleId) {
      throw new Error('Upcoming Cycle rollover requires an explicit nextCycleId');
    }

    if (candidateCycles && candidateCycles.length > 0) {
      const targetCycle = candidateCycles.find((c) => c.id === nextCycleId);
      if (!targetCycle) {
        throw new Error(`Target upcoming cycle "${nextCycleId}" not found`);
      }
      if (targetCycle.teamId !== cycle.teamId) {
        throw new Error(`Target upcoming cycle "${nextCycleId}" belongs to team "${targetCycle.teamId}", not current team "${cycle.teamId}"`);
      }
      if (targetCycle.id === cycle.id) {
        throw new Error('Cannot roll over incomplete items into the cycle being completed');
      }
      if (targetCycle.status !== 'upcoming') {
        throw new Error(`Target cycle "${nextCycleId}" is not in "upcoming" status (current status: "${targetCycle.status}")`);
      }
    }

    targetCycleId = nextCycleId;
  }

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
