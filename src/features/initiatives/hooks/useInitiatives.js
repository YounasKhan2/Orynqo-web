import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const INITIATIVE_SAVE_STATES = {
  SAVED: 'Saved',
  SAVING: 'Saving...',
  FAILED: 'Save failed / retry required',
  CONFLICT: 'Conflict requiring attention'
};

/**
 * useInitiative Hook (INT-002)
 *
 * Real-time initiative retrieval, optimistic concurrency protection,
 * local draft state management, and conflict handling.
 * Operates purely on the supplied canonical initiatives collection boundary.
 *
 * @param {Object} options
 * @param {string} options.initiativeId - Active initiative ID
 * @param {Array<Object>} options.initiatives - Canonical initiatives collection
 * @param {Function} options.onUpdateInitiative - (id, updates, expectedVersion) => Promise<boolean|void> | boolean
 * @param {Function} [options.isAccessible] - Authorization resolver
 */
export function useInitiative({
  initiativeId,
  initiatives = [],
  onUpdateInitiative,
  isAccessible = () => true
} = {}) {
  const canonicalInitiative = useMemo(() => {
    const found = (initiatives || []).find((i) => i.id === initiativeId);
    if (!found) return null;
    if (!isAccessible(found, 'initiative')) return null;
    return found;
  }, [initiativeId, initiatives, isAccessible]);

  const [draftName, setDraftName] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [saveState, setSaveState] = useState(INITIATIVE_SAVE_STATES.SAVED);
  const [saveError, setSaveError] = useState(null);
  const [isConflict, setIsConflict] = useState(false);

  const lastSavedVersionRef = useRef(canonicalInitiative?.version || 1);
  const isDirtyRef = useRef(false);

  // Sync draft when canonicalInitiative changes
  useEffect(() => {
    if (canonicalInitiative) {
      if (!isDirtyRef.current) {
        setDraftName(canonicalInitiative.name || '');
        setDraftSummary(canonicalInitiative.summary || '');
        lastSavedVersionRef.current = canonicalInitiative.version || 1;
        setSaveState(INITIATIVE_SAVE_STATES.SAVED);
        setSaveError(null);
        setIsConflict(false);
      } else if (canonicalInitiative.version > lastSavedVersionRef.current) {
        // Upstream version moved ahead while local edits are pending
        setIsConflict(true);
        setSaveState(INITIATIVE_SAVE_STATES.CONFLICT);
      }
    }
  }, [canonicalInitiative?.id, canonicalInitiative?.version]);

  // Execute update against Authoritative Mutation Boundary
  const executeUpdate = useCallback(
    async (updates) => {
      if (!canonicalInitiative || !onUpdateInitiative) return false;

      const expectedVersion = lastSavedVersionRef.current || 1;

      // Optimistic concurrency check
      if (canonicalInitiative.version > expectedVersion) {
        setIsConflict(true);
        setSaveState(INITIATIVE_SAVE_STATES.CONFLICT);
        setSaveError('This initiative was updated remotely. Your local edits have been preserved.');
        return false;
      }

      setSaveState(INITIATIVE_SAVE_STATES.SAVING);
      setSaveError(null);

      try {
        const result = await onUpdateInitiative(canonicalInitiative.id, updates, expectedVersion);
        if (result === false) {
          throw new Error('Mutation rejected by authoritative boundary due to concurrency conflict or permission failure');
        }

        isDirtyRef.current = false;
        lastSavedVersionRef.current = (canonicalInitiative.version || 1) + 1;
        setSaveState(INITIATIVE_SAVE_STATES.SAVED);
        setSaveError(null);
        setIsConflict(false);
        return true;
      } catch (err) {
        setIsConflict(true);
        setSaveState(INITIATIVE_SAVE_STATES.FAILED);
        setSaveError(err.message || 'Failed to save changes. Local edits preserved.');
        return false;
      }
    },
    [canonicalInitiative, onUpdateInitiative]
  );

  const setLocalName = useCallback((name) => {
    isDirtyRef.current = true;
    setDraftName(name);
  }, []);

  const setLocalSummary = useCallback((summary) => {
    isDirtyRef.current = true;
    setDraftSummary(summary);
  }, []);

  const saveDraft = useCallback(() => {
    return executeUpdate({
      name: draftName,
      summary: draftSummary
    });
  }, [executeUpdate, draftName, draftSummary]);

  const resetDraft = useCallback(() => {
    if (canonicalInitiative) {
      isDirtyRef.current = false;
      setDraftName(canonicalInitiative.name || '');
      setDraftSummary(canonicalInitiative.summary || '');
      lastSavedVersionRef.current = canonicalInitiative.version || 1;
      setSaveState(INITIATIVE_SAVE_STATES.SAVED);
      setSaveError(null);
      setIsConflict(false);
    }
  }, [canonicalInitiative]);

  return {
    initiative: canonicalInitiative,
    draftName,
    draftSummary,
    setLocalName,
    setLocalSummary,
    saveDraft,
    resetDraft,
    executeUpdate,
    saveState,
    saveError,
    isConflict,
    isAccessible: Boolean(canonicalInitiative)
  };
}

