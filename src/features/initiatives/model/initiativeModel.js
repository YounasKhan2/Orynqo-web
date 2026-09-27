/**
 * Canonical Initiative Model, Invariants & Progress Engine (UI-08A / UI-08B)
 *
 * Implements the storage-neutral semantic Initiative contract:
 * - Operational State: planned | active | paused | completed | cancelled
 * - Archive State: active | archived
 * - Health: unset | on_track | at_risk | off_track
 * - Access Policy: workspace-discoverable (default) | restricted
 * - Temporal Horizon: quarter | half | range | target | null
 * - Project Cardinality: Project -> Initiative = 0..1, Initiative -> Projects = 0..N
 * - Derived Teams: unique union of participating teams across accessible associated projects
 * - Dual Progress:
 *     1. Shipped Projects: P_completed / P_total
 *     2. Aggregate WorkItems: sum(M) / sum(N)
 *     Zero-leakage filtered per viewer.
 */

export const INITIATIVE_OPERATIONAL_STATE = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const INITIATIVE_ARCHIVE_STATE = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

export const INITIATIVE_HEALTH = {
  UNSET: 'unset',
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  OFF_TRACK: 'off_track'
};

export const INITIATIVE_ACCESS_POLICY = {
  WORKSPACE_DISCOVERABLE: 'workspace',
  RESTRICTED: 'restricted'
};

/**
 * Creates a canonical Initiative entity with verified defaults and invariant enforcement.
 *
 * @param {Object} input - Initiative creation parameters
 * @returns {Object} Canonical Initiative representation
 */
