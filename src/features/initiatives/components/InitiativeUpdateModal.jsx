import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { INITIATIVE_HEALTH } from '../model/initiativeModel';

/**
 * InitiativeUpdateModal
 *
 * Modal for composing and publishing authoritative historical Initiative Updates.
 * Enforces explicit health declaration and snapshots horizon.
 */
export function InitiativeUpdateModal({
  initiative,
  isOpen = false,
  onClose,
  onPublishUpdate,
  onPostUpdate
}) {
  if (!isOpen || !initiative) return null;

  const [narrative, setNarrative] = useState('');
  const [health, setHealth] = useState(
    initiative.health !== INITIATIVE_HEALTH.UNSET ? initiative.health : INITIATIVE_HEALTH.ON_TRACK
  );
  const [highlightsText, setHighlightsText] = useState('');
  const [blockersText, setBlockersText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!narrative.trim()) {
      setError('Please provide a narrative update.');
      return;
    }

    const highlights = highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const blockers = blockersText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatePayload = {
      initiativeId: initiative.id,
      narrative: narrative.trim(),
      health,
      horizonSnapshot: initiative.horizon,
      highlights,
      blockers
    };

    onPublishUpdate?.(updatePayload);
    onPostUpdate?.(updatePayload);

    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post Strategic Initiative Update"
      data-testid="initiative-update-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-default, #334155)',
          borderRadius: 'var(--radius-lg, 12px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.5))'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-default, #334155)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              Post Strategic Update
            </span>
            <span style={{ fontSize: '11px', color: 'var(--primary-base)' }}>{initiative.identifier}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs, 4px)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontSize: '12px'
              }}
            >
              {error}
            </div>
          )}

          {/* Health Declaration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Strategic Health Declaration *
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { val: INITIATIVE_HEALTH.ON_TRACK, label: 'On Track', color: '#10b981' },
                { val: INITIATIVE_HEALTH.AT_RISK, label: 'At Risk', color: '#f59e0b' },
                { val: INITIATIVE_HEALTH.OFF_TRACK, label: 'Off Track', color: '#ef4444' }
              ].map((opt) => (
                <label
                  key={opt.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs, 4px)',
                    backgroundColor: health === opt.val ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: `1px solid ${health === opt.val ? opt.color : 'var(--border-default, #334155)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="updateHealth"
                    value={opt.val}
                    checked={health === opt.val}
                    onChange={(e) => setHealth(e.target.value)}
                  />
                  <span style={{ color: opt.color, fontWeight: 'var(--font-medium)' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Narrative Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Narrative Context & Strategic Progress *
            </label>
            <textarea
              data-testid="update-narrative-input"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="What strategic milestones were delivered? What are contributing squads focused on?"
              rows={4}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs, 4px)',
                backgroundColor: 'var(--bg-canvas, #0f172a)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #334155)',
                outline: 'none',
                fontSize: '12px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Highlights & Blockers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Key Highlights (1 per line)
              </label>
              <textarea
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                placeholder="Alpha dogfooding ready&#10;Security signoff completed"
                rows={2}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-xs, 4px)',
                  backgroundColor: 'var(--bg-canvas, #0f172a)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default, #334155)',
                  fontSize: '11px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Risks / Blockers (1 per line)
              </label>
              <textarea
                value={blockersText}
                onChange={(e) => setBlockersText(e.target.value)}
                placeholder="SCIM gateway latency&#10;Cross-region replication delay"
                rows={2}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-xs, 4px)',
                  backgroundColor: 'var(--bg-canvas, #0f172a)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default, #334155)',
                  fontSize: '11px'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default, #334155)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-initiative-update-btn"
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--primary-base, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer'
              }}
            >
              Publish Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
