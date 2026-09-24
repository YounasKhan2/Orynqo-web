import React from 'react';

/**
 * Kbd Primitive
 * Standardized keyboard shortcut representation
 */
export function Kbd({ children, className = '', style = {} }) {
  return (
    <kbd
      className={`kbd-shortcut ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '18px',
        minWidth: '18px',
        padding: '0 4px',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--font-medium)',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xs)',
        boxShadow: '0 1px 0 rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        lineHeight: 1,
        ...style
      }}
    >
      {children}
    </kbd>
  );
}