export function createInitiativeModel(input = {}) {
  const {
    id,
    identifier,
    workspaceId = 'wks-core',
    name = '',
    summary = '',
    description = null,
    operationalState = INITIATIVE_OPERATIONAL_STATE.PLANNED,
    archiveState = INITIATIVE_ARCHIVE_STATE.ACTIVE,
    health = INITIATIVE_HEALTH.UNSET,
    ownerUserId = null,
    horizon = null, // e.g. { type: 'quarter', quarter: 3, year: 2026, label: 'Q3 2026', startDate: '2026-07-01', targetDate: '2026-09-30' }
    access = {
      visibility: INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE,
      memberUserIds: [],
      memberTeamIds: []
    },
    accessPolicy,
    version = 1,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = input;

  const canonicalId = id || `init-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const effectiveVisibility = accessPolicy || access?.visibility || INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE;

  return {
    id: canonicalId,
    identifier: identifier || `INT-${canonicalId.replace(/^init-/, '')}`,
    workspaceId,
    name: name.trim(),
    summary: summary ? summary.trim() : '',
    description: description ? description.trim() : null,
    operationalState,
    archiveState,
    health,
    accessPolicy: effectiveVisibility,
    ownerUserId,
    horizon: horizon || null,
    access: {
      visibility: effectiveVisibility,
      memberUserIds: Array.isArray(access?.memberUserIds) ? access.memberUserIds : [],
      memberTeamIds: Array.isArray(access?.memberTeamIds) ? access.memberTeamIds : []
    },
    version: typeof version === 'number' ? version : 1,
    createdAt,
    updatedAt
  };
}

/**
 * Derives unique contributing team IDs from associated accessible projects.
 * Invariant: Initiatives do not independently own team assignments.
 *
 * Supports both:
 *   deriveInitiativeContributingTeams(associatedProjects, isAccessible)
 * and:
 *   deriveInitiativeContributingTeams(initiativeId, allProjects, isAccessible)
 *
 * @param {string|Array<Object>} arg1 - Initiative ID or associatedProjects array
 * @param {Array<Object>|Function} [arg2] - Projects array or isAccessible resolver
 * @param {Function} [arg3] - Authorization resolver
 * @returns {Array<string>} Unique list of contributing team IDs
 */
export function deriveInitiativeContributingTeams(arg1, arg2, arg3) {
  let associatedProjects = [];
  let isAccessible = () => true;

  if (typeof arg1 === 'string') {
    const initiativeId = arg1;
    const allProjects = Array.isArray(arg2) ? arg2 : [];
    isAccessible = typeof arg3 === 'function' ? arg3 : () => true;
    associatedProjects = allProjects.filter((p) => p.initiativeId === initiativeId);
  } else if (Array.isArray(arg1)) {
    associatedProjects = arg1;
    isAccessible = typeof arg2 === 'function' ? arg2 : () => true;
  } else if (arg1 && typeof arg1 === 'object') {
    const { initiativeId, projects = [], associatedProjects: assoc = [], isAccessible: acc = () => true } = arg1;
    isAccessible = acc;
    if (assoc.length > 0) {
      associatedProjects = assoc;
    } else if (initiativeId) {
      associatedProjects = projects.filter((p) => p.initiativeId === initiativeId);
    }
  }

  if (!Array.isArray(associatedProjects)) return [];

  const accessibleProjects = associatedProjects.filter(p => isAccessible(p, 'project'));
  const teamSet = new Set();

  for (const project of accessibleProjects) {
    if (project.leadTeamId) {
      teamSet.add(project.leadTeamId);
    }
    const teams = project.participatingTeamIds || project.teamIds || [];
    for (const t of teams) {
      if (t) teamSet.add(t);
    }
  }

  return Array.from(teamSet);
}

/**
 * Calculates Dual Transparent Progress for an Initiative.
 *
 * Requirements:
 * 1. Shipped Projects: completed / total active+completed projects (excludes cancelled & archived).
 * 2. Aggregate WorkItems: sum(completed) / sum(total included) across all accessible associated projects.
 * 3. Zero-Leakage: Excludes inaccessible projects and inaccessible work items before rollup.
 * 4. Truthful zero state: when zero projects aligned, returns displayText: 'No projects aligned'.
 *
 * Supports both:
 *   calculateInitiativeProgress({ initiativeId, projects, workItems, isAccessible })
 * and positional:
 *   calculateInitiativeProgress(initiativeId, projects, workItems, isAccessible)
 *
 * @returns {Object} Dual progress metrics with projectProgress, workItemProgress, itemProgress alias
 */
export function calculateInitiativeProgress(arg1, arg2, arg3, arg4) {
  let initiativeId;
  let projects = [];
  let workItems = [];
  let isAccessible = () => true;

  if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
    initiativeId = arg1.initiativeId;
    projects = arg1.projects || [];
    workItems = arg1.workItems || [];
    isAccessible = typeof arg1.isAccessible === 'function' ? arg1.isAccessible : () => true;
  } else {
    initiativeId = arg1;
    projects = arg2 || [];
    workItems = arg3 || [];
    isAccessible = typeof arg4 === 'function' ? arg4 : () => true;
  }

  const emptyResult = {
    projectProgress: { completed: 0, total: 0, percentage: 0, displayText: 'No projects aligned', label: '0 / 0' },
    workItemProgress: { completed: 0, total: 0, percentage: 0, displayText: '0 / 0', label: '0 / 0' },
    itemProgress: { completed: 0, total: 0, percentage: 0, displayText: '0 / 0', label: '0 / 0' },
    hasProjects: false
  };

  if (!initiativeId) {
    return emptyResult;
  }

  // Filter associated and accessible projects
  const alignedProjects = (projects || []).filter((p) => {
    if (p.initiativeId !== initiativeId) return false;
    if (p.archiveState === 'archived' || p.isArchived) return false;
    return isAccessible(p, 'project');
  });

  // Exclude cancelled projects from delivery progress
  const activeProjects = alignedProjects.filter((p) => p.operationalState !== 'cancelled');

  if (activeProjects.length === 0) {
    return emptyResult;
  }

  // 1. Shipped Projects Metric
  const completedProjects = activeProjects.filter((p) => p.operationalState === 'completed');
  const projCompleted = completedProjects.length;
  const projTotal = activeProjects.length;
  const projPercentage = Math.round((projCompleted / projTotal) * 100);

  // 2. Aggregate WorkItem Metric
  const activeProjectIds = new Set(activeProjects.map((p) => p.id));
  const accessibleItems = (workItems || []).filter((item) => {
    if (!item.projectId || !activeProjectIds.has(item.projectId)) return false;
    if (item.isArchived || item.status === 'archived') return false;
    return isAccessible(item, 'work_item');
  });

  const validItems = accessibleItems.filter((item) => item.status !== 'cancelled');
  const itemCompleted = validItems.filter((item) => item.status === 'done' || item.status === 'completed').length;
  const itemTotal = validItems.length;
  const itemPercentage = itemTotal > 0 ? Math.round((itemCompleted / itemTotal) * 100) : 0;

  const projectProgress = {
    completed: projCompleted,
    total: projTotal,
    percentage: projPercentage,
    displayText: `${projCompleted} of ${projTotal} projects completed (${projPercentage}%)`,
    label: `${projCompleted} / ${projTotal}`
  };

  const workItemProgress = {
    completed: itemCompleted,
    total: itemTotal,
    percentage: itemPercentage,
    displayText: `${itemCompleted} / ${itemTotal} items (${itemPercentage}%)`,
    label: `${itemCompleted} / ${itemTotal}`
  };

  return {
    projectProgress,
    workItemProgress,
    itemProgress: workItemProgress, // alias for tests and components
    hasProjects: true
  };
}

/**
 * Derives objective supporting risk signals for an Initiative.
 * Invariant: Risk signals serve as supporting context and NEVER silently mutate Initiative health.
 *
 * Supports both:
 *   deriveInitiativeRiskSignals({ initiativeId, projects, dependencies, milestones, projectUpdates, isAccessible })
 * and positional:
 *   deriveInitiativeRiskSignals(init, projects, milestones, dependencies, updates, isAccessible)
 *
 * @returns {Array<Object> & Object} Array of risk signal descriptors with attached metric counts
 */
export function deriveInitiativeRiskSignals(arg1, arg2, arg3, arg4, arg5, arg6) {
  let initiativeId;
  let projects = [];
  let dependencies = [];
  let milestones = [];
  let projectUpdates = [];
  let isAccessible = () => true;
  let staleDaysThreshold = 30;

  if (typeof arg1 === 'object' && arg1 !== null && !('health' in arg1) && !('id' in arg1) && ('initiativeId' in arg1 || 'projects' in arg1)) {
    initiativeId = arg1.initiativeId;
    projects = arg1.projects || [];
    dependencies = arg1.dependencies || [];
    milestones = arg1.milestones || [];
    projectUpdates = arg1.projectUpdates || arg1.updates || [];
    isAccessible = typeof arg1.isAccessible === 'function' ? arg1.isAccessible : () => true;
    staleDaysThreshold = arg1.staleDaysThreshold || 30;
  } else {
    // Positional or init object passed as arg1
    initiativeId = typeof arg1 === 'string' ? arg1 : arg1?.id;
    projects = arg2 || [];
    milestones = arg3 || [];
    dependencies = arg4 || [];
    projectUpdates = arg5 || [];
    isAccessible = typeof arg6 === 'function' ? arg6 : () => true;
  }

  const signalList = [];

  const defaultCounts = {
    atRiskProjectsCount: 0,
    offTrackProjectsCount: 0,
    blockedProjectsCount: 0,
    overdueDeliverablesCount: 0,
    staleUpdatesCount: 0,
    targetMismatchCount: 0,
    totalRisksCount: 0
  };

  if (!initiativeId) {
    return Object.assign(signalList, defaultCounts);
  }

  const initiativeProjects = (projects || []).filter((p) => {
    if (p.initiativeId !== initiativeId) return false;
    if (p.archiveState === 'archived' || p.operationalState === 'cancelled') return false;
    return isAccessible(p, 'project');
  });

  if (initiativeProjects.length === 0) {
    return Object.assign(signalList, defaultCounts);
  }

  const now = new Date();
  const initiativeProjectIds = new Set(initiativeProjects.map((p) => p.id));

  let atRiskCount = 0;
  let offTrackCount = 0;
  let blockedCount = 0;
  let overdueCount = 0;
  let staleCount = 0;

  // Evaluate project health and dates
  for (const proj of initiativeProjects) {
    if (proj.health === 'at_risk') {
      atRiskCount++;
      signalList.push({
        type: 'project_health',
        severity: 'warning',
        projectId: proj.id,
        message: `Project ${proj.name || proj.id} is At Risk`
      });
    }
    if (proj.health === 'off_track') {
      offTrackCount++;
      signalList.push({
        type: 'project_health',
        severity: 'critical',
        projectId: proj.id,
        message: `Project ${proj.name || proj.id} is Off Track`
      });
    }

    // Check project updates freshness
    const latestUpdate = (projectUpdates || [])
      .filter((u) => u.projectId === proj.id)
      .sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt))[0];

    if (latestUpdate) {
      const updateDate = new Date(latestUpdate.createdAt || latestUpdate.publishedAt);
      const diffDays = (now - updateDate) / (1000 * 60 * 60 * 24);
      if (diffDays > staleDaysThreshold) {
        staleCount++;
        signalList.push({
          type: 'stale_update',
          severity: 'warning',
          projectId: proj.id,
          message: `Project ${proj.name || proj.id} update is over ${staleDaysThreshold} days old`
        });
      }
    } else if (proj.operationalState === 'in_progress') {
      staleCount++;
      signalList.push({
        type: 'stale_update',
        severity: 'warning',
        projectId: proj.id,
        message: `In-progress project ${proj.name || proj.id} has no published updates`
      });
    }
  }

  // Evaluate blocked projects via dependency edges
  const incomingBlockedProjects = new Set();
  for (const edge of dependencies || []) {
    if (initiativeProjectIds.has(edge.targetProjectId)) {
      incomingBlockedProjects.add(edge.targetProjectId);
      signalList.push({
        type: 'dependency_block',
        severity: 'critical',
        projectId: edge.targetProjectId,
        message: `Blocked by dependency from project ${edge.sourceProjectId}`
      });
    }
  }
  blockedCount = incomingBlockedProjects.size;

  // Evaluate overdue milestones
  for (const m of milestones || []) {
    if (initiativeProjectIds.has(m.projectId) && m.status !== 'completed' && m.status !== 'archived') {
      if (m.targetDate && new Date(m.targetDate) < now) {
        overdueCount++;
        signalList.push({
          type: 'overdue_milestone',
          severity: 'critical',
          milestoneId: m.id,
          projectId: m.projectId,
          message: `Milestone "${m.name || m.title || m.id}" is overdue (Target: ${m.targetDate})`
        });
      }
    }
  }

  const totalRisks = atRiskCount + offTrackCount + blockedCount + overdueCount + staleCount;

  return Object.assign(signalList, {
    atRiskProjectsCount: atRiskCount,
    offTrackProjectsCount: offTrackCount,
    blockedProjectsCount: blockedCount,
    overdueDeliverablesCount: overdueCount,
    staleUpdatesCount: staleCount,
    targetMismatchCount: 0,
    totalRisksCount: totalRisks
  });
}
