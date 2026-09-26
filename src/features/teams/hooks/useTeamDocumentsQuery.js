import { useMemo } from 'react';

/**
 * useTeamDocumentsQuery Hook (TEM-005)
 *
 * Queries canonical workspace documents contextually associated with the team.
 * Pinned documents derive from canonical isPinned or pinnedTeamIds metadata.
 *
 * @param {Object|string} options - Configuration object { teamId, documents } or teamId
 * @param {Array<Object>} [legacyDocuments] - Canonical documents collection if first arg is teamId
 * @returns {{ documents: Array<Object>, pinnedDocuments: Array<Object>, totalCount: number }}
 */
export function useTeamDocumentsQuery(options, legacyDocuments = []) {
  const { teamId, documents } = useMemo(() => {
    if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
      return {
        teamId: options.teamId,
        documents: options.documents || []
      };
    }
    return {
      teamId: options,
      documents: legacyDocuments || []
    };
  }, [options, legacyDocuments]);

  return useMemo(() => {
    const docs = (documents || []).filter((doc) => {
      return (
        doc.teamId === teamId ||
        (doc.associatedTeamIds || []).includes(teamId) ||
        (doc.teams || []).includes(teamId) ||
        (doc.pinnedTeamIds || []).includes(teamId)
      );
    });

    // Pinned documents must derive from canonical pin/reference metadata
    const pinnedDocuments = docs.filter((doc) => {
      return Boolean(doc.isPinned || (doc.pinnedTeamIds || []).includes(teamId));
    });

    return {
      documents: docs,
      pinnedDocuments,
      totalCount: docs.length
    };
  }, [teamId, documents]);
}
