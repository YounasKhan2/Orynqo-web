import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

/**
 * DataGridGroupHeader Component
 * Collapsible section header with item counter and story point sum
 */
export function DataGridGroupHeader({
  groupId,
  label,
  count = 0,
  pointsSum = 0,
  isCollapsed = false,
  onToggleCollapse,
  badge
}) {
  return (
    <div
      role="row"
      aria-expanded={!isCollapsed}
      onClick={() => onToggleCollapse?.(groupId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '30px',
        padding: '0 12px',
        backgroundColor: 'var(--bg-surface-subtle)',
        borderBottom: '1px solid var(--border-default)',
        borderTop: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)',
        gap: '8px'
      }}
    >
      <button
        type="button"
        aria-label={`Toggle group ${label}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--text-muted)',
          cursor: 'pointer'
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
      </button>

      {badge && <div style={{ display: 'flex', alignItems: 'center' }}>{badge}</div>}

      <span style={{ color: 'var(--text-primary)' }}>{label}</span>

      <span
        style={{
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 'var(--font-regular)'
        }}
      >
        {`(${count} item${count !== 1 ? 's' : ''}${pointsSum > 0 ? ` • ${pointsSum} pts` : ''})`}
      </span>
    </div>
  );
}
