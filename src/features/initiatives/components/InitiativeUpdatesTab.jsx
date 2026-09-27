import React from 'react';
import { Send, Clock, User, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { InitiativeHealthBadge } from './InitiativeHealthBadge';

/**
 * InitiativeUpdatesTab (INT-002 Tab 4)
 *
 * Chronological feed of published historical narrative updates:
 * - Snapshots author, timestamp, health, and horizon
 * - Highlights and blockers
 * - Historical integrity preservation (no destructive in-place erasure)
 */
export function InitiativeUpdatesTab({
  initiative,
  updates = [],
  users = [],
  onOpenUpdateModal,
  canManage = true
}) {
  if (!initiative) return null;

  // Filter and sort updates for this initiative
  const initiativeUpdates = (updates || [])
    .filter((u) => u.initiativeId === initiative.id)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));

  const resolveUser = (userId) => (users || []).find((u) => u.id === userId);

  return (
    <div
      role="region"
      aria-label="Initiative Updates"
      data-testid="initiative-updates-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6, 24px)',
        padding: 'var(--space-6, 24px) var(--space-8, 32px)',
        maxWidth: '850px',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 'var(--font-bold, 700)', margin: 0 }}>
            Strategic Narrative Updates ({initiativeUpdates.length})
          </h2>
          <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-secondary, #94a3b8)', margin: '2px 0 0 0' }}>
            Historical snapshots capturing accomplishments, strategic health, and program alignment.
          </p>
        </div>

        {canManage && onOpenUpdateModal && (
          <button
            type="button"
            data-testid="post-update-from-tab"
            onClick={onOpenUpdateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--primary-base, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer'
            }}
          >
            <Send size={12} />
            <span>Post Update</span>
          </button>
        )}
      </div>

      {initiativeUpdates.length === 0 ? (
        <div
          data-testid="initiative-updates-empty-state"
          style={{
            padding: '36px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: '1px dashed var(--border-default, #334155)',
            borderRadius: 'var(--radius-md, 8px)'
          }}
        >
          <Send size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-semibold)', margin: '0 0 4px 0' }}>
            No strategic updates published
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Post the first update to declare health and summarize cross-squad progress.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {initiativeUpdates.map((upd) => {
            const author = resolveUser(upd.authorId);

            return (
              <div
                key={upd.id}
                data-testid={`initiative-update-card-${upd.id}`}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface, #1e293b)',
                  border: '1px solid var(--border-default, #334155)',
                  borderRadius: 'var(--radius-md, 8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Update Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-base, #3b82f6)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'var(--font-bold)'
                      }}
                    >
                      {author?.initials || 'U'}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                      {author?.name || upd.authorId}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(upd.publishedAt || upd.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <InitiativeHealthBadge health={upd.health} size="sm" />
                </div>

                {/* Narrative Body */}
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary, #cbd5e1)',
                    lineHeight: 1.5,
                    margin: 0
                  }}
                >
                  {upd.narrative}
                </p>

                {/* Highlights and Blockers */}
                {(upd.highlights?.length > 0 || upd.blockers?.length > 0) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                    {upd.highlights?.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                        <CheckCircle2 size={12} />
                        <span>{h}</span>
                      </div>
                    ))}
                    {upd.blockers?.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                        <AlertCircle size={12} />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
