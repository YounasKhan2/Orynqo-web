import React from 'react';
import { Lock } from 'lucide-react';

/**
 * RestrictedPlaceholder Component
 * Zero-leakage privacy placeholder for inaccessible related entities
 * Strictly hides title, identifier, status, assignee, and comments
 */
export function RestrictedPlaceholder({ className = '', style = {} }) {
  return (
    <div
      role="note"
      aria-label="Restricted work item"
      className={`restricted-placeholder ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        ...style
      }}
    >
      <Lock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
          Restricted work item
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          You don't have permission to view this item.
        </span>
      </div>
    </div>
  );
}
