import React, { useState } from 'react';
import {
  Settings,
  Users,
  Link2,
  Lock,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import {
  PROJECT_OPERATIONAL_STATE,
  PROJECT_ARCHIVE_STATE,
  PROJECT_HEALTH,
  canRemoveTeamFromProject
} from '../model/projectModel';
import { validateProjectDependency } from '../model/projectDependencies';

/**
 * ProjectSettingsTab Component (PRJ-006)
 *
 * Project configuration, multi-team membership, dependency management, and lifecycle controls:
 * - General metadata: Name, summary, targetDate, startDate, operationalState.
 * - Multi-team participation: Add/remove participating teams, select Lead Team (invariant: Lead Team ∈ Participating Teams).
 * - Dependency management: Add blocker / blocked dependency edges with cycle detection.
 * - Access policy & permissions.
 * - Danger Zone: Complete Project (preserves WorkItems), Archive / Restore Project (non-destructive).
 * - Stale-write concurrency conflict detection.
 */
export function ProjectSettingsTab({
  project,
  teams = [],
  allProjects = [],
  workItems = [],
  dependencies = [],
  onUpdateProject,
  onArchiveProject,
  onRestoreProject,
  onCompleteProject,
  onAddDependency,
  onRemoveDependency,
  isConflict = false,
  saveState = 'Saved',
  canManageSettings = true,
  canArchive = true
}) {
  const [name, setName] = useState(project?.name || '');
  const [summary, setSummary] = useState(project?.summary || '');
  const [targetDate, setTargetDate] = useState(project?.targetDate || '');
  const [operationalState, setOperationalState] = useState(
    project?.operationalState || project?.status || PROJECT_OPERATIONAL_STATE.PLANNED
  );
  const [leadTeamId, setLeadTeamId] = useState(project?.leadTeamId || '');
  const [participatingTeamIds, setParticipatingTeamIds] = useState(
    project?.participatingTeamIds || project?.teamIds || (project?.teamId ? [project?.teamId] : [])
  );

  // New dependency form state
  const [blockerProjectId, setBlockerProjectId] = useState('');
  const [dependencyError, setDependencyError] = useState(null);

  // General Metadata Save
  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProject?.({
      name: name.trim(),
      summary: summary.trim(),
      targetDate: targetDate || null,
      operationalState,
      leadTeamId: leadTeamId || null,
      participatingTeamIds
    });
  };

  // Team removal validation state
  const [teamRemovalError, setTeamRemovalError] = useState(null);

  // Toggle participating team
  const handleToggleTeam = (teamId) => {
    setTeamRemovalError(null);
    setParticipatingTeamIds((prev) => {
      let next;
      if (prev.includes(teamId)) {
        // Enforce team removal safety: verify if team owns active Project WorkItems
        const safetyCheck = canRemoveTeamFromProject(teamId, project?.id, workItems);
        if (!safetyCheck.canRemove) {
          setTeamRemovalError(safetyCheck.error || safetyCheck.reason);
          return prev;
        }

        next = prev.filter((id) => id !== teamId);
        // If removing lead team, reset lead team
        if (leadTeamId === teamId) {
          setLeadTeamId(next.length > 0 ? next[0] : '');
        }
      } else {
        next = [...prev, teamId];
      }
      return next;
    });
  };

  // Add dependency with cycle validation
  const handleAddDependencyEdge = () => {
    setDependencyError(null);
    if (!blockerProjectId) return;

    // Validate dependency: blockerProjectId blocks current project.id
    const validation = validateProjectDependency(blockerProjectId, project.id, dependencies);
    if (!validation.valid) {
      setDependencyError(validation.error);
      return;
    }

    const res = onAddDependency?.({ blockerId: blockerProjectId, dependentId: project.id });
    if (res && res.valid === false) {
      setDependencyError(res.error);
      return;
    }
    setBlockerProjectId('');
  };

  const isArchived = project?.archiveState === PROJECT_ARCHIVE_STATE.ARCHIVED;
  const isCompleted = (project?.operationalState || operationalState) === PROJECT_OPERATIONAL_STATE.COMPLETED;

  return (
    <div
      role="region"
      aria-label="Project Settings & Access"
      data-testid="project-settings-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        padding: 'var(--space-6, 24px)',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        gap: 'var(--space-6, 24px)'
      }}
    >
      {/* Concurrency Conflict Banner */}
      {isConflict && (
        <div
          data-testid="project-conflict-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--color-error, #ef4444)',
            borderRadius: 'var(--radius-md, 8px)',
            color: 'var(--color-error, #ef4444)',
            fontSize: '13px'
          }}
        >
          <AlertTriangle size={18} />
          <div>
            <strong>Concurrency Conflict:</strong> Another user or session modified this Project. Your local changes are preserved. Please review or reload before overwriting.
          </div>
        </div>
      )}

      {/* 1. General Project Information Form */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-default, #334155)',
          padding: '20px',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            General Configuration
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>{saveState}</span>
        </div>

        <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>
              Project Name *
            </label>
            <input
              type="text"
              data-testid="project-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canManageSettings}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface-raised, #334155)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #475569)',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>
              Scope & Charter Summary
            </label>
            <textarea
              data-testid="project-summary-input"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!canManageSettings}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface-raised, #334155)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #475569)',
                fontSize: '13px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>
                Operational State
              </label>
              <select
                data-testid="project-state-select"
                value={operationalState}
                onChange={(e) => setOperationalState(e.target.value)}
                disabled={!canManageSettings}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-surface-raised, #334155)',
                  color: 'var(--text-primary, #f8fafc)',
                  border: '1px solid var(--border-default, #475569)',
                  fontSize: '13px'
                }}
              >
                <option value={PROJECT_OPERATIONAL_STATE.PLANNED}>Planned</option>
                <option value={PROJECT_OPERATIONAL_STATE.IN_PROGRESS}>In Progress</option>
                <option value={PROJECT_OPERATIONAL_STATE.PAUSED}>Paused</option>
                <option value={PROJECT_OPERATIONAL_STATE.COMPLETED}>Completed</option>
                <option value={PROJECT_OPERATIONAL_STATE.CANCELLED}>Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>
                Target Completion Date
              </label>
              <input
                type="date"
                data-testid="project-target-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={!canManageSettings}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-surface-raised, #334155)',
                  color: 'var(--text-primary, #f8fafc)',
                  border: '1px solid var(--border-default, #475569)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {canManageSettings && (
            <button
              type="submit"
              data-testid="save-general-settings-btn"
              style={{
                alignSelf: 'flex-start',
                height: '34px',
                padding: '0 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary-base, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          )}
        </form>
      </section>

      {/* 2. Multi-Team Participation & Leadership */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-default, #334155)',
          padding: '20px',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="var(--primary-base, #3b82f6)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            Team Participation & Leadership
          </h3>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
          Projects coordinate work across 0..N squads. Project association never alters a WorkItem's canonical owning team.
        </p>

        {/* Team Removal Safety Error Banner */}
        {teamRemovalError && (
          <div
            data-testid="team-removal-error-banner"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--color-error, #ef4444)',
              borderRadius: '6px',
              color: 'var(--color-error, #ef4444)',
              fontSize: '12px'
            }}
          >
            {teamRemovalError}
          </div>
        )}

        {/* Participating Squad Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
            Participating Teams:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {teams.map((t) => {
              const isChecked = participatingTeamIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  data-testid={`team-checkbox-label-${t.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-raised, #334155)',
                    border: isChecked ? '1px solid var(--primary-base, #3b82f6)' : '1px solid var(--border-default, #475569)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleTeam(t.id)}
                    disabled={!canManageSettings}
                  />
                  <span style={{ color: 'var(--text-primary, #f8fafc)', fontWeight: 500 }}>{t.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Lead Team Selector (Invariant: Lead Team ∈ Participating Teams) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
            Lead Team (Primary Driver):
          </label>
          <select
            data-testid="lead-team-select"
            value={leadTeamId}
            onChange={(e) => setLeadTeamId(e.target.value)}
            disabled={!canManageSettings || participatingTeamIds.length === 0}
            style={{
              height: '34px',
              padding: '0 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-raised, #334155)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              fontSize: '13px'
            }}
          >
            <option value="">No Lead Team</option>
            {participatingTeamIds.map((tId) => {
              const t = teams.find((team) => team.id === tId) || { id: tId, name: tId };
              return (
                <option key={tId} value={tId}>
                  {t.name}
                </option>
              );
            })}
          </select>
        </div>
      </section>

      {/* 3. Dependencies & Graph Integrity */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-default, #334155)',
          padding: '20px',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link2 size={16} color="var(--primary-base, #3b82f6)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            Dependencies & Precedence
          </h3>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
          Canonical directed edge: <code>Project A blocks Project B</code>. Directed cycle detection strictly rejects circular graph loops.
        </p>

        {/* Cycle or Edge Error */}
        {dependencyError && (
          <div
            data-testid="dependency-error-banner"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--color-error, #ef4444)',
              borderRadius: '6px',
              color: 'var(--color-error, #ef4444)',
              fontSize: '12px'
            }}
          >
            {dependencyError}
          </div>
        )}

        {/* Current Dependencies List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', margin: '0 0 6px 0' }}>
              Blocked By ({dependencies.filter((d) => d.dependentId === project?.id).length}):
            </h4>
            {dependencies.filter((d) => d.dependentId === project?.id).length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                No blocker projects. This project has no prerequisite dependencies.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dependencies
                  .filter((d) => d.dependentId === project?.id)
                  .map((dep) => {
                    const blocker = allProjects.find((p) => p.id === dep.blockerId) || { id: dep.blockerId, name: dep.blockerId };
                    return (
                      <div
                        key={dep.id || `${dep.blockerId}-${dep.dependentId}`}
                        data-testid={`dependency-row-${dep.blockerId}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-surface-raised, #334155)',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--color-warning, #f59e0b)', fontWeight: 600 }}>Prerequisite:</span>
                          <span style={{ color: 'var(--text-primary, #f8fafc)', fontWeight: 500 }}>{blocker.name}</span>
                          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11px' }}>({blocker.identifier || blocker.key || blocker.id})</span>
                        </div>
                        {canManageSettings && (
                          <button
                            type="button"
                            data-testid={`remove-dependency-btn-${dep.blockerId}`}
                            onClick={() => onRemoveDependency?.(dep.id || `${dep.blockerId}-${dep.dependentId}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-default, #475569)',
                              borderRadius: '4px',
                              color: 'var(--text-muted, #94a3b8)',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            <X size={12} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', margin: '0 0 6px 0' }}>
              Blocks ({dependencies.filter((d) => d.blockerId === project?.id).length}):
            </h4>
            {dependencies.filter((d) => d.blockerId === project?.id).length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                This project does not block any other projects.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dependencies
                  .filter((d) => d.blockerId === project?.id)
                  .map((dep) => {
                    const dependent = allProjects.find((p) => p.id === dep.dependentId) || { id: dep.dependentId, name: dep.dependentId };
                    return (
                      <div
                        key={dep.id || `${dep.blockerId}-${dep.dependentId}`}
                        data-testid={`dependent-row-${dep.dependentId}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-surface-raised, #334155)',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--primary-base, #3b82f6)', fontWeight: 600 }}>Blocks:</span>
                          <span style={{ color: 'var(--text-primary, #f8fafc)', fontWeight: 500 }}>{dependent.name}</span>
                          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11px' }}>({dependent.identifier || dependent.key || dependent.id})</span>
                        </div>
                        {canManageSettings && (
                          <button
                            type="button"
                            data-testid={`remove-dependency-btn-${dep.dependentId}`}
                            onClick={() => onRemoveDependency?.(dep.id || `${dep.blockerId}-${dep.dependentId}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-default, #475569)',
                              borderRadius: '4px',
                              color: 'var(--text-muted, #94a3b8)',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            <X size={12} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Add Blocker Form */}
        {canManageSettings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              data-testid="blocker-project-select"
              value={blockerProjectId}
              onChange={(e) => setBlockerProjectId(e.target.value)}
              style={{
                height: '34px',
                padding: '0 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface-raised, #334155)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #475569)',
                fontSize: '13px'
              }}
            >
              <option value="">Select project that blocks this project...</option>
              {allProjects
                .filter((p) => p.id !== project?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.identifier || p.key})
                  </option>
                ))}
            </select>

            <button
              type="button"
              data-testid="add-dependency-btn"
              onClick={handleAddDependencyEdge}
              disabled={!blockerProjectId}
              style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                backgroundColor: blockerProjectId ? 'var(--primary-base, #3b82f6)' : 'var(--bg-surface-raised, #334155)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: blockerProjectId ? 'pointer' : 'not-allowed'
              }}
            >
              Add Blocker Edge
            </button>
          </div>
        )}
      </section>

      {/* 4. Danger Zone: Lifecycle Actions */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '20px',
          gap: '16px'
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-error, #ef4444)', margin: 0 }}>
          Project Lifecycle & Danger Zone
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Mark Complete */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
                Project Completion
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                Marking complete changes project operational state but preserves all WorkItems, Milestones, and Documents intact.
              </div>
            </div>

            <button
              type="button"
              data-testid="complete-project-btn"
              onClick={() => onCompleteProject?.(project?.id)}
              disabled={isCompleted}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: '6px',
                backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                color: 'var(--color-success, #22c55e)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isCompleted ? 'default' : 'pointer'
              }}
            >
              {isCompleted ? 'Completed' : 'Mark Completed'}
            </button>
          </div>

          {/* Archive / Restore */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
                {isArchived ? 'Restore Project' : 'Archive Project'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                Archiving hides project from default active discovery while retaining full history and relationships.
              </div>
            </div>

            {isArchived ? (
              <button
                type="button"
                data-testid="restore-project-btn"
                onClick={() => onRestoreProject?.(project?.id)}
                style={{
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--primary-base, #3b82f6)',
                  border: '1px solid var(--primary-base, #3b82f6)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Restore Project
              </button>
            ) : (
              <button
                type="button"
                data-testid="archive-project-btn"
                onClick={() => onArchiveProject?.(project?.id)}
                disabled={!canArchive}
                style={{
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--color-error, #ef4444)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Archive Project
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
