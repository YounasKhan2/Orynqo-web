import React from 'react';
import { DataGridHeaderCell } from './DataGridHeaderCell';
import { Checkbox } from '../../design-system';

/**
 * DataGridHeader Component
 * Sticky column header row with select-all checkbox, sorting, and resize controls
 */
export function DataGridHeader({
  visibleColumns = [],
  columnWidths = {},
  sortConfig,
  onSort,
  onResizeColumn,
  allVisibleSelected = false,
  isIndeterminate = false,
  onSelectAllVisible,
  density = 'compact',
  headerHeight = 28
}) {
  return (
    <div
      role="row"
      aria-label="Table Header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        height: `${headerHeight}px`,
        backgroundColor: 'var(--bg-surface-subtle)',
        borderBottom: '1px solid var(--border-default)',
        userSelect: 'none',
        flexShrink: 0,
        minWidth: '100%',
        width: 'max-content'
      }}
    >
      {visibleColumns.map((column) => {
        const width = columnWidths[column.id] || column.width;

        if (column.id === 'select') {
          return (
            <div
              key="select"
              role="columnheader"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${width}px`,
                minWidth: `${column.minWidth}px`,
                height: '100%',
                position: 'sticky',
                left: 0,
                zIndex: 21,
                backgroundColor: 'var(--bg-surface-subtle)',
                boxSizing: 'border-box'
              }}
            >
              <Checkbox
                checked={allVisibleSelected}
                indeterminate={isIndeterminate}
                onChange={onSelectAllVisible}
                aria-label="Select all visible work items"
              />
            </div>
          );
        }

        const isPinnedIdentifier = column.id === 'identifier' && column.pinned;
        const pinnedStyle = isPinnedIdentifier
          ? {
              position: 'sticky',
              left: `${columnWidths['select'] || 32}px`,
              zIndex: 21,
              backgroundColor: 'var(--bg-surface-subtle)'
            }
          : {};

        return (
          <DataGridHeaderCell
            key={column.id}
            column={column}
            width={width}
            sortConfig={sortConfig}
            onSort={onSort}
            onResize={onResizeColumn}
            style={pinnedStyle}
          />
        );
      })}
    </div>
  );
}
