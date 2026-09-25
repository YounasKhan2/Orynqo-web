import React from 'react';

export function MyWorkSummaryStrip({ metrics }) {
  const chips = [
    [`${metrics.totalActive} Active`, 'var(--text-secondary)'],
    [`${metrics.overdueCount} Overdue`, 'var(--priority-urgent)'],
    [`${metrics.dueTodayCount} Due Today`, 'var(--priority-high)'],
    [`${metrics.blockedCount} Blocked`, 'var(--priority-medium)']
  ];

  return (
    <div aria-label="My Work summary" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '28px' }}>
      {chips.map(([label, color]) => (
        <span key={label} className="font-mono" style={{ fontSize: 'var(--text-2xs)', color }}>
          {label}
        </span>
      ))}
    </div>
  );
}
