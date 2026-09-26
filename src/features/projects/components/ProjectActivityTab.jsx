import React from 'react';
import {
  History,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Users,
  Target,
  Link2,
  Archive,
  RefreshCw
} from 'lucide-react';

/**
 * ProjectActivityTab Component (PRJ-005)
 *
 * Chronological stream of canonical ActivityEvents:
 * - Project created
 * - Operational state changed
 * - Health changed
 * - Project Update posted
 * - Milestone created/completed
 * - Participating teams changed
 * - Dependency linked
 * - Archived / Restored
 */
export function ProjectActivityTab({
  project,
  events = []
}) {
  // If no external events supplied, generate deterministic project events
  const projectEvents = events.length > 0
    ? events.filter((e) => e.projectId === project?.id || e.targetId === project?.id)
    : [
        {
          id: 'ev-1',
          type: 'project_created',
          actor: 'System Admin',
          timestamp: project?.createdAt || new Date(Date.now() - 86400000 * 5).toISOString(),
          description: `Project "${project?.name}" initialized.`
        },
        {
          id: 'ev-2',
          type: 'health_updated',
          actor: project?.leadUserId || 'Project Lead',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          description: `Health assessed as "${project?.health || 'on_track'}".`
        },
        {
          id: 'ev-3',
          type: 'state_updated',
          actor: 'System',
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
          description: `Operational state is "${project?.operationalState || project?.status || 'in_progress'}".`
        }
      ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'project_created':
        return <FolderKanban size={14} color="var(--primary-base, #3b82f6)" />;
      case 'health_updated':
        return <AlertTriangle size={14} color="var(--color-warning, #f59e0b)" />;
      case 'update_posted':
        return <MessageSquare size={14} color="var(--primary-base, #3b82f6)" />;
      case 'milestone_completed':
        return <CheckCircle2 size={14} color="var(--color-success, #22c55e)" />;
      case 'archived':
      case 'restored':
        return <Archive size={14} color="var(--text-muted, #94a3b8)" />;
      default:
        return <RefreshCw size={14} color="var(--text-muted, #94a3b8)" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Project Activity"
      data-testid="project-activity-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        padding: 'var(--space-6, 24px)',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        gap: 'var(--space-4, 16px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={18} color="var(--primary-base, #3b82f6)" />
        <h2 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
          Project Activity History
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #1e293b)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-default, #334155)',
          padding: '16px'
        }}
      >
        {projectEvents.map((evt, idx) => (
          <div
            key={evt.id || idx}
            data-testid="activity-event-item"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 0',
              borderBottom: idx < projectEvents.length - 1 ? '1px solid var(--border-subtle, rgba(255,255,255,0.06))' : 'none'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-raised, #334155)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getEventIcon(evt.type)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary, #f8fafc)' }}>
                  {evt.description}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>
                By: {evt.actor}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
