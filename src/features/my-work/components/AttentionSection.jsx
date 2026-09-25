import React from 'react';
import { WorkBucketSection } from './WorkBucketSection';

const REASON_LABELS = {
  blocked: 'Blocked',
  overdue: 'Overdue',
  due_today: 'Due Today',
  review_requested: 'Review Requested'
};

export function AttentionSection(props) {
  const items = (props.items || []).map((item) => ({
    ...item,
    title: `${item.title} · ${(item.attentionReasons || []).map((reason) => REASON_LABELS[reason]).join(' · ')}`
  }));

  return (
    <WorkBucketSection
      {...props}
      items={items}
      title="Needs Attention"
      action={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-text)' }}>View all</span>}
    />
  );
}
