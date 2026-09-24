import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useGridSelection Hook
 * Enforces UI-01B Selection Laws:
 * 1. Bulk selection belongs strictly to the current projection/query context.
 * 2. Filter/query change -> CLEAR bulk selection.
 * 3. Context/saved-view/team change -> CLEAR bulk selection.
 * 4. Sort change -> PRESERVE selection.
 * 5. Group collapse/expand -> PRESERVE selection.
 * 6. Incremental loading -> PRESERVE existing selection.
 * 7. Deleted items -> Prune deleted IDs.
 * 8. Header checkbox selects visible/loaded rows only (NO global isAllSelected).
 */
export function useGridSelection({
  initialSelectedIds = [],
  onSelectionChange,
  queryDependencyKey
} = {}) {
  const [multiSelectedIds, setMultiSelectedIds] = useState(initialSelectedIds);
  const [selectionAnchor, setSelectionAnchor] = useState(null);

  // Sync to parent callback
  const prevIdsRef = useRef(multiSelectedIds);
  useEffect(() => {
    if (prevIdsRef.current !== multiSelectedIds) {
      prevIdsRef.current = multiSelectedIds;
      onSelectionChange?.(multiSelectedIds);
    }
  }, [multiSelectedIds, onSelectionChange]);

  // Clear selection when material query context changes (filter, search, view, team)
  const prevQueryDepRef = useRef(queryDependencyKey);
  useEffect(() => {
    if (prevQueryDepRef.current !== undefined && prevQueryDepRef.current !== queryDependencyKey) {
      setMultiSelectedIds([]);
      setSelectionAnchor(null);
    }
    prevQueryDepRef.current = queryDependencyKey;
  }, [queryDependencyKey]);

  // Toggle single item selection
  const toggleSelect = useCallback((id) => {
    setMultiSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      const next = isSelected ? prev.filter((item) => item !== id) : [...prev, id];
      return next;
    });
    setSelectionAnchor(id);
  }, []);

  // Select range with Shift-click / Shift-navigation
  const selectRange = useCallback((targetId, allVisibleIds = []) => {
    if (!selectionAnchor || allVisibleIds.length === 0) {
      toggleSelect(targetId);
      return;
    }

    const anchorIndex = allVisibleIds.indexOf(selectionAnchor);
    const targetIndex = allVisibleIds.indexOf(targetId);

    if (anchorIndex === -1 || targetIndex === -1) {
      toggleSelect(targetId);
      return;
    }

    const start = Math.min(anchorIndex, targetIndex);
    const end = Math.max(anchorIndex, targetIndex);
    const rangeIds = allVisibleIds.slice(start, end + 1);

    setMultiSelectedIds((prev) => {
      const merged = new Set([...prev, ...rangeIds]);
      return Array.from(merged);
    });
  }, [selectionAnchor, toggleSelect]);

  // Header checkbox: selects/deselects visible items only
  const selectAllVisible = useCallback((visibleIds = []) => {
    if (visibleIds.length === 0) {
      setMultiSelectedIds([]);
      return;
    }

    const allVisibleSelected = visibleIds.every((id) => multiSelectedIds.includes(id));
    if (allVisibleSelected) {
      // Deselect all visible
      setMultiSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setMultiSelectedIds((prev) => {
        const merged = new Set([...prev, ...visibleIds]);
        return Array.from(merged);
      });
    }
  }, [multiSelectedIds]);

  // Explicitly clear selection
  const clearSelection = useCallback(() => {
    setMultiSelectedIds([]);
    setSelectionAnchor(null);
  }, []);

  // Prune deleted items from selection
  const pruneDeleted = useCallback((existingIds = []) => {
    const existingSet = new Set(existingIds);
    setMultiSelectedIds((prev) => {
      const pruned = prev.filter((id) => existingSet.has(id));
      return pruned.length === prev.length ? prev : pruned;
    });
  }, []);

  return {
    multiSelectedIds,
    setMultiSelectedIds,
    selectionAnchor,
    setSelectionAnchor,
    toggleSelect,
    selectRange,
    selectAllVisible,
    clearSelection,
    pruneDeleted
  };
}
