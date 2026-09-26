import React, { useState } from 'react';
import {
  FolderKanban,
  Star,
  MessageSquarePlus,
  Settings,
  Share2,
  Calendar,
  Users,
  Shield,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { ProjectHealthBadge } from './ProjectHealthBadge';
import { PROJECT_OPERATIONAL_STATE } from '../model/projectModel';

/**
 * ProjectHeader Component
 *
 * Compact, high-density project identity and operational header:
 * - Reference key (e.g. ENG-AUTH)
 * - Project title & editable status / health
 * - Lead avatar & participating teams
 * - Target date
 * - Action buttons: Post Update, Favorite toggle, Settings entry
 */
export function ProjectHeader({
  project,
  leadUser,
  teams = [],
  isFavorite = false,
  onToggleFavorite,
  onOpenUpdateModal,
  onOpenSettings,
  onUpdateProject,
  canEdit = true,
  canPostUpdate = true
}) {
  if (!project) return null;

  const operationalState = project.operationalState || project.status || PROJECT_OPERATIONAL_STATE.PLANNED;
  const health = project.health || 'unset';
  const targetDate = project.targetDate;

  // Format operational state label
  const getStateLabel = (st) => {
    switch (st) {
      case PROJECT_OPERATIONAL_STATE.IN_PROGRESS:
        return 'In Progress';
      case PROJECT_OPERATIONAL_STATE.COMPLETED:
        return 'Completed';
      case PROJECT_OPERATIONAL_STATE.PAUSED:
        return 'Paused';
      case PROJECT_OPERATIONAL_STATE.CANCELLED:
        return 'Cancelled';
      case PROJECT_OPERATIONAL_STATE.PLANNED:
      default:
        return 'Planned';
    }
  };

  const getStateColor = (st) => {
    switch (st) {
      case PROJECT_OPERATIONAL_STATE.IN_PROGRESS:
        return 'var(--primary-base, #3b82f6)';
      case PROJECT_OPERATIONAL_STATE.COMPLETED:
        return 'var(--color-success, #22c55e)';
      case PROJECT_OPERATIONAL_STATE.PAUSED:
        return 'var(--color-warning, #f59e0b)';
      case PROJECT_OPERATIONAL_STATE.CANCELLED:
        return 'var(--text-muted, #94a3b8)';
      case PROJECT_OPERATIONAL_STATE.PLANNED:
      default:
        return 'var(--text-secondary, #64748b)';
    }
  };

  return (
    <div
      role="banner"
      aria-label={`${project.name} Header`}
      data-testid="project-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4, 16px)',
        height: '52px',
        backgroundColor: 'var(--bg-surface, #1e293b)',
        borderBottom: '1px solid var(--border-default, #334155)',
        flexShrink: 0,
        gap: 'var(--space-3, 12px)'
      }}
    >
      {/* Left: Identifier, Name, State & Health */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm, 6px)',
            backgroundColor: 'var(--bg-surface-raised, #334155)',
            color: 'var(--primary-base, #3b82f6)',
            flexShrink: 0
          }}
        >
          <FolderKanban size={18} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2, 8px)', minWidth: 0 }}>
          <span
            data-testid="project-identifier"
            style={{
              fontFamily: 'monospace',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 700,
              color: 'var(--text-muted, #94a3b8)',
              padding: '2px 6px',
              backgroundColor: 'var(--bg-surface-subtle, rgba(255,255,255,0.05))',
              borderRadius: 'var(--radius-xs, 4px)',
              letterSpacing: '0.05em'
            }}
          >
            {project.identifier || project.key || 'PRJ'}
          </span>

          <h1
            data-testid="project-name-heading"
            style={{
              fontSize: 'var(--text-md, 16px)',
              fontWeight: 'var(--font-bold, 700)',
              color: 'var(--text-primary, #f8fafc)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {project.name}
          </h1>
        </div>

        {/* State Pill */}
        <span
          data-testid="project-state-badge"
          data-state={operationalState}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: getStateColor(operationalState),
            border: `1px solid ${getStateColor(operationalState)}40`
          }}
        >
          {getStateLabel(operationalState)}
        </span>

        {/* Health Badge */}
        <ProjectHealthBadge health={health} />
      </div>

      {/* Right: Lead, Teams, Target Date & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)', flexShrink: 0 }}>
        {/* Project Lead */}
        {leadUser && (
          <div
            title={`Project Lead: ${leadUser.name || leadUser.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-xs, 12px)',
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle, rgba(59, 130, 246, 0.2))',
                color: 'var(--primary-base, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700
              }}
            >
              {(leadUser.name || leadUser.id || 'U').charAt(0).toUpperCase()}
            </div>
            <span>{leadUser.name || leadUser.id}</span>
          </div>
        )}

        {/* Target Date */}
        {targetDate && (
          <div
            data-testid="project-target-date"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--text-xs, 12px)',
              color: 'var(--text-muted, #94a3b8)'
            }}
          >
            <Clock size={13} />
            <span>{targetDate}</span>
          </div>
        )}

        {/* Post Update Action */}
        {canPostUpdate && (
          <button
            type="button"
            data-testid="post-update-btn"
            onClick={onOpenUpdateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '28px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--primary-base, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <MessageSquarePlus size={14} />
            <span>Post Update</span>
          </button>
        )}

        {/* Favorite Toggle */}
        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          data-testid="favorite-toggle-btn"
          onClick={onToggleFavorite}
          style={{
            background: 'none',
            border: 'none',
            color: isFavorite ? 'var(--color-warning, #eab308)' : 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Settings Entry */}
        <button
          type="button"
          aria-label="Project Settings"
          data-testid="project-settings-btn"
          onClick={onOpenSettings}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
