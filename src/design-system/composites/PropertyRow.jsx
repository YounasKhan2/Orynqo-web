import React from 'react';

/**
 * PropertyRow Component
 * Compact 2-column inspector row for item attributes
 */
export function PropertyRow({
  label,
  icon: Icon,
  children,
  onClick,
  interactive = false
}) {
  return (
    <div
      onClick={interactive ? onClick : undefined}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        alignItems: 'center',
        minHeight: '28px',
        padding: '2px 0',
        fontSize: 'var(--text-xs)',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontWeight: 'var(--font-regular)'
        }}
      >
        {Icon && <Icon size={12} style={{ color: 'var(--text-subtle)' }} />}
        <span>{label}</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-primary)',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
}
