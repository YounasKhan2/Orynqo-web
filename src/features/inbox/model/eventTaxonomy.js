/**
 * Notification Event Taxonomy & Categorization Rules (UI-04A / UI-04B)
 * Frozen deterministic classification:
 * - Importance: 'focus' | 'normal'
 * - Action Requirement: responseRequired: boolean
 */

export const NOTIFICATION_EVENT_TYPES = {
  // Direct Attention
  MENTION: 'mention',
  THREAD_REPLY: 'thread_reply',
  ASSIGNED: 'assigned',
  REVIEW_REQUESTED: 'review_requested',
  APPROVAL_REQUESTED: 'approval_requested',
  ACCESS_REQUESTED: 'access_requested',
  INVITATION: 'invitation',

  // Work Changes
  STATUS_CHANGED: 'status_changed',
  PRIORITY_CHANGED: 'priority_changed',
  DUE_DATE_CHANGED: 'due_date_changed',
  DEPENDENCY_BLOCKED: 'dependency_blocked',
  DEPENDENCY_CLEARED: 'dependency_cleared',
  CYCLE_CHANGED: 'cycle_changed',
  MILESTONE_CHANGED: 'milestone_changed',

  // Collaboration
  COMMENT_ADDED: 'comment_added',
  THREAD_RESOLVED: 'thread_resolved',
  REACTION_ADDED: 'reaction_added',
  DOC_MENTION: 'doc_mention',
  DOC_COMMENT: 'doc_comment',

  // Project & Initiative
  HEALTH_CHANGED: 'health_changed',
  MILESTONE_SLIPPED: 'milestone_slipped',
  OWNERSHIP_CHANGED: 'ownership_changed',

  // Time-Sensitive Policy Events
  OVERDUE_TRANSITION: 'overdue_transition',
  PERSONAL_REMINDER: 'personal_reminder',
  SNOOZE_RETURNED: 'snooze_returned'
};

export const NOTIFICATION_EVENT_FAMILIES = {
  DIRECT: 'direct',
  WORK_CHANGES: 'work_changes',
  COLLABORATION: 'collaboration',
  PROJECT: 'project',
  TIME_SENSITIVE: 'time_sensitive'
};

