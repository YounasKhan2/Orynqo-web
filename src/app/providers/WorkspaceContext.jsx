import React, { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_WORK_ITEMS, TEAMS, PROJECTS } from '../../data/mockData';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  // Canonical Work Items store
  const [items, setItems] = useState(INITIAL_WORK_ITEMS);
  const [activeTeamId, setActiveTeamId] = useState('team-core');
  const [selectedItemId, setSelectedItemId] = useState(INITIAL_WORK_ITEMS[0]?.id || null);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);

  // Mutate single work item
  const updateItem = useCallback((id, updates) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Create work item
  const createItem = useCallback((newItem) => {
    setItems((prev) => [newItem, ...prev]);
    setSelectedItemId(newItem.id);
  }, []);

  // Delete single item
  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setMultiSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    setSelectedItemId((prev) => (prev === id ? null : prev));
  }, []);

  // Bulk status change
  const bulkUpdateStatus = useCallback((status) => {
    setItems((prev) =>
      prev.map((it) =>
        multiSelectedIds.includes(it.id) ? { ...it, status } : it
      )
    );
    setMultiSelectedIds([]);
  }, [multiSelectedIds]);

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
    bulkUpdateStatus,
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
