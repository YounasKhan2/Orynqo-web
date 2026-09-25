// Realistic Enterprise Dataset for Orynqo Platform

export const CURRENT_USER = {
  id: 'usr-1',
  name: 'Marcus Vance',
  email: 'marcus@orynqo.internal',
  role: 'Staff Systems Engineer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  teamId: 'team-core',
  initials: 'MV'
};

export const USERS = [
  CURRENT_USER,
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@orynqo.internal',
    role: 'Principal Product Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    teamId: 'team-core',
    initials: 'SJ'
  },
  {
    id: 'usr-3',
    name: 'Alex Chen',
    email: 'alex.c@orynqo.internal',
    role: 'Engineering Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    teamId: 'team-core',
    initials: 'AC'
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.r@orynqo.internal',
    role: 'Senior Distributed Systems Eng',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    teamId: 'team-core',
    initials: 'ER'
  },
  {
    id: 'usr-5',
    name: 'David Kim',
    email: 'david.k@orynqo.internal',
    role: 'Lead Product Designer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    teamId: 'team-web',
    initials: 'DK'
  },
  {
    id: 'usr-6',
    name: 'Priya Patel',
    email: 'priya.p@orynqo.internal',
    role: 'Technical Program Manager',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
    teamId: 'team-core',
    initials: 'PP'
  }
];

export const TEAMS = [
  {
    id: 'team-core',
    name: 'Core Platform',
    key: 'ENG',
    icon: 'Layers',
    description: 'Distributed synchronization engine, replication protocols, and storage primitives.'
  },
  {
    id: 'team-mobile',
    name: 'Mobile Client',
    key: 'MOB',
    icon: 'Smartphone',
    description: 'Native iOS & Android offline client runtimes and background delta sync.'
  },
  {
    id: 'team-web',
    name: 'Web Studio',
    key: 'WEB',
    icon: 'Globe',
    description: 'High-density web application shell, Canvas projection, and keyboard engine.'
  }
];

export const INITIATIVES = [
  {
    id: 'init-1',
    title: 'Zero-Latency Data Substrate',
    status: 'in_progress',
    targetDate: '2026-11-30',
    progress: 68,
    leadId: 'usr-3',
    description: 'Migrate active state cache to optimistic local memory model with sub-50ms sync latency.'
  },
  {
    id: 'init-2',
    title: 'SOC2 Type II & Enterprise Security',
    status: 'in_progress',
    targetDate: '2026-12-15',
    progress: 82,
    leadId: 'usr-6',
    description: 'Immutable audit logs, granular RBAC inheritance, and SCIM 2.0 automated provisioning.'
  },
  {
    id: 'init-3',
    title: 'Offline-First Workspace Engine',
    status: 'planned',
    targetDate: '2027-02-28',
    progress: 35,
    leadId: 'usr-2',
    description: 'Full IndexedDB local replication and conflict-free replicated data types (CRDT).'
  }
];

export const PROJECTS = [
  {
    id: 'proj-1',
    name: 'Auth API V2 & SCIM Engine',
    key: 'ENG-AUTH',
    teamId: 'team-core',
    initiativeId: 'init-2',
    leadId: 'usr-4',
    status: 'in_progress',
    targetDate: '2026-10-15',
    progress: 74,
    health: 'on_track'
  },
  {
    id: 'proj-2',
    name: 'Local Cache & CRDT State Layer',
    key: 'ENG-CRDT',
    teamId: 'team-core',
    initiativeId: 'init-1',
    leadId: 'usr-1',
    status: 'in_progress',
    targetDate: '2026-10-31',
    progress: 58,
    health: 'at_risk'
  },
  {
    id: 'proj-3',
    name: 'High-Density Virtualized Data Grid',
    key: 'WEB-GRID',
    teamId: 'team-web',
    initiativeId: 'init-1',
    leadId: 'usr-5',
    status: 'in_progress',
    targetDate: '2026-10-20',
    progress: 88,
    health: 'on_track'
  },
  {
    id: 'proj-4',
    name: 'Mobile SQLite Storage Engine',
    key: 'MOB-STORE',
    teamId: 'team-mobile',
    initiativeId: 'init-3',
    leadId: 'usr-3',
    status: 'planned',
    targetDate: '2026-11-20',
    progress: 20,
    health: 'on_track'
  },
  {
    id: 'proj-5',
    name: 'Universal Workspace Sync & Pickers',
    key: 'WKS-SYNC',
    teamIds: ['team-core', 'team-web', 'team-mobile'],
    initiativeId: 'init-1',
    leadId: 'usr-1',
    status: 'in_progress',
    targetDate: '2026-12-01',
    progress: 30,
    health: 'on_track'
  }
];

