import React from 'react';
import { Check } from 'lucide-react';

/**
 * PropertyPickerOption Component
 * Renders an option with ARIA role="option", active keyboard highlight, checkmark, icon, and optional badge
 */
export function PropertyPickerOption({
  id,
  value,
  label,
  description,
  icon: Icon,
  badge,
  avatar,
  isSelected = false,
  isHighlighted = false,
  onClick,
  onSelect,
  onMouseEnter,
  disabled = false,
  shortcut,
  className = '',
  style = {}
}) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      disabled={disabled}
      tabIndex={isHighlighted ? 0 : -1}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          onSelect?.(value);
          onClick?.(e);
        }
      }}
      onMouseEnter={onMouseEnter}
      className={`property-picker-option ${className}`}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 8px',
        backgroundColor: isHighlighted
          ? 'var(--bg-surface-hover, rgba(255, 255, 255, 0.05))'
          : isSelected
          ? 'var(--bg-surface-selected, rgba(255, 255, 255, 0.08))'
          : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-xs, 4px)',
        color: disabled
          ? 'var(--text-muted)'
          : isSelected
          ? 'var(--text-primary)'
          : 'var(--text-secondary)',
        fontSize: '11px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        userSelect: 'none',
        outline: 'none',
        transition: 'background-color var(--duration-instant, 100ms) ease',
        ...style
      }}
    >
      {avatar && <span style={{ flexShrink: 0 }}>{avatar}</span>}
      {badge && <span style={{ flexShrink: 0 }}>{badge}</span>}
      {Icon && !badge && !avatar && (
        <Icon size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="truncate" style={{ fontWeight: isSelected ? 'var(--font-semibold, 600)' : 'normal' }}>
          {label}
        </div>
        {description && (
          <div
            className="truncate"
            style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}
          >
            {description}
          </div>
        )}
      </div>

      {shortcut && (
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {shortcut}
        </span>
      )}

      {isSelected && (
        <Check size={11} style={{ flexShrink: 0, color: 'var(--primary, #3b82f6)' }} />
      )}
    </button>
  );
}
