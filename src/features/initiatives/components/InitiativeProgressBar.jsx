import React from 'react';

/**
 * InitiativeProgressBar
 *
 * Transparent empirical progress bar and ratio indicator for Initiatives.
 * Exposes numerator, denominator, and calculated percentage without false precision.
 */
export function InitiativeProgressBar({
  completed = 0,
  total = 0,
  percentage = 0,
  label = null,
  emptyText = 'No projects aligned',
  size = 'md'
}) {
  if (total === 0) {
    return (
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontStyle: 'italic'
        }}
      >
        {emptyText}
      </span>
    );
  }

  const isSmall = size === 'sm';
  const trackHeight = isSmall ? '4px' : '6px';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        minWidth: '90px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: isSmall ? '11px' : '12px'
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontWeight: 'var(--font-medium)' }}>
          {label || `${completed} / ${total}`}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          {percentage}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${percentage}% (${completed} of ${total})`}
        style={{
          width: '100%',
          height: trackHeight,
          backgroundColor: 'var(--bg-muted, rgba(148, 163, 184, 0.15))',
          borderRadius: 'var(--radius-full, 9999px)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            height: '100%',
            backgroundColor: 'var(--primary-base, #3b82f6)',
            borderRadius: 'var(--radius-full, 9999px)',
            transition: 'width var(--duration-normal, 200ms) var(--ease-out, ease-out)'
          }}
        />
      </div>
    </div>
  );
}
