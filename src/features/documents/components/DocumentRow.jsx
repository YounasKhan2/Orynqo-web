import React from 'react';
import { FileText, Star, Lock } from 'lucide-react';

/**
 * DocumentRow Component
 *
 * Dense, high-information document stream row.
 */
export function DocumentRow({
  document,
  isFavorite = false,
  onToggleFavorite,
  onSelectDocument,
  nestingLevel = 0
}) {
  const isArchived = document.lifecycle === 'archived';

  return (
    <div
      role="row"
      data-testid={`document-row-${document.id}`}
      onClick={() => onSelectDocument?.(document.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        paddingLeft: `${12 + nestingLevel * 16}px`,
        backgroundColor: 'transparent',
        borderBottom: '1px solid var(--border-subtle, #21262d)',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background-color 0.15s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {/* Title & Nesting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        <FileText size={14} color="var(--primary-base, #58a6ff)" style={{ flexShrink: 0 }} />
        <span
          style={{
            fontWeight: 500,
            color: isArchived ? 'var(--text-muted, #8b949e)' : 'var(--text-primary, #c9d1d9)',
            textDecoration: isArchived ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {document.title || 'Untitled Document'}
        </span>

        {/* Association Badges */}
        {document.teamIds?.length > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted, #8b949e)', backgroundColor: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '3px' }}>
            {document.teamIds.join(', ')}
          </span>
        )}
        {document.projectIds?.length > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted, #8b949e)', backgroundColor: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '3px' }}>
            {document.projectIds.join(', ')}
          </span>
        )}
        {isArchived && (
          <span style={{ fontSize: '10px', color: 'var(--priority-high, #f59e0b)', border: '1px solid var(--priority-high, #f59e0b)', padding: '0 4px', borderRadius: '2px' }}>
            Archived
          </span>
        )}
      </div>

      {/* Provenance & Favorite Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, color: 'var(--text-muted, #8b949e)', fontSize: '11px' }}>
        <span>Updated {new Date(document.updatedAt || Date.now()).toLocaleDateString()}</span>
        <button
          type="button"
          data-testid={`row-favorite-btn-${document.id}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(document.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: isFavorite ? 'var(--color-warning, #d29922)' : 'var(--text-muted, #8b949e)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
