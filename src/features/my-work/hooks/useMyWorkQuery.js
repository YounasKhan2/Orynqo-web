import { useMemo } from 'react';
import { CURRENT_USER } from '../../../data/mockData';
import { getStatusCategory } from '../../../constants/workItems';
import {
  bucketMyWorkItems,
  getAttentionReasons,
  getTimeBucket,
  isBlocked,
  isCompletedCategory,
  MY_WORK_NEAR_TERM_DAYS
} from './useMyWorkBuckets';

function matchesScope(item, scope, currentUserId) {
  if (scope === 'created') return item.creatorId === currentUserId;
  if (scope === 'subscribed') return (item.subscriberIds || []).includes(currentUserId);
  return item.assigneeId === currentUserId;
}

function matchesFilters(item, filters = {}) {
  const search = (filters.searchQuery || '').trim().toLowerCase();
  if (search) {
    const haystack = [item.identifier, item.title, item.teamId, item.projectId]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  // Generic UI filter shapes
  if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
  if (filters.priority && filters.priority !== 'all' && item.priority !== filters.priority) return false;
  if (filters.project && filters.project !== 'all' && item.projectId !== filters.project) return false;
  if (filters.assignee && filters.assignee !== 'all' && item.assigneeId !== filters.assignee) return false;

  // Typed array filter shapes
  if (filters.teamIds?.length && !filters.teamIds.includes(item.teamId)) return false;
  if (filters.projectIds?.length && !filters.projectIds.includes(item.projectId)) return false;
  if (filters.cycleIds?.length && !filters.cycleIds.includes(item.cycleId)) return false;
  if (filters.priorities?.length && !filters.priorities.includes(item.priority)) return false;
  if (filters.statusCategories?.length && !filters.statusCategories.includes(getStatusCategory(item.status))) return false;

  return true;
}

function sortItems(items, sort) {
  const config = sort || { field: 'urgency', direction: 'desc' };
  const factor = config.direction === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    if (config.field === 'dueDate') {
      return factor * String(a.dueDate || '9999-12-31').localeCompare(String(b.dueDate || '9999-12-31'));
    }
    if (config.field === 'priority') {
      const order = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
      return factor * ((order[a.priority] || 0) - (order[b.priority] || 0));
    }
    return factor * String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || ''));
  });
}

export function deriveMyWorkQuery({
  items = [],
  workspaceId = 'wks-core',
  currentUserId = CURRENT_USER.id,
  scope = 'overview',
  filters = {},
  sort,
  now = new Date(),
  nearTermDays = MY_WORK_NEAR_TERM_DAYS
}) {
  const scoped = items.filter(
    (item) =>
      item.workspaceId === workspaceId &&
      !item.parentId &&
      matchesScope(item, scope, currentUserId) &&
      matchesFilters(item, filters)
  );

  const activeItems = scoped.filter((item) => !isCompletedCategory(item));
  const buckets = scope === 'overview'
    ? bucketMyWorkItems({ items: scoped, allItems: items, now, nearTermDays })
    : null;

  const summaryMetrics = {
    totalActive: activeItems.length,
    overdueCount: activeItems.filter((item) => getTimeBucket(item, now, nearTermDays) === 'overdue').length,
    dueTodayCount: activeItems.filter((item) => getTimeBucket(item, now, nearTermDays) === 'due_today').length,
    inProgressCount: activeItems.filter((item) => getStatusCategory(item.status) === 'started').length,
    blockedCount: activeItems.filter((item) => isBlocked(item, items)).length,
    completedPastWeekCount: buckets?.recentlyCompleted?.length || 0
  };

  const enriched = scoped.map((item) => {
    const attentionReasons = getAttentionReasons(item, items, now);
    return attentionReasons.length
      ? { ...item, attentionReasons, primaryAttentionReason: attentionReasons[0] }
      : item;
  });

  return {
    items: sortItems(enriched, sort),
    summaryMetrics,
    buckets,
    pageInfo: { hasNextPage: false }
  };
}

export function useMyWorkQuery(options) {
  return useMemo(() => deriveMyWorkQuery(options), [
    options.items,
    options.workspaceId,
    options.currentUserId,
    options.scope,
    options.filters,
    options.sort,
    options.now,
    options.nearTermDays
  ]);
}
