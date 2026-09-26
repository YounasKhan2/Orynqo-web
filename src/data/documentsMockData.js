import { createDocumentModel, BLOCK_TYPES } from '../features/documents/model';

/**
 * Initial Canonical Documents Dataset for Orynqo Platform
 *
 * Implements canonical workspace Documents with:
 * - Structural hierarchy (Parent -> Child)
 * - Multi-team and multi-project contextual associations
 * - Canonical mentions of WorkItems, Documents, and Users
 * - Active and Archived lifecycle states
 * - Visibility policy (Workspace vs Restricted)
 */
export const INITIAL_CANONICAL_DOCUMENTS = [
  createDocumentModel({
    id: 'doc-handbook',
    workspaceId: 'wks-core',
    title: 'Engineering Standards & System Architecture',
    icon: '📘',
    teamIds: ['team-core', 'team-infra'],
    projectIds: ['proj-1'],
    creatorId: 'usr-1',
    lastEditorId: 'usr-3',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-26T14:20:00Z',
    parentId: null,
    version: 3,
    content: {
      blocks: [
        {
          id: 'blk-hb-1',
          type: BLOCK_TYPES.HEADING_1,
          text: 'Engineering Standards & Architecture',
          meta: {}
        },
        {
          id: 'blk-hb-2',
          type: BLOCK_TYPES.PARAGRAPH,
          text: 'This canonical document outlines workspace standards for distributed state, optimistic mutations, and execution tracking.',
          meta: {}
        },
        {
          id: 'blk-hb-3',
          type: BLOCK_TYPES.CALLOUT,
          text: 'All new technical proposals must link to active work items like @[work_item:item-101:ENG-1041: Graph Cycle Detection].',
          meta: { mentions: [{ entityType: 'work_item', id: 'item-101' }] }
        },
        {
          id: 'blk-hb-4',
          type: BLOCK_TYPES.TASK_CHECKLIST_ITEM,
          text: 'Verify all database schema migrations pass automated rollback tests.',
          meta: { checked: true }
        },
        {
          id: 'blk-hb-5',
          type: BLOCK_TYPES.TASK_CHECKLIST_ITEM,
          text: 'Ensure sub-50ms local UI response times under high-density grids.',
          meta: { checked: false }
        }
      ]
    }
  }),
  createDocumentModel({
    id: 'doc-runbook-deploy',
    workspaceId: 'wks-core',
    title: 'Production Blue-Green Deployment Runbook',
    icon: '🚀',
    teamIds: ['team-core'],
    projectIds: ['proj-2'],
    creatorId: 'usr-2',
    lastEditorId: 'usr-1',
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-25T11:30:00Z',
    parentId: 'doc-handbook', // Nested child of Handbook!
    version: 2,
    content: {
      blocks: [
        {
          id: 'blk-rb-1',
          type: BLOCK_TYPES.HEADING_1,
          text: 'Blue-Green Rollback & Verification Procedures',
          meta: {}
        },
        {
          id: 'blk-rb-2',
          type: BLOCK_TYPES.PARAGRAPH,
          text: 'Emergency traffic rollback procedures for production clusters. Associated with @[document:doc-handbook:Engineering Standards & System Architecture].',
          meta: { mentions: [{ entityType: 'document', id: 'doc-handbook' }] }
        },
        {
          id: 'blk-rb-3',
          type: BLOCK_TYPES.CODE_BLOCK,
          text: 'kubectl argo rollbacks abort ingress-primary --namespace production',
          meta: {}
        }
      ]
    }
  }),
  createDocumentModel({
    id: 'doc-auth-rfc',
    workspaceId: 'wks-core',
    title: 'Living Spec: Auth V2 & Session Revocation RFC',
    icon: '🛡️',
    teamIds: ['team-core', 'team-web'],
    projectIds: ['proj-2'],
    creatorId: 'usr-4',
    lastEditorId: 'usr-4',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
    parentId: null,
    version: 1,
    content: {
      blocks: [
        {
          id: 'blk-rfc-1',
          type: BLOCK_TYPES.HEADING_1,
          text: 'Auth V2 Living Technical Specification',
          meta: {}
        },
        {
          id: 'blk-rfc-2',
          type: BLOCK_TYPES.PARAGRAPH,
          text: 'Tracks implementation items including @[work_item:item-102:ENG-1042: SAML Clock Skew].',
          meta: { mentions: [{ entityType: 'work_item', id: 'item-102' }] }
        }
      ]
    }
  }),
  createDocumentModel({
    id: 'doc-legacy-archived',
    workspaceId: 'wks-core',
    title: 'Legacy Redis Token Storage Spec (Archived)',
    icon: '📦',
    teamIds: ['team-core'],
    projectIds: [],
    creatorId: 'usr-1',
    lastEditorId: 'usr-2',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
    parentId: null,
    lifecycle: 'archived',
    archivedAt: '2026-09-05T10:00:00Z',
    archivedBy: 'usr-2',
    version: 1,
    content: {
      blocks: [
        {
          id: 'blk-leg-1',
          type: BLOCK_TYPES.PARAGRAPH,
          text: 'This specification has been superseded by Auth V2 and is archived for historical reference.',
          meta: {}
        }
      ]
    }
  })
];

export const INITIAL_DOCUMENT_COMMENTS = [
  {
    id: 'thread-doc-1',
    documentId: 'doc-handbook',
    status: 'active',
    anchor: { blockId: 'blk-hb-3', quote: 'link to active work items' },
    isOrphaned: false,
    createdAt: '2026-09-24T12:00:00Z',
    resolvedAt: null,
    resolvedBy: null,
    comments: [
      {
        id: 'cmt-1',
        threadId: 'thread-doc-1',
        authorId: 'usr-2',
        content: 'Should we require an architecture RFC before creating items in Phase 2?',
        createdAt: '2026-09-24T12:00:00Z'
      }
    ]
  }
];
