import React from 'react';
import { Shield, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { PROJECT_HEALTH } from '../model/projectModel';

/**
 * ProjectHealthBadge Component
 *
 * Semantic indicator with icon and text label (non-color-only accessibility).
 *
 * @param {Object} props
 * @param {string} props.health - 'unset' | 'on_track' | 'at_risk' | 'off_track'
 */
export function ProjectHealthBadge({ health = PROJECT_HEALTH.UNSET }) {
  if (health === PROJECT_HEALTH.ON_TRACK) {
    return (
      <span
        data-testid="project-health-badge"
        data-health="on_track"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: 'rgba(46, 160, 67, 0.15)',
          color: 'var(--color-success, #2ea043)',
          border: '1px solid rgba(46, 160, 67, 0.3)'
        }}
      >
        <Shield size={12} />
        <span>On Track</span>
      </span>
    );
  }

  if (health === PROJECT_HEALTH.AT_RISK) {
    return (
      <span
        data-testid="project-health-badge"
        data-health="at_risk"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: 'rgba(210, 153, 34, 0.15)',
          color: 'var(--color-warning, #d29922)',
          border: '1px solid rgba(210, 153, 34, 0.3)'
        }}
      >
        <AlertTriangle size={12} />
        <span>At Risk</span>
      </span>
    );
  }

  if (health === PROJECT_HEALTH.OFF_TRACK) {
    return (
      <span
        data-testid="project-health-badge"
        data-health="off_track"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: 'rgba(248, 81, 73, 0.15)',
          color: 'var(--color-danger, #f85149)',
          border: '1px solid rgba(248, 81, 73, 0.3)'
        }}
      >
        <AlertCircle size={12} />
        <span>Off Track</span>
      </span>
    );
  }

  return (
    <span
      data-testid="project-health-badge"
      data-health="unset"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: 'var(--text-muted, #8b949e)',
        border: '1px solid var(--border-subtle, #30363d)'
      }}
    >
      <HelpCircle size={12} />
      <span>No Health Set</span>
    </span>
  );
}
