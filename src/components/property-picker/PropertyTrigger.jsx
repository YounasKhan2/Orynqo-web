import React, { forwardRef } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

/**
 * PropertyTrigger Component
 * Reusable anchor button representing a property value in Grid, Inspector, or Quick Create
 */
export const PropertyTrigger = forwardRef(function PropertyTrigger(
  {
    name,
    label,
    valueLabel,
    icon: Icon,
    badge,
    isOpen = false,
    isReadOnly = false,
    disabled = false,
    isRestricted = false,
    placeholder = 'Select...',
    onClick,
    onKeyDown,
    size = 'default', // 'compact' (24px) | 'default' (26px) | 'sm'
    className = '',
    style = {},
    showChevron = true,
    'aria-label': ariaLabel
  },
  ref
) {
  const isDisabled = disabled || isReadOnly;
  const height = size === 'compact' ? '22px' : '26px';
  const triggerName = name || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'property');

  return (
    <button
      ref={ref}
      type="button"
      role="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-disabled={isDisabled}
      aria-label={ariaLabel || `Change ${label || 'property'}`}
      data-property-trigger={triggerName}
      data-size={size}
      disabled={isDisabled}
      onClick={(e) => {
        if (!isDisabled) {
          e.stopPropagation();
          onClick?.(e);
        }
      }}
      onKeyDown={onKeyDown}
      className={`property-trigger ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        height,
        padding: '0 6px',
        backgroundColor: isOpen ? 'var(--bg-surface-selected)' : 'transparent',
        border: '1px solid',
        borderColor: isOpen
          ? 'var(--border-focus, #3b82f6)'
          : isDisabled
          ? 'transparent'
          : 'var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: 'var(--radius-xs, 4px)',
        color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontSize: '11px',
        fontWeight: 'var(--font-medium, 500)',
        cursor: isDisabled ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'all var(--duration-instant, 100ms) ease',
        boxSizing: 'border-box',
        maxWidth: '100%',
        outline: 'none',
        ...style
      }}
    >
      {isRestricted ? (
        <>
          <Lock size={11} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            [Restricted {label || 'Item'}]
          </span>
        </>
      ) : badge ? (
        badge
      ) : (
        <>
          {Icon && <Icon size={12} style={{ flexShrink: 0 }} />}
          <span
            className="truncate"
            style={{
              color: valueLabel ? 'var(--text-primary)' : 'var(--text-muted)',
              maxWidth: '180px'
            }}
          >
            {valueLabel || placeholder}
          </span>
        </>
      )}

      {showChevron && !isDisabled && !isRestricted && (
        <ChevronDown
          size={11}
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--duration-instant, 100ms) ease'
          }}
        />
      )}
    </button>
  );
});
