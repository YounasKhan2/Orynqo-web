import React from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { Button } from '../../design-system';

/**
 * BulkActionBar Product Component
 * Floats at the bottom of views when multiple items are selected
 */
export function BulkActionBar({
  selectedCount,
  onMarkDone,
  onDelete,
  onClearSelection,
  className = ''
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={`bulk-action-bar ${className}`}
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-modal)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 14px',
        fontSize: 'var(--text-xs)',
        userSelect: 'none'
      }}
    >
      <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
        {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
      </span>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-default)' }} />

      {onMarkDone && (
        <button
          type="button"
          onClick={onMarkDone}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            height: '24px',
            padding: '0 8px',
            backgroundColor: 'var(--status-done-bg)',
            border: '1px solid var(--status-done)',
            color: 'var(--status-done)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'var(--font-medium)'
          }}
        >
          <Check size={11} />
          <span>Mark Done</span>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            height: '24px',
            padding: '0 8px',
            backgroundColor: 'var(--priority-urgent-bg)',
            border: '1px solid var(--priority-urgent)',
            color: 'var(--priority-urgent)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'var(--font-medium)'
          }}
        >
          <Trash2 size={11} />
          <span>Delete</span>
        </button>
      )}

      {onClearSelection && (
        <button
          type="button"
          onClick={onClearSelection}
          title="Clear selection (Esc)"
          aria-label="Clear selection"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
