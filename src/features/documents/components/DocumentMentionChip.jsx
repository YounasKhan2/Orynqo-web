import React from 'react';
import { Lock, FileText, CheckCircle2 } from 'lucide-react';

/**
 * DocumentMentionChip Component
 *
 * Renders an inline reactive pill for an entity mention.
 * Strictly enforces zero-leakage security:
 * If item is restricted, renders "🔒 Restricted item" with zero metadata leakage.
 * If accessible WorkItem, clicking opens canonical WRK-005 Inspector.
 */
export function DocumentMentionChip({
  entityType = 'work_item',
  id,
  title,
  identifier,
  status,
  isRestricted = false,
  onClick,
  onOpenWorkItem
}) {
  if (isRestricted) {
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label="Restricted item"
        data-testid="mention-restricted"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '1px 6px',
          borderRadius: 'var(--radius-xs, 4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
          color: 'var(--text-muted, #8b949e)',
          fontSize: '11px',
          fontFamily: 'inherit',
          userSelect: 'none',
          cursor: 'not-allowed'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Lock size={10} />
        <span>Restricted item</span>
      </span>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (entityType === 'work_item' && onOpenWorkItem) {
      onOpenWorkItem(id);
    } else if (onClick) {
      onClick(id);
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Mention ${identifier || title}`}
      data-testid={`mention-${entityType}-${id}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '1px 6px',
        borderRadius: 'var(--radius-xs, 4px)',
        backgroundColor: 'var(--primary-subtle, rgba(88, 166, 255, 0.12))',
        border: '1px solid var(--border-subtle, rgba(88, 166, 255, 0.3))',
        color: 'var(--primary-base, #58a6ff)',
        fontSize: '11px',
        fontWeight: 'var(--font-medium, 500)',
        cursor: 'pointer',
        userSelect: 'none',
        verticalAlign: 'baseline',
        margin: '0 2px'
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {entityType === 'work_item' && <CheckCircle2 size={11} />}
      {entityType === 'document' && <FileText size={11} />}
      <span>{identifier ? `${identifier}: ` : ''}{title || id}</span>
    </span>
  );
}
