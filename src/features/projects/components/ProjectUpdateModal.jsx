import React, { useState } from 'react';
import { ProjectHealthBadge } from './ProjectHealthBadge';
import { PROJECT_HEALTH } from '../model/projectModel';
import { MessageSquarePlus, X } from 'lucide-react';

/**
 * ProjectUpdateModal Component
 *
 * Dedicated modal for publishing asynchronous Project Updates:
 * - Author enters narrative, health snapshot, and optional blocker items.
 * - Snapshots current target date without mutating authoritative target date.
 */
export function ProjectUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  currentTargetDate = null,
  currentHealth = PROJECT_HEALTH.ON_TRACK
}) {
  const [narrative, setNarrative] = useState('');
  const [health, setHealth] = useState(currentHealth || PROJECT_HEALTH.ON_TRACK);
  const [blockerText, setBlockerText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    const blockers = blockerText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit?.({
      narrative: narrative.trim(),
      health,
      targetDateSnapshot: currentTargetDate,
      blockers
    });

    setNarrative('');
    setBlockerText('');
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-label="Post Project Update"
      data-testid="project-update-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #161b22)',
          border: '1px solid var(--border-default, #30363d)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '540px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.5))'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle, #30363d)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquarePlus size={16} color="var(--primary-base, #58a6ff)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #c9d1d9)' }}>
              Post Project Update
            </span>
          </div>
          <button
            type="button"
            data-testid="close-update-modal-btn"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted, #8b949e)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary, #8b949e)', marginBottom: '6px' }}>
              Health Assessment
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[PROJECT_HEALTH.ON_TRACK, PROJECT_HEALTH.AT_RISK, PROJECT_HEALTH.OFF_TRACK].map((h) => (
                <button
                  key={h}
                  type="button"
                  data-testid={`select-health-${h}`}
                  onClick={() => setHealth(h)}
                  style={{
                    background: health === h ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
                    border: health === h ? '1px solid var(--primary-base, #58a6ff)' : '1px solid var(--border-default, #30363d)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <ProjectHealthBadge health={h} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary, #8b949e)', marginBottom: '6px' }}>
              Update Narrative
            </label>
            <textarea
              data-testid="update-narrative-input"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="What changed? What was accomplished? What is next?"
              rows={4}
              required
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-canvas, #0d1117)',
                border: '1px solid var(--border-default, #30363d)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'var(--text-primary, #c9d1d9)',
                fontSize: '13px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary, #8b949e)', marginBottom: '6px' }}>
              Blockers / Attention Needed (one per line)
            </label>
            <textarea
              data-testid="update-blockers-input"
              value={blockerText}
              onChange={(e) => setBlockerText(e.target.value)}
              placeholder="Pending legal sign-off..."
              rows={2}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-canvas, #0d1117)',
                border: '1px solid var(--border-default, #30363d)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'var(--text-primary, #c9d1d9)',
                fontSize: '13px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-default, #30363d)',
                borderRadius: '6px',
                color: 'var(--text-secondary, #8b949e)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-project-update-btn"
              style={{
                padding: '6px 16px',
                backgroundColor: 'var(--primary-base, #58a6ff)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
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
