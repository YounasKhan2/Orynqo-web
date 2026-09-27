/**
 * Canonical Initiatives Mock Data conforming to UI-08A / UI-08B v1.1.0 Contract
 */

import {
  INITIATIVE_OPERATIONAL_STATE,
  INITIATIVE_ARCHIVE_STATE,
  INITIATIVE_HEALTH,
  INITIATIVE_ACCESS_POLICY
} from '../features/initiatives/model/initiativeModel';

export const INITIAL_CANONICAL_INITIATIVES = [
  {
    id: 'init-1',
    identifier: 'INT-01',
    workspaceId: 'wks-core',
    name: 'Unified Real-Time Architecture & Offline Sync',
    summary: 'Multi-squad engineering program migrating client state to IndexedDB CRDT caching, high-density virtualized data grids, and live presence synchronization.',
    operationalState: INITIATIVE_OPERATIONAL_STATE.ACTIVE,
    archiveState: INITIATIVE_ARCHIVE_STATE.ACTIVE,
    health: INITIATIVE_HEALTH.ON_TRACK,
    ownerUserId: 'usr-1',
    horizon: {
      type: 'quarter',
      quarter: 4,
      year: 2026,
      label: 'Q4 2026',
      startDate: '2026-08-01',
      targetDate: '2026-12-15'
    },
    access: {
      visibility: INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE,
      memberUserIds: [],
      memberTeamIds: []
    },
    version: 1,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-25T16:00:00.000Z'
  },
  {
    id: 'init-2',
    identifier: 'INT-02',
    workspaceId: 'wks-core',
    name: 'Enterprise Security & Identity V2',
    summary: 'OAuth 2.1 protocol migration, SCIM enterprise auto-provisioning, fine-grained access policies, and tamper-evident audit logging.',
    operationalState: INITIATIVE_OPERATIONAL_STATE.ACTIVE,
    archiveState: INITIATIVE_ARCHIVE_STATE.ACTIVE,
    health: INITIATIVE_HEALTH.ON_TRACK,
    ownerUserId: 'usr-4',
    horizon: {
      type: 'quarter',
      quarter: 4,
      year: 2026,
      label: 'Q4 2026',
      startDate: '2026-08-01',
      targetDate: '2026-11-30'
    },
    access: {
      visibility: INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE,
      memberUserIds: [],
      memberTeamIds: []
    },
    version: 1,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-20T14:30:00.000Z'
  },
  {
    id: 'init-3',
    identifier: 'INT-03',
    workspaceId: 'wks-core',
    name: 'Mobile Client Architecture & Native Offline',
    summary: 'Deliver SQLite persistence, background push sync, and battery-efficient reactive queries on iOS & Android.',
    operationalState: INITIATIVE_OPERATIONAL_STATE.PLANNED,
    archiveState: INITIATIVE_ARCHIVE_STATE.ACTIVE,
    health: INITIATIVE_HEALTH.UNSET,
    ownerUserId: 'usr-3',
    horizon: {
      type: 'half',
      half: 1,
      year: 2027,
      label: 'H1 2027',
      startDate: '2026-10-01',
      targetDate: '2027-03-31'
    },
    access: {
      visibility: INITIATIVE_ACCESS_POLICY.WORKSPACE_DISCOVERABLE,
      memberUserIds: [],
      memberTeamIds: []
    },
    version: 1,
    createdAt: '2026-09-05T11:00:00.000Z',
    updatedAt: '2026-09-05T11:00:00.000Z'
  }
];

export const INITIAL_INITIATIVE_UPDATES = [
  {
    id: 'init-upd-1',
    initiativeId: 'init-1',
    authorId: 'usr-1',
    narrative: 'High-density virtual grid integrated with multi-column sorting and virtualized scroll. CRDT IndexedDB replication layer currently under stress testing.',
    health: INITIATIVE_HEALTH.ON_TRACK,
    horizonSnapshot: {
      type: 'quarter',
      quarter: 4,
      year: 2026,
      label: 'Q4 2026',
      startDate: '2026-08-01',
      targetDate: '2026-12-15'
    },
    highlights: ['Virtualized data grid 60fps scrolling verified', 'Universal sync protocol validated'],
    blockers: ['WebKit IndexedDB deadlocks under synthetic concurrency'],
    version: 1,
    publishedAt: '2026-09-24T18:00:00.000Z',
    correctedAt: null
  },
  {
    id: 'init-upd-2',
    initiativeId: 'init-2',
    authorId: 'usr-4',
    narrative: 'Completed SCIM RFC 7644 user and group schema mapping. Initial OAuth 2.1 token rotation unit tests passed.',
    health: INITIATIVE_HEALTH.ON_TRACK,
    horizonSnapshot: {
      type: 'quarter',
      quarter: 4,
      year: 2026,
      label: 'Q4 2026',
      startDate: '2026-08-01',
      targetDate: '2026-11-30'
    },
    highlights: ['OAuth 2.1 authorization endpoint ready', 'SCIM schema validated'],
    blockers: [],
    version: 1,
    publishedAt: '2026-09-20T15:00:00.000Z',
    correctedAt: null
  }
];
