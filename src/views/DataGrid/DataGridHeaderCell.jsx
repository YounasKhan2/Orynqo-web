import React, { useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

/**
 * DataGridHeaderCell Component
 * Column header with sort indicator, drag-resize handle, and accessible semantics
 */
export function DataGridHeaderCell({
  column,
  width,
  sortConfig,
  onSort,
  onResize,
  style = {}
}) {
  const isSorted = sortConfig?.field === column.id;
  const sortDirection = isSorted ? sortConfig.direction : null;

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = width;

      const handleMouseMove = (moveEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(column.minWidth || 30, startWidth + delta);
        onResize?.(column.id, newWidth);
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [column.id, column.minWidth, width, onResize]
  );

  const ariaSort = isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <div
      role="columnheader"
      aria-sort={column.sortable ? ariaSort : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          column.alignment === 'right'
            ? 'flex-end'
            : column.alignment === 'center'
            ? 'center'
            : 'flex-start',
        width: column.flex ? undefined : `${width}px`,
        flex: column.flex ? `${column.flex} 1 ${width}px` : undefined,
        minWidth: `${column.minWidth}px`,
        height: '100%',
        padding: '0 8px',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--font-semibold)',
        color: isSorted ? 'var(--primary-text)' : 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        userSelect: 'none',
        position: 'relative',
        boxSizing: 'border-box',
        cursor: column.sortable ? 'pointer' : 'default',
        ...style
      }}
      onClick={() => {
        if (column.sortable) {
          onSort?.(column.id);
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden' }}>
        <span className="truncate">{column.label}</span>
        {isSorted && (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {sortDirection === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          </span>
        )}
      </div>

      {column.resizable && (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            cursor: 'col-resize',
            zIndex: 2
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-base)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        />
      )}
    </div>
  );
}
