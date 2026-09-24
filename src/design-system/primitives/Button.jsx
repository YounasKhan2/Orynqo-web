import React from 'react';

/**
 * Reusable Button Primitive
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes: xs (24px) | sm (28px) | md (32px)
 */
export function Button({
  children,
  variant = 'secondary',
  size = 'sm',
  icon: Icon,
  iconRight: IconRight,
  shortcut,
  disabled = false,
  onClick,
  className = '',
  title,
  style = {}
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary-base)',
          color: '#ffffff',
          borderColor: 'transparent',
          fontWeight: 'var(--font-medium)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          borderColor: 'transparent'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--priority-urgent-bg)',
          color: 'var(--priority-urgent)',
          borderColor: 'rgba(239, 68, 68, 0.3)'
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-default)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          height: '24px',
          padding: '0 var(--space-2)',
          fontSize: 'var(--text-xs)',
          gap: 'var(--space-1-5)'
        };
      case 'md':
        return {
          height: '36px',
          padding: '0 var(--space-4)',
          fontSize: 'var(--text-base)',
          gap: 'var(--space-2)'
        };
      case 'sm':
      default:
        return {
          height: 'var(--control-height-compact)',
          padding: '0 var(--space-2-5)',
          fontSize: 'var(--text-sm)',
          gap: 'var(--space-2)'
        };
    }
  };

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--duration-fast) var(--ease-out)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
          e.currentTarget.style.borderColor = 'var(--border-strong)';
        } else if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        const defaultStyle = getVariantStyles();
        e.currentTarget.style.backgroundColor = defaultStyle.backgroundColor;
        e.currentTarget.style.color = defaultStyle.color;
        e.currentTarget.style.borderColor = defaultStyle.borderColor;
      }}
    >
      {Icon && <Icon size={size === 'xs' ? 12 : 14} style={{ flexShrink: 0 }} />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={size === 'xs' ? 12 : 14} style={{ flexShrink: 0 }} />}
      {shortcut && <span className="kbd-shortcut" style={{ marginLeft: 'var(--space-1-5)' }}>{shortcut}</span>}
    </button>
  );
}
