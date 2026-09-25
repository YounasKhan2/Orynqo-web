import React from 'react';
import { List, Kanban, Calendar, Activity } from 'lucide-react';

const PROJECTIONS = [
  { id: 'data-grid', label: 'Table', icon: List },
  { id: 'kanban', label: 'Board', icon: Kanban },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'workload', label: 'Capacity', icon: Activity }
];

/**
 * ProjectionSwitcher Component
 * Segmented presentation lens selector for work collections.
 */
export function ProjectionSwitcher({
  activeProjection = 'data-grid',
  onSelectProjection,
  size = 'sm'
}) {
  return (
    <div
      role="radiogroup"
      aria-label="View projections"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        backgroundColor: 'var(--bg-surface-raised)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-default)',
        userSelect: 'none'
      }}
    >
      {PROJECTIONS.map((proj) => {
        const isSelected = activeProjection === proj.id;
        const IconComponent = proj.icon;
        return (
          <button
            key={proj.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectProjection?.(proj.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              height: size === 'sm' ? '22px' : '26px',
              padding: '0 8px',
              fontSize: '11px',
              fontWeight: isSelected ? 'var(--font-medium)' : 'var(--font-regular)',
              backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
              color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
              border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            <IconComponent
              size={12}
              color={isSelected ? 'var(--primary-base)' : 'var(--text-muted)'}
            />
            <span>{proj.label}</span>
          </button>
        );
      })}
    </div>
  );
}
