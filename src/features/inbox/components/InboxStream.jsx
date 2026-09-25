import React from 'react';
import { InboxRow } from './InboxRow';
import { InboxBundle } from './InboxBundle';
import { InboxEmptyState } from './InboxEmptyState';

/**
 * InboxStream Component (UI-04A / UI-04B)
 *
 * Operational virtualizable stream for rows and bundles:
 * - Deterministic row keys
 * - Live update pill [ ↑ N new notifications ] for in-session stability
 * - Selection anchoring
 */

export function InboxStream({
  items = [],
  tab = 'focus',
  selectedId = null,
  multiSelectedIds = [],
  onToggleCheck,
  pendingCount = 0,
  onFlushPending,
  onSelectItem,
  onSelectChildItem,
  onMarkRead,
  onArchive,
  onSnooze,
  isFiltered = false,
  onResetFilters
}) {
  if (items.length === 0) {
    return (
      <InboxEmptyState
        tab={tab}
        filtered={isFiltered}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div
      role="feed"
      aria-label="Notification triage stream"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Triage Stability: Pending Arrival Banner */}
      {pendingCount > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 'var(--space-2)',
            zIndex: 30,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            pointerEvents: 'none'
          }}
        >
          <button
            type="button"
            onClick={onFlushPending}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '24px',
              padding: '0 10px',
              backgroundColor: 'var(--primary-base)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-md)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer'
            }}
          >
            <span>↑ {pendingCount} new notifications</span>
          </button>
        </div>
      )}

      {/* Stream Items (Rows and Bundles) */}
      {items.map((item) => {
        if (item.isBundle) {
          const isSelected = selectedId === item.id || selectedId === item.latestEvent?.id;
          const isChecked = item.childIds?.length > 0 && item.childIds.every((id) => multiSelectedIds.includes(id));
          return (
            <InboxBundle
              key={item.id}
              bundle={item}
              isSelected={isSelected}
              isChecked={isChecked}
              multiSelectedIds={multiSelectedIds}
              onSelect={() => onSelectItem?.(item.latestEvent || item)}
              onToggleCheck={onToggleCheck}
              onSelectChild={(child) => onSelectChildItem?.(child)}
              onMarkRead={onMarkRead}
              onArchive={onArchive}
              onSnooze={onSnooze}
            />
          );
        }

        const isSelected = selectedId === item.id;
        const isChecked = multiSelectedIds.includes(item.id);
        return (
          <InboxRow
            key={item.id}
            event={item}
            isSelected={isSelected}
            isChecked={isChecked}
            onSelect={() => onSelectItem?.(item)}
            onToggleCheck={onToggleCheck}
            onMarkRead={onMarkRead}
            onArchive={onArchive}
            onSnooze={onSnooze}
          />
        );
      })}
    </div>
  );
}
