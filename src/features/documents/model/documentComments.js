/**
 * Threaded Comments Domain Model & Resilient Anchor Engine (UI-06A / UI-06B)
 *
 * Implements:
 * 1. Document-level threads vs Range-anchored inline threads.
 * 2. Anchor degradation & preservation: editing surrounding content never silently deletes discussion.
 * 3. Thread resolution & resolved history preservation.
 */

export const COMMENT_THREAD_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ORPHANED: 'orphaned'
};

/**
 * Creates a new comment thread.
 *
 * @param {Object} input
 * @returns {Object} CommentThread
 */
export function createCommentThread({
  id,
  documentId,
  content,
  authorId = 'usr-1',
  anchor = null, // { blockId?: string, quote?: string, startOffset?: number, endOffset?: number }
  createdAt = new Date().toISOString()
}) {
  const timestamp = Date.now();
  const threadId = id || `thread-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: threadId,
    documentId,
    status: COMMENT_THREAD_STATUS.ACTIVE,
    anchor: anchor || null,
    isOrphaned: false,
    createdAt,
    resolvedAt: null,
    resolvedBy: null,
    comments: [
      {
        id: `cmt-${timestamp}-1`,
        threadId,
        authorId,
        content,
        createdAt
      }
    ]
  };
}

/**
 * Adds a reply to an existing comment thread.
 *
 * @param {Object} thread
 * @param {string} content
 * @param {string} authorId
 * @returns {Object} Updated thread
 */
export function addReplyToThread(thread, content, authorId = 'usr-1') {
  if (!thread) return thread;

  const reply = {
    id: `cmt-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    threadId: thread.id,
    authorId,
    content,
    createdAt: new Date().toISOString()
  };

  return {
    ...thread,
    comments: [...thread.comments, reply]
  };
}

/**
 * Resolves or unresolves a comment thread.
 *
 * @param {Object} thread
 * @param {boolean} resolved
 * @param {string} userId
 * @returns {Object}
 */
export function toggleResolveThread(thread, resolved = true, userId = 'usr-1') {
  if (!thread) return thread;
  return {
    ...thread,
    status: resolved ? COMMENT_THREAD_STATUS.RESOLVED : (thread.isOrphaned ? COMMENT_THREAD_STATUS.ORPHANED : COMMENT_THREAD_STATUS.ACTIVE),
    resolvedAt: resolved ? new Date().toISOString() : null,
    resolvedBy: resolved ? userId : null
  };
}

/**
 * Re-evaluates range anchors against new document content.
 * If anchored block or text was removed, transitions thread to 'orphaned' state
 * WITHOUT silently deleting the thread or its discussion history.
 *
 * @param {Array<Object>} threads
 * @param {Object} docContent - Structured document body
 * @returns {Array<Object>} Updated threads with preserved orphan status
 */
export function reconcileCommentAnchors(threads = [], docContent) {
  if (!docContent || !Array.isArray(docContent.blocks)) return threads;

  const blockMap = new Map((docContent.blocks || []).map((b) => [b.id, b]));

  return threads.map((thread) => {
    // Document-level threads never orphan
    if (!thread.anchor) return thread;

    const { blockId, quote } = thread.anchor;
    let isOrphaned = false;

    if (blockId) {
      const block = blockMap.get(blockId);
      if (!block) {
        // Block was deleted
        isOrphaned = true;
      } else if (quote && !block.text.includes(quote)) {
        // Text inside block was removed or substantially modified
        isOrphaned = true;
      }
    } else if (quote) {
      // Freeform quote search across all blocks
      const existsInAnyBlock = docContent.blocks.some((b) => (b.text || '').includes(quote));
      if (!existsInAnyBlock) {
        isOrphaned = true;
      }
    }

    if (isOrphaned && !thread.isOrphaned) {
      return {
        ...thread,
        isOrphaned: true,
        status: thread.status === COMMENT_THREAD_STATUS.RESOLVED ? COMMENT_THREAD_STATUS.RESOLVED : COMMENT_THREAD_STATUS.ORPHANED
      };
    } else if (!isOrphaned && thread.isOrphaned) {
      return {
        ...thread,
        isOrphaned: false,
        status: thread.status === COMMENT_THREAD_STATUS.RESOLVED ? COMMENT_THREAD_STATUS.RESOLVED : COMMENT_THREAD_STATUS.ACTIVE
      };
    }

    return thread;
  });
}
