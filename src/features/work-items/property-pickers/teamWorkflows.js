import { STATUS_DEFINITIONS } from '../../../constants/workItems';

/**
 * Team-Specific Workflow Configuration Registry
 * Governs available statuses per team rather than assuming a single global static status set.
 */
export const TEAM_WORKFLOWS = {
  'team-core': ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled'],
  'team-web': ['backlog', 'todo', 'in_progress', 'done', 'canceled'],
  'team-mobile': ['triage', 'todo', 'in_progress', 'in_review', 'done', 'canceled'],
  'team-security': ['triage', 'audit', 'remediation', 'certified'],
  'team-sec': ['triage', 'audit', 'remediation', 'certified']
};

// Additional definitions for custom team-specific statuses (e.g. security workflows)
export const EXTENDED_STATUS_DEFINITIONS = {
  ...STATUS_DEFINITIONS,
  triage: {
    id: 'triage',
    label: 'Triage',
    color: 'var(--status-backlog, #71717a)',
    category: 'backlog',
    icon: 'AlertCircle'
  },
  audit: {
    id: 'audit',
    label: 'Security Audit',
    color: 'var(--status-in-progress, #3b82f6)',
    bg: 'var(--status-in-progress-bg, rgba(59, 130, 246, 0.1))',
    category: 'started',
    icon: 'Clock'
  },
  remediation: {
    id: 'remediation',
    label: 'Remediation',
    color: 'var(--status-review, #a855f7)',
    bg: 'var(--status-review-bg, rgba(168, 85, 247, 0.1))',
    category: 'started',
    icon: 'GitPullRequest'
  },
  certified: {
    id: 'certified',
    label: 'Certified',
    color: 'var(--status-done, #10b981)',
    bg: 'var(--status-done-bg, rgba(16, 185, 129, 0.1))',
    category: 'completed',
    icon: 'CheckCircle2'
  }
};

/**
 * Get the list of status definition objects available for a team
 */
export function getTeamWorkflowStatuses(teamId) {
  const allowedKeys = TEAM_WORKFLOWS[teamId] || TEAM_WORKFLOWS['team-core'];
  return allowedKeys
    .map((key) => EXTENDED_STATUS_DEFINITIONS[key])
    .filter(Boolean);
}

/**
 * Get the configured default unstarted/initial status for a team
 */
export function getTeamDefaultStatus(teamId, preferredCategory = 'unstarted') {
  const statuses = getTeamWorkflowStatuses(teamId);
  if (statuses[0]?.id === 'triage') return 'triage';
  const match = statuses.find((s) => s.category === preferredCategory);
  if (match) return match.id;
  return statuses[0]?.id || 'todo';
}

/**
 * Resolve status mapping when moving an item to a target team
 */
export function resolveTeamStatusIncompatibility(currentStatus, targetTeamId) {
  const targetStatuses = getTeamWorkflowStatuses(targetTeamId);
  const isAvailable = targetStatuses.some((s) => s.id === currentStatus);

  if (isAvailable) {
    return { isCompatible: true, resolvedStatus: currentStatus };
  }

  // Find target status in the same statusCategory if possible
  const currentDef = EXTENDED_STATUS_DEFINITIONS[currentStatus];
  const targetSameCategory = targetStatuses.find((s) => s.category === currentDef?.category);

  if (targetSameCategory) {
    return {
      isCompatible: false,
      resolvedStatus: targetSameCategory.id,
      reason: `Status '${currentDef?.label || currentStatus}' is not available in target team. Proposed: '${targetSameCategory.label}'.`
    };
  }

  // Fallback to target team's default status
  const fallback = targetStatuses[0];
  return {
    isCompatible: false,
    resolvedStatus: fallback.id,
    reason: `Status '${currentDef?.label || currentStatus}' is not available in target team. Proposed: '${fallback.label}'.`
  };
}
