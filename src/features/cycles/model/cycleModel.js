/**
 * Cycle Domain Model & Invariants Engine (UI-05A / UI-05B)
 *
 * Enforces:
 * 1. Cycle is strictly team-owned (cycle.teamId).
 * 2. Maximum ONE active Cycle per team at any point in time.
 * 3. Storage-neutral scheduling operations:
 *    - assignWorkItemToCycle(workItemId, cycleId)
 *    - removeWorkItemFromCycle(workItemId)
 * 4. Cycle lifecycle states: 'upcoming' -> 'active' -> 'completed'.
 * 5. Optional estimation: Works seamlessly with points, hours, or simple issue counts.
 */

export const CYCLE_STATUSES = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

/**
 * Validates whether activating a cycle satisfies the invariant:
 * "At most one active cycle per team".
 *
 * @param {Array<Object>} cycles - All cycles
 * @param {string} targetCycleId - Cycle to activate
 * @param {string} teamId - Team ID
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCycleActivation(cycles, targetCycleId, teamId) {
  const currentActive = (cycles || []).find(
    (c) => c.teamId === teamId && c.status === CYCLE_STATUSES.ACTIVE && c.id !== targetCycleId
  );

  if (currentActive) {
    return {
      valid: false,
      error: `Cannot activate cycle. Cycle "${currentActive.name || currentActive.number}" is already active for this team.`
    };
  }

  return { valid: true };
}

/**
 * Derives cycle execution metrics from canonical WorkItems.
 * Supports estimates enabled or disabled.
 *
 * @param {Object} cycle
 * @param {Array<Object>} workItems - Canonical work items
 * @param {boolean} estimatesEnabled
 * @returns {Object} Progress metrics
 */
export function deriveCycleProgress(cycle, workItems = [], estimatesEnabled = true) {
  if (!cycle) return null;

  const cycleItems = (workItems || []).filter((item) => item.cycleId === cycle.id);
  const totalItems = cycleItems.length;
  const completedItems = cycleItems.filter((item) => item.status === 'done').length;
  const blockedItems = cycleItems.filter((item) => (item.relations || []).some((r) => r.type === 'blocked_by')).length;
  const urgentItems = cycleItems.filter((item) => item.priority === 'urgent' && item.status !== 'done').length;

  let totalPoints = 0;
  let completedPoints = 0;

  if (estimatesEnabled) {
    cycleItems.forEach((item) => {
      const pts = Number(item.estimate) || 0;
      totalPoints += pts;
      if (item.status === 'done') {
        completedPoints += pts;
      }
    });
  }

  const percentComplete = estimatesEnabled && totalPoints > 0
    ? Math.round((completedPoints / totalPoints) * 100)
    : totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  return {
    totalItems,
    completedItems,
    remainingItems: totalItems - completedItems,
    blockedItems,
    urgentItems,
    totalPoints: estimatesEnabled ? totalPoints : null,
    completedPoints: estimatesEnabled ? completedPoints : null,
    percentComplete
  };
}
