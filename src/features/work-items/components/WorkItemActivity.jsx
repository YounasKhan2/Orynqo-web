import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { UserAvatar } from '../../../components/avatars/UserAvatar';

/**
 * WorkItemActivity Component (COL-002)
 * Renders chronological Work Item Activity History
 * Operational change context for engineering (not enterprise forensic audit)
 */
export function WorkItemActivity({
  activities = [],
  className = ''
}) {
  return (
    <div className={`work-item-activity ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {activities.map((act) => (
        <div
          key={act.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '6px 8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)'
          }}
        >
          {act.actor ? (
            <UserAvatar user={act.actor} size="xs" />
          ) : (
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <History size={11} />
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                {act.actor?.name || 'System'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {act.timestamp}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', color: 'var(--text-secondary)' }}>
              <span>{act.action}</span>
              {act.from && act.to && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span
                    style={{
                      padding: '0 4px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '10px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {act.from}
                  </span>
                  <ArrowRight size={10} color="var(--text-muted)" />
                  <span
                    style={{
                      padding: '0 4px',
                      backgroundColor: 'var(--primary-subtle)',
                      border: '1px solid var(--primary-base)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '10px',
                      color: 'var(--primary-text)',
                      fontWeight: 'var(--font-medium)'
                    }}
                  >
                    {act.to}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {activities.length === 0 && (
        <div
          style={{
            padding: 'var(--space-4)',
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xs)'
          }}
        >
          No activity recorded yet
        </div>
      )}
    </div>
  );
}
