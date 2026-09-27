import React from 'react';
import { History, Activity, Calendar, User, Tag, CheckCircle2 } from 'lucide-react';

/**
 * InitiativeActivityTab (INT-002 Tab 5)
 *
 * Stream of meaningful Initiative domain events reusing canonical ActivityEvent.
 * Distinguishes product activity history from enterprise audit.
 */
export function InitiativeActivityTab({
  initiative,
  activityEvents = [],
  users = []
}) {
  if (!initiative) return null;

  // Filter activity events associated with this initiative
  const initiativeEvents = (activityEvents || [])
    .filter((e) => e.targetId === initiative.id || e.initiativeId === initiative.id)
    .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

  const resolveUser = (userId) => (users || []).find((u) => u.id === userId);

  return (
    <div
      role="region"
      aria-label="Initiative Activity"
      data-testid="initiative-activity-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4, 16px)',
        padding: 'var(--space-6, 24px) var(--space-8, 32px)',
        maxWidth: '850px',
        width: '100%'
      }}
    >
      <div>
        <h2 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 'var(--font-bold, 700)', margin: 0 }}>
          Initiative Activity Stream ({initiativeEvents.length})
        </h2>
        <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-secondary, #94a3b8)', margin: '2px 0 0 0' }}>
          Meaningful strategic domain events: state changes, project alignments, and published updates.
        </p>
      </div>

      {initiativeEvents.length === 0 ? (
        <div
          data-testid="initiative-activity-empty-state"
          style={{
            padding: '36px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: '1px dashed var(--border-default, #334155)',
            borderRadius: 'var(--radius-md, 8px)'
          }}
        >
          <History size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-semibold)', margin: '0 0 4px 0' }}>
            No recent activity
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Domain events will appear as projects are aligned or updates published.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {initiativeEvents.map((evt, idx) => {
            const actor = resolveUser(evt.actorId);

            return (
              <div
                key={evt.id || idx}
                data-testid={`activity-event-${evt.id || idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-surface, #1e293b)',
                  border: '1px solid var(--border-default, #334155)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '12px'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: 'var(--primary-base, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Activity size={12} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                      {actor?.name || evt.actorId || 'System'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(evt.timestamp || evt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {evt.description || evt.action || 'Initiative updated'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
