import React, { useRef, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { COLUMN_DEFINITIONS } from './columnRegistry';
import { Checkbox } from '../../design-system';

/**
 * DataGridColumnManager Component
 * Popover to customize column visibility and reset configuration
 */
export function DataGridColumnManager({
  isOpen = false,
  onClose,
  columnVisibility = {},
  onToggleColumnVisibility,
  onResetColumns
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Manage Columns"
      style={{
        position: 'absolute',
        top: '40px',
        right: '12px',
        zIndex: 120,
        width: '240px',
        backgroundColor: 'var(--bg-modal)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
          Display Columns
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={12} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxHeight: '260px',
          overflowY: 'auto'
        }}
      >
        {COLUMN_DEFINITIONS.filter((c) => c.id !== 'select').map((col) => {
          const isVisible = columnVisibility[col.id] !== false;
          const isLocked = col.pinned;

          return (
            <label
              key={col.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                backgroundColor: isVisible ? 'transparent' : 'var(--bg-surface-subtle)',
                opacity: isLocked ? 0.7 : 1,
                fontSize: '11px',
                color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <Checkbox
                checked={isVisible}
                disabled={isLocked}
                onChange={() => !isLocked && onToggleColumnVisibility?.(col.id)}
              />
              <span style={{ flex: 1 }}>{col.label}</span>
              {isLocked && (
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Pinned</span>
              )}
            </label>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onResetColumns}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--primary-text)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '2px 4px'
          }}
        >
          <RotateCcw size={10} />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
}
