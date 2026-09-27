import React from 'react';
import {
  Compass,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  Clock,
  Send,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  calculateInitiativeProgress,
  deriveInitiativeContributingTeams,
  deriveInitiativeRiskSignals
} from '../model/initiativeModel';
import { InitiativeHealthBadge } from './InitiativeHealthBadge';
import { InitiativeProgressBar } from './InitiativeProgressBar';

/**
 * InitiativeOverviewTab (INT-002 Tab 1)
 *
 * Dense strategic operational cockpit:
 * - Strategic charter summary
 * - Curated health & non-overriding objective risk signals
 * - Dual transparent progress metrics (Shipped Projects + Aggregate WorkItems)
 * - Latest published Initiative Update
 * - Contributing squads rollup
 * - Project delivery matrix
 */
export function InitiativeOverviewTab({
  initiative,
  projects = [],
  workItems = [],
  teams = [],
  users = [],
  updates = [],
  dependencies = [],
  milestones = [],
  onOpenUpdateModal,
  onNavigateToProject,
  isAccessible = () => true
}) {
  if (!initiative) return null;

  // Filter accessible projects aligned with this initiative
  const associatedProjects = (projects || []).filter(
    (p) => p.initiativeId === initiative.id && isAccessible(p, 'project')
  );

  const contributingTeamIds = deriveInitiativeContributingTeams(associatedProjects, isAccessible);
  const progress = calculateInitiativeProgress({
    initiativeId: initiative.id,
    projects,
    workItems,
    isAccessible
  });

  const riskSignals = deriveInitiativeRiskSignals({
    initiativeId: initiative.id,
    projects,
    dependencies,
    milestones,
    projectUpdates: updates,
    isAccessible
  });

  // Latest published update for this initiative
  const latestUpdate = (updates || [])
    .filter((u) => u.initiativeId === initiative.id)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))[0];

  const resolveUser = (userId) => (users || []).find((u) => u.id === userId);
  const resolveTeam = (teamId) => (teams || []).find((t) => t.id === teamId);

  return (
    <div
      role="region"
      aria-label="Initiative Overview"
      data-testid="initiative-overview-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6, 24px)',
        padding: 'var(--space-6, 24px) var(--space-8, 32px)',
        maxWidth: '1100px',
        width: '100%'
      }}
    >
      {/* Top Cockpit Grid: Dual Progress & Strategic Risk Signals */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Dual Progress Panel */}
        <div
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Dual Transparent Progress
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Empirical rollups</span>
          </div>

          {/* 1. Shipped Projects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Projects Shipped</span>
              <span data-testid="project-progress-text">{progress.projectProgress.displayText}</span>
            </div>
            <InitiativeProgressBar
              completed={progress.projectProgress.completed}
              total={progress.projectProgress.total}
              percentage={progress.projectProgress.percentage}
              label={null}
              size="sm"
            />
          </div>

          {/* 2. Aggregate WorkItems */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>WorkItems Delivered</span>
              <span data-testid="workitem-progress-text">{progress.workItemProgress.displayText}</span>
            </div>
            <InitiativeProgressBar
              completed={progress.workItemProgress.completed}
              total={progress.workItemProgress.total}
              percentage={progress.workItemProgress.percentage}
              label={null}
              size="sm"
            />
          </div>
        </div>

        {/* Objective Risk Signals Panel */}
        <div
          data-testid="initiative-risk-signals-panel"
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: '1px solid var(--border-default, #334155)',
            borderRadius: 'var(--radius-md, 8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
              Objective Risk Signals
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: riskSignals.totalRisksCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: riskSignals.totalRisksCount > 0 ? '#ef4444' : '#10b981'
              }}
            >
              {riskSignals.totalRisksCount} active signal{riskSignals.totalRisksCount === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>At-Risk Projects:</span>
              <span
                data-testid="at-risk-projects-count"
                style={{ fontWeight: 'var(--font-bold)', color: riskSignals.atRiskProjectsCount > 0 ? '#f59e0b' : 'inherit' }}
              >
                {riskSignals.atRiskProjectsCount}
              </span>
            </div>

            <div
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Off-Track Projects:</span>
              <span
                data-testid="off-track-projects-count"
                style={{ fontWeight: 'var(--font-bold)', color: riskSignals.offTrackProjectsCount > 0 ? '#ef4444' : 'inherit' }}
              >
                {riskSignals.offTrackProjectsCount}
              </span>
            </div>

            <div
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Blocked Projects:</span>
              <span
                data-testid="blocked-projects-count"
                style={{ fontWeight: 'var(--font-bold)', color: riskSignals.blockedProjectsCount > 0 ? '#ef4444' : 'inherit' }}
              >
                {riskSignals.blockedProjectsCount}
              </span>
            </div>

            <div
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Overdue Milestones:</span>
              <span
                data-testid="overdue-milestones-count"
                style={{ fontWeight: 'var(--font-bold)', color: riskSignals.overdueDeliverablesCount > 0 ? '#ef4444' : 'inherit' }}
              >
                {riskSignals.overdueDeliverablesCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Published Initiative Update */}
      <div
        data-testid="latest-initiative-update-card"
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-default, #334155)',
          borderRadius: 'var(--radius-md, 8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
              Latest Strategic Update
            </span>
            {latestUpdate && <InitiativeHealthBadge health={latestUpdate.health} size="sm" />}
          </div>
          {onOpenUpdateModal && (
            <button
              type="button"
              data-testid="post-update-from-overview"
              onClick={onOpenUpdateModal}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-base, #3b82f6)',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              + Post New Update
            </button>
          )}
        </div>

        {latestUpdate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {latestUpdate.narrative}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Published by {resolveUser(latestUpdate.authorId)?.name || latestUpdate.authorId}</span>
              <span>•</span>
              <span>{new Date(latestUpdate.publishedAt || latestUpdate.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
            No strategic updates published yet. Post the first update to record progress.
          </div>
        )}
      </div>

      {/* Contributing Squads */}
      <div
        data-testid="contributing-squads-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            Contributing Squads ({contributingTeamIds.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {contributingTeamIds.length === 0 ? (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No squads participating yet (no aligned projects).
            </span>
          ) : (
            contributingTeamIds.map((tId) => {
              const team = resolveTeam(tId);
              return (
                <div
                  key={tId}
                  data-testid={`contributing-team-${tId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--bg-surface, #1e293b)',
                    border: '1px solid var(--border-default, #334155)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{team?.icon || '👥'}</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                    {team?.name || tId}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Associated Projects Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
              Aligned Canonical Projects ({associatedProjects.length})
            </span>
          </div>
        </div>

        {associatedProjects.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              border: '1px dashed var(--border-default, #334155)',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            No projects aligned to this initiative yet.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border-default, #334155)',
              borderRadius: 'var(--radius-md, 8px)',
              overflow: 'hidden'
            }}
          >
            {associatedProjects.map((p) => {
              const leadTeam = resolveTeam(p.leadTeamId);
              return (
                <div
                  key={p.id}
                  data-testid={`overview-project-row-${p.id}`}
                  onClick={() => onNavigateToProject?.(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-subtle, #1e293b)',
                    backgroundColor: 'var(--bg-surface, #1e293b)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--primary-base, #3b82f6)' }}>
                      {p.identifier}
                    </span>
                    <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                    {leadTeam && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--primary-base)'
                        }}
                      >
                        Lead: {leadTeam.name}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      Target: {p.targetDate || 'Unscheduled'}
                    </span>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        textTransform: 'capitalize',
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {p.operationalState}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
