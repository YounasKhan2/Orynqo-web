import React, { useState } from 'react';
import { X, Plus, AlertTriangle, FolderKanban } from 'lucide-react';

/**
 * AlignProjectModal
 *
 * Modal for aligning an existing canonical Project with the active Initiative.
 * If the selected Project already belongs to another Initiative, prompts the user
 * with an explicit reassignment confirmation per contract Section 5.1.
 */
export function AlignProjectModal({
  initiative,
  activeInitiativeId,
  projects = [],
  initiatives = [],
  isOpen = false,
  onClose,
  onAlignProject,
  isAccessible = () => true
}) {
  const currentInitiative =
    initiative ||
    (activeInitiativeId ? (initiatives || []).find((i) => i.id === activeInitiativeId) || { id: activeInitiativeId, name: 'Active Initiative' } : null);

  if (!isOpen || !currentInitiative) return null;

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showReassignConfirm, setShowReassignConfirm] = useState(false);
  const [pendingReassignProject, setPendingReassignProject] = useState(null);

  // Available accessible projects (not archived and not already associated with THIS initiative)
  const candidateProjects = (projects || []).filter((p) => {
    if (!isAccessible(p, 'project')) return false;
    if (p.archiveState === 'archived' || p.isArchived) return false;
    return p.initiativeId !== currentInitiative.id;
  });

  const handleSelect = (e) => {
    const projId = e.target.value;
    setSelectedProjectId(projId);

    const project = candidateProjects.find((p) => p.id === projId);
    if (project && project.initiativeId && project.initiativeId !== currentInitiative.id) {
      // Reassignment required
      const currentInit = (initiatives || []).find((i) => i.id === project.initiativeId);
      setPendingReassignProject({
        project,
        currentInitiativeName: currentInit?.name || project.initiativeId
      });
      setShowReassignConfirm(true);
    } else {
      setShowReassignConfirm(false);
      setPendingReassignProject(null);
    }
  };

  const handleConfirmAlign = () => {
    if (!selectedProjectId) return;
    onAlignProject?.(selectedProjectId, currentInitiative.id);
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Align Project to Initiative"
      data-testid="align-project-modal"
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
          maxWidth: '480px',
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
            <FolderKanban size={16} color="var(--primary-base, #3b82f6)" />
            <span style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              Align Project to Initiative
            </span>
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

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Aligning a project coordinates its timeline and milestones under{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{currentInitiative.name}</strong> without mutating the project's
            autonomous team ownership.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="align-project-select-input" style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Select Project to Align
            </label>
            <select
              id="align-project-select-input"
              data-testid="align-project-select"
              value={selectedProjectId}
              onChange={handleSelect}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs, 4px)',
                backgroundColor: 'var(--bg-canvas, #0f172a)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default, #334155)',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="">-- Choose a project --</option>
              {candidateProjects.map((p) => {
                const currentInit = p.initiativeId
                  ? (initiatives || []).find((i) => i.id === p.initiativeId)
                  : null;

                return (
                  <option key={p.id} value={p.id}>
                    {p.identifier || p.id} - {p.name} {currentInit ? `(Currently: ${currentInit.name})` : '(Unaligned)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Reassignment Warning */}
          {showReassignConfirm && pendingReassignProject && (
            <div
              data-testid="reassign-warning"
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
                <span style={{ fontWeight: 'var(--font-semibold)' }}>Reassignment Confirmation</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Project <strong>{pendingReassignProject.project.name}</strong> is Currently aligned to Initiative{' '}
                <strong>{pendingReassignProject.currentInitiativeName}</strong>. A Project can belong to at most one
                Initiative. Reassign it to <strong>{currentInitiative.name}</strong>?
              </p>
            </div>
          )}

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
              type="button"
              data-testid="confirm-align-project-btn"
              disabled={!selectedProjectId}
              onClick={handleConfirmAlign}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: selectedProjectId ? 'var(--primary-base, #3b82f6)' : 'var(--bg-muted, #334155)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 'var(--font-medium)',
                cursor: selectedProjectId ? 'pointer' : 'not-allowed'
              }}
            >
              {showReassignConfirm ? 'Reassign & Align Project' : 'Align Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
