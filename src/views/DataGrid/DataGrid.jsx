import React, { useState, useEffect } from 'react';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../constants/workItems';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/badges';
import { UserAvatar } from '../../components/avatars/UserAvatar';
import { Checkbox } from '../../design-system';
import { USERS, PROJECTS } from '../../data/mockData';
import {
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

/**
 * High-Density Data Grid View Projection
 * 28px/34px rows, inline edits, keyboard navigation (j/k, x, s, p, Enter)
 */
export function DataGrid({
  items = [],
  selectedItemId,
  onSelectItem,
  onUpdateItem,
  onOpenInspector,
  density = 'compact',
  multiSelectedIds = [],
  onToggleMultiSelect,
  onSelectAll
}) {
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  const rowHeight = density === 'compact' ? 28 : 34;

  // Keyboard navigation for power users (j/k, Enter, x, s, p)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveRowIndex((prev) => {
          const next = Math.min(prev + 1, items.length - 1);
          if (items[next]) onSelectItem?.(items[next]);
          return next;
        });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveRowIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          if (items[next]) onSelectItem?.(items[next]);
          return next;
        });
      } else if (e.key === 'Enter') {
        if (items[activeRowIndex]) {
          onOpenInspector?.(items[activeRowIndex]);
        }
      } else if (e.key === 'x') {
        if (items[activeRowIndex]) {
          onToggleMultiSelect?.(items[activeRowIndex].id);
        }
      } else if (e.key === 's') {
        if (items[activeRowIndex]) {
          const current = items[activeRowIndex].status;
          const statusKeys = Object.keys(STATUS_DEFINITIONS);
          const nextIdx = (statusKeys.indexOf(current) + 1) % statusKeys.length;
          onUpdateItem?.(items[activeRowIndex].id, { status: statusKeys[nextIdx] });
        }
      } else if (e.key === 'p') {
        if (items[activeRowIndex]) {
          const current = items[activeRowIndex].priority;
          const priorityKeys = ['none', 'low', 'medium', 'high', 'urgent'];
          const nextIdx = (priorityKeys.indexOf(current) + 1) % priorityKeys.length;
          onUpdateItem?.(items[activeRowIndex].id, { priority: priorityKeys[nextIdx] });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, activeRowIndex, onSelectItem, onOpenInspector, onToggleMultiSelect, onUpdateItem]);

  if (items.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '240px',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-sm)',
          gap: '8px',
          width: '100%'
        }}
      >
        <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>No work items match current filter</span>
        <span>Try adjusting status, priority, or search parameters.</span>
      </div>
    );
  }

  const allSelected = items.length > 0 && multiSelectedIds.length === items.length;
  const isIndeterminate = multiSelectedIds.length > 0 && multiSelectedIds.length < items.length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Sticky Table Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: '32px 90px 100px 1fr 110px 60px 140px 120px 80px',
          alignItems: 'center',
          height: '28px',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          fontSize: 'var(--text-2xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          userSelect: 'none',
          padding: '0 8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            checked={allSelected}
            indeterminate={isIndeterminate}
            onChange={() => onSelectAll?.(items.map((i) => i.id))}
          />
        </div>
        <div>ID</div>
        <div>Priority</div>
        <div>Title</div>
        <div>Status</div>
        <div>Points</div>
        <div>Assignee</div>
        <div>Project / Cycle</div>
        <div style={{ textAlign: 'right' }}>Due</div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const isSelected = selectedItemId === item.id;
          const isChecked = multiSelectedIds.includes(item.id);
          const isKeyboardActive = activeRowIndex === index;
          const assignee = USERS.find((u) => u.id === item.assigneeId);
          const project = PROJECTS.find((p) => p.id === item.projectId);
          const hasBlocker = item.blockedBy && item.blockedBy.length > 0;

          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveRowIndex(index);
                onSelectItem?.(item);
              }}
              onDoubleClick={() => onOpenInspector?.(item)}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 90px 100px 1fr 110px 60px 140px 120px 80px',
                alignItems: 'center',
                height: `${rowHeight}px`,
                padding: '0 8px',
                fontSize: 'var(--text-xs)',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: isSelected
                  ? 'var(--bg-surface-selected)'
                  : isKeyboardActive
                  ? 'var(--bg-surface-hover)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'background-color var(--duration-instant) ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isKeyboardActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isKeyboardActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Checkbox */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMultiSelect?.(item.id);
                }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={() => onToggleMultiSelect?.(item.id)}
                />
              </div>

              {/* Identifier */}
              <div
                className="font-mono"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--text-muted)'
                }}
              >
                {item.identifier}
              </div>

              {/* Priority */}
              <div>
                <PriorityBadge
                  priorityId={item.priority}
                  interactive
                  onClick={(e) => {
                    e?.stopPropagation();
                    const priorityKeys = ['none', 'low', 'medium', 'high', 'urgent'];
                    const nextIdx = (priorityKeys.indexOf(item.priority) + 1) % priorityKeys.length;
                    onUpdateItem?.(item.id, { priority: priorityKeys[nextIdx] });
                  }}
                />
              </div>

              {/* Title & Metadata Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  overflow: 'hidden',
                  paddingRight: 'var(--space-3)'
                }}
              >
                <TypeBadge typeId={item.type} showLabel={false} />
                <span
                  className="truncate"
                  style={{
                    color: item.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: item.status === 'done' ? 'line-through' : 'none',
                    fontWeight: isSelected ? 'var(--font-medium)' : 'var(--font-regular)'
                  }}
                >
                  {item.title}
                </span>

                {hasBlocker && (
                  <span
                    title={`Blocked by ${item.blockedBy.join(', ')}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      color: 'var(--priority-urgent)',
                      fontSize: '10px',
                      backgroundColor: 'var(--priority-urgent-bg)',
                      padding: '1px 4px',
                      borderRadius: 'var(--radius-xs)',
                      flexShrink: 0
                    }}
                  >
                    <AlertTriangle size={10} />
                    <span>Blocked</span>
                  </span>
                )}

                {item.specDocId && (
                  <span
                    title="Linked to Living PRD Spec"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      color: 'var(--primary-text)',
                      fontSize: '10px',
                      backgroundColor: 'var(--primary-subtle)',
                      padding: '1px 4px',
                      borderRadius: 'var(--radius-xs)',
                      flexShrink: 0
                    }}
                  >
                    Spec
                  </span>
                )}

                {item.commentsCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      color: 'var(--text-subtle)',
                      fontSize: '10px',
                      flexShrink: 0
                    }}
                  >
                    <MessageSquare size={10} />
                    {item.commentsCount}
                  </span>
                )}
              </div>

              {/* Status */}
              <div>
                <StatusBadge
                  statusId={item.status}
                  interactive
                  onClick={(e) => {
                    e?.stopPropagation();
                    const statusKeys = Object.keys(STATUS_DEFINITIONS);
                    const nextIdx = (statusKeys.indexOf(item.status) + 1) % statusKeys.length;
                    onUpdateItem?.(item.id, { status: statusKeys[nextIdx] });
                  }}
                />
              </div>

              {/* Estimate Points */}
              <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                {item.estimate ? `${item.estimate} pts` : '—'}
              </div>

              {/* Assignee */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserAvatar user={assignee} size="xs" showName />
              </div>

              {/* Project / Cycle */}
              <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                {project ? project.name : 'Ad-hoc'}
              </div>

              {/* Due Date */}
              <div
                className="font-mono"
                style={{
                  textAlign: 'right',
                  fontSize: 'var(--text-xs)',
                  color: item.dueDate ? 'var(--text-secondary)' : 'var(--text-subtle)'
                }}
              >
                {item.dueDate ? item.dueDate.slice(5) : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
