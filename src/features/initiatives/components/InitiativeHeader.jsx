import React, { useState } from 'react';
import {
  Compass,
  Star,
  Plus,
  Send,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';
import {
  INITIATIVE_OPERATIONAL_STATE,
  INITIATIVE_HEALTH,
  INITIATIVE_ACCESS_POLICY
} from '../model/initiativeModel';
import { InitiativeHealthBadge } from './InitiativeHealthBadge';

/**
 * InitiativeHeader
 *
 * Compact identity, state, health, horizon, and primary action controls for INT-002.
 */
export function InitiativeHeader({
  initiative,
  users = [],
  isFavorite = false,
  onToggleFavorite,
  onUpdateInitiative,
  onOpenUpdateModal,
  onOpenAlignProjectModal,
  onOpenManagementSurface,
  canManage = true
}) {
  if (!initiative) return null;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initiative.name);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim() && titleDraft.trim() !== initiative.name) {
      onUpdateInitiative?.({ name: titleDraft.trim() });
    } else {
      setTitleDraft(initiative.name);
    }
  };

  const handleStateChange = (newState) => {
    onUpdateInitiative?.({ operationalState: newState });
  };

  const handleHealthChange = (newHealth) => {
    onUpdateInitiative?.({ health: newHealth });
  };

  const owner = (users || []).find((u) => u.id === initiative.ownerUserId);

  return (
    <div
      role="banner"
      aria-label="Initiative Header"
      data-testid="initiative-header"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: 'var(--space-6, 24px) var(--space-8, 32px)',
        borderBottom: '1px solid var(--border-default, #1e293b)',
        backgroundColor: 'var(--bg-canvas, #0f172a)'
      }}
    >
      {/* Top Bar: Identifier, Horizon, State/Health Dropdowns, Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            data-testid="initiative-reference-badge"
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--primary-base, #3b82f6)',
              fontWeight: 'var(--font-bold, 700)',
              fontSize: '12px'
            }}
          >
            {initiative.identifier}
          </span>

          {/* Operational State Selector */}
          <select
            data-testid="initiative-state-select"
            value={initiative.operationalState}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={!canManage}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #334155)',
              fontSize: '11px',
              fontWeight: 'var(--font-medium)',
              outline: 'none',
              cursor: canManage ? 'pointer' : 'default'
            }}
          >
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Health Selector */}
          <select
            data-testid="initiative-health-select"
            value={initiative.health}
            onChange={(e) => handleHealthChange(e.target.value)}
            disabled={!canManage}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #334155)',
              fontSize: '11px',
              fontWeight: 'var(--font-medium)',
              outline: 'none',
              cursor: canManage ? 'pointer' : 'default'
            }}
          >
            <option value="unset">Unset Health</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="off_track">Off Track</option>
          </select>

          {/* Horizon Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-secondary, #94a3b8)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              border: '1px solid var(--border-default, #334155)'
            }}
          >
            <Calendar size={12} />
            <span>{initiative.horizon?.label || 'Unscheduled'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenUpdateModal && (
            <button
              type="button"
              data-testid="post-initiative-update-btn"
              onClick={onOpenUpdateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--bg-surface, #1e293b)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #334155)',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer'
              }}
            >
              <Send size={12} />
              <span>Post Update</span>
            </button>
          )}

          {onOpenAlignProjectModal && (
            <button
              type="button"
              data-testid="align-project-btn"
              onClick={onOpenAlignProjectModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--primary-base, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer'
              }}
            >
              <Plus size={12} />
              <span>Align Project</span>
            </button>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              data-testid="favorite-initiative-btn"
              onClick={onToggleFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove initiative from favorites' : 'Add initiative to favorites'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--bg-surface, #1e293b)',
                border: '1px solid var(--border-default, #334155)',
                color: isFavorite ? '#eab308' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <Star size={14} fill={isFavorite ? '#eab308' : 'none'} />
            </button>
          )}

          {onOpenManagementSurface && (
            <button
              type="button"
              data-testid="initiative-management-trigger"
              onClick={onOpenManagementSurface}
              title="Initiative Settings"
              aria-label="Initiative Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--bg-surface, #1e293b)',
                border: '1px solid var(--border-default, #334155)',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <MoreHorizontal size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Title & Strategic Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {isEditingTitle ? (
          <input
            type="text"
            data-testid="initiative-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setTitleDraft(initiative.name);
              }
            }}
            autoFocus
            style={{
              fontSize: 'var(--text-xl, 22px)',
              fontWeight: 'var(--font-bold, 700)',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--primary-base, #3b82f6)',
              borderRadius: 'var(--radius-sm, 6px)',
              padding: '4px 8px',
              outline: 'none',
              width: '100%'
            }}
          />
        ) : (
          <h1
            data-testid="initiative-title"
            onClick={() => canManage && setIsEditingTitle(true)}
            title={canManage ? 'Click to edit title' : undefined}
            style={{
              fontSize: 'var(--text-xl, 22px)',
              fontWeight: 'var(--font-bold, 700)',
              margin: 0,
              cursor: canManage ? 'pointer' : 'default',
              display: 'inline-block'
            }}
          >
            {initiative.name}
          </h1>
        )}

        {initiative.summary && (
          <p
            data-testid="initiative-summary-text"
            style={{
              fontSize: 'var(--text-sm, 13px)',
              color: 'var(--text-secondary, #94a3b8)',
              margin: 0,
              lineHeight: 1.5,
              maxWidth: '850px'
            }}
          >
            {initiative.summary}
          </p>
        )}
      </div>
    </div>
  );
}
