import { useMemo } from 'react';
import { PROJECT_ARCHIVE_STATE } from '../model/projectModel';

/**
 * useProjectsDirectoryQuery Hook (PRJ-007)
 *
 * Scalable workspace project catalogue query with faceted filtering and sorting:
 * - Search: Matches reference, name, and summary.
 * - Filters: operationalState, archiveState, health, teamId, leadUserId, initiativeId.
 * - Sorting: targetDate, name, health, progress, updatedAt.
 * - Zero-leakage security: Excludes inaccessible projects entirely.
 *
 * @param {Object} options
 * @param {Array<Object>} options.projects - Canonical projects collection
 * @param {Array<Object>} options.workItems - Canonical workItems
 * @param {string} [options.searchQuery=''] - Search term
 * @param {Object} [options.filters={}] - Filter criteria
 * @param {string} [options.sortBy='targetDate'] - Sort field
 * @param {string} [options.sortDirection='asc'] - Sort order
 * @param {Function} [options.isAccessible] - Zero-leakage authorization resolver
 * @returns {{ projects: Array<Object>, totalCount: number, activeCount: number, archivedCount: number }}
 */
export function useProjectsDirectoryQuery({
  projects = [],
  workItems = [],
  searchQuery = '',
  filters = {},
  sortBy = 'name',
  sortDirection = 'asc',
  isAccessible = () => true
} = {}) {
  return useMemo(() => {
    // 1. Zero-leakage security filter
    const authorized = (projects || []).filter((proj) => isAccessible(proj, 'project'));

    // Compute aggregate counts before secondary filters
    const activeCount = authorized.filter(
      (p) => (p.archiveState || PROJECT_ARCHIVE_STATE.ACTIVE) === PROJECT_ARCHIVE_STATE.ACTIVE
    ).length;
    const archivedCount = authorized.filter(
      (p) => p.archiveState === PROJECT_ARCHIVE_STATE.ARCHIVED
    ).length;

    // 2. Apply filters
    const filtered = authorized.filter((proj) => {
      // Archive state filter (default: active)
      const archiveFilter = filters.archiveState || PROJECT_ARCHIVE_STATE.ACTIVE;
      const currentArchiveState = proj.archiveState || PROJECT_ARCHIVE_STATE.ACTIVE;
      if (archiveFilter !== 'all' && currentArchiveState !== archiveFilter) {
        return false;
      }

      // Operational state filter
      if (filters.operationalState && filters.operationalState !== 'all') {
        const state = proj.operationalState || proj.status;
        if (state !== filters.operationalState) return false;
      }

      // Health filter
      if (filters.health && filters.health !== 'all') {
        if (proj.health !== filters.health) return false;
      }

      // Participating team filter
      if (filters.teamId && filters.teamId !== 'all') {
        const teams = proj.participatingTeamIds || proj.teamIds || (proj.teamId ? [proj.teamId] : []);
        if (!teams.includes(filters.teamId)) return false;
      }

      // Project lead filter
      if (filters.leadUserId && filters.leadUserId !== 'all') {
        const lead = proj.leadUserId || proj.leadId;
        if (lead !== filters.leadUserId) return false;
      }

      // Initiative filter
      if (filters.initiativeId && filters.initiativeId !== 'all') {
        if (proj.initiativeId !== filters.initiativeId) return false;
      }

      // Search term query (matches identifier/reference, name, summary)
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const refMatch = (proj.identifier || proj.key || '').toLowerCase().includes(q);
        const nameMatch = (proj.name || '').toLowerCase().includes(q);
        const summaryMatch = (proj.summary || '').toLowerCase().includes(q);
        if (!refMatch && !nameMatch && !summaryMatch) return false;
      }

      return true;
    });

    // 3. Stable sorting
    const sorted = [...filtered].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (sortBy === 'targetDate') {
        valA = a.targetDate || '9999-99-99';
        valB = b.targetDate || '9999-99-99';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return {
      projects: sorted,
      totalCount: sorted.length,
      activeCount,
      archivedCount
    };
  }, [projects, workItems, searchQuery, filters, sortBy, sortDirection, isAccessible]);
}
