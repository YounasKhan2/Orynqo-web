import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

/**
 * WorkItemLinkedDocs Component
 * Renders bi-directional link banner to canonical Living Specs and Documents
 */
export function WorkItemLinkedDocs({
  item,
  onOpenSpec,
  className = ''
}) {
  // Check canonical documentLinks or fallback specDocId
  const specLink = (item.documentLinks || []).find((l) => l.type === 'source_spec') ||
    (item.specDocId ? { documentId: item.specDocId, title: 'PRD: Living Specification' } : null);

  if (!specLink) return null;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => onOpenSpec?.(specLink.documentId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenSpec?.(specLink.documentId);
        }
      }}
      className={`work-item-linked-spec ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-2) var(--space-3)',
        backgroundColor: 'var(--primary-subtle)',
        border: '1px solid var(--primary-base)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color var(--duration-fast)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <FileText size={14} color="var(--primary-text)" style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
            Source Living Spec
          </span>
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {specLink.title || 'PRD: Living Specification'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--primary-text)', fontSize: '10px', fontWeight: 'var(--font-semibold)', flexShrink: 0 }}>
        <span>View Spec</span>
        <ArrowRight size={10} />
      </div>
    </div>
  );
}
