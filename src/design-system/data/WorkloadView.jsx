import React from 'react';
import { USERS } from '../../data/mockData';
import { Avatar } from '../primitives/Avatar';
import { StatusBadge, PriorityBadge } from '../primitives/Badge';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

/**
 * WorkloadView Component
 * Team capacity balancing and real-time point allocation per cycle
 */
export function WorkloadView({
  items = [],
  selectedItemId,
  onSelectItem,
  onOpenInspector
}) {
  const VELOCITY_LIMIT = 12; // points per cycle threshold

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        padding: 'var(--space-4)',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            Team Capacity & Workload Balance
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Cycle 42 allocation based on 12 pts recommended sprint velocity.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-3)' }}>
        {USERS.map((usr) => {
          const userItems = items.filter((it) => it.assigneeId === usr.id);
          const totalPoints = userItems.reduce((acc, it) => acc + (it.estimate || 0), 0);
          const percent = Math.min(Math.round((totalPoints / VELOCITY_LIMIT) * 100), 150);
          const isOverloaded = totalPoints > VELOCITY_LIMIT;

          return (
            <div
              key={usr.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid ${isOverloaded ? 'var(--priority-urgent)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar user={usr} size="md" />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                      {usr.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                      {usr.role}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: isOverloaded ? 'var(--priority-urgent)' : 'var(--text-primary)' }}>
                    {totalPoints} / {VELOCITY_LIMIT} pts
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: isOverloaded ? 'var(--priority-urgent)' : 'var(--text-muted)' }}>
                    {percent}% capacity
                  </div>
                </div>
              </div>

              {/* Meter Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-surface-raised)',
                  borderRadius: 'var(--radius-xs)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${Math.min(percent, 100)}%`,
                    height: '100%',
                    backgroundColor: isOverloaded ? 'var(--priority-urgent)' : percent > 80 ? 'var(--status-in-progress)' : 'var(--status-done)',
                    transition: 'width var(--duration-normal) var(--ease-out)'
                  }}
                />
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'var(--space-1)' }}>
                {userItems.length === 0 ? (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontStyle: 'italic', padding: '4px 0' }}>
                    No assigned items in this cycle.
                  </div>
                ) : (
                  userItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      onDoubleClick={() => onOpenInspector(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        backgroundColor: selectedItemId === item.id ? 'var(--bg-surface-selected)' : 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {item.identifier}
                        </span>
                        <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                      </div>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                        {item.estimate} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
