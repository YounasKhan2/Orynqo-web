import React from 'react';
import { PriorityBadge, StatusBadge } from '../primitives/Badge';
import { Avatar } from '../primitives/Avatar';
import { USERS, PROJECTS } from '../../data/mockData';
import { AlertCircle, Calendar, Link2 } from 'lucide-react';

/**
 * TimelineView Component
 * High-density Gantt/Timeline projection with dependency connectors
 */
export function TimelineView({
  items = [],
  selectedItemId,
  onSelectItem,
  onOpenInspector
}) {
  // 14-day window for active cycle
  const days = [
    { label: 'Sep 14', date: '2026-09-14', isToday: false },
    { label: 'Sep 16', date: '2026-09-16', isToday: false },
    { label: 'Sep 18', date: '2026-09-18', isToday: false },
    { label: 'Sep 20', date: '2026-09-20', isToday: false },
    { label: 'Sep 22', date: '2026-09-22', isToday: false },
    { label: 'Sep 24', date: '2026-09-24', isToday: true },
    { label: 'Sep 26', date: '2026-09-26', isToday: false },
    { label: 'Sep 28', date: '2026-09-28', isToday: false },
    { label: 'Sep 30', date: '2026-09-30', isToday: false },
    { label: 'Oct 02', date: '2026-10-02', isToday: false },
    { label: 'Oct 04', date: '2026-10-04', isToday: false }
  ];

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
      {/* Timeline Header Ruler */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px repeat(11, 1fr)',
          alignItems: 'center',
          height: '32px',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            paddingLeft: 'var(--space-3)',
            fontSize: 'var(--text-2xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}
        >
          Work Item / Dependency
        </div>
        {days.map((day) => (
          <div
            key={day.date}
            className="font-mono"
            style={{
              textAlign: 'center',
              fontSize: 'var(--text-2xs)',
              color: day.isToday ? 'var(--primary-text)' : 'var(--text-muted)',
              fontWeight: day.isToday ? 'var(--font-bold)' : 'var(--font-regular)',
              backgroundColor: day.isToday ? 'var(--primary-subtle)' : 'transparent',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: '1px solid var(--border-subtle)'
            }}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Timeline Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, idx) => {
          const isSelected = selectedItemId === item.id;
          const assignee = USERS.find((u) => u.id === item.assigneeId);
          const hasBlocker = item.blockedBy && item.blockedBy.length > 0;
          const blocksOthers = item.blocks && item.blocks.length > 0;

          // Compute bar position based on item index for realistic simulation
          const startCol = (idx % 7) + 2;
          const spanCols = Math.min((item.estimate || 3), 4);

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              onDoubleClick={() => onOpenInspector(item)}
              style={{
                display: 'grid',
                gridTemplateColumns: '260px repeat(11, 1fr)',
                alignItems: 'center',
                height: '36px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'var(--bg-surface-selected)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              {/* Left Item Label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  paddingLeft: 'var(--space-3)',
                  paddingRight: 'var(--space-2)',
                  overflow: 'hidden'
                }}
              >
                <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {item.identifier}
                </span>
                <span className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                  {item.title}
                </span>
              </div>

              {/* Grid Column Ruler Backgrounds */}
              {Array.from({ length: 11 }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  style={{
                    height: '100%',
                    borderLeft: '1px solid var(--border-subtle)',
                    position: 'relative'
                  }}
                />
              ))}

              {/* Scheduled Bar Overlay */}
              <div
                style={{
                  gridColumn: `${startCol} / span ${spanCols}`,
                  height: '22px',
                  backgroundColor: hasBlocker
                    ? 'rgba(239, 68, 68, 0.2)'
                    : item.status === 'done'
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(59, 130, 246, 0.25)',
                  border: `1px solid ${
                    hasBlocker
                      ? 'var(--priority-urgent)'
                      : item.status === 'done'
                      ? 'var(--status-done)'
                      : 'var(--primary-base)'
                  }`,
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 6px',
                  zIndex: 2,
                  marginLeft: '2px',
                  marginRight: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                  {hasBlocker ? (
                    <AlertCircle size={11} color="var(--priority-urgent)" />
                  ) : (
                    <Calendar size={11} color="var(--primary-text)" />
                  )}
                  <span className="truncate" style={{ fontSize: '10px', color: 'var(--text-primary)' }}>
                    {item.estimate} pts
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {blocksOthers && (
                    <span title={`Blocks ${item.blocks.join(', ')}`}>
                      <Link2 size={11} color="var(--primary-text)" />
                    </span>
                  )}
                  <Avatar user={assignee} size="xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
