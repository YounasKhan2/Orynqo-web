import { useMemo, useCallback } from 'react';
import { bundleNotifications } from '../model/bundler';

/**
 * useInboxQuery Hook (UI-04A / UI-04B)
 *
 * Query Boundary for Personal Triage Inbox:
 * - workspaceId & recipientId tenancy
 * - Tab resolution: 'focus' | 'all' | 'later' | 'archive'
 * - Accurate counts: unreadCount (for sidebar badge), focusCount, totalActiveCount
 * - Presentation bundling
 * - Keyset sorting (createdAt DESC + id tie-breaker)
 * - Search & filter algebra
 * - Permission & zero-leakage awareness
 */

export function deriveInboxQuery({
  notifications = [],
  workspaceId = 'wks-core',
  recipientId = 'usr-1',
  tab = 'focus',
  filters = {},
  searchQuery = '',
  sortBy = 'newest',
  now = new Date().toISOString()
}) {
  const nowDate = new Date(now).getTime();

  // 1. Base Tenant & Recipient isolation
  const tenantScoped = notifications.filter(
    (n) => n.workspaceId === workspaceId && n.recipientUserId === recipientId
  );

  // 2. Compute canonical counts across the workspace
  // Active = not archived, and not currently snoozed (snooze is expired or null)
  const isCurrentlySnoozed = (n) => n.snoozedUntil && new Date(n.snoozedUntil).getTime() > nowDate;
  const isArchived = (n) => Boolean(n.archivedAt);

  const activeEvents = tenantScoped.filter((n) => !isArchived(n) && !isCurrentlySnoozed(n));

  // Sidebar unread count: Unread, Active, Unarchived, Unsnoozed
  const unreadCount = activeEvents.filter((n) => !n.readAt).length;

  // Focus count: Active, unsnoozed, unarchived, importance === 'focus'
  const focusCount = activeEvents.filter((n) => n.importance === 'focus').length;

  // Total active count: All active unsnoozed, unarchived
  const totalActiveCount = activeEvents.length;

  // 3. Tab Filtering
  let tabScoped = [];
  if (tab === 'focus') {
    tabScoped = activeEvents.filter((n) => n.importance === 'focus');
  } else if (tab === 'all') {
    tabScoped = activeEvents;
  } else if (tab === 'later') {
    tabScoped = tenantScoped.filter((n) => !isArchived(n) && isCurrentlySnoozed(n));
  } else if (tab === 'archive') {
    tabScoped = tenantScoped.filter((n) => isArchived(n));
  } else {
    tabScoped = activeEvents;
  }

  // 4. Secondary Filters
  let filtered = tabScoped;

  if (filters.isUnreadOnly) {
    filtered = filtered.filter((n) => !n.readAt);
  }

  if (filters.importance) {
    filtered = filtered.filter((n) => n.importance === filters.importance);
  }

  if (filters.responseRequiredOnly) {
    filtered = filtered.filter((n) => Boolean(n.responseRequired));
  }

  if (filters.sourceType) {
    filtered = filtered.filter((n) => n.sourceEntityType === filters.sourceType);
  }

  if (filters.eventType) {
    filtered = filtered.filter((n) => n.eventType === filters.eventType);
  }

  // 5. Search filtering (Security invariant: Search only matches authorized fields; redacted events don't match sensitive content)
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((n) => {
      if (n.isRedacted) {
        // Redacted events can only match the generic string
        return 'this item is no longer accessible'.includes(q);
      }
      const titleMatch = n.renderPayload?.title?.toLowerCase().includes(q);
      const summaryMatch = n.renderPayload?.summary?.toLowerCase().includes(q);
      const snippetMatch = n.renderPayload?.bodySnippet?.toLowerCase().includes(q);
      const idMatch = n.renderPayload?.identifier?.toLowerCase().includes(q);
      return Boolean(titleMatch || summaryMatch || snippetMatch || idMatch);
    });
  }

  // 6. Deterministic Sorting
  // Default: createdAt DESC + id tie-breaker
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'focus_first') {
      if (a.importance !== b.importance) {
        return a.importance === 'focus' ? -1 : 1;
      }
    }
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || '').localeCompare(a.id || '');
  });

  // 7. Presentation Bundling (applied over filtered, sorted event stream)
  const presentationItems = bundleNotifications(filtered);

  return {
    items: presentationItems,
    rawEvents: filtered,
    unreadCount,
    focusCount,
    totalActiveCount,
    totalFilteredCount: filtered.length,
    pageInfo: {
      hasNextPage: false,
      endCursor: filtered.length > 0 ? `${filtered[filtered.length - 1].createdAt}_${filtered[filtered.length - 1].id}` : null
    }
  };
}

export function useInboxQuery({
  notifications = [],
  workspaceId = 'wks-core',
  recipientId = 'usr-1',
  tab = 'focus',
  filters = {},
  searchQuery = '',
  sortBy = 'newest'
}) {
  return useMemo(() => {
    return deriveInboxQuery({
      notifications,
      workspaceId,
      recipientId,
      tab,
      filters,
      searchQuery,
      sortBy
    });
  }, [notifications, workspaceId, recipientId, tab, filters, searchQuery, sortBy]);
}
