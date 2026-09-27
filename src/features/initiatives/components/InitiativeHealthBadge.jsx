import React from 'react';
import { INITIATIVE_HEALTH } from '../model/initiativeModel';

/**
 * InitiativeHealthBadge
 *
 * Accessible non-color-only semantic health indicator for Initiatives.
 * Uses distinct icons, shapes, and clear text labels.
 */
export function InitiativeHealthBadge({ health = INITIATIVE_HEALTH.UNSET, size = 'sm' }) {
  const config = (() => {
    switch (health) {
      case INITIATIVE_HEALTH.ON_TRACK:
        return {
          label: 'On Track',
          icon: '●',
          bg: 'var(--success-surface, rgba(16, 185, 129, 0.12))',
          color: 'var(--success-text, #10b981)',
          border: 'var(--success-border, rgba(16, 185, 129, 0.25))'
        };
      case INITIATIVE_HEALTH.AT_RISK:
        return {
          label: 'At Risk',
          icon: '▲',
          bg: 'var(--warning-surface, rgba(245, 158, 11, 0.12))',
          color: 'var(--warning-text, #f59e0b)',
          border: 'var(--warning-border, rgba(245, 158, 11, 0.25))'
        };
      case INITIATIVE_HEALTH.OFF_TRACK:
        return {
          label: 'Off Track',
          icon: '■',
          bg: 'var(--danger-surface, rgba(239, 68, 68, 0.12))',
          color: 'var(--danger-text, #ef4444)',
          border: 'var(--danger-border, rgba(239, 68, 68, 0.25))'
        };
      case INITIATIVE_HEALTH.UNSET:
      default:
        return {
          label: 'Unset',
          icon: '○',
          bg: 'var(--bg-muted, rgba(148, 163, 184, 0.1))',
          color: 'var(--text-muted, #94a3b8)',
          border: 'var(--border-subtle, rgba(148, 163, 184, 0.2))'
        };
    }
  })();

  const isSmall = size === 'sm';

  return (
    <span
      role="status"
      aria-label={`Initiative Health: ${config.label}`}
      data-testid={`initiative-health-${health}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 7px' : '4px 9px',
        borderRadius: 'var(--radius-full, 9999px)',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 'var(--font-medium, 500)',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      <span aria-hidden="true" style={{ fontSize: isSmall ? '9px' : '10px' }}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
}
