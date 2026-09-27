import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Unlink,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { calculateProjectProgress } from '../../projects/model/projectModel';
import { InitiativeProgressBar } from './InitiativeProgressBar';

/**
 * InitiativeProjectsTab (INT-002 Tab 2)
 *
 * High-density list of canonical associated Projects.
 * Exposes empirical progress, Lead Squad, Milestones summary, and association/dissociation triggers.
 * Dissociation delegates to the Authoritative Project Mutation Boundary (clears project.initiativeId).
 */
export function InitiativeProjectsTab({
  initiative,
  projects = [],
  workItems = [],
  teams = [],
  users = [],
  onNavigateToProject,
  onOpenAlignProjectModal,
  onDissociateProject,
  canManage = true,
  isAccessible = () => true
}) {
  if (!initiative) return null;

  // Filter accessible projects aligned with this initiative
  const associatedProjects = (projects || []).filter(
    (p) => p.initiativeId === initiative.id && isAccessible(p, 'project')
  );

  const resolveTeam = (teamId) => (teams || []).find((t) => t.id === teamId);
  const resolveUser = (userId) => (users || []).find((u) => u.id === userId);

  return (
    <div
      role="region"
      aria-label="Initiative Projects"
      data-testid="initiative-projects-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4, 16px)',
        padding: 'var(--space-6, 24px) var(--space-8, 32px)',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 'var(--font-bold, 700)', margin: 0 }}>
            Aligned Canonical Projects ({associatedProjects.length})
          </h2>
          <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-secondary, #94a3b8)', margin: '2px 0 0 0' }}>
            Autonomous workspace projects coordinated under this strategic initiative.
          </p>
        </div>

        {canManage && onOpenAlignProjectModal && (
          <button
            type="button"
            data-testid="align-project-trigger-tab"
            onClick={onOpenAlignProjectModal}
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
            <Plus size={13} />
            <span>Align Project</span>
          </button>
        )}
      </div>

      {associatedProjects.length === 0 ? (
        <div
          data-testid="initiative-projects-empty-state"
          style={{
            padding: '36px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: '1px dashed var(--border-default, #334155)',
            borderRadius: 'var(--radius-md, 8px)'
          }}
        >
          <FolderKanban size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-semibold)', margin: '0 0 4px 0' }}>
            No projects aligned to this initiative
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
            Align existing workspace projects to coordinate their delivery and aggregate strategic progress.
          </p>
          {canManage && onOpenAlignProjectModal && (
            <button
              type="button"
              onClick={onOpenAlignProjectModal}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--primary-base, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Align Existing Project
            </button>
          )}
        </div>
      ) : (
        <table
          data-testid="initiative-projects-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '12px',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: '1px solid var(--border-default, #334155)',
            borderRadius: 'var(--radius-md, 8px)',
            overflow: 'hidden'
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-default, #334155)',
                color: 'var(--text-muted, #94a3b8)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              <th style={{ padding: '8px 12px', width: '90px' }}>Reference</th>
              <th style={{ padding: '8px 12px' }}>Project Name</th>
              <th style={{ padding: '8px 12px', width: '120px' }}>Lead Squad</th>
              <th style={{ padding: '8px 12px', width: '110px' }}>State</th>
              <th style={{ padding: '8px 12px', width: '110px' }}>Target Date</th>
              <th style={{ padding: '8px 12px', width: '160px' }}>Progress</th>
              {canManage && onDissociateProject && (
                <th style={{ padding: '8px 12px', width: '80px', textAlign: 'right' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {associatedProjects.map((p) => {
              const leadTeam = resolveTeam(p.leadTeamId);
              const progress = calculateProjectProgress(p.id, workItems, isAccessible);

              return (
                <tr
                  key={p.id}
                  data-testid={`project-row-${p.id}`}
                  style={{
                    borderBottom: '1px solid var(--border-subtle, #1e293b)',
                    transition: 'background-color 150ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover, rgba(255, 255, 255, 0.04))')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td
                    onClick={() => onNavigateToProject?.(p.id)}
                    style={{ padding: '10px 12px', fontWeight: 'var(--font-semibold)', color: 'var(--primary-base, #3b82f6)', cursor: 'pointer' }}
                  >
                    {p.identifier}
                  </td>
                  <td
                    onClick={() => onNavigateToProject?.(p.id)}
                    style={{ padding: '10px 12px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                      {p.summary && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '380px'
                          }}
                        >
                          {p.summary}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {leadTeam ? (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs, 4px)',
                          fontSize: '10px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--primary-base)'
                        }}
                      >
                        {leadTeam.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>
                        No lead
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs, 4px)',
                        fontSize: '11px',
                        textTransform: 'capitalize',
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {p.operationalState}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {p.targetDate || 'Unscheduled'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <InitiativeProgressBar
                      completed={progress.completed}
                      total={progress.total}
                      percentage={progress.percentage}
                      label={progress.displayText}
                      emptyText="0 items"
                      size="sm"
                    />
                  </td>
                  {canManage && onDissociateProject && (
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        data-testid={`dissociate-project-btn-${p.id}`}
                        title="Remove project from this initiative"
                        aria-label={`Remove project ${p.name} from initiative`}
                        onClick={() => onDissociateProject(p.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Unlink size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
