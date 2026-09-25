import React from 'react';
import { Filter, CheckCheck, RotateCcw, AlertCircle, FileText, CheckSquare, Layers } from 'lucide-react';
import { Button } from '../../../design-system';

/**
 * InboxToolbar Component (UI-04A / UI-04B)
 *
 * Provides quick filters and actions in the stream subheader:
 * - Unread Only toggle
 * - Importance Filter ('Focus' only vs 'All')
 * - Response Required toggle
 * - Archive All Read action
 * - Reset Filters affordance
 */

export function InboxToolbar({
  isUnreadOnly,
  onToggleUnreadOnly,
  importanceFilter,
  onSetImportanceFilter,
  responseRequiredOnly,
  onToggleResponseRequiredOnly,
  onArchiveAllRead,
  onResetFilters,
  isFiltered,
  itemCount = 0
}) {
  return (
    <div
      role="toolbar"
      aria-label="Inbox stream toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '32px',
        padding: '0 var(--space-3)',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: 'var(--text-xs)',
        flexShrink: 0
      }}
    >
      {/* Left Filter Affordances */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={onToggleUnreadOnly}
          aria-pressed={isUnreadOnly}
          style={{
            height: '22px',
            padding: '0 8px',
            fontSize: 'var(--text-2xs)',
            backgroundColor: isUnreadOnly ? 'var(--primary-subtle)' : 'transparent',
            border: isUnreadOnly ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: isUnreadOnly ? 'var(--primary-base)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: isUnreadOnly ? 'var(--font-semibold)' : 'normal'
          }}
        >
          Unread
        </button>

        <button
          type="button"
          onClick={onToggleResponseRequiredOnly}
          aria-pressed={responseRequiredOnly}
          style={{
            height: '22px',
            padding: '0 8px',
            fontSize: 'var(--text-2xs)',
            backgroundColor: responseRequiredOnly ? 'var(--primary-subtle)' : 'transparent',
            border: responseRequiredOnly ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: responseRequiredOnly ? 'var(--primary-base)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: responseRequiredOnly ? 'var(--font-semibold)' : 'normal'
          }}
        >
          Needs Response
        </button>

        {isFiltered && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            title="Reset filters"
            style={{
              height: '22px',
              padding: '0 6px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--text-2xs)'
            }}
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right Stream Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>

        {onArchiveAllRead && (
          <button
            type="button"
            onClick={onArchiveAllRead}
            title="Archive all read notifications in active tab"
            style={{
              height: '22px',
              padding: '0 6px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--text-2xs)'
            }}
          >
            <CheckCheck size={12} />
            <span>Archive Read</span>
          </button>
        )}
      </div>
    </div>
  );
}
