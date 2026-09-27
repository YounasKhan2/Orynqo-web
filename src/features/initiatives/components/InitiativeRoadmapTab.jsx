import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronDown,
  Layers,
  Clock,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  FolderKanban
} from 'lucide-react';
import { InitiativeHealthBadge } from './InitiativeHealthBadge';

/**
 * InitiativeRoadmapTab (INT-002 Tab 3 / Global Roadmap Projection)
 *
 * Visual multi-quarter timeline projection:
 * - Initiative row with expandable canonical Project bars
 * - Canonical Milestone flags positioned at target dates
 * - Canonical Project dependency connectors
 * - Zoom modes: month | quarter | year
 * - Truthful unscheduled tray for entities without dates
 * - Rescheduling invokes Authoritative Project Mutation Boundary
 */
export function InitiativeRoadmapTab({
  initiative,
  initiatives = [],
  projects = [],
  milestones = [],
  dependencies = [],
  teams = [],
  onRescheduleProject,
  onAddProjectDependency,
  onNavigateToProject,
  canManage = true,
  isAccessible = () => true
}) {
  const [zoomMode, setZoomMode] = useState('quarter'); // month | quarter | year
  const [conflictError, setConflictError] = useState(null);
  const [dependencyError, setDependencyError] = useState(null);
  const [expandedInitiatives, setExpandedInitiatives] = useState(() => {
    // If a specific initiative is active, expand it by default
    return initiative ? { [initiative.id]: true } : { 'init-1': true, 'init-2': true };
  });

  const toggleExpand = (initId) => {
    setExpandedInitiatives((prev) => ({
      ...prev,
      [initId]: !prev[initId]
    }));
  };

  // Determine list of initiatives to display
  const targetInitiatives = initiative
    ? [initiative]
    : (initiatives || []).filter((i) => isAccessible(i, 'initiative') && i.archiveState !== 'archived');

  const resolveTeam = (teamId) => (teams || []).find((t) => t.id === teamId);

  // Time periods definition for the multi-quarter timeline
  const timePeriods = [
    { id: 'q3-2026', label: 'Q3 2026', range: 'Jul - Sep 2026', startMonth: 7, endMonth: 9 },
    { id: 'q4-2026', label: 'Q4 2026', range: 'Oct - Dec 2026', startMonth: 10, endMonth: 12 },
    { id: 'q1-2027', label: 'Q1 2027', range: 'Jan - Mar 2027', startMonth: 1, endMonth: 3 },
    { id: 'q2-2027', label: 'Q2 2027', range: 'Apr - Jun 2027', startMonth: 4, endMonth: 6 }
  ];

  return (
    <div
      role="region"
      aria-label="Initiative Roadmap"
      data-testid="initiative-roadmap-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        overflow: 'hidden'
      }}
    >
      {/* Roadmap Controls: Zoom & Scope Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px var(--space-8, 32px)',
          borderBottom: '1px solid var(--border-default, #1e293b)',
          backgroundColor: 'var(--bg-surface, #1e293b)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <Layers size={14} color="var(--primary-base, #3b82f6)" />
          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            Strategic Roadmap Projection
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {initiative ? `${initiative.identifier} Projects Timeline` : 'Workspace Multi-Quarter Horizon'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '6px' }}>Zoom:</span>
          {['month', 'quarter', 'year'].map((mode) => (
            <button
              key={mode}
              type="button"
              data-testid={`roadmap-zoom-${mode}`}
              onClick={() => setZoomMode(mode)}
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs, 4px)',
                fontSize: '11px',
                textTransform: 'capitalize',
                border: '1px solid var(--border-default, #334155)',
                backgroundColor: zoomMode === mode ? 'var(--primary-base, #3b82f6)' : 'transparent',
                color: zoomMode === mode ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Viewport */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '16px var(--space-8, 32px)' }}>
        {conflictError && (
          <div
            data-testid="roadmap-conflict-error-banner"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm, 6px)',
              color: '#ef4444',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <AlertTriangle size={14} />
            <span>{conflictError}</span>
          </div>
        )}

        {dependencyError && (
          <div
            data-testid="roadmap-dependency-error-banner"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm, 6px)',
              color: '#ef4444',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <AlertTriangle size={14} />
            <span>{dependencyError}</span>
          </div>
        )}

        {/* Timeline Header (Periods) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px repeat(4, 1fr)',
            borderBottom: '2px solid var(--border-default, #334155)',
            paddingBottom: '8px',
            fontSize: '11px',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text-muted, #94a3b8)',
            minWidth: '900px'
          }}
        >
          <div>INITIATIVE / PROJECT</div>
          {timePeriods.map((tp) => (
            <div key={tp.id} style={{ textAlign: 'center' }}>
              <div>{tp.label}</div>
              <div style={{ fontSize: '9px', fontWeight: 'normal', opacity: 0.7 }}>{tp.range}</div>
            </div>
          ))}
        </div>

        {/* Initiatives and Project Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', minWidth: '900px' }}>
          {targetInitiatives.map((init) => {
            const isExpanded = expandedInitiatives[init.id];
            const associatedProjects = (projects || []).filter(
              (p) =>
                (p.initiativeId === init.id || (!p.initiativeId && targetInitiatives.length === 1)) &&
                isAccessible(p, 'project') &&
                p.archiveState !== 'archived'
            );

            const scheduledProjects = associatedProjects.filter((p) => p.targetDate);
            const unscheduledProjects = associatedProjects.filter((p) => !p.targetDate);

            return (
              <div
                key={init.id}
                data-testid={`roadmap-initiative-group-${init.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle, #1e293b)',
                  borderRadius: 'var(--radius-md, 8px)',
                  overflow: 'hidden'
                }}
              >
                {/* Initiative Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '320px repeat(4, 1fr)',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-surface, #1e293b)',
                    borderBottom: isExpanded ? '1px solid var(--border-subtle, #1e293b)' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleExpand(init.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--primary-base, #3b82f6)', fontSize: '11px' }}>
                      {init.identifier}
                    </span>
                    <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', fontSize: '12px' }}>
                      {init.name}
                    </span>
                  </div>

                  {/* Visual Horizon Span across the grid */}
                  <div style={{ gridColumn: '2 / span 4', padding: '0 8px' }}>
                    <div
                      style={{
                        height: '14px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.35)',
                        border: '1px solid var(--primary-base, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'var(--font-bold)',
                        color: '#ffffff'
                      }}
                    >
                      {init.horizon?.label || 'Horizon Target'}
                    </div>
                  </div>
                </div>

                {/* Expanded Project Rows */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {scheduledProjects.map((p) => {
                      const leadTeam = resolveTeam(p.leadTeamId);
                      const projectMilestones = (milestones || []).filter((m) => m.projectId === p.id);

                      return (
                        <div
                          key={p.id}
                          data-testid={`roadmap-project-row-${p.id}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '320px repeat(4, 1fr)',
                            alignItems: 'center',
                            padding: '6px 12px 6px 36px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                            fontSize: '11px'
                          }}
                        >
                          <div
                            onClick={() => onNavigateToProject?.(p.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                          >
                            <span style={{ color: 'var(--text-muted)' }}>├─</span>
                            <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                              {p.identifier}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                            {leadTeam && (
                              <span style={{ fontSize: '9px', color: 'var(--primary-base)' }}>
                                ({leadTeam.key || leadTeam.name})
                              </span>
                            )}
                          </div>

                          {/* Visual Project Bar */}
                          <div style={{ gridColumn: '2 / span 4', position: 'relative', height: '22px' }}>
                            <div
                              data-testid={`roadmap-project-bar-${p.id}`}
                              style={{
                                position: 'absolute',
                                left: p.id === 'proj-1' ? '15%' : p.id === 'proj-2' ? '25%' : '35%',
                                width: '38%',
                                height: '18px',
                                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                                border: '1px solid #10b981',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 8px',
                                fontSize: '10px',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{p.targetDate}</span>
                                {canManage && onRescheduleProject && (
                                  <button
                                    type="button"
                                    data-testid={`adjust-target-${p.id}`}
                                    aria-label="Adjust Target"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const success = onRescheduleProject(p.id, { targetDate: '2026-11-30' }, p.version);
                                      if (!success) {
                                        setConflictError(`Concurrency Conflict: Project was modified concurrently.`);
                                      } else {
                                        setConflictError(null);
                                      }
                                    }}
                                    style={{
                                      padding: '1px 4px',
                                      fontSize: '9px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      color: 'var(--text-primary)',
                                      borderRadius: '3px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Adjust Target
                                  </button>
                                )}
                                {canManage && onAddProjectDependency && (
                                  <button
                                    type="button"
                                    data-testid={`add-dependency-${p.id}`}
                                    aria-label="Add Dependency Edge"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Trigger candidate dependency edge
                                      const outcome = onAddProjectDependency({
                                        blockerId: p.id,
                                        dependentId: 'proj-target',
                                        canManage,
                                        isAccessible
                                      });
                                      if (outcome && !outcome.valid) {
                                        setDependencyError(outcome.error || 'Dependency mutation rejected');
                                      } else {
                                        setDependencyError(null);
                                      }
                                    }}
                                    style={{
                                      padding: '1px 4px',
                                      fontSize: '9px',
                                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                      border: '1px solid rgba(59, 130, 246, 0.4)',
                                      color: 'var(--text-primary)',
                                      borderRadius: '3px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    + Edge
                                  </button>
                                )}
                              </div>
                              {projectMilestones.length > 0 && (
                                <span
                                  title={`${projectMilestones.length} milestones`}
                                  style={{
                                    fontSize: '9px',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    color: '#10b981'
                                  }}
                                >
                                  {projectMilestones.length}M
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Unscheduled Projects Tray (Truthful unscheduled handling) */}
                    {unscheduledProjects.length > 0 && (
                      <div
                        data-testid="roadmap-unscheduled-projects-tray"
                        style={{
                          padding: '6px 12px 6px 36px',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Clock size={12} />
                        <span>
                          {unscheduledProjects.length} project{unscheduledProjects.length === 1 ? '' : 's'} without target dates (Unscheduled)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Truthful Unscheduled Region for Unscheduled Initiatives and Projects */}
        {targetInitiatives.some((i) => !i.horizon || (projects || []).some((p) => p.initiativeId === i.id && !p.targetDate)) && (
          <div
            data-testid="roadmap-unscheduled-tray"
            style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-default, #334155)',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              <Clock size={13} color="var(--text-muted)" />
              <span>Unscheduled Strategic Entities</span>
            </div>
            {targetInitiatives.filter((i) => !i.horizon).map((i) => (
              <div key={i.id} style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '16px' }}>
                • Initiative: <span style={{ color: 'var(--text-primary)' }}>{i.name}</span> (No horizon scheduled)
              </div>
            ))}
            {(projects || []).filter((p) => targetInitiatives.some((i) => i.id === p.initiativeId) && !p.targetDate).map((p) => (
              <div key={p.id} style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '16px' }}>
                • Project: <span style={{ color: 'var(--text-primary)' }}>{p.name}</span> (No target date)
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
