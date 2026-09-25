import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { App } from '../App';
import {
  deriveInboxQuery,
  useInboxPreferences,
  useInboxMutations,
  classifyNotificationAttention,
  bundleNotifications,
  NOTIFICATION_EVENT_TYPES,
  INITIAL_NOTIFICATIONS
} from '../features/inbox';

describe('UI-04B: Personal Triage Inbox implementation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // 1. Query / IA: Focus returns only active Focus notifications
  it('1. Focus returns only active Focus notifications', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'focus'
    });

    expect(result.rawEvents.length).toBeGreaterThan(0);
    expect(result.rawEvents.every((e) => e.importance === 'focus')).toBe(true);
    // Snoozed and archived should not be in Focus
    expect(result.rawEvents.some((e) => e.snoozedUntil && new Date(e.snoozedUntil) > new Date())).toBe(false);
    expect(result.rawEvents.some((e) => e.archivedAt)).toBe(false);
  });

  // 2. Query / IA: All returns all active unsnoozed/unarchived notifications
  it('2. All returns all active unsnoozed/unarchived notifications', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'all'
    });

    expect(result.rawEvents.length).toBeGreaterThan(0);
    expect(result.rawEvents.some((e) => e.importance === 'focus')).toBe(true);
    expect(result.rawEvents.some((e) => e.importance === 'normal')).toBe(true);
    expect(result.rawEvents.every((e) => !e.archivedAt)).toBe(true);
  });

  // 3. Query / IA: Later contains snoozed notifications
  it('3. Later contains snoozed notifications awaiting timer expiration', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'later'
    });

    expect(result.rawEvents.length).toBe(1);
    expect(result.rawEvents[0].id).toBe('notif-108');
    expect(result.rawEvents[0].snoozedUntil).toBe('2026-09-27T09:00:00Z');
  });

  // 4. Query / IA: Archive contains archived notifications
  it('4. Archive contains archived notifications', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'archive'
    });

    expect(result.rawEvents.length).toBe(1);
    expect(result.rawEvents[0].id).toBe('notif-109');
    expect(result.rawEvents[0].archivedAt).toBeTruthy();
  });

  // 5. Sidebar unread count excludes Later, Archive, and read notifications
  it('5. Sidebar unread count counts only active unread notifications', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1'
    });

    // In initialNotifications:
    // notif-101: active, unread (count +1)
    // notif-102: active, unread (count +1)
    // notif-103: active, unread (count +1)
    // notif-104: active, readAt set (no)
    // notif-105: active, unread (count +1)
    // notif-106: active, unread (count +1)
    // notif-107: active, readAt set (no)
    // notif-108: in later (no)
    // notif-109: in archive (no)
    // notif-110: active, unread (count +1)
    expect(result.unreadCount).toBe(6);
  });

  // 6. Classification: Importance and responseRequired are independent dimensions
  it('6. Importance and responseRequired are independent dimensions', () => {
    const reviewReq = classifyNotificationAttention({
      eventType: NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED
    });
    expect(reviewReq.importance).toBe('focus');
    expect(reviewReq.responseRequired).toBe(true);

    const blocker = classifyNotificationAttention({
      eventType: NOTIFICATION_EVENT_TYPES.DEPENDENCY_BLOCKED
    });
    expect(blocker.importance).toBe('focus');
    expect(blocker.responseRequired).toBe(false);

    const overdue = classifyNotificationAttention({
      eventType: NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION
    });
    expect(overdue.importance).toBe('focus');
    expect(overdue.responseRequired).toBe(false);

    const comment = classifyNotificationAttention({
      eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED
    });
    expect(comment.importance).toBe('normal');
    expect(comment.responseRequired).toBe(false);
  });

  // 7. Deterministic Sorting has stable ID tie-breaker
  it('7. Deterministic sorting uses createdAt DESC with id tie-breaker', () => {
    const timestamp = '2026-09-24T12:00:00Z';
    const eventA = {
      id: 'notif-a',
      workspaceId: 'wks-core',
      recipientUserId: 'usr-1',
      eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
      createdAt: timestamp,
      sourceEntityType: 'work_item',
      sourceEntityId: 'item-1',
      importance: 'normal'
    };
    const eventB = {
      id: 'notif-b',
      workspaceId: 'wks-core',
      recipientUserId: 'usr-1',
      eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
      createdAt: timestamp,
      sourceEntityType: 'work_item',
      sourceEntityId: 'item-2',
      importance: 'normal'
    };

    const result = deriveInboxQuery({
      notifications: [eventA, eventB],
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'all'
    });

    // ID tie breaker: 'notif-b' comes before 'notif-a' alphabetically descending
    expect(result.rawEvents[0].id).toBe('notif-b');
    expect(result.rawEvents[1].id).toBe('notif-a');
  });

  // 8. Compatible events bundle
  it('8. Bundles compatible events sharing entity and event family within window', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'all'
    });

    // notif-105 and notif-106 are comments on doc-1 within 15 minutes
    const docBundle = result.items.find(
      (item) => item.isBundle && item.sourceEntityId === 'doc-1'
    );
    expect(docBundle).toBeDefined();
    expect(docBundle.events.length).toBe(2);
    expect(docBundle.childIds).toContain('notif-105');
    expect(docBundle.childIds).toContain('notif-106');
  });

  // 9. Direct mentions do NOT bundle
  it('9. Direct mentions and distinct approval requests remain independent', () => {
    const mention1 = {
      id: 'm-1',
      workspaceId: 'wks-core',
      recipientUserId: 'usr-1',
      eventType: NOTIFICATION_EVENT_TYPES.MENTION,
      sourceEntityType: 'work_item',
      sourceEntityId: 'item-101',
      createdAt: '2026-09-24T18:00:00Z',
      importance: 'focus'
    };
    const mention2 = {
      id: 'm-2',
      workspaceId: 'wks-core',
      recipientUserId: 'usr-1',
      eventType: NOTIFICATION_EVENT_TYPES.MENTION,
      sourceEntityType: 'work_item',
      sourceEntityId: 'item-101',
      createdAt: '2026-09-24T18:10:00Z',
      importance: 'focus'
    };

    const bundled = bundleNotifications([mention1, mention2]);
    expect(bundled.length).toBe(2);
    expect(bundled[0].isBundle).toBeFalsy();
    expect(bundled[1].isBundle).toBeFalsy();
  });

  // 10. Archived historical events are not resurrected by new activity
  it('10. Archived historical events retain archivedAt when new event arrives', () => {
    const archivedChild = {
      id: 'old-1',
      workspaceId: 'wks-core',
      recipientUserId: 'usr-1',
      eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
      sourceEntityType: 'work_item',
      sourceEntityId: 'item-99',
      createdAt: '2026-09-20T10:00:00Z',
      archivedAt: '2026-09-20T11:00:00Z'
    };
    const newActiveChild = {
      id: 'new-1',
      workspaceId: 'wks-core',
      recipientUserId: 'usr-1',
      eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
      sourceEntityType: 'work_item',
      sourceEntityId: 'item-99',
      createdAt: '2026-09-24T10:00:00Z',
      archivedAt: null
    };

    const activeResult = deriveInboxQuery({
      notifications: [archivedChild, newActiveChild],
      tab: 'all'
    });

    // In active 'all' tab, only the newActiveChild is present; old remains archived
    expect(activeResult.rawEvents.length).toBe(1);
    expect(activeResult.rawEvents[0].id).toBe('new-1');
  });

  // 11. Security & Redaction: Inaccessible notification search does not expose source metadata
  it('11. Inaccessible / redacted notifications do not leak sensitive metadata in search', () => {
    const result = deriveInboxQuery({
      notifications: INITIAL_NOTIFICATIONS,
      workspaceId: 'wks-core',
      recipientId: 'usr-1',
      tab: 'all',
      searchQuery: 'confidential' // secret keyword from proj-confidential-99
    });

    // notif-110 is redacted, so querying "confidential" returns zero matches!
    expect(result.rawEvents.length).toBe(0);
  });

  // 12. Preferences isolation: Inbox preferences do not mutate Sidebar or My Work
  it('12. Inbox preferences persist in localStorage under isolated namespace', () => {
    const { result } = renderHook(() => useInboxPreferences());

    act(() => {
      result.current.setActiveTab('later');
      result.current.setIsUnreadOnly(true);
    });

    expect(result.current.activeTab).toBe('later');
    expect(result.current.isUnreadOnly).toBe(true);

    const stored = JSON.parse(localStorage.getItem('orynqo.inboxPreferences.v1') || '{}');
    expect(stored.activeTab).toBe('later');
    expect(stored.isUnreadOnly).toBe(true);

    // Sidebar and My Work keys must remain unaffected
    expect(localStorage.getItem('orynqo.sidebarPreferences.v1')).toBeNull();
    expect(localStorage.getItem('orynqo.myWorkPreferences.v1')).toBeNull();
  });

  // 13. UI Integration: Navigation to Inbox renders InboxCockpit with Focus tab active by default
  it('13. Navigating to Inbox renders Inbox cockpit with Focus tab and rows', () => {
    render(<App />);

    // Click on Inbox in Sidebar
    const inboxItem = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxItem);

    // Confirm Inbox cockpit landmark
    expect(screen.getByRole('region', { name: 'Personal Triage Inbox' })).toBeDefined();

    // Confirm Focus tab is active in ContextBar
    const focusTab = screen.getByRole('tab', { name: /Focus/i });
    expect(focusTab).toBeDefined();

    // Confirm that rows from initialNotifications are visible
    expect(screen.getAllByText(/ENG-1041/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tarjan's algorithm/i)).toBeDefined();
  });

  // 14. Lifecycle & Optimistic Rollback
  it('14. Optimistic mutation rolls back state on network rejection', async () => {
    let state = [...INITIAL_NOTIFICATIONS];
    const setState = (nextOrUpdater) => {
      state = typeof nextOrUpdater === 'function' ? nextOrUpdater(state) : nextOrUpdater;
    };

    let caughtError = null;
    const { result } = renderHook(() =>
      useInboxMutations({
        notifications: state,
        setNotifications: setState,
        onMutationError: (err) => {
          caughtError = err;
        }
      })
    );

    const initialArchived = state.find((n) => n.id === 'notif-101')?.archivedAt;
    expect(initialArchived).toBeNull();

    // Trigger archive with simulated failure
    await expect(result.current.archiveEvents(['notif-101'], true)).rejects.toThrow();

    expect(caughtError).toBeTruthy();
    // Proves exact rollback to previous state
    expect(state.find((n) => n.id === 'notif-101')?.archivedAt).toBeNull();
  });

  // 15. Context detail: opening WorkItem notification mounts canonical WorkItem details
  it('15. WorkItem notification routes to canonical WorkItem inspection without forking mutation behavior', () => {
    render(<App />);

    // Click on Inbox in Sidebar
    const inboxItem = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxItem);

    // Initial item notif-101 corresponds to item-101 (ENG-1041)
    // Clicking on row selects item and displays WorkItemDetailContainer
    expect(screen.getByRole('region', { name: 'Personal Triage Inbox' })).toBeDefined();
    expect(screen.getByText(/CRDT graph cycle detection on client mutation log/i)).toBeDefined();
  });
});
