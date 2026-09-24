import React from 'react';

/**
 * Badge Primitive (Domain-Neutral)
 * Represents a status, count, tag, or indicator badge.
 * Variants: default | primary | success | warning | danger | outline | subtle
 */
export function Badge({
  children,
  variant = 'default',
  color,
  bg,
  icon: Icon,
  iconSize = 11,
  interactive = false,
  onClick,
  title,
  className = '',
  style = {}
}) {
  const getVariantStyles = () => {
    if (color || bg) {
      return {
        color: color || 'var(--text-primary)',
        backgroundColor: bg || 'transparent',
        border: bg ? `1px solid ${color}33` : '1px solid transparent'
      };
    }

    switch (variant) {
      case 'primary':
        return {
          color: 'var(--primary-text)',
          backgroundColor: 'var(--primary-subtle)',
          border: '1px solid var(--primary-base)'
        };
      case 'success':
        return {
          color: 'var(--status-done)',
          backgroundColor: 'var(--status-done-bg)',
          border: '1px solid rgba(34, 197, 94, 0.25)'
        };
      case 'warning':
        return {
          color: 'var(--status-in-progress)',
          backgroundColor: 'var(--status-in-progress-bg)',
          border: '1px solid rgba(234, 179, 8, 0.25)'
        };
      case 'danger':
        return {
          color: 'var(--priority-urgent)',
          backgroundColor: 'var(--priority-urgent-bg)',
          border: '1px solid rgba(239, 68, 68, 0.25)'
        };
      case 'outline':
        return {
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
          border: '1px solid var(--border-default)'
        };
      case 'subtle':
        return {
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)'
        };
      case 'default':
      default:
        return {
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-surface-raised)',
          border: '1px solid transparent'
        };
    }
  };

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={title}
      onClick={interactive ? onClick : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      className={`badge-primitive ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        borderRadius: 'var(--radius-xs)',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        lineHeight: 1,
        transition: 'all var(--duration-fast) var(--ease-out)',
        ...getVariantStyles(),
        ...style
      }}
    >
      {Icon && <Icon size={iconSize} style={{ flexShrink: 0 }} />}
      {children && <span>{children}</span>}
    </span>
  );
}

/**
 * Tag Primitive (Domain-Neutral)
 */
export function Tag({
  label,
  onRemove,
  onClick,
  className = '',
  style = {}
}) {
  return (
    <span
      onClick={onClick}
      className={`tag-primitive ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '1px 5px',
        fontSize: 'var(--text-2xs)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xs)',
        lineHeight: '1.2',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      #{label}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ cursor: 'pointer', marginLeft: '2px', color: 'var(--text-muted)' }}
        >
          ×
        </span>
      )}
    </span>
  );
}
