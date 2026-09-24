import React from 'react';

/**
 * EntityReference Component
 * Monospace pill representation of a canonical WorkItem identifier
 */
export function EntityReference({
  identifier,
  onClick,
  interactive = false,
  className = '',
  style = {}
}) {
  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      className={`font-mono ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 5px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xs)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-muted)',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      {identifier}
    </span>
  );
}
