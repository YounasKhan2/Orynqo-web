import { useState, useCallback, useMemo } from 'react';
import {
  createCommentThread,
  addReplyToThread,
  toggleResolveThread,
  reconcileCommentAnchors
} from '../model';

/**
 * useDocumentComments Hook
 *
 * Threaded collaboration integration supporting:
 * - Document-level threads
 * - Range-anchored inline threads
 * - Reply creation
 * - Resolution toggling
 * - Resilient anchor reconciliation without silent thread deletion
 *
 * @param {Object} options
 * @param {string} options.documentId - Document ID
 * @param {Array<Object>} options.initialThreads - Supplied threads
 * @param {Object} options.documentContent - Current document body for anchor tracking
 * @param {string} [options.currentUserId='usr-1'] - Active user
 */
export function useDocumentComments({
  documentId,
  initialThreads = [],
  documentContent = null,
  currentUserId = 'usr-1'
} = {}) {
  const [threads, setThreads] = useState(() => initialThreads || []);

  // Reconcile anchors whenever documentContent updates
  const activeThreads = useMemo(() => {
    return reconcileCommentAnchors(threads, documentContent);
  }, [threads, documentContent]);

  // Create thread
  const addThread = useCallback(({ content, anchor = null }) => {
    const newThread = createCommentThread({
      documentId,
      content,
      authorId: currentUserId,
      anchor
    });
    setThreads((prev) => [newThread, ...prev]);
    return newThread;
  }, [documentId, currentUserId]);

  // Add reply
  const addReply = useCallback((threadId, content) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? addReplyToThread(t, content, currentUserId) : t))
    );
  }, [currentUserId]);

  // Resolve / unresolve
  const toggleResolve = useCallback((threadId, resolved) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? toggleResolveThread(t, resolved, currentUserId) : t))
    );
  }, [currentUserId]);

  const unresolvedCount = useMemo(() => {
    return activeThreads.filter((t) => t.status !== 'resolved').length;
  }, [activeThreads]);

  return {
    threads: activeThreads,
    unresolvedCount,
    addThread,
    addReply,
    toggleResolve
  };
}
