import { useMemo } from 'react';
import { getStatusCategory } from '../../../constants/workItems';
import {
  classifyDueDate,
  getCalendarDateString,
  addCalendarDays,
  resolveTimezone,
  DEFAULT_NEAR_TERM_DAYS,
  DEFAULT_RETENTION_DAYS
} from '../../../constants/dateUtils';

export const MY_WORK_NEAR_TERM_DAYS = DEFAULT_NEAR_TERM_DAYS;
export const MY_WORK_COMPLETED_RETENTION_DAYS = DEFAULT_RETENTION_DAYS;

export function getTimeBucket(
  item,
  now = new Date(),
  nearTermDays = MY_WORK_NEAR_TERM_DAYS,
  userTimezone
) {
  return classifyDueDate(item?.dueDate, {
    now,
    timeZone: userTimezone,
    nearTermDays
  });
}

export function isCompletedCategory(item) {
  const category = getStatusCategory(item?.status);
  return category === 'completed' || category === 'canceled';
}

export function isBlocked(item, allItems = []) {
  return (item?.relations || []).some((relation) => {
    if (relation.type !== 'blocked_by') return false;
    if (!relation.targetId) return true;
    const target = allItems.find((candidate) => candidate.id === relation.targetId);
    return !target || !isCompletedCategory(target);
  });
}

export function getAttentionReasons(item, allItems = [], now = new Date(), userTimezone) {
  const reasons = [];
  const timeBucket = getTimeBucket(item, now, MY_WORK_NEAR_TERM_DAYS, userTimezone);

  if (isBlocked(item, allItems)) reasons.push('blocked');
  if (timeBucket === 'overdue') reasons.push('overdue');
  if (timeBucket === 'due_today') reasons.push('due_today');
  if (item?.isReviewRequested || item?.reviewRequested) reasons.push('review_requested');

  return reasons;
}

export function getPrimaryAttentionReason(item, allItems = [], now = new Date(), userTimezone) {
  const reasons = getAttentionReasons(item, allItems, now, userTimezone);
  return reasons[0] || null;
}

export function bucketMyWorkItems({
  items = [],
  allItems = items,
  now = new Date(),
  userTimezone,
  nearTermDays = MY_WORK_NEAR_TERM_DAYS,
  completedRetentionDays = MY_WORK_COMPLETED_RETENTION_DAYS
} = {}) {
  const buckets = {
    needsAttention: [],
    inProgress: [],
    upcoming: [],
    unscheduled: [],
    recentlyCompleted: []
  };

  const tz = resolveTimezone(userTimezone);
  const todayCalStr = getCalendarDateString(now, tz);
  const completedCutoffCalStr = addCalendarDays(todayCalStr, -completedRetentionDays);

  items.forEach((item) => {
    const category = getStatusCategory(item.status);
    const completedAtCalStr = item.completedAt ? getCalendarDateString(item.completedAt, tz) : null;
    const attentionReasons = getAttentionReasons(item, allItems, now, tz);

    if (!isCompletedCategory(item) && attentionReasons.length > 0) {
      buckets.needsAttention.push({
        ...item,
        attentionReasons,
        primaryAttentionReason: attentionReasons[0]
      });
      return;
    }

    if (!isCompletedCategory(item) && category === 'started') {
      buckets.inProgress.push(item);
      return;
    }

    if (!isCompletedCategory(item) && getTimeBucket(item, now, nearTermDays, tz) === 'due_soon') {
      buckets.upcoming.push(item);
      return;
    }

    if (!isCompletedCategory(item) && !item.dueDate && !item.cycleId) {
      buckets.unscheduled.push(item);
      return;
    }

    if (isCompletedCategory(item) && completedAtCalStr && completedAtCalStr >= completedCutoffCalStr) {
      buckets.recentlyCompleted.push(item);
    }
  });

  return buckets;
}

export function useMyWorkBuckets(options = {}) {
  const {
    items,
    allItems,
    now,
    userTimezone,
    nearTermDays = MY_WORK_NEAR_TERM_DAYS,
    completedRetentionDays = MY_WORK_COMPLETED_RETENTION_DAYS
  } = options;

  return useMemo(
    () => bucketMyWorkItems({ items, allItems, now, userTimezone, nearTermDays, completedRetentionDays }),
    [items, allItems, now, userTimezone, nearTermDays, completedRetentionDays]
  );
}
