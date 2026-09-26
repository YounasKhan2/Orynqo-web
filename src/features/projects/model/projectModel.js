/**
 * Canonical Project Model & State Machine (UI-07A / UI-07B)
 *
 * Implements the storage-neutral semantic Project contract:
 * - Operational State: planned | in_progress | paused | completed | cancelled
 * - Archive State: active | archived
 * - Health: unset | on_track | at_risk | off_track
 * - Multi-team participation: 0..N participating teams, 0..1 lead team (leadTeam ∈ participatingTeams)
 * - WorkItem team ownership invariant: Project association never alters canonical WorkItem owning team.
 * - Milestone cardinality: 0..1 milestone per WorkItem.
 * - Single canonical dependency edge: A blocks B (B depends on A is inverse projection).
 */

export const PROJECT_OPERATIONAL_STATE = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PROJECT_ARCHIVE_STATE = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

export const PROJECT_HEALTH = {
  UNSET: 'unset',
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  OFF_TRACK: 'off_track'
};

export const MILESTONE_STATUS = {
  OPEN: 'open',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

/**
 * Creates a canonical Project entity with verified defaults and invariant enforcement.
 *
 * @param {Object} input - Project creation input
 * @returns {Object} Canonical project representation
 */
export function createProjectModel(input = {}) {
  const {
    id,
    identifier,
    workspaceId = 'wks-core',
    name = '',
    summary = '',
    description = null,
    operationalState = PROJECT_OPERATIONAL_STATE.PLANNED,
    archiveState = PROJECT_ARCHIVE_STATE.ACTIVE,
    health = PROJECT_HEALTH.UNSET,
    leadUserId = null,
    leadTeamId = null,
    participatingTeamIds = [],
    targetDate = null,
    startDate = null,
    initiativeId = null,
    access = { visibility: 'workspace', memberUserIds: [] },
    version = 1,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = input;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Project name is required.');
  }

  // Ensure unique list of participating team IDs
  const normalizedTeams = Array.from(new Set(Array.isArray(participatingTeamIds) ? participatingTeamIds : []));

  // Invariant: If leadTeamId is defined, it MUST be a member of participatingTeamIds
  if (leadTeamId && !normalizedTeams.includes(leadTeamId)) {
    normalizedTeams.push(leadTeamId);
  }

  const generatedId = id || `prj-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedIdentifier = identifier || (input.key ? input.key : `PRJ-${Math.floor(100 + Math.random() * 900)}`);

  return {
    id: generatedId,
    identifier: generatedIdentifier,
    workspaceId,
    name: name.trim(),
    summary: (summary || '').trim(),
    description,
    operationalState,
    archiveState,
    health,
    leadUserId,
    leadTeamId: leadTeamId || null,
    participatingTeamIds: normalizedTeams,
    targetDate: targetDate || null,
    startDate: startDate || null,
    initiativeId: initiativeId || null,
    access: {
      visibility: access?.visibility || 'workspace',
      memberUserIds: Array.isArray(access?.memberUserIds) ? access.memberUserIds : []
    },
    version: typeof version === 'number' ? version : 1,
    createdAt,
    updatedAt
  };
}

/**
 * Validates Lead Team consistency against participating teams.
 * Invariant: leadTeamId must belong to participatingTeamIds when set.
 *
 * @param {string|null} leadTeamId
 * @param {Array<string>} participatingTeamIds
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLeadTeamParticipation(leadTeamId, participatingTeamIds = []) {
  if (!leadTeamId) return { valid: true };
  const valid = Array.isArray(participatingTeamIds) && participatingTeamIds.includes(leadTeamId);
  return {
    valid,
    error: valid ? undefined : `Lead Team "${leadTeamId}" must be a participating team in the Project.`
  };
}

/**
 * Validates whether a WorkItem's owning team is permitted to associate with a Project.
 * Invariant: A WorkItem may only associate with a Project when its owning team is participating.
 * If not participating, an explicit team participation decision is required.
 *
 * @param {Object} workItem
 * @param {Object} project
 * @returns {{ canAssociate: boolean, requiresTeamParticipationDecision: boolean, mismatchedTeamId?: string }}
 */
export function canAssociateWorkItemWithProject(workItem, project) {
  if (!workItem || !project) {
    return { canAssociate: false, requiresTeamParticipationDecision: false };
  }

  const workItemTeamId = typeof workItem === 'string' ? workItem : workItem.teamId;
  const teams = project.participatingTeamIds || project.teamIds || (project.teamId ? [project.teamId] : []);

  if (teams.includes(workItemTeamId)) {
    return { canAssociate: true, requiresTeamParticipationDecision: false };
  }

  return {
    canAssociate: false,
    requiresTeamParticipationDecision: true,
    mismatchedTeamId: workItemTeamId
  };
}

/**
 * Calculates transparent, empirical progress for a Project over canonical WorkItems.
 * Supports both signatures:
 *   calculateProjectProgress(items, isAccessible)
 *   calculateProjectProgress(projectId, workItems, isAccessible)
 *
 * Requirements:
 * - Exposes both numerator (completed items) and denominator (total active items).
 * - Cancelled items are excluded from total calculation.
 * - Archived items are excluded from active calculation.
 * - Zero items returns { completed: 0, total: 0, percentage: 0, displayText: '0 items', label: '0 items' }.
 * - Evaluates only over viewer-accessible items (zero-leakage security).
 *
 * @param {string|Array<Object>} projectOrItems - Project ID or Array of WorkItems
 * @param {Array<Object>|Function} [itemsOrAccessor] - WorkItems array or access resolver
 * @param {Function} [maybeAccessor] - Access resolver
 * @returns {{ completed: number, total: number, percentage: number, percent: number, displayText: string, label: string }}
 */
export function calculateProjectProgress(projectOrItems, itemsOrAccessor = [], maybeAccessor = () => true) {
  let projectId = null;
  let workItems = [];
  let isAccessible = () => true;

  if (Array.isArray(projectOrItems)) {
    workItems = projectOrItems;
    if (typeof itemsOrAccessor === 'function') {
      isAccessible = itemsOrAccessor;
    }
  } else {
    projectId = projectOrItems;
    workItems = Array.isArray(itemsOrAccessor) ? itemsOrAccessor : [];
    if (typeof maybeAccessor === 'function') {
      isAccessible = maybeAccessor;
    }
  }

  if (!Array.isArray(workItems) || workItems.length === 0) {
    return {
      completed: 0,
      total: 0,
      percentage: 0,
      percent: 0,
      displayText: '0 items',
      label: '0 items'
    };
  }

  // Filter to accessible items (and filter by projectId if specified)
  const projectItems = workItems.filter((item) => {
    if (projectId && item.projectId && item.projectId !== projectId) return false;
    if (item.isArchived || item.status === 'archived') return false;
    return isAccessible(item, 'work_item');
  });

  // Exclude cancelled items from active delivery count
  const validItems = projectItems.filter((item) => item.status !== 'cancelled');

  if (validItems.length === 0) {
    return {
      completed: 0,
      total: 0,
      percentage: 0,
      percent: 0,
      displayText: '0 items',
      label: '0 items'
    };
  }

  const completedItems = validItems.filter((item) => item.status === 'done' || item.status === 'completed');
  const completed = completedItems.length;
  const total = validItems.length;
  const percentage = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
    percent: percentage,
    displayText: `${completed} / ${total}`,
    label: `${completed} / ${total}`
  };
}
