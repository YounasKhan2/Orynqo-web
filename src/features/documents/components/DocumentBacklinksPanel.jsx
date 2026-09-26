import React from 'react';
import { ArrowUpRight, CheckCircle2, FileText, Lock } from 'lucide-react';

/**
 * DocumentBacklinksPanel Component
 *
 * Renders derived incoming references to this document.
 * Strictly enforces zero-leakage security:
 * Unauthorized sources are completely excluded from list items AND counts.
 */
export function DocumentBacklinksPanel({
  backlinks = [],
  totalCount = 0,
  onOpenWorkItem,
  onOpenDocument
}) {
  if (totalCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Document Backlinks"
      data-testid="document-backlinks-panel"
      style={{
        marginTop: '32px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle, #30363d)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          data-testid="backlinks-count-header"
          style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #8b949e)', textTransform: 'uppercase' }}
        >
          Backlinks ({totalCount})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {backlinks.map((bl) => {
          const isWorkItem = bl.sourceType === 'work_item';
          const isDoc = bl.sourceType === 'document';

          return (
            <div
              key={`${bl.sourceType}-${bl.sourceId}`}
              data-testid={`backlink-item-${bl.sourceId}`}
              onClick={() => {
                if (isWorkItem && onOpenWorkItem) onOpenWorkItem(bl.sourceId);
                if (isDoc && onOpenDocument) onOpenDocument(bl.sourceId);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle, #30363d)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                {isWorkItem && <CheckCircle2 size={13} color="var(--primary-base, #58a6ff)" />}
                {isDoc && <FileText size={13} color="var(--text-secondary, #8b949e)" />}
                <span style={{ fontWeight: 500, color: 'var(--text-primary, #c9d1d9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bl.sourceKey ? `${bl.sourceKey}: ` : ''}{bl.sourceTitle}
                </span>
                {bl.snippet && (
                  <span style={{ color: 'var(--text-muted, #8b949e)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{bl.snippet}"
                  </span>
                )}
              </div>
              <ArrowUpRight size={12} color="var(--text-muted, #8b949e)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