export const CYCLES = [
  {
    id: 'cycle-41',
    number: 41,
    name: 'Cycle 41',
    teamId: 'team-core',
    startDate: '2026-08-28',
    endDate: '2026-09-11',
    status: 'completed',
    completedPoints: 46,
    totalPoints: 48
  },
  {
    id: 'cycle-42',
    number: 42,
    name: 'Cycle 42 (Active)',
    teamId: 'team-core',
    startDate: '2026-09-12',
    endDate: '2026-09-26',
    status: 'active',
    completedPoints: 28,
    totalPoints: 44,
    daysRemaining: 2
  },
  {
    id: 'cycle-43',
    number: 43,
    name: 'Cycle 43',
    teamId: 'team-core',
    startDate: '2026-09-27',
    endDate: '2026-10-11',
    status: 'upcoming',
    completedPoints: 0,
    totalPoints: 38
  }
];

export const INITIAL_WORK_ITEMS = [
  {
    id: 'item-101',
    identifier: 'ENG-1041',
    workspaceId: 'wks-core',
    title: 'Implement Tarjan cycle detection algorithm on dependency graph updates',
    type: 'task',
    status: 'in_progress',
    priority: 'urgent',
    estimate: 5,
    assigneeId: 'usr-1',
    teamId: 'team-core',
    projectId: 'proj-2',
    cycleId: 'cycle-42',
    dueDate: '2026-09-25',
    parentId: null,
    labels: ['algorithms', 'backend', 'core-sync'],
    description: 'When users declare `A blocks B`, we must detect transitive loops (A -> B -> C -> A) in O(V + E) time before committing the relation to the normalized state cache.',
    relations: [
      { type: 'blocks', targetKey: 'ENG-1044', targetTitle: 'Persistent IndexedDB storage engine with delta log compression' }
    ],
    documentLinks: [
      { documentId: 'doc-1', type: 'source_spec', title: 'PRD: Offline-First Synchronization & CRDT Substrate' }
    ],
    createdAt: '2026-09-14T09:30:00Z',
    commentsCount: 4
  },
  {
    id: 'item-102',
    identifier: 'ENG-1042',
    workspaceId: 'wks-core',
    title: 'Audit SAML 2.0 assertion signature replay verification',
    type: 'bug',
    status: 'in_review',
    priority: 'urgent',
    estimate: 3,
    assigneeId: 'usr-4',
    teamId: 'team-core',
    projectId: 'proj-1',
    cycleId: 'cycle-42',
    dueDate: '2026-09-26',
    parentId: null,
    labels: ['security', 'auth', 'soc2'],
    description: 'Strict verification of InResponseTo attributes in SAML assertions. Ensure clock-skew tolerance is capped at 120 seconds.',
    relations: [
      { type: 'relates_to', isRestricted: true }
    ],
    documentLinks: [],
    createdAt: '2026-09-15T11:20:00Z',
    commentsCount: 6
  },
  {
    id: 'item-103',
    identifier: 'WEB-402',
    workspaceId: 'wks-core',
    title: 'Build 28px compact row data grid with virtualized DOM buffer',
    type: 'issue',
    status: 'in_progress',
    priority: 'high',
    estimate: 8,
    assigneeId: 'usr-5',
    teamId: 'team-web',
    projectId: 'proj-3',
    cycleId: 'cycle-42',
    dueDate: '2026-09-28',
    parentId: null,
    labels: ['ui', 'data-grid', 'performance'],
    description: 'Ensure 10,000 work items can be scrolled at 60 FPS without memory leaks. Keep total rendered DOM nodes between 150 and 200.',
    relations: [],
    documentLinks: [
      { documentId: 'doc-1', type: 'source_spec', title: 'PRD: Offline-First Synchronization & CRDT Substrate' }
    ],
    createdAt: '2026-09-13T14:15:00Z',
    commentsCount: 9
  },
  {
    id: 'item-104',
    identifier: 'ENG-1044',
    workspaceId: 'wks-core',
    title: 'Persistent IndexedDB storage engine with delta log compression',
    type: 'task',
    status: 'todo',
    priority: 'high',
    estimate: 8,
    assigneeId: 'usr-1',
    teamId: 'team-core',
    projectId: 'proj-2',
    cycleId: 'cycle-42',
    dueDate: '2026-10-02',
    parentId: null,
    labels: ['offline', 'storage', 'crdt'],
    description: 'Store client state operations in an IndexedDB write-ahead log. Compress snapshot states every 1,000 transactions.',
    relations: [
      { type: 'blocked_by', targetKey: 'ENG-1041', targetTitle: 'Implement Tarjan cycle detection algorithm' }
    ],
    documentLinks: [
      { documentId: 'doc-1', type: 'source_spec', title: 'PRD: Offline-First Synchronization & CRDT Substrate' }
    ],
    createdAt: '2026-09-16T10:00:00Z',
    commentsCount: 2
  },
  {
    id: 'item-105',
    identifier: 'ENG-1045',
    workspaceId: 'wks-core',
    title: 'SCIM 2.0 User & Group provisioning endpoint specifications',
    type: 'issue',
    status: 'done',
    priority: 'medium',
    estimate: 5,
    assigneeId: 'usr-4',
    teamId: 'team-core',
    projectId: 'proj-1',
    cycleId: 'cycle-41',
    dueDate: '2026-09-10',
    parentId: null,
    labels: ['scim', 'enterprise', 'auth'],
    description: 'Implement `/scim/v2/Users` and `/scim/v2/Groups` following RFC 7644.',
    relations: [],
    documentLinks: [],
    createdAt: '2026-08-30T08:00:00Z',
    commentsCount: 3
  },
  {
    id: 'item-106',
    identifier: 'WEB-405',
    workspaceId: 'wks-core',
    title: 'Global Command Palette with fuzzy multi-category search',
    type: 'issue',
    status: 'done',
    priority: 'high',
    estimate: 5,
    assigneeId: 'usr-5',
    teamId: 'team-web',
    projectId: 'proj-3',
    cycleId: 'cycle-42',
    dueDate: '2026-09-18',
    parentId: null,
    labels: ['ui', 'keyboard', 'navigation'],
    description: 'Cmd+K launcher supporting instant navigation across projects, views, documents, and execution actions.',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-10T16:40:00Z',
    commentsCount: 5
  },
  {
    id: 'item-107',
    identifier: 'MOB-201',
    workspaceId: 'wks-core',
    title: 'Background sync daemon for iOS background fetch tasks',
    type: 'task',
    status: 'in_progress',
    priority: 'medium',
    estimate: 5,
    assigneeId: 'usr-3',
    teamId: 'team-mobile',
    projectId: 'proj-4',
    cycleId: 'cycle-42',
    dueDate: '2026-09-30',
    parentId: null,
    labels: ['ios', 'mobile', 'sync'],
    description: 'Utilize BGAppRefreshTask to pull delta change-sets when devices are connected to unmetered Wi-Fi.',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-17T13:10:00Z',
    commentsCount: 1
  },
  {
    id: 'item-108',
    identifier: 'ENG-1049',
    workspaceId: 'wks-core',
    title: 'WebSocket heartbeat fallback when edge CDN terminates idle TLS',
    type: 'bug',
    status: 'backlog',
    priority: 'low',
    estimate: 2,
    assigneeId: 'usr-1',
    teamId: 'team-core',
    projectId: 'proj-2',
    cycleId: null,
    dueDate: null,
    parentId: null,
    labels: ['network', 'websockets', 'infra'],
    description: 'Inject ping/pong frames every 25 seconds to keep AWS CloudFront connections warm.',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-18T15:20:00Z',
    commentsCount: 0
  },
  {
    id: 'item-109',
    identifier: 'ENG-1050',
    workspaceId: 'wks-core',
    title: 'Add granular team workflow transition guards (e.g. require PR link on In Review)',
    type: 'issue',
    status: 'todo',
    priority: 'medium',
    estimate: 3,
    assigneeId: 'usr-6',
    teamId: 'team-core',
    projectId: 'proj-1',
    cycleId: 'cycle-43',
    dueDate: '2026-10-08',
    parentId: null,
    labels: ['workflows', 'governance'],
    description: 'Allow team leads to enforce required fields before an item can be moved to specific workflow states.',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-19T09:45:00Z',
    commentsCount: 2
  },
  {
    id: 'item-110',
    identifier: 'WEB-410',
    workspaceId: 'wks-core',
    title: 'Bi-directional document block embedding engine with live Work Item sync',
    type: 'issue',
    status: 'in_progress',
    priority: 'urgent',
    estimate: 8,
    assigneeId: 'usr-2',
    teamId: 'team-web',
    projectId: 'proj-3',
    cycleId: 'cycle-42',
    dueDate: '2026-09-27',
    parentId: null,
    labels: ['living-spec', 'editor', 'sync'],
    description: 'Ensure any sentence or table row in a PRD can be linked directly to a WorkItem, displaying live status pills and assignee avatars.',
    relations: [],
    documentLinks: [
      { documentId: 'doc-1', type: 'source_spec', title: 'PRD: Offline-First Synchronization & CRDT Substrate' }
    ],
    createdAt: '2026-09-12T11:00:00Z',
    commentsCount: 11
  },
  // Canonical Sub-items (Hierarchical children resolved via parentId)
  {
    id: 'sub-1',
    identifier: 'ENG-1041-A',
    workspaceId: 'wks-core',
    teamId: 'team-core',
    title: 'Implement DFS adjacency list validator in TypeScript',
    type: 'task',
    status: 'done',
    priority: 'medium',
    parentId: 'item-101',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-14T10:00:00Z'
  },
  {
    id: 'sub-2',
    identifier: 'ENG-1041-B',
    workspaceId: 'wks-core',
    teamId: 'team-core',
    title: 'Write property-based fuzz tests with random cyclic graphs',
    type: 'task',
    status: 'done',
    priority: 'medium',
    parentId: 'item-101',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-14T11:00:00Z'
  },
  {
    id: 'sub-3',
    identifier: 'ENG-1041-C',
    workspaceId: 'wks-core',
    teamId: 'team-core',
    title: 'Connect conflict rejection callback to client toast system',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    parentId: 'item-101',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-14T12:00:00Z'
  },
  {
    id: 'sub-4',
    identifier: 'ENG-1042-A',
    workspaceId: 'wks-core',
    teamId: 'team-core',
    title: 'Patch assertion consumer service endpoint',
    type: 'task',
    status: 'done',
    priority: 'medium',
    parentId: 'item-102',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-15T12:00:00Z'
  },
  {
    id: 'sub-5',
    identifier: 'ENG-1042-B',
    workspaceId: 'wks-core',
    teamId: 'team-core',
    title: 'Add regression tests against captured malicious replay payloads',
    type: 'task',
    status: 'done',
    priority: 'medium',
    parentId: 'item-102',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-15T13:00:00Z'
  },
  {
    id: 'sub-6',
    identifier: 'WEB-402-A',
    workspaceId: 'wks-core',
    teamId: 'team-web',
    title: 'Calculate fixed row offset matrix with dynamic overscan',
    type: 'task',
    status: 'done',
    priority: 'medium',
    parentId: 'item-103',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-13T15:00:00Z'
  },
  {
    id: 'sub-7',
    identifier: 'WEB-402-B',
    workspaceId: 'wks-core',
    teamId: 'team-web',
    title: 'Implement keyboard arrow key continuous scrolling',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    parentId: 'item-103',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-13T16:00:00Z'
  },
  {
    id: 'sub-8',
    identifier: 'WEB-402-C',
    workspaceId: 'wks-core',
    teamId: 'team-web',
    title: 'Support multi-row selection with Shift + ArrowDown',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    parentId: 'item-103',
    relations: [],
    documentLinks: [],
    createdAt: '2026-09-13T17:00:00Z'
  }
];

