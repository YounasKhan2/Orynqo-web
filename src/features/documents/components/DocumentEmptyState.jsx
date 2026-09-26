import React from 'react';
import { FileText, Plus, Search } from 'lucide-react';

/**
 * DocumentEmptyState Component
 *
 * Clean, capability-backed empty state without fake templates.
 */
export function DocumentEmptyState({
  title = 'No documents found',
  description = 'Create a canonical document to capture living specifications and operational guides.',
  actionLabel = 'Create Document',
  onCreateDocument,
  isSearch = false
}) {
  return (
    <div
      role="region"
      aria-label="Empty state"
      data-testid="document-empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle, #30363d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted, #8b949e)'
        }}
      >
        {isSearch ? <Search size={20} /> : <FileText size={20} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #c9d1d9)', margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted, #8b949e)', margin: 0, maxWidth: '320px' }}>
          {description}
        </p>
      </div>

      {onCreateDocument && (
        <button
          type="button"
          data-testid="empty-create-doc-btn"
          onClick={onCreateDocument}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'var(--primary-base, #58a6ff)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: '4px'
          }}
        >
          <Plus size={14} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
