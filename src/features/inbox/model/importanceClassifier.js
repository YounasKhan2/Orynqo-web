import { NOTIFICATION_EVENT_TYPES } from './eventTaxonomy';

/**
 * Deterministic Importance & Action Requirement Classifier (UI-04A / UI-04B)
 *
 * Explicit Invariants:
 * 1. Importance ('focus' | 'normal') determines visual prominence and Focus tab eligibility.
 * 2. responseRequired (boolean) determines whether an explicit decision/action is expected from recipient.
 * 3. Focus does NOT imply responseRequired (e.g. blockers, overdue transitions, assignments are Focus without responseRequired).
 * 4. Deterministic logic only - NO black-box AI ranking.
 */

export function classifyNotificationAttention(event) {
  const { eventType } = event;

  switch (eventType) {
    // Direct requests expecting explicit response
    case NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED:
    case NOTIFICATION_EVENT_TYPES.APPROVAL_REQUESTED:
    case NOTIFICATION_EVENT_TYPES.ACCESS_REQUESTED:
    case NOTIFICATION_EVENT_TYPES.INVITATION:
      return {
        importance: 'focus',
        responseRequired: true
      };

    // Direct attention with response expected (conversational)
    case NOTIFICATION_EVENT_TYPES.MENTION:
      return {
        importance: 'focus',
        responseRequired: true
      };

    // Direct attention with optional response / high awareness
    case NOTIFICATION_EVENT_TYPES.THREAD_REPLY:
    case NOTIFICATION_EVENT_TYPES.ASSIGNED:
    case NOTIFICATION_EVENT_TYPES.DEPENDENCY_BLOCKED:
    case NOTIFICATION_EVENT_TYPES.MILESTONE_SLIPPED:
    case NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION:
    case NOTIFICATION_EVENT_TYPES.PERSONAL_REMINDER:
    case NOTIFICATION_EVENT_TYPES.SNOOZE_RETURNED:
      return {
        importance: 'focus',
        responseRequired: false
      };

    // Ordinary collaboration & work updates
    case NOTIFICATION_EVENT_TYPES.STATUS_CHANGED:
    case NOTIFICATION_EVENT_TYPES.PRIORITY_CHANGED:
    case NOTIFICATION_EVENT_TYPES.DUE_DATE_CHANGED:
    case NOTIFICATION_EVENT_TYPES.DEPENDENCY_CLEARED:
    case NOTIFICATION_EVENT_TYPES.CYCLE_CHANGED:
    case NOTIFICATION_EVENT_TYPES.MILESTONE_CHANGED:
    case NOTIFICATION_EVENT_TYPES.COMMENT_ADDED:
    case NOTIFICATION_EVENT_TYPES.THREAD_RESOLVED:
    case NOTIFICATION_EVENT_TYPES.REACTION_ADDED:
    case NOTIFICATION_EVENT_TYPES.DOC_MENTION:
    case NOTIFICATION_EVENT_TYPES.DOC_COMMENT:
    case NOTIFICATION_EVENT_TYPES.HEALTH_CHANGED:
    case NOTIFICATION_EVENT_TYPES.OWNERSHIP_CHANGED:
    default:
      return {
        importance: 'normal',
        responseRequired: false
      };
  }
}
