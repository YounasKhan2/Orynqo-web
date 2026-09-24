import React from 'react';
import { CheckSquare, Square, MinusSquare } from 'lucide-react';

/**
 * Checkbox Primitive
 * Domain-neutral accessible checkbox
 */
export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  size = 14,
  label,
  className = '',
  style = {},
  'aria-label': ariaLabel,
  ...rest
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      role="checkbox"
      aria-label={ariaLabel || label}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`checkbox-primitive ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        outline: 'none',
        ...style
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {indeterminate ? (
          <MinusSquare size={size} color="var(--primary-base)" />
        ) : checked ? (
          <CheckSquare size={size} color="var(--primary-base)" />
        ) : (
          <Square size={size} color="var(--border-strong)" />
        )}
      </span>
      {label && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
