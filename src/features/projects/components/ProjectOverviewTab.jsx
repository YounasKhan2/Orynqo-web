import React from 'react';
import {
  FolderKanban,
  Users,
  Target,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Link2,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { ProjectHealthBadge } from './ProjectHealthBadge';
import { calculateProjectProgress } from '../model/projectModel';

/**
 * ProjectOverviewTab Component (PRJ-001)
 *
 * Compact operational home surfacing semantic regions:
 * - Project Identity & Scope / Charter
 * - Transparent Progress (e.g. 24 / 32 • 75%)
 * - Latest Project Update narrative snapshot
 * - Participating Teams (with Lead Team distinguished)
 * - Sequential Milestones gate preview
 * - Key Associated Documents
 * - Blockers & Dependencies
 * - Recent Activity summary
 */
export function ProjectOverviewTab({
  project,
  leadUser,
  teams = [],
  workItems = [],
  milestones = [],
  documents = [],
  latestUpdate = null,
  dependencies = { blockedBy: [], blocks: [] },
  onNavigateToTab,
  onNavigateToDoc,
  onNavigateToWorkItem,
  onOpenUpdateModal,
  isAccessible = () => true
}) {
  if (!project) return null;

  // Compute transparent progress ratio with zero-leakage security filter
  const progress = calculateProjectProgress(workItems, isAccessible);
  const participatingTeamIds = project.participatingTeamIds || project.teamIds || (project.teamId ? [project.teamId] : []);
  const leadTeamId = project.leadTeamId || (project.teamIds ? project.teamIds[0] : project.teamId);

  return (
    <div
      role="region"
      aria-label="Project Overview"
      data-testid="project-overview-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4, 16px)',
        padding: 'var(--space-5, 20px)',
        overflowY: 'auto',
        height: '100%',
        backgroundColor: 'var(--bg-canvas, #0f172a)'
      }}
    >
      {/* Top Row: Mission / Charter & Operational Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4, 16px)'
        }}
      >
        {/* Scope / Charter Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
              Project Charter & Scope
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ProjectHealthBadge health={project.health} />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'var(--primary-base, #3b82f6)'
                }}
              >
                {project.identifier || project.key}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2
              data-testid="project-overview-name"
              style={{
                fontSize: 'var(--text-md, 16px)',
                fontWeight: 700,
                color: 'var(--text-primary, #f8fafc)',
                margin: 0
              }}
            >
              {project.name}
            </h2>
            <p
              data-testid="project-summary-text"
              style={{
                fontSize: 'var(--text-sm, 14px)',
                lineHeight: 1.5,
                color: 'var(--text-secondary, #94a3b8)',
                margin: 0
              }}
            >
              {project.summary || 'No project scope or charter defined yet.'}
            </p>
          </div>

          {/* Lead & Dates Sub-row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 'var(--space-3, 12px)',
              borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
              fontSize: 'var(--text-xs, 12px)',
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted, #64748b)' }}>Lead: </span>
              <strong>{leadUser?.name || project.leadUserId || project.leadId || 'Unassigned'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted, #64748b)' }}>Target: </span>
              <strong>{project.targetDate || 'No target date'}</strong>
            </div>
          </div>
        </div>

        {/* Progress & Transparent Delivery Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
              Execution Progress
            </span>
            <button
              type="button"
              onClick={() => onNavigateToTab?.('work')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--primary-base, #3b82f6)',
                fontSize: 'var(--text-xs, 12px)',
                cursor: 'pointer'
              }}
            >
              <span>View Work</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Progress Display: Both ratio and percentage */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2, 8px)' }}>
            <span
              data-testid="project-progress-ratio"
              style={{ fontSize: 'var(--text-2xl, 24px)', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}
            >
              {progress.displayText}
            </span>
            <span
              data-testid="project-progress-percent"
              style={{ fontSize: 'var(--text-sm, 14px)', color: 'var(--text-secondary, #94a3b8)' }}
            >
              ({progress.percentage}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--bg-surface-raised, #334155)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progress.percentage}%`,
                height: '100%',
                backgroundColor: progress.percentage === 100 ? 'var(--color-success, #22c55e)' : 'var(--primary-base, #3b82f6)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-muted, #64748b)', margin: 0 }}>
            {progress.total > 0
              ? `${progress.completed} items completed out of ${progress.total} tracked (excludes cancelled/archived)`
              : 'Zero active WorkItems currently associated with this Project.'}
          </p>
        </div>
      </div>

      {/* Middle Row: Latest Project Update & Participating Teams */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4, 16px)'
        }}
      >
        {/* Latest Project Update */}
        <div
          data-testid="latest-project-update-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="var(--primary-base, #3b82f6)" />
              <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                Latest Project Update
              </span>
            </div>
            {latestUpdate && (
              <ProjectHealthBadge health={latestUpdate.health} />
            )}
          </div>

          {latestUpdate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p
                data-testid="latest-update-narrative"
                style={{
                  fontSize: 'var(--text-sm, 14px)',
                  lineHeight: 1.5,
                  color: 'var(--text-primary, #f8fafc)',
                  margin: 0
                }}
              >
                {latestUpdate.narrative}
              </p>

              {latestUpdate.blockers && latestUpdate.blockers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-warning, #f59e0b)' }}>
                    Active Blockers:
                  </span>
                  {latestUpdate.blockers.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                      <AlertTriangle size={12} color="var(--color-warning, #f59e0b)" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>
                Published {new Date(latestUpdate.createdAt).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
                No updates published yet. Publish an update to communicate status and health to stakeholders.
              </p>
              <button
                type="button"
                onClick={onOpenUpdateModal}
                style={{
                  fontSize: 'var(--text-xs, 12px)',
                  color: 'var(--primary-base, #3b82f6)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                + Post first update
              </button>
            </div>
          )}
        </div>

        {/* Participating Squads / Teams */}
        <div
          data-testid="participating-teams-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="var(--primary-base, #3b82f6)" />
              <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                Participating Teams ({participatingTeamIds.length})
              </span>
            </div>
          </div>

          {participatingTeamIds.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-muted, #64748b)', margin: 0 }}>
              Zero teams participating. Project exists independently at workspace level.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {participatingTeamIds.map((tId) => {
                const team = (teams || []).find((t) => t.id === tId) || { id: tId, name: tId };
                const isLeadTeam = tId === leadTeamId;

                return (
                  <div
                    key={tId}
                    data-testid={`team-pill-${tId}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: isLeadTeam ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-raised, #334155)',
                      border: isLeadTeam ? '1px solid var(--primary-base, #3b82f6)' : '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                      fontSize: 'var(--text-xs, 12px)'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>{team.name}</span>
                    {isLeadTeam && (
                      <span
                        data-testid="lead-team-badge"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: 'var(--primary-base, #3b82f6)',
                          color: '#ffffff',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          letterSpacing: '0.04em'
                        }}
                      >
                        LEAD
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Milestones Gates & Key Documents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4, 16px)'
        }}
      >
        {/* Milestones Delivery Gates */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} color="var(--primary-base, #3b82f6)" />
              <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                Delivery Milestones ({milestones.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab?.('milestones')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--primary-base, #3b82f6)',
                fontSize: 'var(--text-xs, 12px)',
                cursor: 'pointer'
              }}
            >
              <span>Manage</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {milestones.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-muted, #64748b)', margin: 0 }}>
              No milestones defined. Create sequential delivery gates to structure delivery.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {milestones.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--bg-surface-raised, #334155)',
                    fontSize: 'var(--text-xs, 12px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2
                      size={14}
                      color={m.status === 'completed' ? 'var(--color-success, #22c55e)' : 'var(--text-muted, #64748b)'}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>{m.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11px' }}>
                    {m.targetDate || 'No date'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Associated Documents */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} color="var(--primary-base, #3b82f6)" />
              <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                Project Docs ({documents.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab?.('docs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--primary-base, #3b82f6)',
                fontSize: 'var(--text-xs, 12px)',
                cursor: 'pointer'
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {documents.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-muted, #64748b)', margin: 0 }}>
              No canonical documents associated with this Project.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigateToDoc?.(doc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--bg-surface-raised, #334155)',
                    fontSize: 'var(--text-xs, 12px)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{doc.icon || '📄'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>{doc.title}</span>
                  </div>
                  <ArrowRight size={12} color="var(--text-muted, #94a3b8)" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dependencies Section (if any blockers or blocks exist) */}
      {(dependencies.blockedBy.length > 0 || dependencies.blocks.length > 0) && (
        <div
          data-testid="project-dependencies-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            gap: 'var(--space-3, 12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link2 size={15} color="var(--primary-base, #3b82f6)" />
            <span style={{ fontSize: 'var(--text-xs, 12px)', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
              Project Dependencies
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {/* Inbound Blockers (Blocked by) */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-warning, #f59e0b)' }}>
                Blocked By ({dependencies.blockedBy.length}):
              </span>
              {dependencies.blockedBy.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0' }}>None</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {dependencies.blockedBy.map(({ project: p }) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary, #f8fafc)' }}>
                      <AlertTriangle size={12} color="var(--color-warning, #f59e0b)" />
                      <span>{p.name} ({p.identifier || p.key})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outbound Blocks (Blocks) */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-base, #3b82f6)' }}>
                Blocks ({dependencies.blocks.length}):
              </span>
              {dependencies.blocks.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0' }}>None</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {dependencies.blocks.map(({ project: p }) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary, #f8fafc)' }}>
                      <ArrowRight size={12} color="var(--primary-base, #3b82f6)" />
                      <span>{p.name} ({p.identifier || p.key})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
