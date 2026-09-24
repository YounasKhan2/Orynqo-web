import React from 'react';
import { STATUS_DEFINITIONS } from '../tokens';
import { PriorityBadge, TypeBadge } from '../primitives/Badge';
import { Avatar } from '../primitives/Avatar';
import { USERS } from '../../data/mockData';
import { Plus, MessageSquare, AlertTriangle } from 'lucide-react';

/**
 * KanbanBoard Component
 * Direct projection over canonical WorkItems grouped by status
 */
export function KanbanBoard({
  items = [],
  selectedItemId,
  onSelectItem,
  onOpenInspector,
  onUpdateItem,
  onQuickCreate
}) {
  const columns = [
    STATUS_DEFINITIONS.backlog,
    STATUS_DEFINITIONS.todo,
    STATUS_DEFINITIONS.in_progress,
    STATUS_DEFINITIONS.in_review,
    STATUS_DEFINITIONS.done
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        height: '100%',
        width: '100%',
        overflowX: 'auto',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {columns.map((col) => {
        const colItems = items.filter((item) => item.status === col.id);

        return (
          <div
            key={col.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '280px',
              minWidth: '280px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-3)',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: col.color
                  }}
                />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {col.label}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-2xs)',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-surface-raised)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  {colItems.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onQuickCreate(col.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="Add card"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Column Card Container */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                padding: 'var(--space-2)',
                overflowY: 'auto',
                flex: 1
              }}
            >
              {colItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                const assignee = USERS.find((u) => u.id === item.assigneeId);
                const hasBlocker = item.blockedBy && item.blockedBy.length > 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    onDoubleClick={() => onOpenInspector(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1-5)',
                      padding: 'var(--space-2-5)',
                      backgroundColor: isSelected ? 'var(--bg-surface-selected)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--border-focus)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) var(--ease-out)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Top Row: Identifier, Type, Priority */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                          {item.identifier}
                        </span>
                        <TypeBadge typeId={item.type} />
                      </div>
                      <PriorityBadge priorityId={item.priority} />
                    </div>

                    {/* Card Title */}
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--text-primary)',
                        lineHeight: 'var(--line-height-normal)'
                      }}
                    >
                      {item.title}
                    </div>

                    {/* Footer: Points, Blockers, Comments, Assignee */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'var(--space-1)',
                        paddingTop: 'var(--space-1)',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: 'var(--text-2xs)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.estimate && (
                          <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {item.estimate} pts
                          </span>
                        )}
                        {hasBlocker && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              color: 'var(--priority-urgent)'
                            }}
                          >
                            <AlertTriangle size={10} />
                            <span>Blocked</span>
                          </span>
                        )}
                        {item.commentsCount > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              color: 'var(--text-subtle)'
                            }}
                          >
                            <MessageSquare size={10} />
                            {item.commentsCount}
                          </span>
                        )}
                      </div>

                      <Avatar user={assignee} size="xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
