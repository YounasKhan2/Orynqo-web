import React from 'react';

/**
 * Compact Input Primitive
 */
export function Input({
  value,
  onChange,
  placeholder,
  icon: Icon,
  size = 'sm',
  autoFocus = false,
  className = '',
  style = {},
  onKeyDown,
  type = 'text'
}) {
  const height = size === 'xs' ? '24px' : size === 'md' ? '36px' : 'var(--control-height-compact)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height
      }}
    >
      {Icon && (
        <span
          style={{
            position: 'absolute',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        >
          <Icon size={13} />
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        className={`input-field ${className}`}
        style={{
          width: '100%',
          height: '100%',
          paddingLeft: Icon ? '28px' : '8px',
          paddingRight: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          transition: 'border-color var(--duration-fast) var(--ease-out)',
          ...style
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-focus)';
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--border-focus)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
