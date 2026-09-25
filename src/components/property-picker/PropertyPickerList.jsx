import React from 'react';
import { PropertyPickerEmptyState } from './PropertyPickerEmptyState';

/**
 * PropertyPickerList Component
 * ARIA role="listbox" container with loading skeletons, error states, and empty state fallbacks
 */
export function PropertyPickerList({
  children,
  id,
  label = 'Options',
  isLoading = false,
  isError = false,
  error = null,
  errorMessage = 'Failed to load options',
  onRetry,
  isEmpty = false,
  emptyMessage = 'No options found',
  emptyActionLabel,
  onEmptyAction,
  maxHeight = 240,
  className = '',
  style = {}
}) {
  const hasError = isError || Boolean(error);
  const displayErrorMessage = typeof error === 'string' ? error : errorMessage;

  return (
    <div
      id={id}
      role="listbox"
      aria-label={label}
      tabIndex={-1}
      className={`property-picker-list ${className}`}
      style={{
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        outline: 'none',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading ? (
        <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Loading options...</span>
          <div
            style={{
              height: '18px',
              backgroundColor: 'var(--bg-surface-hover, rgba(255, 255, 255, 0.05))',
              borderRadius: 'var(--radius-xs, 4px)',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          />
          <div
            style={{
              height: '18px',
              backgroundColor: 'var(--bg-surface-hover, rgba(255, 255, 255, 0.05))',
              borderRadius: 'var(--radius-xs, 4px)',
              animation: 'pulse 1.5s infinite ease-in-out',
              width: '80%'
            }}
          />
        </div>
      ) : hasError ? (
        <PropertyPickerEmptyState
          message={displayErrorMessage}
          isError={true}
          onRetry={onRetry}
        />
      ) : isEmpty ? (
        <PropertyPickerEmptyState
          message={emptyMessage}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        children
      )}
    </div>
  );
}