export const EVENT_FAMILY_MAP = {
  [NOTIFICATION_EVENT_TYPES.MENTION]: NOTIFICATION_EVENT_FAMILIES.DIRECT,
  [NOTIFICATION_EVENT_TYPES.THREAD_REPLY]: NOTIFICATION_EVENT_FAMILIES.DIRECT,
  [NOTIFICATION_EVENT_TYPES.ASSIGNED]: NOTIFICATION_EVENT_FAMILIES.DIRECT,
  [NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED]: NOTIFICATION_EVENT_FAMILIES.DIRECT,
  [NOTIFICATION_EVENT_TYPES.APPROVAL_REQUESTED]: NOTIFICATION_EVENT_FAMILIES.DIRECT,
  [NOTIFICATION_EVENT_TYPES.ACCESS_REQUESTED]: NOTIFICATION_EVENT_FAMILIES.DIRECT,
  [NOTIFICATION_EVENT_TYPES.INVITATION]: NOTIFICATION_EVENT_FAMILIES.DIRECT,

  [NOTIFICATION_EVENT_TYPES.STATUS_CHANGED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,
  [NOTIFICATION_EVENT_TYPES.PRIORITY_CHANGED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,
  [NOTIFICATION_EVENT_TYPES.DUE_DATE_CHANGED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,
  [NOTIFICATION_EVENT_TYPES.DEPENDENCY_BLOCKED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,
  [NOTIFICATION_EVENT_TYPES.DEPENDENCY_CLEARED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,
  [NOTIFICATION_EVENT_TYPES.CYCLE_CHANGED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,
  [NOTIFICATION_EVENT_TYPES.MILESTONE_CHANGED]: NOTIFICATION_EVENT_FAMILIES.WORK_CHANGES,

  [NOTIFICATION_EVENT_TYPES.COMMENT_ADDED]: NOTIFICATION_EVENT_FAMILIES.COLLABORATION,
  [NOTIFICATION_EVENT_TYPES.THREAD_RESOLVED]: NOTIFICATION_EVENT_FAMILIES.COLLABORATION,
  [NOTIFICATION_EVENT_TYPES.REACTION_ADDED]: NOTIFICATION_EVENT_FAMILIES.COLLABORATION,
  [NOTIFICATION_EVENT_TYPES.DOC_MENTION]: NOTIFICATION_EVENT_FAMILIES.COLLABORATION,
  [NOTIFICATION_EVENT_TYPES.DOC_COMMENT]: NOTIFICATION_EVENT_FAMILIES.COLLABORATION,

  [NOTIFICATION_EVENT_TYPES.HEALTH_CHANGED]: NOTIFICATION_EVENT_FAMILIES.PROJECT,
  [NOTIFICATION_EVENT_TYPES.MILESTONE_SLIPPED]: NOTIFICATION_EVENT_FAMILIES.PROJECT,
  [NOTIFICATION_EVENT_TYPES.OWNERSHIP_CHANGED]: NOTIFICATION_EVENT_FAMILIES.PROJECT,

  [NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION]: NOTIFICATION_EVENT_FAMILIES.TIME_SENSITIVE,
  [NOTIFICATION_EVENT_TYPES.PERSONAL_REMINDER]: NOTIFICATION_EVENT_FAMILIES.TIME_SENSITIVE,
  [NOTIFICATION_EVENT_TYPES.SNOOZE_RETURNED]: NOTIFICATION_EVENT_FAMILIES.TIME_SENSITIVE
};

/**
 * Returns user-facing label and action descriptor for an event type
 */
export function getEventTypeDescriptor(eventType) {
  switch (eventType) {
    case NOTIFICATION_EVENT_TYPES.MENTION:
      return { label: 'Mention', actionText: 'mentioned you in' };
    case NOTIFICATION_EVENT_TYPES.THREAD_REPLY:
      return { label: 'Reply', actionText: 'replied to thread in' };
    case NOTIFICATION_EVENT_TYPES.ASSIGNED:
      return { label: 'Assigned', actionText: 'assigned you to' };
    case NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED:
      return { label: 'Review Requested', actionText: 'requested your review on' };
    case NOTIFICATION_EVENT_TYPES.APPROVAL_REQUESTED:
      return { label: 'Approval Required', actionText: 'requested your approval for' };
    case NOTIFICATION_EVENT_TYPES.ACCESS_REQUESTED:
      return { label: 'Access Requested', actionText: 'requested access to' };
    case NOTIFICATION_EVENT_TYPES.INVITATION:
      return { label: 'Invitation', actionText: 'invited you to' };
    case NOTIFICATION_EVENT_TYPES.STATUS_CHANGED:
      return { label: 'Status Changed', actionText: 'changed status on' };
    case NOTIFICATION_EVENT_TYPES.PRIORITY_CHANGED:
      return { label: 'Priority Changed', actionText: 'updated priority on' };
    case NOTIFICATION_EVENT_TYPES.DUE_DATE_CHANGED:
      return { label: 'Due Date Changed', actionText: 'shifted due date on' };
    case NOTIFICATION_EVENT_TYPES.DEPENDENCY_BLOCKED:
      return { label: 'Dependency Blocked', actionText: 'blocked your work item with' };
    case NOTIFICATION_EVENT_TYPES.DEPENDENCY_CLEARED:
      return { label: 'Dependency Cleared', actionText: 'cleared blocker on' };
    case NOTIFICATION_EVENT_TYPES.COMMENT_ADDED:
      return { label: 'Comment', actionText: 'commented on' };
    case NOTIFICATION_EVENT_TYPES.THREAD_RESOLVED:
      return { label: 'Thread Resolved', actionText: 'resolved discussion in' };
    case NOTIFICATION_EVENT_TYPES.REACTION_ADDED:
      return { label: 'Reaction', actionText: 'reacted to your comment in' };
    case NOTIFICATION_EVENT_TYPES.HEALTH_CHANGED:
      return { label: 'Health Update', actionText: 'updated health status for' };
    case NOTIFICATION_EVENT_TYPES.MILESTONE_SLIPPED:
      return { label: 'Milestone Risk', actionText: 'marked milestone at risk in' };
    case NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION:
      return { label: 'Overdue Alert', actionText: 'became overdue:' };
    case NOTIFICATION_EVENT_TYPES.PERSONAL_REMINDER:
      return { label: 'Reminder', actionText: 'scheduled reminder for' };
    case NOTIFICATION_EVENT_TYPES.SNOOZE_RETURNED:
      return { label: 'Snooze Returned', actionText: 'returned to active triage:' };
    default:
      return { label: 'Notification', actionText: 'updated' };
  }
}
