/**
 * Hierarchy & Ancestry Invariants Engine (UI-06A / UI-06B)
 *
 * Enforces:
 * 1. Single structural parent (parentId === null | string).
 * 2. Strict cycle prevention: B cannot be reparented under A if A is already an ancestor of B.
 * 3. Breadcrumb resolution.
 * 4. Safe descendant resolution on archive.
 * 5. Practical depth calculation.
 */

/**
 * Computes the ancestor chain of a document.
 * Returns array of document IDs from root to immediate parent.
 *
 * @param {string} docId - Target document ID
 * @param {Array<Object>} documents - Collection of all canonical documents
 * @returns {string[]} Array of ancestor document IDs
 */
export function getAncestorIds(docId, documents = []) {
  const docMap = new Map((documents || []).map((d) => [d.id, d]));
  const ancestors = [];
  const visited = new Set();

  let curr = docMap.get(docId);
  while (curr && curr.parentId) {
    if (visited.has(curr.parentId)) {
      // Cycle encountered in data; break safely
      break;
    }
    visited.add(curr.parentId);
    ancestors.unshift(curr.parentId);
    curr = docMap.get(curr.parentId);
  }

  return ancestors;
}

/**
 * Validates whether reparenting targetDocId under newParentId is valid.
 *
 * @param {string} targetDocId - Document to reparent
 * @param {string|null} newParentId - Destination parent ID
 * @param {Array<Object>} documents - Current documents
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateReparent(targetDocId, newParentId, documents = []) {
  if (!targetDocId) {
    return { valid: false, error: 'Target document ID is required' };
  }

  // Setting to root is always valid
  if (!newParentId) {
    return { valid: true };
  }

  // Cannot parent under itself
  if (targetDocId === newParentId) {
    return { valid: false, error: 'A document cannot be its own structural parent' };
  }

  const docMap = new Map((documents || []).map((d) => [d.id, d]));
  const targetDoc = docMap.get(targetDocId);
  const newParent = docMap.get(newParentId);

  if (!newParent) {
    return { valid: false, error: 'Target parent document does not exist' };
  }

  // Cycle check: Ensure newParent is not a descendant of targetDocId
  // Traverse upward from newParentId; if targetDocId is encountered, it's a cycle!
  let curr = newParent;
  const visited = new Set();

  while (curr) {
    if (curr.id === targetDocId) {
      return {
        valid: false,
        error: `Hierarchy cycle detected: "${newParent.title || newParent.id}" is a descendant of "${targetDoc?.title || targetDocId}".`
      };
    }
    if (visited.has(curr.id)) {
      break;
    }
    visited.add(curr.id);
    curr = curr.parentId ? docMap.get(curr.parentId) : null;
  }

  return { valid: true };
}

/**
 * Resolves breadcrumbs for a document with permission-safe masking.
 *
 * @param {string} docId - Document ID
 * @param {Array<Object>} documents - Current documents
 * @param {Function} isAccessible - (doc) => boolean capability resolver
 * @returns {Array<{ id: string, title: string, isRestricted: boolean }>}
 */
export function resolveBreadcrumbs(docId, documents = [], isAccessible = () => true) {
  const docMap = new Map((documents || []).map((d) => [d.id, d]));
  const targetDoc = docMap.get(docId);
  if (!targetDoc) return [];

  const crumbs = [];
  const visited = new Set();

  let curr = targetDoc;
  while (curr) {
    if (visited.has(curr.id)) break;
    visited.add(curr.id);

    const accessible = isAccessible(curr);
    crumbs.unshift({
      id: curr.id,
      title: accessible ? curr.title : 'Restricted Item',
      isRestricted: !accessible
    });

    curr = curr.parentId ? docMap.get(curr.parentId) : null;
  }

  return crumbs;
}

/**
 * Finds all direct and indirect descendants of a document.
 *
 * @param {string} docId - Target parent ID
 * @param {Array<Object>} documents - Collection of documents
 * @returns {Object[]} Array of descendant document objects
 */
export function getDescendants(docId, documents = []) {
  const childrenMap = new Map();
  (documents || []).forEach((doc) => {
    if (doc.parentId) {
      if (!childrenMap.has(doc.parentId)) {
        childrenMap.set(doc.parentId, []);
      }
      childrenMap.get(doc.parentId).push(doc);
    }
  });

  const descendants = [];
  const queue = [...(childrenMap.get(docId) || [])];

  while (queue.length > 0) {
    const child = queue.shift();
    descendants.push(child);
    const grandChildren = childrenMap.get(child.id) || [];
    queue.push(...grandChildren);
  }

  return descendants;
}

/**
 * Builds a nested tree structure from flat document collection.
 *
 * @param {Array<Object>} documents
 * @returns {Array<Object>} Tree nodes with { ...doc, children: [] }
 */
export function buildDocumentTree(documents = []) {
  const nodeMap = new Map();
  const roots = [];

  // Create nodes
  (documents || []).forEach((doc) => {
    nodeMap.set(doc.id, { ...doc, children: [] });
  });

  // Assemble hierarchy
  (documents || []).forEach((doc) => {
    const node = nodeMap.get(doc.id);
    if (doc.parentId && nodeMap.has(doc.parentId)) {
      nodeMap.get(doc.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
