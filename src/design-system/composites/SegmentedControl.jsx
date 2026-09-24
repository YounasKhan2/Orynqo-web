import React from 'react';

/**
 * SegmentedControl Component
 * Used for view switching and density toggles
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'sm'
}) {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        backgroundColor: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        gap: '2px'
      }}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: size === 'xs' ? '22px' : '26px',
              padding: '0 8px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              fontWeight: isSelected ? 'var(--font-medium)' : 'var(--font-regular)',
              color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: isSelected ? 'var(--bg-surface-raised)' : 'transparent',
              boxShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all var(--duration-fast) var(--ease-out)',
              outline: 'none'
            }}
          >
            {Icon && <Icon size={12} />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                style={{
                  fontSize: 'var(--text-2xs)',
                  color: isSelected ? 'var(--text-secondary)' : 'var(--text-subtle)',
                  marginLeft: '2px'
                }}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