export const LIVING_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'PRD: Offline-First Synchronization & CRDT Substrate',
    projectId: 'proj-2',
    teamId: 'team-core',
    authorId: 'usr-2',
    updatedAt: '2026-09-24T18:30:00Z',
    version: '2.4',
    summary: 'Technical and product specification for client-side optimistic mutations, IndexedDB persistence, and peer-to-peer conflict resolution.',
    content: {
      sections: [
        {
          id: 'sec-1',
          heading: '1. Executive Summary & Strategic Rationale',
          body: 'Modern knowledge workers require an authoring and tracking environment that operates seamlessly irrespective of network fidelity. This document details the architectural requirements for sub-50ms local UI response times and guaranteed eventual consistency using state-based CRDTs.'
        },
        {
          id: 'sec-2',
          heading: '2. Target Performance Benchmarks',
          body: 'Local state mutations must persist to memory in <10ms. Replay of IndexedDB transaction logs must not exceed 100ms on cold app startup. Graph cycle checks must execute client-side before dispatch.'
        },
        {
          id: 'sec-3',
          heading: '3. Core Deliverables & Live Work Items',
          isLiveTable: true,
          linkedItemIds: ['item-101', 'item-104', 'item-103', 'item-110']
        },
        {
          id: 'sec-4',
          heading: '4. Edge Cases & Conflict Resolution Policies',
          body: 'In the event of concurrent conflicting edits to scalar properties (such as Status or Assignee), the platform adopts Last-Write-Wins (LWW) governed by hybrid logical clocks (HLC). Rich text block modifications utilize commutative tree operations.'
        }
      ]
    }
  }
];

export const INBOX_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'mention',
    title: 'Sarah Jenkins mentioned you in ENG-1041',
    snippet: '"@Marcus Vance can you confirm whether Tarjan\'s handles detached subgraphs without recursion overflows?"',
    itemId: 'item-101',
    timestamp: '12m ago',
    unread: true,
    author: USERS[1]
  },
  {
    id: 'notif-2',
    type: 'review_requested',
    title: 'Elena Rostova requested your review on ENG-1042',
    snippet: '"PR #892: Fix SAML assertion replay clock skew tolerance check"',
    itemId: 'item-102',
    timestamp: '45m ago',
    unread: true,
    author: USERS[3]
  },
  {
    id: 'notif-3',
    type: 'assignment',
    title: 'Assigned to WEB-410: Bi-directional document block embedding',
    snippet: '"You were added as a co-contributor for the live spec engine."',
    itemId: 'item-110',
    timestamp: '3h ago',
    unread: false,
    author: USERS[1]
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Cycle 42 Scope Freeze',
    snippet: '"Cycle 42 commitment period ends in 48 hours. Review unestimated backlog items."',
    itemId: null,
    timestamp: '5h ago',
    unread: false,
    author: null
  }
];
