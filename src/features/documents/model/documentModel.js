/**
 * Canonical Document Domain Model & Invariant Engine (UI-06A / UI-06B)
 *
 * Implements the storage-neutral canonical Document model defined in:
 * `docs/18-ui-06a-docs-knowledge-product-ux-contract.md` (v1.1.0)
 *
 * Enforces:
 * 1. Exactly one canonical Document model (no TeamDocument, ProjectDocument, etc.).
 * 2. Immutable identity, workspace tenancy, title, structured content, authorship provenance.
 * 3. Single structural parent (0 or 1).
 * 4. Contextual associations independent of hierarchy.
 * 5. Lifecycle states: 'active' | 'archived'.
 * 6. Semantic authorization & capabilities.
 */

export const DOCUMENT_LIFECYCLE = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

export const DOCUMENT_VISIBILITY = {
  WORKSPACE: 'workspace',
  RESTRICTED: 'restricted'
};

export const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph',
  HEADING_1: 'heading_1',
  HEADING_2: 'heading_2',
  HEADING_3: 'heading_3',
  BULLET_LIST_ITEM: 'bullet_list_item',
  ORDERED_LIST_ITEM: 'ordered_list_item',
  TASK_CHECKLIST_ITEM: 'task_checklist_item',
  CODE_BLOCK: 'code_block',
  CALLOUT: 'callout',
  DIVIDER: 'divider'
};

/**
 * Creates a canonical document entity with standard defaults.
 *
 * @param {Object} input
 * @returns {Object} Canonical Document
 */
export function createDocumentModel({
  id,
  workspaceId = 'wks-core',
  title = '',
  icon = '📄',
  content = null,
  creatorId = 'usr-1',
  lastEditorId = 'usr-1',
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
  parentId = null,
  teamIds = [],
  projectIds = [],
  initiativeIds = [],
  cycleIds = [],
  lifecycle = DOCUMENT_LIFECYCLE.ACTIVE,
  archivedAt = null,
  archivedBy = null,
  visibility = DOCUMENT_VISIBILITY.WORKSPACE,
  allowedUserIds = [],
  allowedTeamIds = [],
  version = 1
} = {}) {
  const timestamp = Date.now();
  const docId = id || `doc-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;

  const defaultContent = {
    blocks: [
      {
        id: `blk-${timestamp}-1`,
        type: BLOCK_TYPES.PARAGRAPH,
        text: '',
        meta: {}
      }
    ]
  };

  return {
    id: docId,
    workspaceId,
    title: title || 'Untitled Document',
    icon,
    content: content && Array.isArray(content.blocks) ? content : defaultContent,
    creatorId,
    lastEditorId,
    createdAt,
    updatedAt,
    parentId: parentId || null,
    teamIds: Array.isArray(teamIds) ? [...new Set(teamIds)] : [],
    projectIds: Array.isArray(projectIds) ? [...new Set(projectIds)] : [],
    initiativeIds: Array.isArray(initiativeIds) ? [...new Set(initiativeIds)] : [],
    cycleIds: Array.isArray(cycleIds) ? [...new Set(cycleIds)] : [],
    lifecycle,
    archivedAt,
    archivedBy,
    visibility,
    allowedUserIds: Array.isArray(allowedUserIds) ? [...allowedUserIds] : [],
    allowedTeamIds: Array.isArray(allowedTeamIds) ? [...allowedTeamIds] : [],
    version
  };
}

/**
 * Validates document creation/update invariants.
 *
 * @param {Object} doc
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDocument(doc) {
  const errors = [];
  if (!doc) {
    return { valid: false, errors: ['Document is null or undefined'] };
  }
  if (!doc.id) errors.push('Document must have an immutable identity (id)');
  if (!doc.workspaceId) errors.push('Document must belong to a workspace');
  if (!doc.content || !Array.isArray(doc.content.blocks)) {
    errors.push('Document must have structured content blocks');
  }
  if (![DOCUMENT_LIFECYCLE.ACTIVE, DOCUMENT_LIFECYCLE.ARCHIVED].includes(doc.lifecycle)) {
    errors.push(`Invalid lifecycle state: ${doc.lifecycle}`);
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
