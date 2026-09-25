import { NOTIFICATION_EVENT_TYPES, EVENT_FAMILY_MAP } from './eventTaxonomy';

/**
 * Pure Presentation Bundling Transformation (UI-04A / UI-04B)
 *
 * Invariants:
 * 1. A bundle is a presentation projection, NOT a canonical database entity.
 * 2. Child NotificationEvents retain their IDs, timestamps, read/archive/snooze states.
 * 3. Grouping rule:
 *      recipientUserId + sourceEntityId + compatibleEventFamily + boundedWindow
 * 4. Strictly Ineligible for bundling:
 *    - Direct @mentions (individual semantic prominence required)
 *    - Review / Approval / Access requests
 *    - Different source entities
 * 5. Historical archived events remain archived; new activity delivers a new event.
 */

export const DEFAULT_BUNDLE_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours configurable policy

/**
 * Determines whether an event type can be bundled with others of the same family
 */
export function isEventBundleable(eventType) {
  switch (eventType) {
    case NOTIFICATION_EVENT_TYPES.MENTION:
    case NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED:
    case NOTIFICATION_EVENT_TYPES.APPROVAL_REQUESTED:
    case NOTIFICATION_EVENT_TYPES.ACCESS_REQUESTED:
    case NOTIFICATION_EVENT_TYPES.INVITATION:
    case NOTIFICATION_EVENT_TYPES.ASSIGNED:
    case NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION:
    case NOTIFICATION_EVENT_TYPES.PERSONAL_REMINDER:
    case NOTIFICATION_EVENT_TYPES.SNOOZE_RETURNED:
      return false;

    // Bundleable families
    case NOTIFICATION_EVENT_TYPES.COMMENT_ADDED:
    case NOTIFICATION_EVENT_TYPES.THREAD_REPLY:
    case NOTIFICATION_EVENT_TYPES.REACTION_ADDED:
    case NOTIFICATION_EVENT_TYPES.STATUS_CHANGED:
    case NOTIFICATION_EVENT_TYPES.PRIORITY_CHANGED:
    case NOTIFICATION_EVENT_TYPES.DUE_DATE_CHANGED:
    case NOTIFICATION_EVENT_TYPES.CYCLE_CHANGED:
    case NOTIFICATION_EVENT_TYPES.MILESTONE_CHANGED:
    case NOTIFICATION_EVENT_TYPES.DOC_COMMENT:
      return true;

    default:
      return false;
  }
}

/**
 * Transforms an array of NotificationEvents into presentation items (events and bundles).
 * Events must be pre-sorted or will be ordered by createdAt descending with ID tie-breaker.
 */
export function bundleNotifications(events, bundleWindowMs = DEFAULT_BUNDLE_WINDOW_MS) {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }

  // Sort deterministically: createdAt DESC, then id DESC
  const sorted = [...events].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || '').localeCompare(a.id || '');
  });

  const presentationItems = [];
  const processedIds = new Set();

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (processedIds.has(current.id)) continue;

    // Check bundle eligibility
    if (!isEventBundleable(current.eventType)) {
      processedIds.add(current.id);
      presentationItems.push(current);
      continue;
    }

    const currentFamily = EVENT_FAMILY_MAP[current.eventType] || 'other';
    const currentTime = new Date(current.createdAt).getTime();

    // Look for matching subsequent events in the sorted stream
    const matchingChildren = [current];
    processedIds.add(current.id);

    for (let j = i + 1; j < sorted.length; j++) {
      const candidate = sorted[j];
      if (processedIds.has(candidate.id)) continue;

      if (!isEventBundleable(candidate.eventType)) continue;

      const candidateFamily = EVENT_FAMILY_MAP[candidate.eventType] || 'other';

      // Compatibility check: same recipient, same source entity, same family, within window
      const isSameRecipient = candidate.recipientUserId === current.recipientUserId;
      const isSameEntity =
        candidate.sourceEntityType === current.sourceEntityType &&
        candidate.sourceEntityId === current.sourceEntityId;
      const isSameFamily = candidateFamily === currentFamily;

      const candidateTime = new Date(candidate.createdAt).getTime();
      const isWithinWindow = Math.abs(currentTime - candidateTime) <= bundleWindowMs;

      if (isSameRecipient && isSameEntity && isSameFamily && isWithinWindow) {
        matchingChildren.push(candidate);
        processedIds.add(candidate.id);
      }
    }

    if (matchingChildren.length === 1) {
      presentationItems.push(current);
    } else {
      // Create Presentation Bundle Projection
      const unreadCount = matchingChildren.filter((c) => !c.readAt).length;
      const distinctActors = Array.from(
        new Set(matchingChildren.map((c) => c.actorUserId).filter(Boolean))
      );

      const latestChild = matchingChildren[0];

      const bundleProjection = {
        isBundle: true,
        id: `bundle-${current.sourceEntityType}-${current.sourceEntityId}-${currentFamily}-${current.id}`,
        bundleKey: current.bundleKey || `${current.sourceEntityId}-${currentFamily}`,
        sourceEntityType: current.sourceEntityType,
        sourceEntityId: current.sourceEntityId,
        family: currentFamily,
        events: matchingChildren,
        childIds: matchingChildren.map((c) => c.id),
        latestEvent: latestChild,
        createdAt: latestChild.createdAt,
        importance: matchingChildren.some((c) => c.importance === 'focus') ? 'focus' : 'normal',
        responseRequired: matchingChildren.some((c) => c.responseRequired),
        unreadCount,
        isUnread: unreadCount > 0,
        distinctActors,
        renderPayload: latestChild.renderPayload
      };

      presentationItems.push(bundleProjection);
    }
  }

  return presentationItems;
}
