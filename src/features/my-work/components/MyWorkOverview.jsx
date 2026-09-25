import React from 'react';
import { AttentionSection } from './AttentionSection';
import { WorkBucketSection } from './WorkBucketSection';
import { RecentlyCompletedList } from './RecentlyCompletedList';
import { EmptyWorkState } from './EmptyWorkState';

export function MyWorkOverview({
  buckets,
  collapsedSections,
  onToggleSection,
  onOpenItem,
  onBrowseTeams,
  filtered,
  onResetFilters
}) {
  const total = Object.values(buckets).reduce((sum, list) => sum + list.length, 0);
  if (total === 0) {
    return <EmptyWorkState filtered={filtered} onResetFilters={onResetFilters} onBrowseTeams={onBrowseTeams} />;
  }

  return (
    <div
      role="region"
      aria-label="My Work Overview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <AttentionSection
        id="needs-attention"
        items={buckets.needsAttention}
        collapsed={collapsedSections.needsAttention}
        onToggle={() => onToggleSection('needsAttention')}
        onOpenItem={onOpenItem}
      />
      <WorkBucketSection id="in-progress" title="In Progress" items={buckets.inProgress} collapsed={collapsedSections.inProgress} onToggle={() => onToggleSection('inProgress')} onOpenItem={onOpenItem} />
      <WorkBucketSection id="upcoming" title="Upcoming" items={buckets.upcoming} collapsed={collapsedSections.upcoming} onToggle={() => onToggleSection('upcoming')} onOpenItem={onOpenItem} />
      <WorkBucketSection id="unscheduled" title="Unscheduled" items={buckets.unscheduled} collapsed={collapsedSections.unscheduled} onToggle={() => onToggleSection('unscheduled')} onOpenItem={onOpenItem} />
      <RecentlyCompletedList id="recently-completed" items={buckets.recentlyCompleted} collapsed={collapsedSections.recentlyCompleted} onToggle={() => onToggleSection('recentlyCompleted')} onOpenItem={onOpenItem} />
    </div>
  );
}
