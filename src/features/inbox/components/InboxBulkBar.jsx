import React from 'react';
import { Check, Archive, Clock, X } from 'lucide-react';
import { Button } from '../../../design-system';

/**
 * InboxBulkBar Component (UI-04A / UI-04B)
 *
 * Floating action bar for safe heterogeneous bulk triage:
 * - Mark as Read
 * - Mark as Unread
 * - Archive
 * - Snooze
 *
 * Invariant: Banned from universal domain operations like "Resolve All" or "Approve All".
 */

export function InboxBulkBar({
  selectedIds = [],
  onClearSelection,
  onBulkMarkRead,
  onBulkMarkUnread,
  onBulkArchive,
  onBulkSnooze
}) {
  if (!selectedIds || selectedIds.length === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk notification actions"
      style={{
        position: 'absolute',
        bottom: 'var(--space-4)',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          marginRight: '6px'
        }}
      >
        {selectedIds.length} selected
      </span>

      <Button
        variant="secondary"
        size="xs"
        icon={Check}
        onClick={() => onBulkMarkRead?.(selectedIds)}
      >
        Mark Read
      </Button>

      <Button
        variant="secondary"
        size="xs"
        onClick={() => onBulkMarkUnread?.(selectedIds)}
      >
        Mark Unread
      </Button>

      <Button
        variant="secondary"
        size="xs"
        icon={Clock}
        onClick={() => onBulkSnooze?.(selectedIds)}
      >
        Snooze
      </Button>

      <Button
        variant="secondary"
        size="xs"
        icon={Archive}
        onClick={() => onBulkArchive?.(selectedIds)}
      >
        Archive
      </Button>

      <button
        type="button"
        onClick={onClearSelection}
        aria-label="Clear selection"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          marginLeft: '4px'
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
