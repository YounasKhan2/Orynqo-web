import React, { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_WORK_ITEMS, TEAMS, PROJECTS } from '../../data/mockData';

/**
 * ============================================================================
 * ARCHITECTURAL BOUNDARY NOTICE: PROTOTYPE IN-MEMORY DATA ADAPTER
 * ============================================================================
 *
 * Current Role:
 * WorkspaceContext serves strictly as a temporary, in-memory prototype adapter
 * for Work Items domain mutations and local selection state.
 *
 * CRITICAL ARCHITECTURAL BOUNDARY:
 * Do NOT expand WorkspaceContext into a universal monolithic application store!
 * In the production architecture, these responsibilities MUST be partitioned:
 *
 * 1. SERVER STATE (Data Synchronization Layer):
 *    - Managed by a query/cache manager (e.g. TanStack Query or dedicated sync engine)
 *    - Handles background polling, delta sync, offline queues, optimistic reconciliation.
 *
 * 2. DOMAIN ENTITIES (Domain Repositories):
 *    - Segregated into independent bounded context repositories:
 *      * Projects & Initiatives
 *      * Cycles & Milestones
 *      * Living Specs & Documents
 *      * Members, Roles & Permissions
 *      * Notifications & Triage Feed
 *      * Activity Log & Audit Trail
 *    - MUST NOT be consolidated into one giant WorkspaceContext.
 *
 * 3. CLIENT WORKFLOW STATE:
 *    - Filter algebra, sorting criteria, draft edits, active view projections.
 *
 * 4. SELECTION STATE:
 *    - URL/route-driven primary selection (?item=OR-101) or dedicated transient selection managers.
 *
 * 5. LOCAL UI STATE:
 *    - Modals, drawers, density toggles, sidebars (isolated in UIContext).
 * ============================================================================
 */

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children, initialItems, initialSelectedItemId }) {
  // Canonical Work Items store
  const [items, setItems] = useState(() => initialItems || INITIAL_WORK_ITEMS);
  const [activeTeamId, setActiveTeamId] = useState('team-core');
  const [selectedItemId, setSelectedItemId] = useState(() =>
    initialSelectedItemId !== undefined
      ? initialSelectedItemId
      : (initialItems || INITIAL_WORK_ITEMS)[0]?.id || null
  );
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);

  // Mutate single work item
  const updateItem = useCallback((id, updates) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Create work item (Canonical Creation Boundary)
  const createItem = useCallback((createInput) => {
    const team = TEAMS.find((t) => t.id === createInput.teamId) || TEAMS[0];
    const timestamp = Date.now();
    const count = Math.floor(1000 + Math.random() * 9000);
    const canonicalItem = {
      id: createInput.id || `item-${timestamp}`,
      identifier: createInput.identifier || `${team?.key || 'TASK'}-${count}`,
      title: createInput.title,
      description: createInput.description || '',
      teamId: createInput.teamId,
      projectId: createInput.projectId || null,
      cycleId: createInput.cycleId || null,
      type: createInput.type || 'task',
      status: createInput.status || 'todo',
      priority: createInput.priority || 'medium',
      assigneeId: createInput.assigneeId || null,
      labels: createInput.labels || [],
      dueDate: createInput.dueDate || null,
      workspaceId: createInput.workspaceId || 'wks-core',
      parentId: createInput.parentId || null,
      relations: createInput.relations || [],
      documentLinks: createInput.documentLinks || [],
      createdAt: createInput.createdAt || new Date().toISOString(),
      commentsCount: createInput.commentsCount || 0
    };
    setItems((prev) => [canonicalItem, ...prev]);
    setSelectedItemId(canonicalItem.id);
    return canonicalItem;
  }, []);

  // Delete single item
  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setMultiSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    setSelectedItemId((prev) => (prev === id ? null : prev));
  }, []);

  // Normalized Bulk Update
  const bulkUpdate = useCallback((patch) => {
    const succeeded = [];
    const skipped = [];
    const failed = [];

    setItems((prev) =>
      prev.map((it) => {
        if (!multiSelectedIds.includes(it.id)) return it;
        if (it.isReadOnly) {
          skipped.push(it.id);
          return it;
        }
        succeeded.push(it.id);
        return { ...it, ...patch };
      })
    );
    setMultiSelectedIds([]);
    return { succeeded, skipped, failed };
  }, [multiSelectedIds]);

  // Bulk status change
  const bulkUpdateStatus = useCallback((status) => {
    return bulkUpdate({ status });
  }, [bulkUpdate]);

  // Bulk assign change
  const bulkAssign = useCallback((assigneeId) => {
    return bulkUpdate({ assigneeId });
  }, [bulkUpdate]);

  // Bulk delete
  const deleteSelected = useCallback(() => {
    setItems((prev) => prev.filter((it) => !multiSelectedIds.includes(it.id)));
    setMultiSelectedIds([]);
  }, [multiSelectedIds]);

  // Multi-selection helpers
  const toggleMultiSelect = useCallback((id) => {
    setMultiSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((targetIds) => {
    setMultiSelectedIds((prev) =>
      prev.length === targetIds.length ? [] : [...targetIds]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setMultiSelectedIds([]);
  }, []);

  const selectItem = useCallback((id) => {
    setSelectedItemId(id);
  }, []);

  const selectedItem = items.find((it) => it.id === selectedItemId) || items[0] || null;
  const activeTeam = TEAMS.find((t) => t.id === activeTeamId) || TEAMS[0];

  const value = {
    items,
    activeTeamId,
    setActiveTeamId,
    activeTeam,
    selectedItemId,
    selectedItem,
    selectItem,
    multiSelectedIds,
    toggleMultiSelect,
    selectAll,
    clearSelection,
    updateItem,
    createItem,
    deleteItem,
    bulkUpdate,
    bulkUpdateStatus,
    bulkAssign,
    deleteSelected
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
