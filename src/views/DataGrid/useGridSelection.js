import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useGridSelection Hook
 * Supports both Controlled and Uncontrolled selection ownership.
 *
 * Enforces UI-01B Selection Laws:
 * 1. Bulk selection belongs strictly to the current projection/query context.
 * 2. Filter/query change -> CLEAR bulk selection (notifies consumer in controlled mode).
 * 3. Context/saved-view/team change -> CLEAR bulk selection.
 * 4. Sort change -> PRESERVE selection.
 * 5. Group collapse/expand -> PRESERVE selection.
 * 6. Incremental loading -> PRESERVE existing selection.
 * 7. Deleted items -> Prune deleted IDs.
 * 8. Header checkbox selects visible/loaded rows only (NO global isAllSelected).
 */
export function useGridSelection({
  controlledSelectedIds,
  initialSelectedIds = [],
  onToggleSelect,
  onClearSelection,
  onSelectAllVisible,
  onSelectionChange,
  queryDependencyKey
} = {}) {
  const isControlled = controlledSelectedIds !== undefined;
  const [internalSelectedIds, setInternalSelectedIds] = useState(initialSelectedIds);
  const [selectionAnchor, setSelectionAnchor] = useState(null);

  const multiSelectedIds = isControlled ? controlledSelectedIds : internalSelectedIds;

  // Clear selection when material query context changes (filter, search, view, team)
  const prevQueryDepRef = useRef(queryDependencyKey);
  useEffect(() => {
    if (prevQueryDepRef.current !== undefined && prevQueryDepRef.current !== queryDependencyKey) {
      if (isControlled) {
        onClearSelection?.();
      } else {
        setInternalSelectedIds([]);
        onSelectionChange?.([]);
      }
      setSelectionAnchor(null);
    }
    prevQueryDepRef.current = queryDependencyKey;
  }, [queryDependencyKey, isControlled, onClearSelection, onSelectionChange]);

  // Toggle single item selection
  const toggleSelect = useCallback((id) => {
    if (isControlled && onToggleSelect) {
      onToggleSelect(id);
    } else {
      const isSelected = multiSelectedIds.includes(id);
      const next = isSelected
        ? multiSelectedIds.filter((item) => item !== id)
        : [...multiSelectedIds, id];
      if (isControlled) {
        onSelectionChange?.(next);
      } else {
        setInternalSelectedIds(next);
        onSelectionChange?.(next);
      }
    }
    setSelectionAnchor(id);
  }, [isControlled, onToggleSelect, multiSelectedIds, onSelectionChange]);

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
    const merged = Array.from(new Set([...multiSelectedIds, ...rangeIds]));

    if (isControlled) {
      if (onSelectAllVisible) {
        onSelectAllVisible(merged);
      } else if (onSelectionChange) {
        onSelectionChange(merged);
      }
    } else {
      setInternalSelectedIds(merged);
      onSelectionChange?.(merged);
    }
  }, [selectionAnchor, toggleSelect, isControlled, multiSelectedIds, onSelectAllVisible, onSelectionChange]);

  // Header checkbox: selects/deselects visible items only
  const selectAllVisible = useCallback((visibleIds = []) => {
    if (visibleIds.length === 0) {
      if (isControlled) {
        onClearSelection?.();
      } else {
        setInternalSelectedIds([]);
        onSelectionChange?.([]);
      }
      return;
    }

    const allVisibleSelected = visibleIds.every((id) => multiSelectedIds.includes(id));
    if (allVisibleSelected) {
      if (isControlled) {
        if (onSelectAllVisible) {
          onSelectAllVisible([]);
        } else if (onClearSelection) {
          onClearSelection();
        } else {
          onSelectionChange?.([]);
        }
      } else {
        setInternalSelectedIds([]);
        onSelectionChange?.([]);
      }
    } else {
      if (isControlled) {
        if (onSelectAllVisible) {
          onSelectAllVisible(visibleIds);
        } else if (onSelectionChange) {
          const merged = Array.from(new Set([...multiSelectedIds, ...visibleIds]));
          onSelectionChange(merged);
        }
      } else {
        const merged = Array.from(new Set([...multiSelectedIds, ...visibleIds]));
        setInternalSelectedIds(merged);
        onSelectionChange?.(merged);
      }
    }
  }, [isControlled, multiSelectedIds, onSelectAllVisible, onClearSelection, onSelectionChange]);

  // Explicitly clear selection
  const clearSelection = useCallback(() => {
    if (isControlled) {
      onClearSelection?.();
    } else {
      setInternalSelectedIds([]);
      onSelectionChange?.([]);
    }
    setSelectionAnchor(null);
  }, [isControlled, onClearSelection, onSelectionChange]);

  // Prune deleted items from selection
  const pruneDeleted = useCallback((existingIds = []) => {
    const existingSet = new Set(existingIds);
    const pruned = multiSelectedIds.filter((id) => existingSet.has(id));
    if (pruned.length !== multiSelectedIds.length) {
      if (isControlled) {
        onSelectionChange?.(pruned);
      } else {
        setInternalSelectedIds(pruned);
        onSelectionChange?.(pruned);
      }
    }
  }, [multiSelectedIds, isControlled, onSelectionChange]);

  return {
    multiSelectedIds,
    setMultiSelectedIds: isControlled ? (onSelectionChange || onSelectAllVisible) : setInternalSelectedIds,
    selectionAnchor,
    setSelectionAnchor,
    toggleSelect,
    selectRange,
    selectAllVisible,
    clearSelection,
    pruneDeleted,
    isControlled
  };
}
