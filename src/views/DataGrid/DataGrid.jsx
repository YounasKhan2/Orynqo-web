import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  COLUMN_DEFINITIONS,
  getDefaultColumnWidths,
  getDefaultColumnVisibility
} from './columnRegistry';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridHeader } from './DataGridHeader';
import { DataGridBody } from './DataGridBody';
import { DataGridMobileList } from './DataGridMobileList';
import { DataGridColumnManager } from './DataGridColumnManager';
import { useGridSelection } from './useGridSelection';
import { useGridKeyboard } from './useGridKeyboard';
import { evaluateFilterGroup, buildFilterGroupFromParams } from './filterEvaluator';
import { PRIORITY_DEFINITIONS } from '../../constants/workItems';

/**
 * Universal High-Density Data Grid View Projection
 * Governed by: UI-01B specification (docs/08-ui-01b-high-density-data-grid-contract.md)
 *
 * Invariants:
 * - One canonical WorkItem query/projection pipeline -> reusable across surfaces
 * - Clean 3-tier state separation: Data, Presentation, Selection
 * - Distinct row states: Focused, Inspector-Active, Multi-Selected
 * - Roving tabindex keyboard navigation with explicit property triggers (NO cycle-on-click)
 * - Mobile responsive projection with canonical WorkItem detail container
 */
