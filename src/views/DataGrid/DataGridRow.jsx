import React, { useRef, useEffect } from 'react';
import { DataGridCell } from './DataGridCell';

/**
 * DataGridRow Component
 * Renders a high-density table row with distinct states: Focused, Inspector Active, Multi-Selected
 */
export function DataGridRow({
  item,
  index,
  visibleColumns = [],
  columnWidths = {},
  isFocused = false,
  isInspectorActive = false,
  isMultiSelected = false,
  rowHeight = 28,
  onSelectItem,
  onOpenInspector,
  onToggleSelect,
  onUpdateItem,
  isEditingTitle = false,
  onCommitTitle,
  onCancelTitle,
  isFilterMismatch = false,
  activeDropdown = null,
  setActiveDropdown
}) {
  const rowRef = useRef(null);

  // Focus row element when roving tabindex moves to it
  useEffect(() => {
    if (isFocused && rowRef.current && document.activeElement !== rowRef.current && !rowRef.current.contains(document.activeElement)) {
      rowRef.current.focus({ preventScroll: true });
    }
  }, [isFocused]);

  // Determine row background color based on distinct state combinations
  let backgroundColor = 'transparent';
  if (isInspectorActive && isMultiSelected) {
    backgroundColor = 'var(--bg-surface-selected)';
  } else if (isInspectorActive) {
    backgroundColor = 'var(--bg-surface-selected)';
  } else if (isMultiSelected) {
    backgroundColor = 'var(--primary-subtle)';
  }

  // Determine border/outline for focused row
  const outline = isFocused ? '2px solid var(--border-focus, #3b82f6)' : 'none';
  const outlineOffset = '-2px';

  return (
    <div
      ref={rowRef}
      role="row"
      tabIndex={isFocused ? 0 : -1}
      aria-selected={isInspectorActive || isMultiSelected}
      data-row-index={index}
      data-item-id={item.id}
      onClick={() => onSelectItem?.(item)}
      onDoubleClick={() => onOpenInspector?.(item)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: `${rowHeight}px`,
        backgroundColor,
        outline,
        outlineOffset,
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color var(--duration-instant) ease',
        boxSizing: 'border-box',
        position: 'relative',
        minWidth: '100%',
        width: 'max-content'
      }}
      onMouseEnter={(e) => {
        if (!isInspectorActive && !isMultiSelected) {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isInspectorActive && !isMultiSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {visibleColumns.map((column) => {
        const width = columnWidths[column.id] || column.width;
        const isPinnedSelect = column.id === 'select';
        const isPinnedIdentifier = column.id === 'identifier' && column.pinned;

        let pinnedStyle = {};
        if (isPinnedSelect) {
          pinnedStyle = {
            position: 'sticky',
            left: 0,
            zIndex: 10,
            backgroundColor: backgroundColor === 'transparent' ? 'var(--bg-canvas)' : backgroundColor
          };
        } else if (isPinnedIdentifier) {
          pinnedStyle = {
            position: 'sticky',
            left: `${columnWidths['select'] || 32}px`,
            zIndex: 10,
            backgroundColor: backgroundColor === 'transparent' ? 'var(--bg-canvas)' : backgroundColor
          };
        }

        return (
          <DataGridCell
            key={column.id}
            column={column}
            item={item}
            width={width}
            isSelected={isInspectorActive}
            isChecked={isMultiSelected}
            onToggleSelect={onToggleSelect}
            onUpdateItem={onUpdateItem}
            isEditingTitle={isEditingTitle}
            onCommitTitle={onCommitTitle}
            onCancelTitle={onCancelTitle}
            isFilterMismatch={isFilterMismatch}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            style={pinnedStyle}
          />
        );
      })}
    </div>
  );
}
