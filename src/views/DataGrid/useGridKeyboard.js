import { useState, useEffect, useCallback, useRef } from 'react';
import { isEditableElement } from '../../hooks/keyboardScopes';

/**
 * useGridKeyboard Hook
 * Roving tabindex focus model & power-user hotkeys for UI-01B Universal Data Grid
 */
export function useGridKeyboard({
  items = [],
  focusedRowIndex = 0,
  setFocusedRowIndex,
  onSelectItem,
  onOpenInspector,
  onToggleMultiSelect,
  onSelectRange,
  onSelectAllVisible,
  onClearSelection,
  onCloseInspector,
  isInspectorOpen = false,
  multiSelectedIds = [],
  isKeyboardActive = true,
  tableContainerRef
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'status' | 'priority' | 'assignee' | null

  // Keep focused row index within bounds
  useEffect(() => {
    if (items.length === 0) {
      setFocusedRowIndex?.(0);
      return;
    }
    if (focusedRowIndex >= items.length) {
      setFocusedRowIndex?.(Math.max(0, items.length - 1));
    }
  }, [items.length, focusedRowIndex, setFocusedRowIndex]);

  // Focus current row element in DOM when index changes
  const focusRowElement = useCallback((index) => {
    if (!tableContainerRef?.current) return;
    const rowEl = tableContainerRef.current.querySelector(`[data-row-index="${index}"]`);
    if (rowEl && document.activeElement !== rowEl && !rowEl.contains(document.activeElement)) {
      rowEl.focus({ preventScroll: true });
    }
  }, [tableContainerRef]);

  const handleKeyDown = useCallback((e) => {
    // Suppress hotkeys if user is typing in an input/textarea
    if (isEditableElement(e.target)) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsEditingTitle(false);
        setActiveDropdown(null);
        focusRowElement(focusedRowIndex);
      }
      return;
    }

    if (!isKeyboardActive) return;

    const currentItem = items[focusedRowIndex];

    // Select all visible (Ctrl+A or Cmd+A)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      onSelectAllVisible?.(items.map((i) => i.id));
      return;
    }

    // Down navigation (j or ArrowDown)
    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length === 0) return;
      const nextIndex = Math.min(focusedRowIndex + 1, items.length - 1);
      setFocusedRowIndex?.(nextIndex);
      const nextItem = items[nextIndex];
      if (nextItem) onSelectItem?.(nextItem);

      if (e.shiftKey && nextItem) {
        onSelectRange?.(nextItem.id, items.map((i) => i.id));
      }
      return;
    }

    // Up navigation (k or ArrowUp)
    if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length === 0) return;
      const prevIndex = Math.max(focusedRowIndex - 1, 0);
      setFocusedRowIndex?.(prevIndex);
      const prevItem = items[prevIndex];
      if (prevItem) onSelectItem?.(prevItem);

      if (e.shiftKey && prevItem) {
        onSelectRange?.(prevItem.id, items.map((i) => i.id));
      }
      return;
    }

    // Enter: Open Inspector or commit title rename
    if (e.key === 'Enter') {
      if (isEditingTitle) {
        setIsEditingTitle(false);
        focusRowElement(focusedRowIndex);
      } else if (currentItem) {
        e.preventDefault();
        onOpenInspector?.(currentItem);
      }
      return;
    }

    // F2: Inline Title Edit
    if (e.key === 'F2') {
      e.preventDefault();
      if (currentItem && !currentItem.isReadOnly) {
        setIsEditingTitle(true);
      }
      return;
    }

    // Space or x: Toggle multi-selection
    if (e.key === 'x' || (e.key === ' ' && !isEditingTitle && !activeDropdown)) {
      e.preventDefault();
      if (currentItem) {
        onToggleMultiSelect?.(currentItem.id);
      }
      return;
    }

    // s: Open Status Trigger
    if (e.key === 's') {
      e.preventDefault();
      if (currentItem && !currentItem.isReadOnly) {
        setActiveDropdown((prev) => (prev === 'status' ? null : 'status'));
      }
      return;
    }

    // p: Open Priority Trigger
    if (e.key === 'p') {
      e.preventDefault();
      if (currentItem && !currentItem.isReadOnly) {
        setActiveDropdown((prev) => (prev === 'priority' ? null : 'priority'));
      }
      return;
    }

    // a: Open Assignee Trigger
    if (e.key === 'a') {
      e.preventDefault();
      if (currentItem && !currentItem.isReadOnly) {
        setActiveDropdown((prev) => (prev === 'assignee' ? null : 'assignee'));
      }
      return;
    }

    // Escape hierarchy
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isEditingTitle) {
        setIsEditingTitle(false);
        focusRowElement(focusedRowIndex);
      } else if (activeDropdown) {
        setActiveDropdown(null);
        focusRowElement(focusedRowIndex);
      } else if (multiSelectedIds.length > 0) {
        onClearSelection?.();
      } else if (isInspectorOpen) {
        onCloseInspector?.();
        focusRowElement(focusedRowIndex);
      }
      return;
    }
  }, [
    isKeyboardActive,
    items,
    focusedRowIndex,
    setFocusedRowIndex,
    onSelectItem,
    onOpenInspector,
    onToggleMultiSelect,
    onSelectRange,
    onSelectAllVisible,
    onClearSelection,
    onCloseInspector,
    isInspectorOpen,
    multiSelectedIds,
    isEditingTitle,
    activeDropdown,
    focusRowElement
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    isEditingTitle,
    setIsEditingTitle,
    activeDropdown,
    setActiveDropdown,
    focusRowElement
  };
}
