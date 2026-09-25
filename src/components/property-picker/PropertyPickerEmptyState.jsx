import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';

/**
 * PropertyPickerEmptyState Component
 * Fallback for empty search results, creation prompts, or error notices
 */
export function PropertyPickerEmptyState({
  message = 'No options found',
  actionLabel,
  onAction,
  isError = false,
  onRetry
}) {
  return (
    <div
      style={{
        padding: '12px 8px',
        textAlign: 'center',
        fontSize: '11px',
        color: isError ? 'var(--priority-urgent, #ef4444)' : 'var(--text-muted)'
      }}
    >
      {isError && (
        <AlertCircle
          size={14}
          style={{ margin: '0 auto 4px auto', display: 'block', color: 'var(--priority-urgent)' }}
        />
      )}
      <div>{message}</div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 'var(--font-medium, 500)',
            backgroundColor: 'var(--primary-subtle, rgba(59, 130, 246, 0.1))',
            color: 'var(--primary, #3b82f6)',
            border: '1px solid var(--primary, #3b82f6)',
            borderRadius: 'var(--radius-xs, 4px)',
            cursor: 'pointer'
          }}
        >
          <Plus size={10} />
          <span>{actionLabel}</span>
        </button>
      )}

      {isError && onRetry && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          style={{
            marginTop: '6px',
            padding: '2px 8px',
            fontSize: '10px',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs, 4px)',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