/**
 * useInitiativesDirectoryQuery Hook (INT-001)
 *
 * Faceted query engine for Initiatives Directory with pre-render zero-leakage authorization filtering.
 */
export function useInitiativesDirectoryQuery({
  initiatives = [],
  projects = [],
  workItems = [],
  filters = {},
  sortKey = 'horizon',
  sortDirection = 'asc',
  searchQuery = '',
  isAccessible = () => true
} = {}) {
  const {
    state = 'all',
    health = 'all',
    ownerId = 'all',
    teamId = 'all',
    horizon = 'all',
    archiveState = 'active'
  } = filters;

  const filteredInitiatives = useMemo(() => {
    return (initiatives || []).filter((init) => {
      // 1. Authoritative accessibility check (pre-render zero-leakage)
      if (!isAccessible(init, 'initiative')) return false;

      // 2. Archive state filter
      if (archiveState === 'active' && init.archiveState === 'archived') return false;
      if (archiveState === 'archived' && init.archiveState !== 'archived') return false;

      // 3. Operational state filter
      if (state !== 'all' && init.operationalState !== state) return false;

      // 4. Health filter
      if (health !== 'all' && init.health !== health) return false;

      // 5. Owner filter
      if (ownerId !== 'all' && init.ownerUserId !== ownerId) return false;

      // 6. Contributing team filter
      if (teamId !== 'all') {
        const associatedProjects = (projects || []).filter(
          (p) => p.initiativeId === init.id && isAccessible(p, 'project')
        );
        const hasTeam = associatedProjects.some((p) => {
          const teams = p.participatingTeamIds || p.teamIds || [];
          return p.leadTeamId === teamId || teams.includes(teamId);
        });
        if (!hasTeam) return false;
      }

      // 7. Horizon filter
      if (horizon !== 'all') {
        if (horizon === 'unscheduled') {
          if (init.horizon !== null && init.horizon?.targetDate) return false;
        } else if (horizon === 'current_quarter') {
          if (!init.horizon?.label?.includes('Q4 2026')) return false;
        }
      }

      // 8. Search query matching reference, title, or summary
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = (init.identifier || '').toLowerCase().includes(q);
        const matchesName = (init.name || '').toLowerCase().includes(q);
        const matchesSummary = (init.summary || '').toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesSummary) return false;
      }

      return true;
    });
  }, [initiatives, projects, filters, state, health, ownerId, teamId, horizon, archiveState, searchQuery, isAccessible]);

  const sortedInitiatives = useMemo(() => {
    const list = [...filteredInitiatives];
    list.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortKey === 'health') {
        valA = a.health || 'unset';
        valB = b.health || 'unset';
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortKey === 'state') {
        valA = a.operationalState || 'planned';
        valB = b.operationalState || 'planned';
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      // Default: horizon targetDate
      valA = a.horizon?.targetDate || '9999-99-99';
      valB = b.horizon?.targetDate || '9999-99-99';
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return list;
  }, [filteredInitiatives, sortKey, sortDirection]);

  return {
    initiatives: sortedInitiatives,
    totalCount: (initiatives || []).filter((i) => isAccessible(i, 'initiative')).length,
    filteredCount: sortedInitiatives.length
  };
}
