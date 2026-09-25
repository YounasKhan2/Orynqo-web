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
    (simulatedFailure = false) => {
      const readActiveIds = notifications
        .filter((n) => Boolean(n.readAt) && !n.archivedAt)
        .map((n) => n.id);
      return archiveEvents(readActiveIds, simulatedFailure);
    },
    [notifications, archiveEvents]
  );

  return {
    isMutating,
    markAsRead,
    markAsUnread,
    archiveEvents,
    unarchiveEvents,
    snoozeEvents,
    unsnoozeEvents,
    archiveAllRead
  };
}
