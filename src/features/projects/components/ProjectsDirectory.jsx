import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Users,
  Clock,
  Shield,
  Layers,
  Archive,
  ChevronRight
} from 'lucide-react';
import { ProjectHealthBadge } from './ProjectHealthBadge';
import {
  PROJECT_OPERATIONAL_STATE,
  PROJECT_ARCHIVE_STATE,
  PROJECT_HEALTH,
  calculateProjectProgress
} from '../model/projectModel';
import { useProjectsDirectoryQuery } from '../hooks/useProjectsDirectoryQuery';

/**
 * ProjectsDirectory Component (PRJ-007)
 *
 * Scalable workspace project catalogue:
 * - High-density tabular layout.
 * - Multi-facet filtering: operationalState, archiveState, health, teamId, leadUserId.
 * - Search: filters by identifier, name, and summary.
 * - Columns: Reference, Project Name, Lead, Participating Teams, State, Health, Target Date, Progress.
 * - Zero-leakage: Inaccessible projects are completely excluded.
 */
export function ProjectsDirectory({
  projects = [],
  workItems = [],
  teams = [],
  users = [],
  onNavigateToProject,
  onOpenCreateProject,
  canCreate = true,
  isAccessible = () => true
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [operationalStateFilter, setOperationalStateFilter] = useState('all');
  const [archiveStateFilter, setArchiveStateFilter] = useState(PROJECT_ARCHIVE_STATE.ACTIVE);
  const [healthFilter, setHealthFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const filters = useMemo(
    () => ({
      operationalState: operationalStateFilter,
      archiveState: archiveStateFilter,
      health: healthFilter,
      teamId: teamFilter
    }),
    [operationalStateFilter, archiveStateFilter, healthFilter, teamFilter]
  );

  const {
    projects: filteredProjects,
    totalCount,
    activeCount,
    archivedCount
  } = useProjectsDirectoryQuery({
    projects,
    workItems,
    searchQuery,
    filters,
    sortBy,
    sortDirection,
    isAccessible
  });

  return (
    <div
      role="region"
      aria-label="Projects Directory"
      data-testid="projects-directory"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas, #0f172a)'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6, 24px)',
          height: '52px',
          borderBottom: '1px solid var(--border-default, #334155)',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FolderKanban size={20} color="var(--primary-base, #3b82f6)" />
          <h1 style={{ fontSize: 'var(--text-lg, 18px)', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            Projects Directory
          </h1>
          <span
            data-testid="projects-directory-total-badge"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-raised, #334155)',
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            {totalCount} total ({activeCount} active)
          </span>
        </div>

        {canCreate && (
          <button
            type="button"
            data-testid="create-project-btn"
            onClick={onOpenCreateProject}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--primary-base, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filter & Search Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px var(--space-6, 24px)',
          backgroundColor: 'var(--bg-surface-subtle, rgba(255,255,255,0.02))',
          borderBottom: '1px solid var(--border-default, #334155)',
          flexShrink: 0,
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface-raised, #334155)',
            border: '1px solid var(--border-default, #475569)',
            borderRadius: '6px',
            padding: '0 10px',
            width: '260px',
            height: '32px'
          }}
        >
          <Search size={14} color="var(--text-muted, #94a3b8)" />
          <input
            type="text"
            data-testid="projects-search-input"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '12px',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>

        {/* Right: Facet Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Operational State */}
          <select
            data-testid="filter-state-select"
            aria-label="Filter Operational State"
            value={operationalStateFilter}
            onChange={(e) => setOperationalStateFilter(e.target.value)}
            style={{
              height: '30px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              borderRadius: '6px',
              padding: '0 8px'
            }}
          >
            <option value="all">All States</option>
            <option value={PROJECT_OPERATIONAL_STATE.PLANNED}>Planned</option>
            <option value={PROJECT_OPERATIONAL_STATE.IN_PROGRESS}>In Progress</option>
            <option value={PROJECT_OPERATIONAL_STATE.PAUSED}>Paused</option>
            <option value={PROJECT_OPERATIONAL_STATE.COMPLETED}>Completed</option>
            <option value={PROJECT_OPERATIONAL_STATE.CANCELLED}>Cancelled</option>
          </select>

          {/* Health */}
          <select
            data-testid="filter-health-select"
            aria-label="Filter Project Health"
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            style={{
              height: '30px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              borderRadius: '6px',
              padding: '0 8px'
            }}
          >
            <option value="all">All Health</option>
            <option value={PROJECT_HEALTH.ON_TRACK}>On Track</option>
            <option value={PROJECT_HEALTH.AT_RISK}>At Risk</option>
            <option value={PROJECT_HEALTH.OFF_TRACK}>Off Track</option>
          </select>

          {/* Participating Team */}
          <select
            data-testid="filter-team-select"
            aria-label="Filter Team"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            style={{
              height: '30px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              borderRadius: '6px',
              padding: '0 8px'
            }}
          >
            <option value="all">All Squads</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Archive Status */}
          <select
            data-testid="filter-archive-select"
            aria-label="Filter Archive State"
            value={archiveStateFilter}
            onChange={(e) => setArchiveStateFilter(e.target.value)}
            style={{
              height: '30px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              borderRadius: '6px',
              padding: '0 8px'
            }}
          >
            <option value={PROJECT_ARCHIVE_STATE.ACTIVE}>Active Only</option>
            <option value={PROJECT_ARCHIVE_STATE.ARCHIVED}>Archived Only</option>
            <option value="all">All Records</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {filteredProjects.length === 0 ? (
          <div
            data-testid="projects-directory-empty"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: 'var(--text-muted, #94a3b8)'
            }}
          >
            <FolderKanban size={32} />
            <span style={{ fontSize: '14px' }}>No projects match your current filters</span>
          </div>
        ) : (
          <table
            data-testid="projects-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr
                style={{
                  height: '36px',
                  backgroundColor: 'var(--bg-surface-raised, #334155)',
                  borderBottom: '1px solid var(--border-default, #475569)',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '0 16px', width: '110px' }}>Reference</th>
                <th style={{ padding: '0 16px' }}>Project</th>
                <th style={{ padding: '0 16px', width: '130px' }}>Lead</th>
                <th style={{ padding: '0 16px', width: '180px' }}>Teams</th>
                <th style={{ padding: '0 16px', width: '120px' }}>State</th>
                <th style={{ padding: '0 16px', width: '110px' }}>Health</th>
                <th style={{ padding: '0 16px', width: '110px' }}>Target</th>
                <th style={{ padding: '0 16px', width: '140px' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const leadUser = users.find((u) => u.id === (project.leadUserId || project.leadId));
                const participatingTeamIds = project.participatingTeamIds || project.teamIds || (project.teamId ? [project.teamId] : []);
                const projectItems = (workItems || []).filter((it) => it.projectId === project.id);
                const progress = calculateProjectProgress(projectItems);

                return (
                  <tr
                    key={project.id}
                    data-testid={`project-row-${project.id}`}
                    onClick={() => onNavigateToProject?.(project.id)}
                    style={{
                      height: '44px',
                      borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {/* Reference */}
                    <td style={{ padding: '0 16px' }}>
                      <span
                        data-testid="project-cell-identifier"
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '11px',
                          color: 'var(--text-muted, #94a3b8)',
                          backgroundColor: 'var(--bg-surface-raised, #334155)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {project.identifier || project.key || 'PRJ'}
                      </span>
                    </td>

                    {/* Project Name & Summary */}
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          data-testid="project-cell-name"
                          style={{ fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}
                        >
                          {project.name}
                        </span>
                        {project.summary && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                            {project.summary}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Lead */}
                    <td style={{ padding: '0 16px', color: 'var(--text-secondary, #94a3b8)', fontSize: '12px' }}>
                      {leadUser?.name || project.leadUserId || project.leadId || '—'}
                    </td>

                    {/* Teams */}
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {participatingTeamIds.length === 0 ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>0 teams</span>
                        ) : (
                          participatingTeamIds.slice(0, 2).map((tId) => {
                            const t = teams.find((team) => team.id === tId);
                            return (
                              <span
                                key={tId}
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  backgroundColor: 'var(--bg-surface-raised, #334155)',
                                  color: 'var(--text-secondary, #94a3b8)'
                                }}
                              >
                                {t?.key || t?.name || tId}
                              </span>
                            );
                          })
                        )}
                        {participatingTeamIds.length > 2 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
                            +{participatingTeamIds.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Operational State */}
                    <td style={{ padding: '0 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          color: 'var(--text-secondary, #94a3b8)'
                        }}
                      >
                        {(project.operationalState || project.status || 'planned').replace('_', ' ')}
                      </span>
                    </td>

                    {/* Health */}
                    <td style={{ padding: '0 16px' }}>
                      <ProjectHealthBadge health={project.health} />
                    </td>

                    {/* Target Date */}
                    <td style={{ padding: '0 16px', fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                      {project.targetDate || '—'}
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '5px',
                            backgroundColor: 'var(--bg-surface-raised, #334155)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${progress.percentage}%`,
                              height: '100%',
                              backgroundColor: progress.percentage === 100 ? 'var(--color-success, #22c55e)' : 'var(--primary-base, #3b82f6)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>
                          {progress.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
