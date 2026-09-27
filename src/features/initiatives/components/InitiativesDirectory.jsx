import React, { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Users
} from 'lucide-react';
import {
  INITIATIVE_OPERATIONAL_STATE,
  INITIATIVE_HEALTH,
  deriveInitiativeContributingTeams,
  calculateInitiativeProgress,
  matchesCurrentQuarter
} from '../model/initiativeModel';
import { InitiativeHealthBadge } from './InitiativeHealthBadge';
import { InitiativeProgressBar } from './InitiativeProgressBar';

/**
 * InitiativesDirectory (INT-001)
 *
 * High-density portfolio discovery surface for Workspace Initiatives.
 * Multi-facet filtering, instant search, empirical progress rollups, and zero-leakage security.
 */
export function InitiativesDirectory({
  initiatives = [],
  projects = [],
  workItems = [],
  teams = [],
  users = [],
  onNavigateToInitiative,
  onOpenCreateInitiative,
  referenceClock = new Date(),
  isAccessible = () => true
}) {
  const [stateFilter, setStateFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [horizonFilter, setHorizonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('horizon');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter accessible initiatives
  const accessibleInitiatives = (initiatives || []).filter((init) => isAccessible(init, 'initiative'));

  const filteredInitiatives = accessibleInitiatives.filter((init) => {
    if (stateFilter !== 'all' && init.operationalState !== stateFilter) return false;
    if (healthFilter !== 'all' && init.health !== healthFilter) return false;

    if (horizonFilter !== 'all') {
      if (horizonFilter === 'unscheduled') {
        if (init.horizon !== null && (init.horizon?.targetDate || init.horizon?.quarter)) return false;
      } else if (horizonFilter === 'current_quarter') {
        if (!matchesCurrentQuarter(init, referenceClock)) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesRef = (init.identifier || '').toLowerCase().includes(q);
      const matchesName = (init.name || '').toLowerCase().includes(q);
      const matchesSummary = (init.summary || '').toLowerCase().includes(q);
      if (!matchesRef && !matchesName && !matchesSummary) return false;
    }

    return true;
  });

  // Sort initiatives
  const sortedInitiatives = [...filteredInitiatives].sort((a, b) => {
    let valA, valB;
    if (sortKey === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortKey === 'health') {
      valA = a.health || 'unset';
      valB = b.health || 'unset';
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    valA = a.horizon?.targetDate || '9999-99-99';
    valB = b.horizon?.targetDate || '9999-99-99';
    return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const resolveUser = (userId) => (users || []).find((u) => u.id === userId);
  const resolveTeam = (teamId) => (teams || []).find((t) => t.id === teamId);

  return (
    <div
      role="region"
      aria-label="Initiatives Directory"
      data-testid="initiatives-directory"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        color: 'var(--text-primary, #f8fafc)',
        overflowY: 'auto'
      }}
    >
      {/* Directory Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-6, 24px) var(--space-8, 32px)',
          borderBottom: '1px solid var(--border-default, #1e293b)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary-base, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl, 20px)', fontWeight: 'var(--font-bold, 700)', margin: 0 }}>
              Initiatives (INT-001)
            </h1>
            <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-secondary, #94a3b8)', margin: '2px 0 0 0' }}>
              Strategic coordination umbrellas across multi-squad canonical projects.
            </p>
          </div>
        </div>

        {onOpenCreateInitiative && (
          <button
            type="button"
            data-testid="create-initiative-btn"
            onClick={onOpenCreateInitiative}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'var(--primary-base, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm, 6px)',
              fontWeight: 'var(--font-medium, 500)',
              fontSize: 'var(--text-xs, 12px)',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New Initiative</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px var(--space-8, 32px)',
          borderBottom: '1px solid var(--border-subtle, #1e293b)',
          backgroundColor: 'var(--bg-surface, #1e293b)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-canvas, #0f172a)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs, 4px)',
              border: '1px solid var(--border-default, #334155)',
              minWidth: '220px'
            }}
          >
            <Search size={13} color="var(--text-muted, #64748b)" />
            <input
              type="text"
              data-testid="initiative-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search initiatives (INT-01, name)..."
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '12px',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          {/* Operational State Facet */}
          <select
            data-testid="initiative-state-filter"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'var(--bg-canvas, #0f172a)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #334155)',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="all">All States</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Health Facet */}
          <select
            data-testid="initiative-health-filter"
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'var(--bg-canvas, #0f172a)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #334155)',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="all">All Health</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="off_track">Off Track</option>
            <option value="unset">Unset</option>
          </select>

          {/* Horizon Facet */}
          <select
            data-testid="initiative-horizon-filter"
            value={horizonFilter}
            onChange={(e) => setHorizonFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'var(--bg-canvas, #0f172a)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #334155)',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="all">All Horizons</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="unscheduled">Unscheduled</option>
          </select>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
          Showing {sortedInitiatives.length} of {accessibleInitiatives.length} initiatives
        </div>
      </div>

      {/* High-Density Initiatives Table */}
      <div style={{ flex: 1, padding: 'var(--space-6, 24px) var(--space-8, 32px)' }}>
        {sortedInitiatives.length === 0 ? (
          <div
            data-testid="initiatives-empty-state"
            style={{
              padding: 'var(--space-12, 48px)',
              textAlign: 'center',
              border: '1px dashed var(--border-default, #334155)',
              borderRadius: 'var(--radius-md, 8px)'
            }}
          >
            <Compass size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ fontSize: 'var(--text-md, 14px)', fontWeight: 'var(--font-semibold, 600)', margin: '0 0 4px 0' }}>
              No initiatives match filters
            </h3>
            <p style={{ fontSize: 'var(--text-xs, 12px)', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
              Adjust or reset filters to display strategic initiatives.
            </p>
          </div>
        ) : (
          <table
            data-testid="initiatives-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '12px'
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-default, #334155)',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '8px 12px', width: '90px' }}>Reference</th>
                <th style={{ padding: '8px 12px' }}>Initiative Name</th>
                <th style={{ padding: '8px 12px', width: '130px' }}>State</th>
                <th style={{ padding: '8px 12px', width: '110px' }}>Health</th>
                <th style={{ padding: '8px 12px', width: '110px' }}>Horizon</th>
                <th style={{ padding: '8px 12px', width: '130px' }}>Contributing Squads</th>
                <th style={{ padding: '8px 12px', width: '180px' }}>Progress (Projects)</th>
                <th style={{ padding: '8px 12px', width: '120px' }}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {sortedInitiatives.map((init) => {
                const owner = resolveUser(init.ownerUserId);
                const associatedProjects = (projects || []).filter(
                  (p) => p.initiativeId === init.id && isAccessible(p, 'project')
                );
                const contributingTeamIds = deriveInitiativeContributingTeams(associatedProjects, isAccessible);
                const progress = calculateInitiativeProgress({
                  initiativeId: init.id,
                  projects,
                  workItems,
                  isAccessible
                });

                return (
                  <tr
                    key={init.id}
                    data-testid={`initiative-row-${init.id}`}
                    onClick={() => onNavigateToInitiative?.(init.id)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #1e293b)',
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover, rgba(255, 255, 255, 0.04))')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 'var(--font-semibold)', color: 'var(--primary-base, #3b82f6)' }}>
                      {init.identifier}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                          {init.name}
                        </span>
                        {init.summary && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '420px'
                            }}
                          >
                            {init.summary}
                          </span>
                        )}
                      </div>
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
                        {init.operationalState.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <InitiativeHealthBadge health={init.health} />
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span>{init.horizon?.label || 'Unscheduled'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {contributingTeamIds.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>
                          0 teams
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          {contributingTeamIds.slice(0, 3).map((tId) => {
                            const team = resolveTeam(tId);
                            return (
                              <span
                                key={tId}
                                style={{
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-xs, 4px)',
                                  fontSize: '10px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  color: 'var(--primary-base)'
                                }}
                              >
                                {team?.name || tId}
                              </span>
                            );
                          })}
                          {contributingTeamIds.length > 3 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              +{contributingTeamIds.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <InitiativeProgressBar
                        completed={progress.projectProgress.completed}
                        total={progress.projectProgress.total}
                        percentage={progress.projectProgress.percentage}
                        label={`${progress.projectProgress.completed} / ${progress.projectProgress.total} projects`}
                        emptyText="No projects aligned"
                        size="sm"
                      />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {owner?.name || 'Unassigned'}
                      </span>
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
