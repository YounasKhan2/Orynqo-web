import { useMemo } from 'react';
import { deriveDocumentBacklinks } from '../model';

/**
 * useDocumentBacklinks Hook
 *
 * Computes derived incoming references referencing target document.
 * Strictly enforces zero-leakage security:
 * Unauthorized entities do NOT contribute to list entries or counts.
 *
 * @param {Object} options
 * @param {string} options.documentId - Target document ID
 * @param {Array<Object>} options.documents - Canonical documents
 * @param {Array<Object>} options.workItems - Canonical work items
 * @param {Array<Object>} [options.comments] - Comments
 * @param {Function} [options.isAccessible] - Authorization resolver (entity, type) => boolean
 * @returns {{ backlinks: Array<Object>, totalCount: number }}
 */
export function useDocumentBacklinks({
  documentId,
  documents = [],
  workItems = [],
  comments = [],
  isAccessible = () => true
} = {}) {
  return useMemo(() => {
    return deriveDocumentBacklinks(
      documentId,
      { documents, workItems, comments },
      isAccessible
    );
  }, [documentId, documents, workItems, comments, isAccessible]);
}
