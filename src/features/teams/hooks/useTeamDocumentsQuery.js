import { useMemo } from 'react';
import { LIVING_DOCUMENTS } from '../../../data/mockData';

/**
 * useTeamDocumentsQuery Hook (TEM-005)
 *
 * Queries canonical workspace documents contextually associated with the team.
 *
 * @param {string} teamId
 * @returns {{ documents: Array<Object>, pinnedDocuments: Array<Object>, totalCount: number }}
 */
export function useTeamDocumentsQuery(teamId) {
  return useMemo(() => {
    const docs = (LIVING_DOCUMENTS || []).filter((doc) => {
      return (
        doc.teamId === teamId ||
        (doc.associatedTeamIds || []).includes(teamId)
      );
    });

    const pinnedDocuments = docs.slice(0, 3); // Pinned high-frequency runbooks / PRDs

    return {
      documents: docs,
      pinnedDocuments,
      totalCount: docs.length
    };
  }, [teamId]);
}
