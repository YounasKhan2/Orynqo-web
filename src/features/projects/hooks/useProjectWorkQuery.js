import { useMemo } from 'react';

/**
 * useProjectWorkQuery Hook (PRJ-002)
 *
 * Filters and groups canonical WorkItems belonging to the active project:
 * - Query: workItems.filter(it => it.projectId === projectId && !it.isArchived)
 * - Zero duplication law: each item appears in exactly 1 logical group.
 * - Grouping: by team, milestone, status, assignee, priority.
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {Array<Object>} options.workItems
 * @param {string} [options.groupBy='team'] - 'team' | 'milestone' | 'status' | 'assignee' | 'priority'
 * @param {Function} [options.isAccessible]
 * @returns {{ items: Array<Object>, groups: Array<{ key: string, label: string, items: Array<Object> }>, totalCount: number }}
 */
export function useProjectWorkQuery({
  projectId,
  workItems = [],
  groupBy = 'team',
  isAccessible = () => true
} = {}) {
  return useMemo(() => {
    if (!projectId) {
      return { items: [], groups: [], totalCount: 0 };
    }

    const items = (workItems || []).filter(
      (it) => it.projectId === projectId && !it.isArchived && isAccessible(it, 'work_item')
    );

    const groupMap = new Map();

    items.forEach((item) => {
      let groupKey = 'unassigned';
      let groupLabel = 'Unassigned';

      if (groupBy === 'team') {
        groupKey = item.teamId || 'no-team';
        groupLabel = item.teamId ? `Team: ${item.teamId}` : 'No Team';
      } else if (groupBy === 'milestone') {
        groupKey = item.milestoneId || 'unassigned';
        groupLabel = item.milestoneId ? `Milestone: ${item.milestoneId}` : 'No Milestone';
      } else if (groupBy === 'status') {
        groupKey = item.status || 'todo';
        groupLabel = (item.status || 'todo').toUpperCase();
      } else if (groupBy === 'assignee') {
        groupKey = item.assigneeId || 'unassigned';
        groupLabel = item.assigneeId ? `Assignee: ${item.assigneeId}` : 'Unassigned';
      } else if (groupBy === 'priority') {
        groupKey = item.priority || 'none';
        groupLabel = (item.priority || 'none').toUpperCase();
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, { key: groupKey, label: groupLabel, items: [] });
      }
      groupMap.get(groupKey).items.push(item);
    });

    const groups = Array.from(groupMap.values());

    return {
      items,
      groups,
      totalCount: items.length
    };
  }, [projectId, workItems, groupBy, isAccessible]);
}
