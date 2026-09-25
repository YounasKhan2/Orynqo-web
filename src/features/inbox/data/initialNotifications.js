import { NOTIFICATION_EVENT_TYPES } from '../model/eventTaxonomy';

/**
 * Realistic NotificationEvent Fixtures (UI-04B)
 *
 * Demonstrates:
 * - Focus vs Normal
 * - responseRequired vs awareness
 * - Unread / Read
 * - Later (snoozed)
 * - Archive
 * - Bundling candidate events (multiple comments and status updates)
 * - Diverse source entities: WorkItem, Document, Project, Access Request
 * - Redacted / Tombstone permission loss example
 */

export const INITIAL_NOTIFICATIONS = [
  // 1. Direct Mention on WorkItem (Focus + responseRequired)
  {
    id: 'notif-101',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-2', // Sarah Jenkins
    eventType: NOTIFICATION_EVENT_TYPES.MENTION,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-101', // ENG-1041
    threadId: 'thread-101',
    activityEventId: 'act-201',
    createdAt: '2026-09-24T18:45:00Z',
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    importance: 'focus',
    responseRequired: true,
    bundleKey: 'item-101-mention',
    dedupeKey: 'dedupe-mention-101',
    renderPayload: {
      identifier: 'ENG-1041',
      title: 'CRDT graph cycle detection on client mutation log',
      summary: 'mentioned you in a comment:',
      bodySnippet: '@Marcus Vance can you confirm whether Tarjan\'s algorithm handles detached subgraphs without recursion overflows?',
      status: 'in_progress',
      priority: 'high'
    }
  },

  // 2. Review Request on WorkItem (Focus + responseRequired)
  {
    id: 'notif-102',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-4', // Elena Rostova
    eventType: NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-102', // ENG-1042
    activityEventId: 'act-202',
    createdAt: '2026-09-24T18:15:00Z',
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    importance: 'focus',
    responseRequired: true,
    bundleKey: 'item-102-review',
    dedupeKey: 'dedupe-review-102',
    renderPayload: {
      identifier: 'ENG-1042',
      title: 'Replay clock skew tolerance for SAML auth assertion',
      summary: 'requested your code review on PR #892',
      bodySnippet: 'Fix SAML assertion replay clock skew tolerance check for clock drifting edge cases.',
      status: 'in_review',
      priority: 'urgent'
    }
  },

  // 3. Newly Blocked Dependency on Owned WorkItem (Focus + !responseRequired)
  {
    id: 'notif-103',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-3', // Alex Chen
    eventType: NOTIFICATION_EVENT_TYPES.DEPENDENCY_BLOCKED,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-104', // WEB-402
    activityEventId: 'act-203',
    createdAt: '2026-09-24T17:30:00Z',
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    importance: 'focus',
    responseRequired: false,
    bundleKey: 'item-104-blocked',
    dedupeKey: 'dedupe-blocked-104',
    renderPayload: {
      identifier: 'WEB-402',
      title: 'Virtual grid dynamic scroll container with row windowing',
      summary: 'work item blocked by dependency:',
      bodySnippet: 'Blocked by ENG-1041 (Cycle detection substrate). Allocation overhead benchmarks required.',
      status: 'todo',
      priority: 'high'
    }
  },

  // 4. Overdue Transition (Focus + !responseRequired)
  {
    id: 'notif-104',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: null, // System event
    eventType: NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-103', // CORE-201
    activityEventId: 'act-204',
    createdAt: '2026-09-24T16:00:00Z',
    readAt: '2026-09-24T17:00:00Z',
    archivedAt: null,
    snoozedUntil: null,
    importance: 'focus',
    responseRequired: false,
    bundleKey: 'item-103-overdue',
    dedupeKey: 'dedupe-overdue-103',
    renderPayload: {
      identifier: 'CORE-201',
      title: 'WAL Segment rotation file descriptor leak on Windows',
      summary: 'became overdue on target schedule',
      bodySnippet: 'Target completion was due yesterday at 18:00 UTC.',
      status: 'in_progress',
      priority: 'urgent'
    }
  },

  // 5. Bundleable Comment 1 on Document doc-1 (Normal + !responseRequired)
  {
    id: 'notif-105',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-3', // Alex Chen
    eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
    sourceEntityType: 'document',
    sourceEntityId: 'doc-1',
    threadId: 'thread-doc-1',
    activityEventId: 'act-205',
    createdAt: '2026-09-24T15:20:00Z',
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    importance: 'normal',
    responseRequired: false,
    bundleKey: 'doc-1-collab',
    dedupeKey: 'dedupe-comment-105',
    renderPayload: {
      title: 'PRD: Offline-First Synchronization & CRDT Substrate',
      summary: 'commented on section 2.4:',
      bodySnippet: 'Agreed on the 50ms latency ceiling for local persistence.',
      status: 'draft'
    }
  },

  // 6. Bundleable Comment 2 on Document doc-1 (Normal + !responseRequired)
  {
    id: 'notif-106',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-2', // Sarah Jenkins
    eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
    sourceEntityType: 'document',
    sourceEntityId: 'doc-1',
    threadId: 'thread-doc-1',
    activityEventId: 'act-206',
    createdAt: '2026-09-24T15:35:00Z',
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    importance: 'normal',
    responseRequired: false,
    bundleKey: 'doc-1-collab',
    dedupeKey: 'dedupe-comment-106',
    renderPayload: {
      title: 'PRD: Offline-First Synchronization & CRDT Substrate',
      summary: 'commented on section 2.4:',
      bodySnippet: 'Let\'s also mandate IndexedDB memory limits for low-RAM devices.',
      status: 'draft'
    }
  },

  // 7. WorkItem Property Change on followed item (Normal)
  {
    id: 'notif-107',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-3', // Alex Chen
    eventType: NOTIFICATION_EVENT_TYPES.STATUS_CHANGED,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-105', // WEB-403
    activityEventId: 'act-207',
    createdAt: '2026-09-24T14:10:00Z',
    readAt: '2026-09-24T15:00:00Z',
    archivedAt: null,
    snoozedUntil: null,
    importance: 'normal',
    responseRequired: false,
    bundleKey: 'item-105-changes',
    dedupeKey: 'dedupe-status-105',
    renderPayload: {
      identifier: 'WEB-403',
      title: 'Multi-column sorting and secondary key tie-breaking',
      summary: 'changed status from In Progress to In Review',
      bodySnippet: 'Ready for peer verification before merge.',
      status: 'in_review',
      priority: 'medium'
    }
  },

  // 8. Snoozed Item in "Later" (snoozedUntil is future)
  {
    id: 'notif-108',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-2',
    eventType: NOTIFICATION_EVENT_TYPES.ASSIGNED,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-110', // WEB-410
    activityEventId: 'act-208',
    createdAt: '2026-09-23T11:00:00Z',
    readAt: '2026-09-23T11:30:00Z',
    archivedAt: null,
    snoozedUntil: '2026-09-27T09:00:00Z', // Future date
    importance: 'focus',
    responseRequired: false,
    bundleKey: 'item-110-assigned',
    dedupeKey: 'dedupe-assigned-110',
    renderPayload: {
      identifier: 'WEB-410',
      title: 'Bi-directional document block embedding',
      summary: 'assigned you to work item',
      bodySnippet: 'You were added as co-contributor for the live spec engine.',
      status: 'todo',
      priority: 'high'
    }
  },

  // 9. Archived Historical Item
  {
    id: 'notif-109',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: 'usr-4',
    eventType: NOTIFICATION_EVENT_TYPES.REACTION_ADDED,
    sourceEntityType: 'work_item',
    sourceEntityId: 'item-101',
    activityEventId: 'act-209',
    createdAt: '2026-09-22T08:00:00Z',
    readAt: '2026-09-22T09:00:00Z',
    archivedAt: '2026-09-22T09:05:00Z', // Archived
    snoozedUntil: null,
    importance: 'normal',
    responseRequired: false,
    bundleKey: 'item-101-reaction',
    dedupeKey: 'dedupe-react-109',
    renderPayload: {
      identifier: 'ENG-1041',
      title: 'CRDT graph cycle detection on client mutation log',
      summary: 'reacted with 👍 to your benchmark comment',
      bodySnippet: 'Benchmark results: 4.2ms over 10,000 cyclic nodes.',
      status: 'in_progress',
      priority: 'high'
    }
  },

  // 10. Permission Revoked / Redacted Tombstone Example
  {
    id: 'notif-110',
    workspaceId: 'wks-core',
    recipientUserId: 'usr-1',
    actorUserId: null,
    eventType: NOTIFICATION_EVENT_TYPES.COMMENT_ADDED,
    sourceEntityType: 'project',
    sourceEntityId: 'proj-confidential-99',
    activityEventId: 'act-210',
    createdAt: '2026-09-24T12:00:00Z',
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    importance: 'normal',
    responseRequired: false,
    isRedacted: true, // Permission revoked!
    redactedReason: 'access_revoked',
    bundleKey: 'proj-99-redacted',
    dedupeKey: 'dedupe-proj-110',
    renderPayload: null // Must never expose confidential details
  }
];
