import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * PropertyPickerSearch Component
 * Auto-focused search input for filterable/searchable pickers
 */
export function PropertyPickerSearch({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Search...',
  autoFocus = true
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        backgroundColor: 'transparent'
      }}
    >
      <Search
        size={12}
        style={{
          color: 'var(--text-muted)',
          marginRight: '6px',
          flexShrink: 0
        }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: '11px',
          fontFamily: 'inherit',
          padding: 0
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={(e) => {
            e.stopPropagation();
            onChange?.('');
            inputRef.current?.focus();
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
