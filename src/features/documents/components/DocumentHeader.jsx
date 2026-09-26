import React from 'react';
import { ArrowLeft, Bookmark, Star, Shield, Lock, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { SAVE_STATES } from '../hooks/useDocument';

/**
 * DocumentHeader Component (DOC-002)
 *
 * Compact canvas header providing:
 * - Breadcrumbs with zero-leakage masking for restricted ancestors
 * - Inline document title
 * - Ambient continuous autosave state indicator
 * - Personal Favorite toggle [★] vs Context Pin
 * - Archive/Restore action
 * - Save error retry affordance
 */
export function DocumentHeader({
  document,
  breadcrumbs = [],
  title = '',
  onTitleChange,
  saveState = SAVE_STATES.SAVED,
  saveError = null,
  onRetrySave,
  isFavorite = false,
  onToggleFavorite,
  onArchive,
  onRestore,
  onBackToHub,
  canArchive = true,
  canEdit = true
}) {
  const isArchived = document?.lifecycle === 'archived';

  return (
    <div
      role="banner"
      aria-label="Document Header"
      data-testid="document-header"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle, #30363d)',
        marginBottom: '16px'
      }}
    >
      {/* Top Bar: Back to Hub + Breadcrumbs + Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            data-testid="back-to-docs-btn"
            aria-label="Back to Docs Hub"
            onClick={onBackToHub}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #8b949e)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <ArrowLeft size={16} />
          </button>

          {/* Breadcrumbs with permission-safe masking */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted, #8b949e)' }}>Docs</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id || idx}>
                <span style={{ color: 'var(--text-muted, #8b949e)' }}>/</span>
                <span
                  data-testid={`breadcrumb-${crumb.id}`}
                  style={{
                    color: crumb.isRestricted ? 'var(--text-muted, #8b949e)' : 'var(--text-secondary, #8b949e)',
                    fontStyle: crumb.isRestricted ? 'italic' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {crumb.isRestricted && <Lock size={10} />}
                  <span>{crumb.title}</span>
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Ambient Sync State & Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Ambient Autosave Indicator */}
          <div
            data-testid="save-state-indicator"
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: saveState === SAVE_STATES.FAILED
                ? 'var(--priority-urgent, #ef4444)'
                : saveState === SAVE_STATES.CONFLICT
                ? 'var(--priority-high, #f59e0b)'
                : 'var(--text-muted, #8b949e)'
            }}
          >
            {saveState === SAVE_STATES.SAVING && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
            {saveState === SAVE_STATES.SAVED && <CheckCircle2 size={12} color="var(--color-success, #2ea043)" />}
            {saveState === SAVE_STATES.FAILED && <AlertCircle size={12} color="var(--priority-urgent, #ef4444)" />}
            <span>{saveState}</span>
            {saveState === SAVE_STATES.FAILED && onRetrySave && (
              <button
                type="button"
                data-testid="retry-save-btn"
                onClick={onRetrySave}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-base, #58a6ff)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '11px'
                }}
              >
                Retry
              </button>
            )}
          </div>

          {/* Personal Favorite Toggle */}
          <button
            type="button"
            data-testid="favorite-toggle-btn"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={onToggleFavorite}
            style={{
              background: 'none',
              border: 'none',
              color: isFavorite ? 'var(--color-warning, #d29922)' : 'var(--text-muted, #8b949e)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Lifecycle Action: Archive or Restore */}
          {isArchived ? (
            <button
              type="button"
              data-testid="restore-doc-btn"
              onClick={onRestore}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '3px 8px',
                backgroundColor: 'rgba(56, 139, 253, 0.1)',
                border: '1px solid var(--primary-base, #58a6ff)',
                borderRadius: '4px',
                color: 'var(--primary-base, #58a6ff)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={12} />
              <span>Restore</span>
            </button>
          ) : (
            canArchive && (
              <button
                type="button"
                data-testid="archive-doc-btn"
                onClick={onArchive}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default, #30363d)',
                  borderRadius: '4px',
                  color: 'var(--text-muted, #8b949e)',
                  cursor: 'pointer'
                }}
              >
                Archive
              </button>
            )
          )}
        </div>
      </div>

      {/* Title Input */}
      <div>
        <input
          type="text"
          data-testid="document-title-input"
          value={title}
          disabled={!canEdit || isArchived}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Untitled Document"
          aria-label="Document Title"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary, #c9d1d9)',
            fontFamily: 'inherit',
            letterSpacing: '-0.02em',
            padding: 0
          }}
        />
      </div>

      {/* Contextual associations badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-muted, #8b949e)' }}>
        {document?.teamIds?.length > 0 && (
          <span style={{ padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle, #30363d)' }}>
            Teams: {document.teamIds.join(', ')}
          </span>
        )}
        {document?.projectIds?.length > 0 && (
          <span style={{ padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle, #30363d)' }}>
            Projects: {document.projectIds.join(', ')}
          </span>
        )}
        <span>v{document?.version || 1}</span>
      </div>
    </div>
  );
}
