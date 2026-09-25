import { useState, useCallback } from 'react';

/**
 * useInboxMutations Hook (UI-04A / UI-04B)
 *
 * Strict Ownership Boundary:
 * - Owns ONLY NotificationEvent lifecycle mutations:
 *   - markAsRead
 *   - markAsUnread
 *   - archiveEvents
 *   - unarchiveEvents
 *   - snoozeEvents
 *   - unsnoozeEvents
 *   - archiveAllRead
 * - Safe optimistic execution with rollback on rejection
 * - Does NOT own domain actions (comments, work item status, approvals).
 */

export function useInboxMutations({
  notifications,
  setNotifications,
  onMutationError
}) {
  const [isMutating, setIsMutating] = useState(false);

  // Helper for applying optimistic lifecycle transitions with rollback
  const applyOptimisticMutation = useCallback(
    async (eventIds, updateFn, simulatedFailure = false) => {
      if (!eventIds || eventIds.length === 0) return;

      const previousState = [...notifications];
      const targetIdSet = new Set(eventIds);

      // 1. Optimistic apply
      setNotifications((prev) =>
        prev.map((n) => (targetIdSet.has(n.id) ? updateFn(n) : n))
      );

      // 2. Perform async boundary / verification
      try {
        setIsMutating(true);
        if (simulatedFailure) {
          throw new Error('Simulated network failure on notification mutation');
        }
        // Success
      } catch (err) {
        // Rollback
        setNotifications(previousState);
        onMutationError?.(err);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [notifications, setNotifications, onMutationError]
  );

  const markAsRead = useCallback(
    (eventIds, simulatedFailure = false) => {
      const now = new Date().toISOString();
      return applyOptimisticMutation(
        eventIds,
        (n) => ({ ...n, readAt: n.readAt || now }),
        simulatedFailure
      );
    },
    [applyOptimisticMutation]
  );

  const markAsUnread = useCallback(
    (eventIds, simulatedFailure = false) => {
      return applyOptimisticMutation(
        eventIds,
        (n) => ({ ...n, readAt: null }),
        simulatedFailure
      );
    },
    [applyOptimisticMutation]
  );

  const archiveEvents = useCallback(
    (eventIds, simulatedFailure = false) => {
      const now = new Date().toISOString();
      return applyOptimisticMutation(
        eventIds,
        (n) => ({ ...n, archivedAt: now, snoozedUntil: null }),
        simulatedFailure
      );
    },
    [applyOptimisticMutation]
  );

  const unarchiveEvents = useCallback(
    (eventIds, simulatedFailure = false) => {
      return applyOptimisticMutation(
        eventIds,
        (n) => ({ ...n, archivedAt: null }),
        simulatedFailure
      );
    },
    [applyOptimisticMutation]
  );

  const snoozeEvents = useCallback(
    (eventIds, untilIso, simulatedFailure = false) => {
      return applyOptimisticMutation(
        eventIds,
        (n) => ({ ...n, snoozedUntil: untilIso }),
        simulatedFailure
      );
    },
    [applyOptimisticMutation]
  );

  const unsnoozeEvents = useCallback(
    (eventIds, simulatedFailure = false) => {
      return applyOptimisticMutation(
        eventIds,
        (n) => ({ ...n, snoozedUntil: null }),
        simulatedFailure
      );
    },
    [applyOptimisticMutation]
  );

  const archiveAllRead = useCallback(
    (explicitIdsOrScope = null, simulatedFailure = false) => {
      let targetIds = [];

      if (Array.isArray(explicitIdsOrScope)) {
        targetIds = explicitIdsOrScope;
      } else if (explicitIdsOrScope && typeof explicitIdsOrScope === 'object') {
        const { workspaceId, recipientUserId } = explicitIdsOrScope;
        targetIds = notifications
          .filter((n) => {
            if (workspaceId && n.workspaceId !== workspaceId) return false;
            if (recipientUserId && n.recipientUserId !== recipientUserId) return false;
            // Must be read, not archived, and not currently snoozed
            const isSnoozed = n.snoozedUntil && new Date(n.snoozedUntil).getTime() > Date.now();
            return Boolean(n.readAt) && !n.archivedAt && !isSnoozed;
          })
          .map((n) => n.id);
      } else {
        // Fallback default: only unarchived, unsnoozed read events
        targetIds = notifications
          .filter((n) => {
            const isSnoozed = n.snoozedUntil && new Date(n.snoozedUntil).getTime() > Date.now();
            return Boolean(n.readAt) && !n.archivedAt && !isSnoozed;
          })
          .map((n) => n.id);
      }

      return archiveEvents(targetIds, simulatedFailure);
    },
    [notifications, archiveEvents]
  );

  const ingestNewEvents = useCallback(
    (newEvents) => {
      if (!newEvents) return;
      const list = Array.isArray(newEvents) ? newEvents : [newEvents];
      if (list.length === 0) return;
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        const nonDuplicates = list.filter((e) => !existingIds.has(e.id));
        return [...nonDuplicates, ...prev];
      });
    },
    [setNotifications]
  );

  return {
    isMutating,
    markAsRead,
    markAsUnread,
    archiveEvents,
    unarchiveEvents,
    snoozeEvents,
    unsnoozeEvents,
    archiveAllRead,
    ingestNewEvents
  };
}
