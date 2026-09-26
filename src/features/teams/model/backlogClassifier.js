/**
 * Backlog Classifier & State Evaluation Engine (UI-05A / UI-05B)
 *
 * Implements deterministic canonical backlog classification independent of presentation names:
 *
 * Backlog Criteria:
 * 1. owningTeamId === currentTeam.id
 * 2. cycleId === null (uncommitted to active/upcoming cycle)
 * 3. status.category is eligible for future/unstarted work ('unstarted' or 'backlog')
 * 4. status.category !== 'completed' && status.category !== 'canceled'
 * 5. archivedAt === null
 *
 * Other Classifications:
 * - Started + no Cycle => 'active_out_of_cycle'
 * - Upcoming Cycle assignment => 'planned_commitment'
 * - Active Cycle assignment => 'active_cycle_execution'
 * - Completed status => 'completed'
 * - Canceled status => 'canceled'
 * - Archived => 'archived'
 */

export const WORK_ITEM_TRIAGE_STATES = {
  BACKLOG: 'backlog',
  ACTIVE_CYCLE_EXECUTION: 'active_cycle_execution',
  PLANNED_COMMITMENT: 'planned_commitment',
  ACTIVE_OUT_OF_CYCLE: 'active_out_of_cycle',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  ARCHIVED: 'archived'
};

/**
 * Classifies a single canonical WorkItem within a team and cycles context.
 *
 * @param {Object} item - Canonical WorkItem
 * @param {string} teamId - Target team context ID
 * @param {Array<Object>} cycles - Workspace/Team cycles
 * @returns {string} One of WORK_ITEM_TRIAGE_STATES
 */
export function classifyTeamWorkItem(item, teamId, cycles = []) {
  if (!item || item.teamId !== teamId) {
    return null;
  }

  // 1. Archived check
  if (item.archivedAt || item.status === 'archived') {
    return WORK_ITEM_TRIAGE_STATES.ARCHIVED;
  }

  const statusCategory = item.statusCategory || (
    item.status === 'done' ? 'completed' :
    item.status === 'canceled' ? 'canceled' :
    (item.status === 'in_progress' || item.status === 'in_review') ? 'started' :
    (item.status === 'todo' || item.status === 'backlog') ? 'unstarted' :
    'unstarted'
  );

  // 2. Completed / Canceled
  if (statusCategory === 'completed') {
    return WORK_ITEM_TRIAGE_STATES.COMPLETED;
  }
  if (statusCategory === 'canceled') {
    return WORK_ITEM_TRIAGE_STATES.CANCELED;
  }

  // 3. Cycle assignment check
  if (item.cycleId) {
    const cycle = cycles.find((c) => c.id === item.cycleId);
    if (cycle) {
      if (cycle.status === 'active') {
        return WORK_ITEM_TRIAGE_STATES.ACTIVE_CYCLE_EXECUTION;
      }
      if (cycle.status === 'upcoming') {
        return WORK_ITEM_TRIAGE_STATES.PLANNED_COMMITMENT;
      }
      if (cycle.status === 'completed') {
        // If completed and not marked done, out of cycle / needs rollover
        return statusCategory === 'started'
          ? WORK_ITEM_TRIAGE_STATES.ACTIVE_OUT_OF_CYCLE
          : WORK_ITEM_TRIAGE_STATES.BACKLOG;
      }
    }
  }

  // 4. Started but cycle-less
  if (statusCategory === 'started') {
    return WORK_ITEM_TRIAGE_STATES.ACTIVE_OUT_OF_CYCLE;
  }

  // 5. Unstarted without cycle = canonical Backlog
  return WORK_ITEM_TRIAGE_STATES.BACKLOG;
}

/**
 * Filters items into the canonical Backlog scope for a team.
 */
export function filterTeamBacklog(items, teamId, cycles = []) {
  return (items || []).filter((item) => {
    return classifyTeamWorkItem(item, teamId, cycles) === WORK_ITEM_TRIAGE_STATES.BACKLOG;
  });
}

/**
 * Filters items into the active work scope for a team (both active cycle & out-of-cycle started).
 */
export function filterTeamActiveWork(items, teamId, cycles = []) {
  return (items || []).filter((item) => {
    const state = classifyTeamWorkItem(item, teamId, cycles);
    return (
      state === WORK_ITEM_TRIAGE_STATES.ACTIVE_CYCLE_EXECUTION ||
      state === WORK_ITEM_TRIAGE_STATES.ACTIVE_OUT_OF_CYCLE
    );
  });
}
