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

const PRIORITY_RANK = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0
};

/**
 * Calculates urgency rank according to canonical specification:
 * 1. Blocked: 400
 * 2. Overdue: 300
 * 3. Due Today: 200
 * 4. Started (In Progress): 100
 * 5. Normal / Other: 0
 */
export function getUrgencyRank(item, allItems = [], now = new Date(), userTimezone) {
  if (isBlocked(item, allItems)) return 400;
  const timeBucket = getTimeBucket(item, now, MY_WORK_NEAR_TERM_DAYS, userTimezone);
  if (timeBucket === 'overdue') return 300;
  if (timeBucket === 'due_today') return 200;
  if (getStatusCategory(item.status) === 'started') return 100;
  return 0;
}

/**
 * Compares two items by default urgency sort:
 * 1. Urgency Rank (Blocked > Overdue > Due Today > In Progress > Normal)
 * 2. Priority (urgent > high > medium > low > none)
 * 3. Due Date ascending (items with due dates come before items without due dates)
 * 4. Stable tie-breaker: Identifier / ID ascending
 */
export function compareDefaultUrgency(a, b, allItems = [], now = new Date(), userTimezone) {
  // 1. Urgency rank descending
  const rankA = getUrgencyRank(a, allItems, now, userTimezone);
  const rankB = getUrgencyRank(b, allItems, now, userTimezone);
  if (rankA !== rankB) {
    return rankB - rankA;
  }

  // 2. Priority rank descending
  const prioA = PRIORITY_RANK[a.priority] ?? 0;
  const prioB = PRIORITY_RANK[b.priority] ?? 0;
  if (prioA !== prioB) {
    return prioB - prioA;
  }

  // 3. Due date ascending (items with due date come before null)
  const dueA = a.dueDate || '';
  const dueB = b.dueDate || '';
  if (dueA && dueB && dueA !== dueB) {
    return dueA.localeCompare(dueB);
  }
  if (dueA && !dueB) return -1;
  if (!dueA && dueB) return 1;

  // 4. Stable identifier / ID tie-breaker ascending
  const idA = String(a.identifier || a.id || '');
  const idB = String(b.identifier || b.id || '');
  return idA.localeCompare(idB);
}

function sortItems(items, sort, allItems = [], now = new Date(), userTimezone) {
  const config = sort || { field: 'urgency', direction: 'desc' };
  const factor = config.direction === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    if (config.field === 'urgency') {
      const cmp = compareDefaultUrgency(a, b, allItems, now, userTimezone);
      return config.direction === 'asc' ? -cmp : cmp;
    }

    if (config.field === 'dueDate') {
      const dueA = a.dueDate || '9999-12-31';
      const dueB = b.dueDate || '9999-12-31';
      if (dueA !== dueB) return factor * dueA.localeCompare(dueB);
    }

    if (config.field === 'priority') {
      const prioDiff = (PRIORITY_RANK[a.priority] || 0) - (PRIORITY_RANK[b.priority] || 0);
      if (prioDiff !== 0) return factor * prioDiff;
    }

    if (config.field === 'updatedAt' || config.field === 'createdAt') {
      const dateA = String(a.updatedAt || a.createdAt || '');
      const dateB = String(b.updatedAt || b.createdAt || '');
      if (dateA !== dateB) return factor * dateA.localeCompare(dateB);
    }

    // Tie-breaker
    const idA = String(a.identifier || a.id || '');
    const idB = String(b.identifier || b.id || '');
    return idA.localeCompare(idB);
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
  userTimezone,
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
    ? bucketMyWorkItems({ items: scoped, allItems: items, now, userTimezone, nearTermDays })
    : null;

  const summaryMetrics = {
    totalActive: activeItems.length,
    overdueCount: activeItems.filter((item) => getTimeBucket(item, now, nearTermDays, userTimezone) === 'overdue').length,
    dueTodayCount: activeItems.filter((item) => getTimeBucket(item, now, nearTermDays, userTimezone) === 'due_today').length,
    inProgressCount: activeItems.filter((item) => getStatusCategory(item.status) === 'started').length,
    blockedCount: activeItems.filter((item) => isBlocked(item, items)).length,
    completedPastWeekCount: buckets?.recentlyCompleted?.length || 0
  };

  const enriched = scoped.map((item) => {
    const attentionReasons = getAttentionReasons(item, items, now, userTimezone);
    return attentionReasons.length
      ? { ...item, attentionReasons, primaryAttentionReason: attentionReasons[0] }
      : item;
  });

  return {
    items: sortItems(enriched, sort, items, now, userTimezone),
    summaryMetrics,
    buckets,
    pageInfo: { hasNextPage: false }
  };
}

export function useMyWorkQuery(options = {}) {
  return useMemo(() => deriveMyWorkQuery(options), [
    options.items,
    options.workspaceId,
    options.currentUserId,
    options.scope,
    options.filters,
    options.sort,
    options.now,
    options.userTimezone,
    options.nearTermDays
  ]);
}
