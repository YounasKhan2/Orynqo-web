/**
 * Document Classification, Faceting, Search & Filter Algebra (UI-06A / UI-06B)
 *
 * Implements:
 * - Built-in facets: 'recent', 'pinned', 'authored', 'all'
 * - Query presets: 'specs', 'runbooks' (semantic presets over canonical properties)
 * - Team & Project contextual filtering
 * - Text search across title and block contents
 * - Lifecycle filtering ('active' vs 'archived')
 */

import { DOCUMENT_LIFECYCLE } from './documentModel';

export const DOC_FACETS = {
  RECENT: 'recent',
  PINNED: 'pinned',
  AUTHORED: 'authored',
  ALL: 'all',
  SPECS: 'specs',
  RUNBOOKS: 'runbooks'
};

/**
 * Filters and searches documents collection.
 *
 * @param {Array<Object>} documents - Canonical documents
 * @param {Object} options
 * @param {string} options.facet - Active facet
 * @param {string} options.searchQuery - Search string
 * @param {string} options.teamId - Context team filter
 * @param {string} options.projectId - Context project filter
 * @param {string} options.lifecycle - 'active' | 'archived'
 * @param {string} options.currentUserId - User ID
 * @param {Array<string>} options.favoriteDocIds - List of user-favorited doc IDs
 * @param {Array<string>} options.contextPinnedDocIds - List of context-pinned doc IDs
 * @returns {Array<Object>} Filtered documents
 */
export function filterDocuments(documents = [], {
  facet = DOC_FACETS.RECENT,
  searchQuery = '',
  teamId = null,
  projectId = null,
  lifecycle = DOCUMENT_LIFECYCLE.ACTIVE,
  currentUserId = 'usr-1',
  favoriteDocIds = [],
  contextPinnedDocIds = []
} = {}) {
  const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
  const favSet = new Set(favoriteDocIds || []);
  const pinSet = new Set(contextPinnedDocIds || []);

  return (documents || []).filter((doc) => {
    // 1. Lifecycle filter (Default to active unless explicitly requested)
    if (lifecycle && doc.lifecycle !== lifecycle) {
      return false;
    }

    // 2. Team Context Filter
    if (teamId) {
      const docTeams = doc.teamIds || doc.contextAssociations?.teamIds || (doc.teamId ? [doc.teamId] : []);
      const matchTeam = docTeams.includes(teamId);
      if (!matchTeam) return false;
    }

    // 3. Project Context Filter
    if (projectId) {
      const docProjects = doc.projectIds || doc.contextAssociations?.projectIds || (doc.projectId ? [doc.projectId] : []);
      const matchProject = docProjects.includes(projectId);
      if (!matchProject) return false;
    }

    // 4. Facet Filter
    switch (facet) {
      case DOC_FACETS.RECENT:
        // Shows all active documents sorted by updatedAt desc
        break;

      case DOC_FACETS.PINNED:
        // Personal Favorite OR Context Pin
        if (!favSet.has(doc.id) && !pinSet.has(doc.id)) {
          return false;
        }
        break;

      case DOC_FACETS.AUTHORED:
        if (doc.creatorId !== currentUserId) {
          return false;
        }
        break;

      case DOC_FACETS.SPECS:
        // Query preset: documents associated with active projects
        if (!doc.projectId && (!doc.projectIds || doc.projectIds.length === 0)) {
          return false;
        }
        break;

      case DOC_FACETS.RUNBOOKS:
        // Query preset: documents associated with teams
        if (!doc.teamId && (!doc.teamIds || doc.teamIds.length === 0)) {
          return false;
        }
        break;

      case DOC_FACETS.ALL:
      default:
        break;
    }

    // 5. Search Query
    if (query) {
      const titleMatch = (doc.title || '').toLowerCase().includes(query);
      if (titleMatch) return true;

      // Search in content blocks
      const blocks = doc.blocks || doc.content?.blocks || [];
      const contentMatch = blocks.some((b) => (b.content || b.text || '').toLowerCase().includes(query));
      if (!contentMatch) return false;
    }

    return true;
  }).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}
