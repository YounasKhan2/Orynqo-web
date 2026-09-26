import React from 'react';
import { FolderKanban, ArrowRight } from 'lucide-react';

/**
 * TeamProjects Component (TEM-004)
 *
 * Curated catalogue of projects led by or involving this squad:
 * - Clear role indicator: [Lead Team] vs [Participant]
 * - Direct navigation to Project Hub
 */
export function TeamProjects({
  ledProjects = [],
  participatingProjects = [],
  onNavigateToProject
}) {
  return (
    <div
      role="region"
      aria-label="Team Projects"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)',
        overflowY: 'auto',
        height: '100%',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Led Projects Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderKanban size={16} color="var(--primary-base)" />
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Projects Led by Team ({ledProjects.length})
          </h2>
        </div>

        {ledProjects.length === 0 ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No projects currently led by this team.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {ledProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigateToProject?.(proj.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  gap: 'var(--space-2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                    {proj.name}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-2xs)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary-base)',
                      fontWeight: 'var(--font-semibold)'
                    }}
                  >
                    Lead
                  </span>
                </div>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                  Target: {proj.targetDate} • Health: {proj.health}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{proj.teamItemCount} team items</span>
                  <span style={{ color: 'var(--primary-base)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Open <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participating Projects Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderKanban size={16} color="var(--text-secondary)" />
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Contributing / Participating ({participatingProjects.length})
          </h2>
        </div>

        {participatingProjects.length === 0 ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No cross-functional contributing projects.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {participatingProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigateToProject?.(proj.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  gap: 'var(--space-2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                    {proj.name}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-2xs)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-surface-raised)',
                      color: 'var(--text-muted)',
                      fontWeight: 'var(--font-semibold)'
                    }}
                  >
                    Participant
                  </span>
                </div>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                  Target: {proj.targetDate}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{proj.teamItemCount} team items</span>
                  <span style={{ color: 'var(--primary-base)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Open <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
