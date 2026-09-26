/**
 * Mention Parser & Derived Backlinks Engine (UI-06A / UI-06B)
 *
 * Implements:
 * 1. Extraction of entity mentions from structured block content.
 * 2. Extraction of mentions from WorkItems, Projects, and Comments.
 * 3. Derived backlinks resolution with zero-leakage security:
 *    - Unauthorized sources are completely excluded from lists AND counts.
 */

/**
 * Extracts all @ mentions from text or structured document blocks.
 * Mention token format supported:
 * - Structured token: { type: 'mention', entityType: 'work_item' | 'user' | 'document' | 'project' | 'team', id: string }
 * - Inline text tokens: @[type:id:title] or @id
 *
 * @param {Object} content - Document body content
 * @returns {Array<{ entityType: string, id: string }>}
 */
export function extractMentionsFromContent(content) {
  const blocks = Array.isArray(content)
    ? content
    : Array.isArray(content?.blocks)
    ? content.blocks
    : Array.isArray(content?.content?.blocks)
    ? content.content.blocks
    : [];

  if (blocks.length === 0) return [];

  const mentions = [];
  const regex = /@\[(work_item|user|document|project|team):([a-zA-Z0-9_-]+)(?::([^\]]+))?\]/g;

  blocks.forEach((block) => {
    // Check block.meta.mentions if structured
    if (Array.isArray(block.meta?.mentions)) {
      block.meta.mentions.forEach((m) => {
        if (m.id && m.entityType) {
          mentions.push({ entityType: m.entityType, id: m.id });
        }
      });
    }

    // Check raw text or content
    const text = block.content !== undefined ? block.content : (block.text || '');
    let match;
    while ((match = regex.exec(text)) !== null) {
      mentions.push({
        entityType: match[1],
        id: match[2],
        fallbackTitle: match[3] || ''
      });
    }
  });

  return mentions;
}

/**
 * Derives all incoming backlinks referencing a target document.
 * Enforces zero-leakage authorization filtering:
 * Unauthorized sources do NOT contribute to list rows OR aggregate counts.
 *
 * @param {string} targetDocId - Document to find references for
 * @param {Object} graph - All supplied workspace entities
 * @param {Array<Object>} graph.documents - All canonical documents
 * @param {Array<Object>} graph.workItems - All canonical work items
 * @param {Array<Object>} [graph.comments] - All comments
 * @param {Function} isAccessible - (entity, entityType) => boolean
 * @returns {{ backlinks: Array<Object>, totalCount: number }}
 */
export function deriveDocumentBacklinks(
  targetDocId,
  { documents = [], workItems = [], comments = [] },
  isAccessible = () => true
) {
  if (!targetDocId) {
    return { backlinks: [], totalCount: 0 };
  }

  const rawBacklinks = [];

  // 1. Check referencing Documents
  (documents || []).forEach((doc) => {
    if (doc.id === targetDocId) return; // Ignore self-links
    const mentions = extractMentionsFromContent(doc.content || doc);
    const referencesTarget = mentions.some((m) => m.entityType === 'document' && m.id === targetDocId);

    if (referencesTarget) {
      // Find matching text snippet
      let snippet = '';
      const docBlocks = doc.blocks || doc.content?.blocks || [];
      const matchingBlock = docBlocks.find((b) => (b.content || b.text || '').includes(targetDocId));
      if (matchingBlock) {
        snippet = (matchingBlock.content || matchingBlock.text || '').slice(0, 100);
      }

      rawBacklinks.push({
        sourceId: doc.id,
        sourceType: 'document',
        sourceTitle: doc.title,
        status: doc.lifecycle,
        snippet: snippet || doc.title,
        entity: doc
      });
    }
  });

  // 2. Check referencing WorkItems
  (workItems || []).forEach((item) => {
    // Check item.documentLinks or description
    const hasDocLink = (item.documentLinks || []).includes(targetDocId);
    const mentionsInDesc = (item.description || '').includes(targetDocId) ||
      (item.relations || []).some((r) => r.targetId === targetDocId);

    if (hasDocLink || mentionsInDesc) {
      rawBacklinks.push({
        sourceId: item.id,
        sourceType: 'work_item',
        sourceKey: item.identifier || item.id,
        sourceTitle: item.title,
        status: item.status,
        snippet: item.description?.slice(0, 100) || item.title,
        entity: item
      });
    }
  });

  // 3. ZERO-LEAKAGE FILTERING: Filter unauthorized sources BEFORE returning
  const authorizedBacklinks = rawBacklinks.filter((bl) => {
    return isAccessible(bl.entity, bl.sourceType);
  });

  return {
    backlinks: authorizedBacklinks,
    totalCount: authorizedBacklinks.length
  };
}
