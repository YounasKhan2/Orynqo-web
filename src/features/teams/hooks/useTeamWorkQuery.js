import { useMemo } from 'react';
import {
  classifyTeamWorkItem,
  WORK_ITEM_TRIAGE_STATES
} from '../model/backlogClassifier';

/**
 * useTeamWorkQuery Hook (TEM-003)
 *
 * Authoritative query over canonical WorkItems owned by the current team.
 * Reconciles status filter tabs:
 * - 'active': items in active cycle execution OR out-of-cycle started work
 * - 'backlog': items uncommitted to cycles and in unstarted status category
 * - 'completed': finished work items
 * - 'all': all unarchived team work items
 *
 * @param {Object} options
 * @param {Array<Object>} options.workItems - Canonical work items from WorkspaceContext
 * @param {string} options.teamId - Active team identifier
 * @param {Array<Object>} options.cycles - Workspace/team cycles
 * @param {'active'|'backlog'|'completed'|'all'} options.tab - Active filter tab
 * @param {string} options.searchQuery - Contextual search filter
 * @returns {{ items: Array<Object>, counts: Object, totalCount: number }}
 */
export function useTeamWorkQuery({
  workItems = [],
  teamId,
  cycles = [],
  tab = 'active',
  searchQuery = ''
}) {
  return useMemo(() => {
    // 1. Filter for canonical items owned by target team and not archived
    const teamItems = (workItems || []).filter((item) => {
      if (item.teamId !== teamId) return false;
      if (item.archivedAt || item.status === 'archived') return false;
      if (item.parentId) return false; // Hierarchical sub-items resolved under parent
      return true;
    });

    // 2. Classify items into logical scopes
    let activeCount = 0;
    let backlogCount = 0;
    let completedCount = 0;

    const classified = teamItems.map((item) => {
      const state = classifyTeamWorkItem(item, teamId, cycles);
      if (state === WORK_ITEM_TRIAGE_STATES.ACTIVE_CYCLE_EXECUTION || state === WORK_ITEM_TRIAGE_STATES.ACTIVE_OUT_OF_CYCLE) {
        activeCount++;
      } else if (state === WORK_ITEM_TRIAGE_STATES.BACKLOG) {
        backlogCount++;
      } else if (state === WORK_ITEM_TRIAGE_STATES.COMPLETED) {
        completedCount++;
      }
      return { item, state };
    });

    // 3. Filter by tab scope
    let scoped = classified.filter(({ state }) => {
      if (tab === 'active') {
        return state === WORK_ITEM_TRIAGE_STATES.ACTIVE_CYCLE_EXECUTION || state === WORK_ITEM_TRIAGE_STATES.ACTIVE_OUT_OF_CYCLE;
      }
      if (tab === 'backlog') {
        return state === WORK_ITEM_TRIAGE_STATES.BACKLOG;
      }
      if (tab === 'completed') {
        return state === WORK_ITEM_TRIAGE_STATES.COMPLETED;
      }
      return true; // 'all' tab includes active, backlog, completed, planned
    }).map(({ item }) => item);

    // 4. Contextual search filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      scoped = scoped.filter((it) => {
        return (
          it.title?.toLowerCase().includes(q) ||
          it.identifier?.toLowerCase().includes(q) ||
          (it.labels || []).some((l) => l.toLowerCase().includes(q))
        );
      });
    }

    return {
      items: scoped,
      counts: {
        active: activeCount,
        backlog: backlogCount,
        completed: completedCount,
        all: teamItems.length
      },
      totalCount: scoped.length
    };
  }, [workItems, teamId, cycles, tab, searchQuery]);
}
