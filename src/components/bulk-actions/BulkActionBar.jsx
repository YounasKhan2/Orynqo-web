import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, X, Clock, User, ChevronDown, AlertCircle } from 'lucide-react';
import { STATUS_DEFINITIONS } from '../../constants/workItems';
import { USERS } from '../../data/mockData';
import { UserAvatar } from '../avatars/UserAvatar';

/**
 * BulkActionBar Product Component
 * Floats at the bottom of views when multiple items are selected
 *
 * Requirements:
 * - OPAQUE SEMANTIC ELEVATED SURFACE (NO glassmorphism, NO blur, NO glow)
 * - Supports Change Status, Assign, Mark Done, Delete/Archive
 * - Normalized outcome reporting ({ succeeded, skipped, failed })
 */
export function BulkActionBar({
  selectedCount,
  onMarkDone,
  onBulkUpdateStatus,
  onBulkAssign,
  onDelete,
  onClearSelection,
  outcome = null, // { succeeded: string[], skipped: string[], failed: string[] }
  className = ''
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'status' | 'assign' | null
  const barRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openDropdown]);

  if (selectedCount === 0 && !outcome) return null;

  return (
    <div
      ref={barRef}
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
        gap: '10px',
        backgroundColor: 'var(--bg-modal)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 14px',
        fontSize: 'var(--text-xs)',
        userSelect: 'none',
        flexWrap: 'nowrap'
      }}
    >
      <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-default)' }} />

      {/* Change Status Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openDropdown === 'status'}
          onClick={() => setOpenDropdown((prev) => (prev === 'status' ? null : 'status'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            height: '24px',
            padding: '0 8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'var(--font-medium)'
          }}
        >
          <Clock size={11} />
          <span>Status</span>
          <ChevronDown size={10} />
        </button>

        {openDropdown === 'status' && (
          <div
            role="listbox"
            aria-label="Bulk status options"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: 0,
              zIndex: 100,
              width: '140px',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              padding: '4px 0'
            }}
          >
            {Object.entries(STATUS_DEFINITIONS).map(([sKey, def]) => (
              <button
                key={sKey}
                type="button"
                role="option"
                onClick={() => {
                  if (onBulkUpdateStatus) {
                    onBulkUpdateStatus(sKey);
                  } else if (sKey === 'done' && onMarkDone) {
                    onMarkDone();
                  }
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{def.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assign Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openDropdown === 'assign'}
          onClick={() => setOpenDropdown((prev) => (prev === 'assign' ? null : 'assign'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            height: '24px',
            padding: '0 8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'var(--font-medium)'
          }}
        >
          <User size={11} />
          <span>Assign</span>
          <ChevronDown size={10} />
        </button>

        {openDropdown === 'assign' && (
          <div
            role="listbox"
            aria-label="Bulk assign options"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: 0,
              zIndex: 100,
              width: '160px',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              padding: '4px 0'
            }}
          >
            <button
              type="button"
              role="option"
              onClick={() => {
                onBulkAssign?.(null);
                setOpenDropdown(null);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <span>Unassign</span>
            </button>
            {USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                role="option"
                onClick={() => {
                  onBulkAssign?.(user.id);
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <UserAvatar user={user} size="xs" showName />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Mark Done Button */}
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

      {/* Delete / Archive Button */}
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

      {/* Outcome notification feedback */}
      {outcome && (
        <div
          role="status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: outcome.failed?.length ? 'var(--priority-urgent)' : 'var(--text-secondary)',
            fontSize: '11px',
            padding: '0 4px'
          }}
        >
          <AlertCircle size={11} />
          <span>
            {outcome.succeeded?.length || 0} updated
            {outcome.skipped?.length ? `, ${outcome.skipped.length} skipped (read-only)` : ''}
            {outcome.failed?.length ? `, ${outcome.failed.length} failed` : ''}
          </span>
        </div>
      )}

      {/* Clear Selection */}
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
            padding: '2px',
            marginLeft: '4px'
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
