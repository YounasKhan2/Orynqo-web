import { useMemo } from 'react';
import { filterDocuments, buildDocumentTree, DOC_FACETS } from '../model';

/**
 * useDocumentsQuery Hook (DOC-001)
 *
 * Faceted, search-filtered document collection query operating strictly on supplied data.
 * Does NOT import hidden global fixtures.
 *
 * @param {Object} options
 * @param {Array<Object>} options.documents - Canonical documents supplied from boundary
 * @param {string} options.facet - Active navigation facet ('recent', 'pinned', 'authored', 'all', 'specs', 'runbooks')
 * @param {string} options.searchQuery - Search string
 * @param {string} options.teamId - Context team filter
 * @param {string} options.projectId - Context project filter
 * @param {string} options.lifecycle - 'active' | 'archived'
 * @param {string} options.currentUserId - Current user ID
 * @param {Array<string>} options.favoriteDocIds - User favorites
 * @param {Array<string>} options.contextPinnedDocIds - Context pins
 * @returns {{ documents: Array<Object>, documentTree: Array<Object>, totalCount: number, isEmpty: boolean }}
 */
export function useDocumentsQuery({
  documents = [],
  facet = DOC_FACETS.RECENT,
  searchQuery = '',
  teamId = null,
  projectId = null,
  lifecycle = 'active',
  currentUserId = 'usr-1',
  favoriteDocIds = [],
  contextPinnedDocIds = []
} = {}) {
  const filteredDocuments = useMemo(() => {
    return filterDocuments(documents, {
      facet,
      searchQuery,
      teamId,
      projectId,
      lifecycle,
      currentUserId,
      favoriteDocIds,
      contextPinnedDocIds
    });
  }, [
    documents,
    facet,
    searchQuery,
    teamId,
    projectId,
    lifecycle,
    currentUserId,
    favoriteDocIds,
    contextPinnedDocIds
  ]);

  const documentTree = useMemo(() => {
    return buildDocumentTree(filteredDocuments);
  }, [filteredDocuments]);

  return {
    documents: filteredDocuments,
    documentTree,
    totalCount: filteredDocuments.length,
    isEmpty: (documents || []).length === 0,
    hasFilteredResults: filteredDocuments.length > 0
  };
}
