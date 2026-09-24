import { useMemo } from 'react';
import { CURRENT_USER } from '../data/mockData';

/**
 * useWorkItemsFilter Hook
 * Computes filtered items based on team, view, search query, and compound filters
 */
export function useWorkItemsFilter({
  items = [],
  activeTeamId,
  activeView,
  searchQuery = '',
  filters = { status: 'all', priority: 'all', assignee: 'all', project: 'all' }
}) {
  return useMemo(() => {
    return items.filter((item) => {
      // Exclude sub-items from top-level views (sub-items are resolved via parentId hierarchy)
      if (item.parentId) {
        return false;
      }

      // Team filter (unless special views like my-issues or inbox)
      if (activeView !== 'my-issues' && item.teamId !== activeTeamId) {
        return false;
      }

      // My Issues view filter
      if (activeView === 'my-issues' && item.assigneeId !== CURRENT_USER.id) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          item.identifier.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Status Filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Priority Filter
      if (filters.priority !== 'all' && item.priority !== filters.priority) {
        return false;
      }

      // Assignee Filter
      if (filters.assignee !== 'all' && item.assigneeId !== filters.assignee) {
        return false;
      }

      // Project Filter
      if (filters.project && filters.project !== 'all' && item.projectId !== filters.project) {
        return false;
      }

      return true;
    });
  }, [items, activeTeamId, activeView, searchQuery, filters]);
}
