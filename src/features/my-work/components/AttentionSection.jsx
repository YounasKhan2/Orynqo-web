import React from 'react';
import { WorkBucketSection } from './WorkBucketSection';

const REASON_LABELS = {
  blocked: 'Blocked',
  overdue: 'Overdue',
  due_today: 'Due Today',
  review_requested: 'Review Requested'
};

export function AttentionSection(props) {
  return (
    <WorkBucketSection
      {...props}
      title="Needs Attention"
      action={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-text)' }}>View all</span>}
      renderReasons={(item) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
          {(item.attentionReasons || []).map((reason) => (
            <span
              key={reason}
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 'var(--font-medium)',
                backgroundColor:
                  reason === 'blocked'
                    ? 'var(--priority-urgent-bg, #fee2e2)'
                    : reason === 'overdue'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : reason === 'due_today'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'var(--bg-surface-raised)',
                color:
                  reason === 'blocked'
                    ? 'var(--priority-urgent, #ef4444)'
                    : reason === 'overdue'
                    ? '#dc2626'
                    : reason === 'due_today'
                    ? '#d97706'
                    : 'var(--text-secondary)'
              }}
            >
              {REASON_LABELS[reason] || reason}
            </span>
          ))}
        </span>
      )}
    />
  );
}
