import React from 'react';
import {
  Calendar,
  AlertTriangle,
  FolderKanban,
  FileText,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

/**
 * TeamOverview Component (TEM-002)
 *
 * Operational landing cockpit:
 * - Active Cycle operational snapshot (when enabled and active)
 * - Team charter & squad mission
 * - Active Projects rollup (distinguishing Lead vs Participant)
 * - Pinned runbooks and canonical docs
 * - Compact operational activity stream
 */
export function TeamOverview({
  team,
  lead,
  memberCount,
  activeCycle,
  activeCycleProgress,
  onNavigateToCycles,
  projects = [],
  documents = [],
  onNavigateToProject,
  onNavigateToDoc
}) {
  return (
    <div
      role="region"
      aria-label="Team Overview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        overflowY: 'auto',
        height: '100%',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Top Grid: Active Cycle Snapshot + Team Charter */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        {/* Active Cycle Snapshot */}
        {activeCycle ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              gap: 'var(--space-3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--primary-base)" />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                  {activeCycle.name || `Cycle ${activeCycle.number}`}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-2xs)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-in-progress-bg)',
                    color: 'var(--status-in-progress)',
                    fontWeight: 'var(--font-semibold)'
                  }}
                >
                  Active
                </span>
              </div>

              <button
                type="button"
                onClick={onNavigateToCycles}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-base)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer'
                }}
              >
                <span>View Cycle</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
              {activeCycle.startDate} to {activeCycle.endDate}
              {activeCycle.daysRemaining !== undefined && ` • ${activeCycle.daysRemaining} days remaining`}
            </p>

            {/* Progress metrics */}
            {activeCycleProgress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-semibold)' }}>
                    {activeCycleProgress.completedItems} / {activeCycleProgress.totalItems} items ({activeCycleProgress.percentComplete}%)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${activeCycleProgress.percentComplete}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-base)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width var(--duration-normal) ease'
                    }}
                  />
                </div>

                {activeCycleProgress.blockedItems > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: 'var(--accent-amber)', fontSize: 'var(--text-xs)' }}>
                    <AlertTriangle size={12} />
                    <span>{activeCycleProgress.blockedItems} blocked item{activeCycleProgress.blockedItems > 1 ? 's' : ''} requires attention</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <Calendar size={24} color="var(--text-muted)" />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
              No active cycle
            </span>
            <button
              type="button"
              onClick={onNavigateToCycles}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--primary-base)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'var(--font-semibold)'
              }}
            >
              Go to Cycles & Planning →
            </button>
          </div>
        )}

        {/* Team Charter Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            gap: 'var(--space-2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--primary-base)" />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              Team Charter
            </span>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
            {team?.description || 'Operational engineering and product delivery squad for the workspace.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'auto', paddingTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {lead && <span>Lead: <strong style={{ color: 'var(--text-primary)' }}>{lead.name}</strong></span>}
            <span>Squad: <strong style={{ color: 'var(--text-primary)' }}>{memberCount} members</strong></span>
          </div>
        </div>
      </div>

      {/* Mid Grid: Active Projects + Pinned Docs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        {/* Projects Rollup */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={16} color="var(--primary-base)" />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              Active Projects ({projects.length})
            </span>
          </div>

          {projects.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No active projects.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {projects.slice(0, 4).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigateToProject?.(proj.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-2xs)',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: proj.isLead ? 'var(--primary-subtle)' : 'var(--bg-surface-raised)',
                        color: proj.isLead ? 'var(--primary-base)' : 'var(--text-muted)',
                        fontWeight: 'var(--font-semibold)'
                      }}
                    >
                      {proj.isLead ? 'Lead' : 'Participant'}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {proj.progress || 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned Documents */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--primary-base)" />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              Pinned Runbooks & Docs
            </span>
          </div>

          {documents.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No team documents pinned.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigateToDoc?.(doc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <FileText size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', flexShrink: 0 }}>
                    v{doc.version || '1.0'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
