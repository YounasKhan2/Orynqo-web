import React from 'react';
import { TypeBadge, StatusBadge, PriorityBadge } from '../../components/badges';
import { UserAvatar } from '../../components/avatars/UserAvatar';
import { USERS } from '../../data/mockData';

/**
 * DataGridMobileList Component
 * Responsive compact WorkItem list projection for mobile viewports (< 768px)
 * Reuses canonical WorkItem models and connects to WorkItemDetailContainer
 */
export function DataGridMobileList({
  items = [],
  selectedItemId,
  onSelectItem,
  onOpenDetail
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-xs)',
          textAlign: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          No work items match current filter
        </span>
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Mobile work item list"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {items.map((item) => {
        const isSelected = selectedItemId === item.id;
        const assignee = USERS.find((u) => u.id === item.assigneeId);

        return (
          <div
            key={item.id}
            role="listitem"
            onClick={() => {
              onSelectItem?.(item);
              onOpenDetail?.(item);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '10px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: isSelected ? 'var(--bg-surface-selected)' : 'transparent',
              cursor: 'pointer',
              gap: '6px'
            }}
          >
            {/* Top row: ID, Type, Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <TypeBadge typeId={item.type} showLabel={false} />
              <span
                className="font-mono"
                style={{
                  fontSize: '11px',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--text-muted)',
                  flexShrink: 0
                }}
              >
                {item.identifier}
              </span>
              <span
                className="truncate"
                style={{
                  color: item.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: item.status === 'done' ? 'line-through' : 'none',
                  fontSize: '13px',
                  fontWeight: 'var(--font-medium)'
                }}
              >
                {item.title}
              </span>
            </div>

            {/* Bottom row: Status, Priority, Assignee */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusBadge statusId={item.status} interactive={false} />
                <PriorityBadge priorityId={item.priority} interactive={false} />
              </div>
              {assignee && <UserAvatar user={assignee} size="xs" showName />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
