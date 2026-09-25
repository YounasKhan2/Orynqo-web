import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../App';
import { deriveMyWorkQuery } from '../features/my-work';
import {
  bucketMyWorkItems,
  getPrimaryAttentionReason,
  getTimeBucket
} from '../features/my-work/hooks/useMyWorkBuckets';

const now = new Date('2026-09-25T12:00:00');

const item = (overrides) => ({
  id: overrides.id,
  identifier: overrides.identifier || overrides.id,
  workspaceId: 'wks-core',
  title: overrides.title || overrides.id,
  status: 'todo',
  priority: 'medium',
  assigneeId: 'usr-1',
  creatorId: 'usr-2',
  subscriberIds: [],
  relations: [],
  parentId: null,
  dueDate: null,
  ...overrides
});

describe('UI-03B: My Work implementation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('queries assigned, created, and subscribed scopes independently with valid overlap', () => {
    const shared = item({
      id: 'shared',
      assigneeId: 'usr-1',
      creatorId: 'usr-1',
      subscriberIds: ['usr-1']
    });
    const createdOnly = item({ id: 'created', assigneeId: 'usr-2', creatorId: 'usr-1' });
    const otherWorkspace = item({ id: 'other-workspace', workspaceId: 'wks-other', creatorId: 'usr-1' });
    const items = [shared, createdOnly, otherWorkspace];

    expect(deriveMyWorkQuery({ items, currentUserId: 'usr-1', scope: 'assigned', now }).items.map((it) => it.id)).toEqual(['shared']);
    expect(new Set(deriveMyWorkQuery({ items, currentUserId: 'usr-1', scope: 'created', now }).items.map((it) => it.id))).toEqual(new Set(['created', 'shared']));
    expect(deriveMyWorkQuery({ items, currentUserId: 'usr-1', scope: 'subscribed', now }).items.map((it) => it.id)).toEqual(['shared']);
  });

  it('assigns overview items once using attention, progress, upcoming, unscheduled, and completed sections', () => {
    const items = [
      item({ id: 'blocked-overdue', dueDate: '2026-09-24', relations: [{ type: 'blocked_by', targetId: 'blocking' }] }),
      item({ id: 'started', status: 'in_progress', dueDate: '2026-09-30' }),
      item({ id: 'soon', dueDate: '2026-09-29' }),
      item({ id: 'unscheduled', dueDate: null, cycleId: null }),
      item({ id: 'done', status: 'done', completedAt: '2026-09-23T09:00:00Z' }),
      item({ id: 'blocking', assigneeId: 'usr-2', status: 'todo' })
    ];

    const buckets = bucketMyWorkItems({ items: items.filter((it) => it.assigneeId === 'usr-1'), allItems: items, now });
    expect(buckets.needsAttention.map((it) => it.id)).toEqual(['blocked-overdue']);
    expect(buckets.inProgress.map((it) => it.id)).toEqual(['started']);
    expect(buckets.upcoming.map((it) => it.id)).toEqual(['soon']);
    expect(buckets.unscheduled.map((it) => it.id)).toEqual(['unscheduled']);
    expect(buckets.recentlyCompleted.map((it) => it.id)).toEqual(['done']);

    const allBucketedIds = Object.values(buckets).flat().map((it) => it.id);
    expect(new Set(allBucketedIds).size).toBe(allBucketedIds.length);
  });

  it('uses deterministic attention reason precedence and local time buckets', () => {
    const blocker = item({ id: 'blocker', assigneeId: 'usr-2', status: 'todo' });
    const blockedOverdue = item({
      id: 'blocked-overdue',
      dueDate: '2026-09-24',
      isReviewRequested: true,
      relations: [{ type: 'blocked_by', targetId: 'blocker' }]
    });

    expect(getPrimaryAttentionReason(blockedOverdue, [blockedOverdue, blocker], now)).toBe('blocked');
    expect(getTimeBucket(item({ id: 'today', dueDate: '2026-09-25' }), now)).toBe('due_today');
    expect(getTimeBucket(item({ id: 'soon', dueDate: '2026-10-02' }), now)).toBe('due_soon');
    expect(getTimeBucket(item({ id: 'later', dueDate: '2026-10-10' }), now)).toBe('later');
  });

  it('renders My Work overview from the sidebar with tabs, summary, and projection switching only outside overview', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));

    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeDefined();
    expect(screen.getByText(/\d+ Active/i)).toBeDefined();
    expect(screen.queryByRole('radio', { name: /^Board$/i })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: /Assigned/i }));
    expect(screen.getByRole('grid')).toBeDefined();
    expect(screen.getByRole('radio', { name: /^Board$/i })).toBeDefined();
  }, 10000);

  it('opens Quick Create from My Work with current assignee and unresolved team', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));
    fireEvent.click(screen.getByRole('button', { name: /New Item/i }));

    const dialog = screen.getByRole('dialog', { name: /New Work Item/i });
    expect(within(dialog).getByRole('button', { name: /Change Team/i }).textContent).toContain('Select Team *');
    expect(within(dialog).getByRole('button', { name: /Change Assignee/i }).textContent).toContain('Marcus Vance');
  });

  it('preserves context when opening and closing Inspector from My Work overview', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));
    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();

    // Click on the first row in Overview
    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[0]);

    // Inspector should open
    expect(screen.getByRole('complementary', { name: /Detail panel/i })).toBeDefined();
    // Overview should still be active
    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();

    // Close Inspector
    const closeBtn = screen.getByRole('button', { name: /Close inspector/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('complementary', { name: /Detail panel/i })).toBeNull();
    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();
  });

  it('renders Board and Timeline projections from Assigned tab without forking mutation behavior', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));
    fireEvent.click(screen.getByRole('tab', { name: /Assigned/i }));

    // Switch to Board projection
    const boardRadio = screen.getByRole('radio', { name: /^Board$/i });
    fireEvent.click(boardRadio);
    expect(screen.getByText('In Progress')).toBeDefined();

    // Switch to Timeline projection
    const timelineRadio = screen.getByRole('radio', { name: /^Timeline$/i });
    fireEvent.click(timelineRadio);
    expect(screen.getByText('Sep 24')).toBeDefined();
  });

  it('renders filtered empty state with reset affordance', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));

    const searchInput = screen.getByPlaceholderText(/Filter items.../i);
    fireEvent.change(searchInput, { target: { value: 'non_existent_search_query_xyz' } });

    expect(screen.getByText(/No work matches the active filters/i)).toBeDefined();
    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    expect(resetBtn).toBeDefined();

    fireEvent.click(resetBtn);
    expect(screen.queryByText(/No work matches the active filters/i)).toBeNull();
  });
});
