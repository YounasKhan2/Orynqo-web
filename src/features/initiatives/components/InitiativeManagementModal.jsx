import React, { useState } from 'react';
import {
  X,
  Shield,
  Trash2,
  CheckCircle2,
  Calendar,
  Lock,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { INITIATIVE_ACCESS_POLICY } from '../model/initiativeModel';

/**
 * InitiativeManagementModal (Initiative Management Surface)
 *
 * Progressive-disclosure management experience invoked via header More / Settings (...).
 * Manages:
 * - Metadata (rename, strategic narrative)
 * - Access Policy (workspace-discoverable vs restricted)
 * - Horizon configuration
 * - Lifecycle / Danger Zone (complete, archive, restore)
 */
export function InitiativeManagementModal({
  initiative,
  associatedProjects = [],
  isOpen = false,
  onClose,
  onUpdateInitiative,
  onArchiveInitiative,
  onRestoreInitiative,
  onCompleteInitiative,
  canManageAccess = true,
  canArchive = true,
  canComplete = true
}) {
  if (!isOpen || !initiative) return null;

  const incompleteProjectsCount = associatedProjects.filter(
    (p) => p.operationalState !== 'completed' && p.operationalState !== 'cancelled'
  ).length;

  const [nameDraft, setNameDraft] = useState(initiative.name);
  const [summaryDraft, setSummaryDraft] = useState(initiative.summary || '');
  const [visibilityDraft, setVisibilityDraft] = useState(
    initiative.access?.visibility || INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE
  );
  const [horizonLabel, setHorizonLabel] = useState(initiative.horizon?.label || '');
  const [horizonTargetDate, setHorizonTargetDate] = useState(initiative.horizon?.targetDate || '');
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);

  const handleSave = () => {
    onUpdateInitiative?.({
      name: nameDraft.trim(),
      summary: summaryDraft.trim(),
      horizon: horizonLabel
        ? {
            ...initiative.horizon,
            label: horizonLabel,
            targetDate: horizonTargetDate || null
          }
        : null,
      access: {
        ...initiative.access,
        visibility: visibilityDraft
      }
    });
    onClose?.();
  };

  const isArchived = initiative.archiveState === 'archived';
  const isCompleted = initiative.operationalState === 'completed';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Initiative Management & Settings"
      data-testid="initiative-management-modal"
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
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-default, #334155)',
          borderRadius: 'var(--radius-lg, 12px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.5))'
        }}
      >
        {/* Modal Header */}
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
              Initiative Management & Access
            </span>
            <span style={{ fontSize: '11px', color: 'var(--primary-base)' }}>{initiative.identifier}</span>
          </div>

          <button
            type="button"
            data-testid="close-management-modal-btn"
            onClick={onClose}
            aria-label="Close settings"
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

        {/* Modal Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            fontSize: '12px'
          }}
        >
          {/* Metadata Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Initiative Title
            </label>
            <input
              type="text"
              data-testid="management-title-input"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs, 4px)',
                backgroundColor: 'var(--bg-canvas, #0f172a)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #334155)',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Strategic Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Strategic Charter Summary
            </label>
            <textarea
              data-testid="management-summary-input"
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              rows={3}
              style={{
                padding: '6px 10px',
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

          {/* Temporal Horizon Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
                Planning Horizon Label
              </label>
              <input
                type="text"
                data-testid="management-horizon-label-input"
                value={horizonLabel}
                onChange={(e) => setHorizonLabel(e.target.value)}
                placeholder="e.g. Q4 2026 or H1 2027"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs, 4px)',
                  backgroundColor: 'var(--bg-canvas, #0f172a)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default, #334155)',
                  fontSize: '12px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
                Target Delivery Date
              </label>
              <input
                type="date"
                data-testid="management-target-date-input"
                value={horizonTargetDate}
                onChange={(e) => setHorizonTargetDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs, 4px)',
                  backgroundColor: 'var(--bg-canvas, #0f172a)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default, #334155)',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          {/* Access Policy Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="var(--primary-base)" />
              <label style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
                Access Policy & Visibility
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: canManageAccess ? 'pointer' : 'not-allowed'
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE}
                  checked={visibilityDraft === INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE}
                  onChange={(e) => setVisibilityDraft(e.target.value)}
                  disabled={!canManageAccess}
                />
                <Globe size={13} color="var(--text-muted)" />
                <span>Workspace Discoverable</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: canManageAccess ? 'pointer' : 'not-allowed'
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={INITIATIVE_ACCESS_POLICY.RESTRICTED}
                  checked={visibilityDraft === INITIATIVE_ACCESS_POLICY.RESTRICTED}
                  onChange={(e) => setVisibilityDraft(e.target.value)}
                  disabled={!canManageAccess}
                />
                <Lock size={13} color="var(--text-muted)" />
                <span>Restricted (Explicit Grants)</span>
              </label>
            </div>
          </div>

          {/* Lifecycle & Danger Zone */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-default, #334155)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>
              Lifecycle & State Transitions
            </span>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Complete Action */}
              {canComplete && (
                <button
                  type="button"
                  data-testid="management-complete-initiative-btn"
                  onClick={() => {
                    if (!isCompleted) {
                      setShowCompletionConfirm(true);
                    } else {
                      onCompleteInitiative?.(initiative.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>{isCompleted ? 'Reopen Initiative' : 'Mark Completed'}</span>
                </button>
              )}

              {/* Archive / Restore Action */}
              {canArchive && (
                <button
                  type="button"
                  data-testid="management-archive-initiative-btn"
                  onClick={() => {
                    if (isArchived) {
                      onRestoreInitiative?.(initiative.id);
                    } else {
                      onArchiveInitiative?.(initiative.id);
                    }
                    onClose?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: isArchived ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isArchived ? 'var(--primary-base)' : '#ef4444',
                    border: `1px solid ${isArchived ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontSize: '11px',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                  <span>{isArchived ? 'Restore Initiative' : 'Archive Initiative'}</span>
                </button>
              )}
            </div>

            {/* Incomplete Projects Non-Cascading Warning Dialog */}
            {showCompletionConfirm && (
              <div
                data-testid="completion-confirmation-dialog"
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                  <AlertTriangle size={14} />
                  <span style={{ fontWeight: 'var(--font-semibold)' }}>Confirm Strategic Completion</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {incompleteProjectsCount > 0 ? (
                    <span>
                      <strong>{incompleteProjectsCount} incomplete project{incompleteProjectsCount === 1 ? '' : 's'} remain aligned.</strong> Completing this Initiative will NOT mutate or cascade into these projects.
                    </span>
                  ) : (
                    'Completing this Initiative marks the strategic program as finished. Contributing projects and work items will remain active and unmutated in their squads.'
                  )}
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCompletionConfirm(false)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-testid="confirm-completion-btn"
                    onClick={() => {
                      onCompleteInitiative?.(initiative.id);
                      setShowCompletionConfirm(false);
                      onClose?.();
                    }}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '12px 20px',
            borderTop: '1px solid var(--border-default, #334155)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
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
            type="button"
            data-testid="save-management-settings-btn"
            onClick={handleSave}
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
