import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../App';
import { deriveMyWorkQuery, useMyWorkPreferences } from '../features/my-work';
import {
  bucketMyWorkItems,
  getPrimaryAttentionReason,
  getTimeBucket
} from '../features/my-work/hooks/useMyWorkBuckets';
import {
  classifyDueDate,
  getCalendarDateString,
  addCalendarDays,
  getDueDateGroup
} from '../constants/dateUtils';
import { renderHook, act } from '@testing-library/react';
import { useSidebarPreferences } from '../hooks/useSidebarPreferences';

const now = new Date('2026-09-25T12:00:00Z');

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

  // 1. Scopes & Overlap
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

  // 2. Bucketing Waterfall
  it('assigns overview items once using attention, progress, upcoming, unscheduled, and completed sections', () => {
    const items = [
      item({ id: 'blocked-overdue', dueDate: '2026-09-24', relations: [{ type: 'blocked_by', targetId: 'blocking' }] }),
      item({ id: 'started', status: 'in_progress', dueDate: '2026-09-30' }),
      item({ id: 'soon', dueDate: '2026-09-29' }),
      item({ id: 'unscheduled', dueDate: null, cycleId: null }),
      item({ id: 'done', status: 'done', completedAt: '2026-09-23T09:00:00Z' }),
      item({ id: 'blocking', assigneeId: 'usr-2', status: 'todo' })
    ];

    const buckets = bucketMyWorkItems({ items: items.filter((it) => it.assigneeId === 'usr-1'), allItems: items, now, userTimezone: 'UTC' });
    expect(buckets.needsAttention.map((it) => it.id)).toEqual(['blocked-overdue']);
    expect(buckets.inProgress.map((it) => it.id)).toEqual(['started']);
    expect(buckets.upcoming.map((it) => it.id)).toEqual(['soon']);
    expect(buckets.unscheduled.map((it) => it.id)).toEqual(['unscheduled']);
    expect(buckets.recentlyCompleted.map((it) => it.id)).toEqual(['done']);

    const allBucketedIds = Object.values(buckets).flat().map((it) => it.id);
    expect(new Set(allBucketedIds).size).toBe(allBucketedIds.length);
  });

  // 3. Attention Reason Precedence
  it('uses deterministic attention reason precedence: Blocked > Overdue > Due Today > Review Requested', () => {
    const blocker = item({ id: 'blocker', assigneeId: 'usr-2', status: 'todo' });
    const blockedOverdue = item({
      id: 'blocked-overdue',
      dueDate: '2026-09-24',
      isReviewRequested: true,
      relations: [{ type: 'blocked_by', targetId: 'blocker' }]
    });

    expect(getPrimaryAttentionReason(blockedOverdue, [blockedOverdue, blocker], now, 'UTC')).toBe('blocked');
    expect(getTimeBucket(item({ id: 'today', dueDate: '2026-09-25' }), now, 7, 'UTC')).toBe('due_today');
    expect(getTimeBucket(item({ id: 'soon', dueDate: '2026-10-02' }), now, 7, 'UTC')).toBe('due_soon');
    expect(getTimeBucket(item({ id: 'later', dueDate: '2026-10-10' }), now, 7, 'UTC')).toBe('later');
  });

  // 4. Deterministic Default Sort
  it('evaluates deterministic default sort across urgency rank, priority, due date, and stable ID tie-breaker', () => {
    const blocker = item({ id: 'blocker-item', assigneeId: 'usr-2', status: 'todo' });
    const items = [
      item({ id: 'unscheduled-high', title: 'Unscheduled High', priority: 'high', dueDate: null }),
      item({ id: 'blocked-urgent', title: 'Blocked Urgent', priority: 'urgent', relations: [{ type: 'blocked_by', targetId: 'blocker-item' }] }),
      item({ id: 'overdue-med', title: 'Overdue Med', priority: 'medium', dueDate: '2026-09-20' }),
      item({ id: 'due-today-low-b', identifier: 'B-100', title: 'Due Today Low B', priority: 'low', dueDate: '2026-09-25' }),
      item({ id: 'due-today-low-a', identifier: 'A-100', title: 'Due Today Low A', priority: 'low', dueDate: '2026-09-25' }),
      item({ id: 'due-today-high', title: 'Due Today High', priority: 'high', dueDate: '2026-09-25' }),
      item({ id: 'in-progress-med', title: 'In Progress Med', status: 'in_progress', priority: 'medium', dueDate: '2026-09-30' }),
      item({ id: 'future-urgent', title: 'Future Urgent', priority: 'urgent', dueDate: '2026-10-05' }),
      item({ id: 'future-med-sooner', title: 'Future Med Sooner', priority: 'medium', dueDate: '2026-10-01' }),
      item({ id: 'future-med-later', title: 'Future Med Later', priority: 'medium', dueDate: '2026-10-04' }),
      blocker
    ];

    const result = deriveMyWorkQuery({
      items,
      currentUserId: 'usr-1',
      scope: 'assigned',
      now,
      userTimezone: 'UTC'
    });

    const ids = result.items.map((it) => it.id);

    // Expected order:
    // 1. Blocked (urgency 400): blocked-urgent
    // 2. Overdue (urgency 300): overdue-med
    // 3. Due Today (urgency 200), sub-ordered by Priority (high > low), then ID:
    //    due-today-high, due-today-low-a, due-today-low-b
    // 4. In Progress (urgency 100): in-progress-med
    // 5. Normal active (urgency 0), sub-ordered by Priority (urgent > high > medium), then due date:
    //    future-urgent (priority 4)
    //    unscheduled-high (priority 3, no due date)
    //    future-med-sooner (priority 2, 2026-10-01)
    //    future-med-later (priority 2, 2026-10-04)
    expect(ids).toEqual([
      'blocked-urgent',
      'overdue-med',
      'due-today-high',
      'due-today-low-a',
      'due-today-low-b',
      'in-progress-med',
      'future-urgent',
      'unscheduled-high',
      'future-med-sooner',
      'future-med-later'
    ]);
  });

  // 5. Timezone boundary & DST-safety
  it('correctly classifies due dates across user timezones and DST boundaries without fixed 24h assumptions', () => {
    // A single UTC instant: 2026-09-25T02:00:00Z
    // In Tokyo (UTC+9): 2026-09-25 11:00 AM (calendar date 2026-09-25)
    // In New York (UTC-4): 2026-09-24 10:00 PM (calendar date 2026-09-24)
    const instant = '2026-09-25T02:00:00Z';
    const evalNow = new Date('2026-09-25T12:00:00Z'); // Today is Sep 25 in both for now

    const tokyoClass = classifyDueDate(instant, { now: evalNow, timeZone: 'Asia/Tokyo' });
    const nyClass = classifyDueDate(instant, { now: evalNow, timeZone: 'America/New_York' });

    expect(tokyoClass).toBe('due_today');
    expect(nyClass).toBe('overdue');

    // Calendar string extraction verifies cross-timezone date boundary
    expect(getCalendarDateString(instant, 'Asia/Tokyo')).toBe('2026-09-25');
    expect(getCalendarDateString(instant, 'America/New_York')).toBe('2026-09-24');

    // DST transition in America/New_York (Nov 1, 2026 clock fall back 1 hour, day has 25 hours)
    // addCalendarDays must not drift or corrupt the day count
    expect(addCalendarDays('2026-11-01', 7)).toBe('2026-11-08');
    expect(addCalendarDays('2026-11-01', -7)).toBe('2026-10-25');
  });

  // 6. DataGrid Due-Date Grouping Reconciled
  it('reconciles DataGrid due-date grouping with domain-neutral dateUtils classification', () => {
    const evalNow = new Date('2026-09-25T12:00:00Z');
    expect(getDueDateGroup('2026-09-20', { now: evalNow, timeZone: 'UTC' })).toEqual({ id: 'overdue', label: 'Overdue' });
    expect(getDueDateGroup('2026-09-25', { now: evalNow, timeZone: 'UTC' })).toEqual({ id: 'due_today', label: 'Due Today' });
    expect(getDueDateGroup('2026-09-29', { now: evalNow, timeZone: 'UTC' })).toEqual({ id: 'this_week', label: 'This Week' });
    expect(getDueDateGroup('2026-10-15', { now: evalNow, timeZone: 'UTC' })).toEqual({ id: 'later', label: 'Later' });
    expect(getDueDateGroup(null, { now: evalNow, timeZone: 'UTC' })).toEqual({ id: 'no_due_date', label: 'No Due Date' });
  });

  // 7. Scoped Preferences Isolation
  it('persists My Work preferences independently and does not modify Sidebar preferences', () => {
    const { result: myWorkHook } = renderHook(() => useMyWorkPreferences());
    const { result: sidebarHook } = renderHook(() => useSidebarPreferences());

    // Initially default
    expect(myWorkHook.current.activeTab).toBe('overview');
    expect(myWorkHook.current.getProjection('assigned')).toBe('data-grid');

    act(() => {
      myWorkHook.current.setActiveTab('assigned');
      myWorkHook.current.setProjection('assigned', 'kanban');
      myWorkHook.current.setProjection('created', 'timeline');
      myWorkHook.current.toggleSection('inProgress');
    });

    expect(myWorkHook.current.activeTab).toBe('assigned');
    expect(myWorkHook.current.getProjection('assigned')).toBe('kanban');
    expect(myWorkHook.current.getProjection('created')).toBe('timeline');
    expect(myWorkHook.current.collapsedSections.inProgress).toBe(true);

    // Verify localStorage key is isolated
    const myWorkStored = JSON.parse(localStorage.getItem('orynqo.myWorkPreferences.v1') || '{}');
    expect(myWorkStored.activeTab).toBe('assigned');
    expect(myWorkStored.projections.assigned).toBe('kanban');
    expect(myWorkStored.projections.created).toBe('timeline');

    // Sidebar preferences remain unaffected
    const sidebarStored = JSON.parse(localStorage.getItem('orynqo.sidebarPreferences.v1') || '{}');
    expect(sidebarStored.activeTab).toBeUndefined();
    expect(sidebarHook.current.isSidebarCollapsed).toBe(false);
  });

  // 8. Canonical Mutation Observable in Inspector and Other Projections
  it('demonstrates that a canonical mutation in My Work updates shared state across projections and open Inspector', async () => {
    const { container } = render(<App />);

    // Navigate to My Work -> Assigned
    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));
    fireEvent.click(screen.getByRole('tab', { name: /Assigned/i }));

    // Find first content row in DataGrid (which has data-item-id)
    const contentRow = container.querySelector('[data-item-id]');
    expect(contentRow).not.toBeNull();
    const itemId = contentRow.getAttribute('data-item-id');

    // Open Inspector by double-clicking the content row
    fireEvent.doubleClick(contentRow);

    // Inspector is open
    const inspector = screen.getByRole('complementary', { name: /Detail panel/i });
    expect(inspector).toBeDefined();

    // Trigger priority change via DataGrid cell dropdown
    const priorityButton = within(contentRow).getByRole('button', { name: /Change priority/i });
    fireEvent.click(priorityButton);

    const urgentOption = screen.getByRole('option', { name: /Urgent/i });
    fireEvent.click(urgentOption);

    // Both the Grid row and the open Inspector reflect the canonical update
    expect(within(contentRow).getByRole('button', { name: /Change priority/i }).textContent).toContain('Urgent');
    expect(within(inspector).getByRole('button', { name: /Change priority/i }).textContent).toContain('Urgent');
  }, 10000);

  // 9. Navigation, tabs, summary, and projection switching outside overview
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

  // 10. Quick Create assignee and unresolved team
  it('opens Quick Create from My Work with current assignee and unresolved team', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));
    fireEvent.click(screen.getByRole('button', { name: /New Item/i }));

    const dialog = screen.getByRole('dialog', { name: /New Work Item/i });
    expect(within(dialog).getByRole('button', { name: /Change Team/i }).textContent).toContain('Select Team *');
    expect(within(dialog).getByRole('button', { name: /Change Assignee/i }).textContent).toContain('Marcus Vance');
  });

  // 11. Context preservation on Inspector open/close
  it('preserves context when opening and closing Inspector from My Work overview', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /My Work/i }));
    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();

    // Click on the first row in Overview
    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[0]);

    // Inspector should open
    expect(screen.getByRole('complementary', { name: /Detail panel/i })).toBeDefined();
    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();

    // Close Inspector
    const closeBtn = screen.getByRole('button', { name: /Close inspector/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('complementary', { name: /Detail panel/i })).toBeNull();
    expect(screen.getByRole('region', { name: /My Work Overview/i })).toBeDefined();
  });

  // 12. Board and Timeline projections reuse
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

  // 13. Filtered empty state with reset
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
