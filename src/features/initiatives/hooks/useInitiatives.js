import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { matchesCurrentQuarter, getInitiativeCapabilities } from '../model/initiativeModel';

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
  referenceClock = new Date(),
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
          if (init.horizon !== null && (init.horizon?.targetDate || init.horizon?.quarter)) return false;
        } else if (horizon === 'current_quarter') {
          if (!matchesCurrentQuarter(init, referenceClock)) return false;
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

/**
 * useInitiativeMutations Hook
 *
 * Authoritative mutation boundary for Initiatives.
 * Enforces capabilities:
 * - canEditInitiative
 * - canManageInitiativeProjects
 * - canPostInitiativeUpdate
 * - canManageInitiativeAccess
 * - canCompleteInitiative
 * - canArchiveInitiative
 *
 * Emits canonical ActivityEvents on successful mutations.
 */
export function useInitiativeMutations({
  initiatives = [],
  setInitiatives,
  projects = [],
  onUpdateProject,
  updates = [],
  setUpdates,
  activityEvents = [],
  setActivityEvents,
  actor = { id: 'usr-sarah', workspaceId: 'wks-core' }
} = {}) {
  const updateInitiative = useCallback(
    (initiativeId, patch = {}, expectedVersion = null) => {
      let succeeded = false;
      let conflict = false;
      let error = null;

      const target = (initiatives || []).find((i) => i.id === initiativeId);
      if (!target) {
        return { success: false, error: 'Initiative not found' };
      }

      // 1. Authoritative capability check
      const caps = getInitiativeCapabilities(target, actor);
      if (patch.accessPolicy && !caps.canManageInitiativeAccess) {
        return { success: false, error: 'Unauthorized: actor lacks canManageInitiativeAccess capability' };
      }
      if (!caps.canEditInitiative) {
        return { success: false, error: 'Unauthorized: actor lacks canEditInitiative capability' };
      }

      // 2. Concurrency validation
      if (expectedVersion !== null && target.version > expectedVersion) {
        return { success: false, conflict: true, error: 'Concurrency Conflict: Stale write rejected' };
      }

      const updated = {
        ...target,
        ...patch,
        version: (target.version || 1) + 1,
        updatedAt: new Date().toISOString()
      };

      setInitiatives?.((prev) => prev.map((i) => (i.id === initiativeId ? updated : i)));

      // 3. Emit ActivityEvent
      if (setActivityEvents) {
        const eventType = patch.health
          ? 'initiative.health_changed'
          : patch.operationalState
          ? 'initiative.state_changed'
          : patch.horizon
          ? 'initiative.horizon_changed'
          : 'initiative.updated';

        setActivityEvents((prev) => [
          {
            id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            type: eventType,
            entityType: 'initiative',
            entityId: initiativeId,
            actorId: actor.id,
            timestamp: new Date().toISOString(),
            payload: patch
          },
          ...prev
        ]);
      }

      return { success: true, updated };
    },
    [initiatives, setInitiatives, setActivityEvents, actor]
  );

  const completeInitiative = useCallback(
    (initiativeId) => {
      const target = (initiatives || []).find((i) => i.id === initiativeId);
      if (!target) return { success: false, error: 'Initiative not found' };

      const caps = getInitiativeCapabilities(target, actor);
      if (!caps.canCompleteInitiative) {
        return { success: false, error: 'Unauthorized: actor lacks canCompleteInitiative capability' };
      }

      const updated = {
        ...target,
        operationalState: 'completed',
        version: (target.version || 1) + 1,
        updatedAt: new Date().toISOString()
      };

      setInitiatives?.((prev) => prev.map((i) => (i.id === initiativeId ? updated : i)));

      // Invariant: Non-cascading. Associated projects remain unchanged.

      setActivityEvents?.((prev) => [
        {
          id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'initiative.state_changed',
          entityType: 'initiative',
          entityId: initiativeId,
          actorId: actor.id,
          timestamp: new Date().toISOString(),
          payload: { operationalState: 'completed' }
        },
        ...prev
      ]);

      return { success: true, updated };
    },
    [initiatives, setInitiatives, setActivityEvents, actor]
  );

  const archiveInitiative = useCallback(
    (initiativeId) => {
      const target = (initiatives || []).find((i) => i.id === initiativeId);
      if (!target) return { success: false, error: 'Initiative not found' };

      const caps = getInitiativeCapabilities(target, actor);
      if (!caps.canArchiveInitiative) {
        return { success: false, error: 'Unauthorized: actor lacks canArchiveInitiative capability' };
      }

      const updated = {
        ...target,
        archiveState: 'archived',
        version: (target.version || 1) + 1,
        updatedAt: new Date().toISOString()
      };

      setInitiatives?.((prev) => prev.map((i) => (i.id === initiativeId ? updated : i)));

      setActivityEvents?.((prev) => [
        {
          id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'initiative.archived',
          entityType: 'initiative',
          entityId: initiativeId,
          actorId: actor.id,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);

      return { success: true, updated };
    },
    [initiatives, setInitiatives, setActivityEvents, actor]
  );

  const restoreInitiative = useCallback(
    (initiativeId) => {
      const target = (initiatives || []).find((i) => i.id === initiativeId);
      if (!target) return { success: false, error: 'Initiative not found' };

      const caps = getInitiativeCapabilities(target, actor);
      if (!caps.canArchiveInitiative) {
        return { success: false, error: 'Unauthorized: actor lacks canArchiveInitiative capability' };
      }

      const updated = {
        ...target,
        archiveState: 'active',
        version: (target.version || 1) + 1,
        updatedAt: new Date().toISOString()
      };

      setInitiatives?.((prev) => prev.map((i) => (i.id === initiativeId ? updated : i)));

      setActivityEvents?.((prev) => [
        {
          id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'initiative.restored',
          entityType: 'initiative',
          entityId: initiativeId,
          actorId: actor.id,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);

      return { success: true, updated };
    },
    [initiatives, setInitiatives, setActivityEvents, actor]
  );

  const alignProject = useCallback(
    (projectId, targetInitiativeId, expectedVersion = null) => {
      const targetInit = (initiatives || []).find((i) => i.id === targetInitiativeId);
      if (!targetInit) return { success: false, error: 'Target Initiative not found' };

      const caps = getInitiativeCapabilities(targetInit, actor);
      if (!caps.canManageInitiativeProjects) {
        return { success: false, error: 'Unauthorized: actor lacks canManageInitiativeProjects capability' };
      }

      // Delegate canonically to Authoritative Project Mutation Boundary (UI-07)
      if (typeof onUpdateProject !== 'function') {
        return { success: false, error: 'No authoritative project mutation boundary provided' };
      }

      const mutationResult = onUpdateProject(projectId, { initiativeId: targetInitiativeId }, expectedVersion);
      const succeeded = mutationResult === true || (mutationResult && mutationResult.success !== false);
      if (!succeeded) {
        return { success: false, error: 'Project mutation rejected by authoritative boundary' };
      }

      // Emit canonical ActivityEvent ONLY upon authoritative success
      setActivityEvents?.((prev) => [
        {
          id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'initiative.project_associated',
          entityType: 'initiative',
          entityId: targetInitiativeId,
          actorId: actor.id,
          timestamp: new Date().toISOString(),
          payload: { projectId }
        },
        ...prev
      ]);

      return { success: true };
    },
    [initiatives, onUpdateProject, setActivityEvents, actor]
  );

  const dissociateProject = useCallback(
    (projectId, sourceInitiativeId = null, expectedVersion = null) => {
      if (sourceInitiativeId) {
        const sourceInit = (initiatives || []).find((i) => i.id === sourceInitiativeId);
        if (sourceInit) {
          const caps = getInitiativeCapabilities(sourceInit, actor);
          if (!caps.canManageInitiativeProjects) {
            return { success: false, error: 'Unauthorized: actor lacks canManageInitiativeProjects capability' };
          }
        }
      }

      // Delegate canonically to Authoritative Project Mutation Boundary (UI-07)
      if (typeof onUpdateProject !== 'function') {
        return { success: false, error: 'No authoritative project mutation boundary provided' };
      }

      const mutationResult = onUpdateProject(projectId, { initiativeId: null }, expectedVersion);
      const succeeded = mutationResult === true || (mutationResult && mutationResult.success !== false);
      if (!succeeded) {
        return { success: false, error: 'Project mutation rejected by authoritative boundary' };
      }

      if (sourceInitiativeId) {
        setActivityEvents?.((prev) => [
          {
            id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'initiative.project_dissociated',
            entityType: 'initiative',
            entityId: sourceInitiativeId,
            actorId: actor.id,
            timestamp: new Date().toISOString(),
            payload: { projectId }
          },
          ...prev
        ]);
      }

      return { success: true };
    },
    [initiatives, onUpdateProject, setActivityEvents, actor]
  );

  const postUpdate = useCallback(
    (updatePayload) => {
      const { initiativeId, health, narrative } = updatePayload;
      const targetInit = (initiatives || []).find((i) => i.id === initiativeId);
      if (!targetInit) return { success: false, error: 'Initiative not found' };

      const caps = getInitiativeCapabilities(targetInit, actor);
      if (!caps.canPostInitiativeUpdate) {
        return { success: false, error: 'Unauthorized: actor lacks canPostInitiativeUpdate capability' };
      }

      const newUpdate = {
        id: `upd-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        initiativeId,
        authorId: actor.id || 'usr-sarah',
        narrative: narrative.trim(),
        healthSnapshot: health,
        horizonSnapshot: targetInit.horizon ? { ...targetInit.horizon } : null,
        highlights: updatePayload.highlights || [],
        blockers: updatePayload.blockers || [],
        version: 1,
        publishedAt: new Date().toISOString()
      };

      setUpdates?.((prev) => [newUpdate, ...prev]);

      // Synchronize canonical initiative health
      setInitiatives?.((prev) =>
        prev.map((i) => (i.id === initiativeId ? { ...i, health, updatedAt: new Date().toISOString() } : i))
      );

      setActivityEvents?.((prev) => [
        {
          id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'initiative.update_published',
          entityType: 'initiative',
          entityId: initiativeId,
          actorId: actor.id,
          timestamp: new Date().toISOString(),
          payload: { updateId: newUpdate.id, health }
        },
        ...prev
      ]);

      return { success: true, update: newUpdate };
    },
    [initiatives, setUpdates, setInitiatives, setActivityEvents, actor]
  );

  return {
    updateInitiative,
    completeInitiative,
    archiveInitiative,
    restoreInitiative,
    alignProject,
    dissociateProject,
    postUpdate
  };
}