export function DataGrid({
  items = [],
  selectedItemId,
  onSelectItem,
  onUpdateItem,
  onOpenInspector,
  onCloseInspector,
  isInspectorOpen = false,
  density: propDensity = 'compact',
  onDensityChange,
  groupBy: propGroupBy = 'none',
  onGroupByChange: propOnGroupByChange,
  multiSelectedIds: propMultiSelectedIds,
  onToggleMultiSelect: propToggleMultiSelect,
  onSelectAll: propSelectAll,
  onClearSelection: propClearSelection,
  isKeyboardActive = true,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  filters: externalFilters,
  onFilterChange: externalOnFilterChange,
  onResetFilters: externalOnResetFilters,
  filterGroup: propFilterGroup
}) {
  const containerRef = useRef(null);
  const tableRef = useRef(null);

  // 1. Presentation State
  const [density, setDensity] = useState(propDensity);
  const [columnWidths, setColumnWidths] = useState(getDefaultColumnWidths);
  const [columnVisibility, setColumnVisibility] = useState(getDefaultColumnVisibility);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [groupBy, setGroupBy] = useState(propGroupBy);
  const [sortConfig, setSortConfig] = useState({ field: 'identifier', direction: 'asc' });

  // Sync propGroupBy when changed externally
  useEffect(() => {
    if (propGroupBy) setGroupBy(propGroupBy);
  }, [propGroupBy]);

  const handleGroupByChange = (val) => {
    setGroupBy(val);
    propOnGroupByChange?.(val);
  };

  // Internal search and filters if not provided externally
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalFilters, setInternalFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    project: 'all'
  });

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const onSearchChange = externalOnSearchChange || setInternalSearchQuery;
  const filters = externalFilters !== undefined ? externalFilters : internalFilters;
  const onFilterChange =
    externalOnFilterChange ||
    ((key, val) => setInternalFilters((prev) => ({ ...prev, [key]: val })));
  const onResetFilters =
    externalOnResetFilters ||
    (() => setInternalFilters({ status: 'all', priority: 'all', assignee: 'all', project: 'all' }));

  // Keep density in sync if prop changes
  useEffect(() => {
    if (propDensity) setDensity(propDensity);
  }, [propDensity]);

  const toggleDensity = () => {
    const next = density === 'compact' ? 'comfortable' : 'compact';
    setDensity(next);
    onDensityChange?.(next);
  };

  // 2. Responsive detection (< 768px for mobile projection)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 3. Filter Expression Construction & Evaluation
  const activeFilterGroup = useMemo(() => {
    if (propFilterGroup) return propFilterGroup;
    return buildFilterGroupFromParams({
      searchQuery,
      status: filters.status,
      priority: filters.priority,
      assignee: filters.assignee,
      project: filters.project
    });
  }, [propFilterGroup, searchQuery, filters]);

  // 3b. Optimistic Overrides with Automatic Rollback
  const [optimisticOverrides, setOptimisticOverrides] = useState({});

  useEffect(() => {
    setOptimisticOverrides({});
  }, [items]);

  const effectiveItems = useMemo(() => {
    if (Object.keys(optimisticOverrides).length === 0) return items;
    return items.map((it) => {
      const override = optimisticOverrides[it.id];
      return override ? { ...it, ...override } : it;
    });
  }, [items, optimisticOverrides]);

  // Track item that was edited while focused but no longer matches filter
  const [filterMismatchItemId, setFilterMismatchItemId] = useState(null);

  // Evaluate items matching the filter
  const filteredItems = useMemo(() => {
    return effectiveItems.filter((item) => {
      // Retain item temporarily if currently marked as filter mismatch
      if (item.id === filterMismatchItemId) return true;
      return evaluateFilterGroup(item, activeFilterGroup);
    });
  }, [effectiveItems, activeFilterGroup, filterMismatchItemId]);

  // 4. Deterministic Sorting
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    const { field, direction } = sortConfig;
    const factor = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'priority') {
        valA = PRIORITY_DEFINITIONS[a.priority]?.value ?? 0;
        valB = PRIORITY_DEFINITIONS[b.priority]?.value ?? 0;
      } else if (field === 'estimate') {
        valA = a.estimate ?? -1;
        valB = b.estimate ?? -1;
      } else if (field === 'dueDate' || field === 'createdAt' || field === 'updatedAt') {
        valA = a[field] || '';
        valB = b[field] || '';
      }

      if (valA === valB) {
        // Deterministic tie-breaker by identifier
        return (a.identifier || '').localeCompare(b.identifier || '');
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return factor * valA.localeCompare(valB);
      }
      return factor * (valA > valB ? 1 : -1);
    });

    return list;
  }, [filteredItems, sortConfig]);

  // 5. Selection State & Selection Laws
  // Material query dependency key: changes when filter or search changes, causing selection to clear
  const queryDependencyKey = useMemo(() => {
    return JSON.stringify({
      search: searchQuery,
      filters,
      propFilter: propFilterGroup
    });
  }, [searchQuery, filters, propFilterGroup]);

  const internalSelection = useGridSelection({
    controlledSelectedIds: propMultiSelectedIds,
    onToggleSelect: propToggleMultiSelect,
    onClearSelection: propClearSelection,
    onSelectAllVisible: propSelectAll,
    queryDependencyKey
  });

  const multiSelectedIds = internalSelection.multiSelectedIds;
  const onToggleMultiSelect = internalSelection.toggleSelect;
  const onSelectRange = internalSelection.selectRange;
  const onClearSelection = internalSelection.clearSelection;

  const visibleIds = useMemo(() => sortedItems.map((i) => i.id), [sortedItems]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => multiSelectedIds.includes(id));
  const isIndeterminate = multiSelectedIds.length > 0 && !allVisibleSelected;

  const handleSelectAllVisible = useCallback(() => {
    internalSelection.selectAllVisible(visibleIds);
  }, [internalSelection, visibleIds]);

  // 6. Keyboard & Focus Management
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // Clear filter mismatch when focus moves to another item
  useEffect(() => {
    if (filterMismatchItemId && sortedItems[focusedRowIndex]?.id !== filterMismatchItemId) {
      setFilterMismatchItemId(null);
    }
  }, [focusedRowIndex, filterMismatchItemId, sortedItems]);

  const {
    isEditingTitle,
    setIsEditingTitle,
    activeDropdown,
    setActiveDropdown,
    focusRowElement
  } = useGridKeyboard({
    items: sortedItems,
    focusedRowIndex,
    setFocusedRowIndex,
    onSelectItem,
    onOpenInspector,
    onToggleMultiSelect,
    onSelectRange,
    onSelectAllVisible: handleSelectAllVisible,
    onClearSelection,
    onCloseInspector,
    isInspectorOpen,
    multiSelectedIds,
    isKeyboardActive,
    tableContainerRef: tableRef
  });

  // 7. Column Configuration Actions
  const visibleColumns = useMemo(() => {
    return COLUMN_DEFINITIONS.filter((col) => columnVisibility[col.id] !== false);
  }, [columnVisibility]);

  const handleResizeColumn = useCallback((columnId, newWidth) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnId]: newWidth
    }));
  }, []);

  const handleToggleColumnVisibility = useCallback((columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  }, []);

  const handleResetColumns = useCallback(() => {
    setColumnWidths(getDefaultColumnWidths());
    setColumnVisibility(getDefaultColumnVisibility());
  }, []);

  // 8. Optimistic Inline Update with Filter Mismatch Detection
  const handleUpdateItem = useCallback(
    async (itemId, patch) => {
      const originalItem = effectiveItems.find((i) => i.id === itemId);
      if (!originalItem || originalItem.isReadOnly) return;

      const updatedItem = { ...originalItem, ...patch };

      // Optimistically apply override locally
      setOptimisticOverrides((prev) => ({ ...prev, [itemId]: updatedItem }));

      // Check if updated item violates current active filter
      const stillMatches = evaluateFilterGroup(updatedItem, activeFilterGroup);
      if (!stillMatches) {
        setFilterMismatchItemId(itemId);
      }

      try {
        const result = onUpdateItem?.(itemId, patch);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (err) {
        // Rollback optimistic mutation on failure
        setOptimisticOverrides((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        try {
          const rollbackResult = onUpdateItem?.(itemId, originalItem);
          if (rollbackResult && typeof rollbackResult.catch === 'function') {
            rollbackResult.catch(() => {});
          }
        } catch {
          // ignore synchronous rollback call errors
        }
        throw err;
      }
    },
    [effectiveItems, activeFilterGroup, onUpdateItem]
  );

  const handleCommitTitle = useCallback(
    async (itemId, newTitle) => {
      setIsEditingTitle(false);
      if (newTitle.trim()) {
        try {
          await handleUpdateItem(itemId, { title: newTitle.trim() });
        } catch {
          // Handled via optimistic rollback
        }
      }
      focusRowElement(focusedRowIndex);
    },
    [handleUpdateItem, setIsEditingTitle, focusRowElement, focusedRowIndex]
  );

  const handleCancelTitle = useCallback(() => {
    setIsEditingTitle(false);
    focusRowElement(focusedRowIndex);
  }, [setIsEditingTitle, focusRowElement, focusedRowIndex]);

  const rowHeight = density === 'compact' ? 28 : 34;
  const headerHeight = density === 'compact' ? 28 : 32;

  // Responsive mobile rendering (< 768px)
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflow: 'auto',
          backgroundColor: 'var(--bg-canvas)'
        }}
      >
        <DataGridToolbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          density={density}
          onToggleDensity={toggleDensity}
          totalCount={sortedItems.length}
          selectedCount={multiSelectedIds.length}
          isColumnManagerOpen={isColumnManagerOpen}
          onToggleColumnManager={() => setIsColumnManagerOpen((prev) => !prev)}
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
        <DataGridMobileList
          items={sortedItems}
          selectedItemId={selectedItemId}
          onSelectItem={onSelectItem}
          onOpenDetail={onOpenInspector}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="grid"
      aria-rowcount={sortedItems.length}
      aria-colcount={visibleColumns.length}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* 1. Projection Toolbar */}
      <DataGridToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        groupBy={groupBy}
        onGroupByChange={handleGroupByChange}
        density={density}
        onToggleDensity={toggleDensity}
        totalCount={sortedItems.length}
        selectedCount={multiSelectedIds.length}
        isColumnManagerOpen={isColumnManagerOpen}
        onToggleColumnManager={() => setIsColumnManagerOpen((prev) => !prev)}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      {/* Column Manager Popover */}
      <DataGridColumnManager
        isOpen={isColumnManagerOpen}
        onClose={() => setIsColumnManagerOpen(false)}
        columnVisibility={columnVisibility}
        onToggleColumnVisibility={handleToggleColumnVisibility}
        onResetColumns={handleResetColumns}
      />

      {/* 2. Scrollable Grid Canvas */}
      <div
        ref={tableRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'var(--bg-canvas)'
        }}
      >
        {/* Sticky Header */}
        <DataGridHeader
          visibleColumns={visibleColumns}
          columnWidths={columnWidths}
          sortConfig={sortConfig}
          onSort={(field) => {
            setSortConfig((prev) => ({
              field,
              direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
            }));
          }}
          onResizeColumn={handleResizeColumn}
          allVisibleSelected={allVisibleSelected}
          isIndeterminate={isIndeterminate}
          onSelectAllVisible={handleSelectAllVisible}
          density={density}
          headerHeight={headerHeight}
        />

        {/* Rows Body */}
        <DataGridBody
          items={sortedItems}
          visibleColumns={visibleColumns}
          columnWidths={columnWidths}
          selectedItemId={selectedItemId}
          multiSelectedIds={multiSelectedIds}
          focusedRowIndex={focusedRowIndex}
          rowHeight={rowHeight}
          groupBy={groupBy}
          onSelectItem={(item) => {
            const idx = sortedItems.findIndex((i) => i.id === item.id);
            if (idx !== -1) setFocusedRowIndex(idx);
            onSelectItem?.(item);
          }}
          onOpenInspector={(item) => {
            const idx = sortedItems.findIndex((i) => i.id === item.id);
            if (idx !== -1) setFocusedRowIndex(idx);
            onOpenInspector?.(item);
          }}
          onToggleSelect={onToggleMultiSelect}
          onUpdateItem={handleUpdateItem}
          isEditingTitle={isEditingTitle}
          onCommitTitle={handleCommitTitle}
          onCancelTitle={handleCancelTitle}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          filterMismatchItemId={filterMismatchItemId}
        />
      </div>
    </div>
  );
}

export default DataGrid;
