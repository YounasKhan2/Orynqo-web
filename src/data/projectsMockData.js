/**
 * Canonical Projects Initial Mock Data conforming to UI-07A/UI-07B v1.1.0 Contract
 */

import {
  PROJECT_OPERATIONAL_STATE,
  PROJECT_ARCHIVE_STATE,
  PROJECT_HEALTH
} from '../features/projects/model/projectModel';

export const INITIAL_CANONICAL_PROJECTS = [
  {
    id: 'proj-1',
    identifier: 'ENG-AUTH',
    workspaceId: 'wks-core',
    name: 'Auth API V2 & SCIM Engine',
    summary: 'OAuth 2.1 protocol migration, SCIM enterprise provisioning, and fine-grained permissions.',
    operationalState: PROJECT_OPERATIONAL_STATE.IN_PROGRESS,
    archiveState: PROJECT_ARCHIVE_STATE.ACTIVE,
    health: PROJECT_HEALTH.ON_TRACK,
    leadUserId: 'usr-4',
    leadTeamId: 'team-core',
    participatingTeamIds: ['team-core'],
    targetDate: '2026-10-15',
    startDate: '2026-08-01',
    initiativeId: 'init-2',
    version: 1,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-20T14:30:00.000Z'
  },
  {
    id: 'proj-2',
    identifier: 'ENG-CRDT',
    workspaceId: 'wks-core',
    name: 'Local Cache & CRDT State Layer',
    summary: 'Full IndexedDB local replication and conflict-free replicated data types for offline editability.',
    operationalState: PROJECT_OPERATIONAL_STATE.IN_PROGRESS,
    archiveState: PROJECT_ARCHIVE_STATE.ACTIVE,
    health: PROJECT_HEALTH.AT_RISK,
    leadUserId: 'usr-1',
    leadTeamId: 'team-core',
    participatingTeamIds: ['team-core'],
    targetDate: '2026-10-31',
    startDate: '2026-08-15',
    initiativeId: 'init-1',
    version: 1,
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-09-22T10:15:00.000Z'
  },
  {
    id: 'proj-3',
    identifier: 'WEB-GRID',
    workspaceId: 'wks-core',
    name: 'High-Density Virtualized Data Grid',
    summary: 'Virtual row virtualization, inline editable cells, keyboard traversal, and bulk updates.',
    operationalState: PROJECT_OPERATIONAL_STATE.IN_PROGRESS,
    archiveState: PROJECT_ARCHIVE_STATE.ACTIVE,
    health: PROJECT_HEALTH.ON_TRACK,
    leadUserId: 'usr-5',
    leadTeamId: 'team-web',
    participatingTeamIds: ['team-web'],
    targetDate: '2026-10-20',
    startDate: '2026-09-01',
    initiativeId: 'init-1',
    version: 1,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-24T12:00:00.000Z'
  },
  {
    id: 'proj-4',
    identifier: 'MOB-STORE',
    workspaceId: 'wks-core',
    name: 'Mobile SQLite Storage Engine',
    summary: 'Native mobile persistence engine and background delta synchronizer for iOS & Android.',
    operationalState: PROJECT_OPERATIONAL_STATE.PLANNED,
    archiveState: PROJECT_ARCHIVE_STATE.ACTIVE,
    health: PROJECT_HEALTH.UNSET,
    leadUserId: 'usr-3',
    leadTeamId: 'team-mobile',
    participatingTeamIds: ['team-mobile'],
    targetDate: '2026-11-20',
    startDate: '2026-10-01',
    initiativeId: 'init-3',
    version: 1,
    createdAt: '2026-09-05T11:00:00.000Z',
    updatedAt: '2026-09-05T11:00:00.000Z'
  },
  {
    id: 'proj-5',
    identifier: 'WKS-SYNC',
    workspaceId: 'wks-core',
    name: 'Universal Workspace Sync & Pickers',
    summary: 'Cross-squad universal search, quick-switcher, entity pickers, and synchronized app navigation.',
    operationalState: PROJECT_OPERATIONAL_STATE.IN_PROGRESS,
    archiveState: PROJECT_ARCHIVE_STATE.ACTIVE,
    health: PROJECT_HEALTH.ON_TRACK,
    leadUserId: 'usr-1',
    leadTeamId: 'team-core',
    participatingTeamIds: ['team-core', 'team-web', 'team-mobile'],
    targetDate: '2026-12-01',
    startDate: '2026-09-10',
    initiativeId: 'init-1',
    version: 1,
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-25T16:00:00.000Z'
  }
];

export const INITIAL_PROJECT_UPDATES = [
  {
    id: 'upd-1',
    projectId: 'proj-1',
    authorId: 'usr-4',
    narrative: 'Completed SCIM RFC 7644 user and group schema mapping. Commenced token lifecycle tests.',
    health: PROJECT_HEALTH.ON_TRACK,
    targetDateSnapshot: '2026-10-15',
    highlights: ['SCIM schema mapped', 'OAuth 2.1 authorization endpoint ready'],
    blockers: [],
    createdAt: '2026-09-20T14:30:00.000Z'
  },
  {
    id: 'upd-2',
    projectId: 'proj-2',
    authorId: 'usr-1',
    narrative: 'IndexedDB transaction locking bottlenecks identified during heavy bulk mutation load.',
    health: PROJECT_HEALTH.AT_RISK,
    targetDateSnapshot: '2026-10-31',
    highlights: ['CRDT delta codec implemented'],
    blockers: ['IndexedDB concurrent transaction deadlock in WebKit'],
    createdAt: '2026-09-22T10:15:00.000Z'
  }
];

export const INITIAL_PROJECT_MILESTONES = [
  {
    id: 'mls-1',
    projectId: 'proj-1',
    name: 'M1: SCIM Schema & Protocols',
    description: 'Protocol definitions and data serialization contracts.',
    targetDate: '2026-09-30',
    status: 'completed',
    sortOrder: 1,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'mls-2',
    projectId: 'proj-1',
    name: 'M2: IdP Integration & Token Rotation',
    description: 'Okta and Azure AD integration tests with automated token lifecycle management.',
    targetDate: '2026-10-15',
    status: 'open',
    sortOrder: 2,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-20T14:00:00.000Z'
  },
  {
    id: 'mls-3',
    projectId: 'proj-5',
    name: 'M1: Shared Model Extraction',
    description: 'Refactor entity schema across teams into shared packages.',
    targetDate: '2026-10-15',
    status: 'open',
    sortOrder: 1,
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z'
  }
];
