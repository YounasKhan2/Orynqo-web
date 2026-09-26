import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { calculateProjectProgress } from '../model/projectModel';

export const PROJECT_SAVE_STATES = {
  SAVED: 'Saved',
  SAVING: 'Saving...',
  FAILED: 'Save failed / retry required',
  CONFLICT: 'Conflict requiring attention'
};

/**
 * useProject Hook (PRJ-001 / PRJ-006)
 *
 * Real-time project retrieval, metadata draft preservation, continuous autosave,
 * and optimistic concurrency conflict protection.
 * Operates purely on supplied canonical projects boundary.
 *
 * @param {Object} options
 * @param {string} options.projectId - Active project ID
 * @param {Array<Object>} options.projects - Canonical projects collection
 * @param {Array<Object>} options.workItems - Canonical workItems
 * @param {Function} options.onUpdateProject - (id, updates, expectedVersion) => Promise<boolean|void> | boolean | void
 * @param {Function} [options.isAccessible] - Zero-leakage authorization resolver
 * @returns {Object}
 */
export function useProject({
  projectId,
  projects = [],
  workItems = [],
  onUpdateProject,
  isAccessible = () => true
} = {}) {
  const canonicalProject = useMemo(() => {
    return (projects || []).find((p) => p.id === projectId) || null;
  }, [projectId, projects]);

  const [draftName, setDraftName] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [saveState, setSaveState] = useState(PROJECT_SAVE_STATES.SAVED);
  const [saveError, setSaveError] = useState(null);
  const [isConflict, setIsConflict] = useState(false);

  const lastSavedVersionRef = useRef(canonicalProject?.version || 1);
  const isDirtyRef = useRef(false);

  // Sync draft when canonical project changes externally
  useEffect(() => {
    if (canonicalProject) {
      if (!isDirtyRef.current) {
        setDraftName(canonicalProject.name || '');
        setDraftSummary(canonicalProject.summary || '');
        lastSavedVersionRef.current = canonicalProject.version || 1;
        setSaveState(PROJECT_SAVE_STATES.SAVED);
        setSaveError(null);
        setIsConflict(false);
      } else if (canonicalProject.version > lastSavedVersionRef.current) {
        // Upstream version moved ahead while local edit is pending: conflict!
        setIsConflict(true);
        setSaveState(PROJECT_SAVE_STATES.CONFLICT);
      }
    }
  }, [canonicalProject?.id, canonicalProject?.version]);

  const updateName = useCallback((val) => {
    setDraftName(val);
    isDirtyRef.current = true;
    setSaveState(PROJECT_SAVE_STATES.SAVED);
  }, []);

  const updateSummary = useCallback((val) => {
    setDraftSummary(val);
    isDirtyRef.current = true;
    setSaveState(PROJECT_SAVE_STATES.SAVED);
  }, []);

  // Save executor with expectedVersion concurrency precondition
  const executeSave = useCallback(
    async (forcedUpdates = null) => {
      if (!canonicalProject || !onUpdateProject) return;

      const updates = forcedUpdates || {
        name: draftName,
        summary: draftSummary,
        version: (lastSavedVersionRef.current || 1) + 1,
        updatedAt: new Date().toISOString()
      };

      const expectedVersion = lastSavedVersionRef.current || 1;

      // Optimistic concurrency check before submission
      if (canonicalProject.version > expectedVersion) {
        setIsConflict(true);
        setSaveState(PROJECT_SAVE_STATES.CONFLICT);
        return;
      }

      setSaveState(PROJECT_SAVE_STATES.SAVING);
      setSaveError(null);

      try {
        const result = await onUpdateProject(canonicalProject.id, updates, expectedVersion);
        if (result === false) {
          setIsConflict(true);
          setSaveState(PROJECT_SAVE_STATES.CONFLICT);
          return;
        }
        isDirtyRef.current = false;
        lastSavedVersionRef.current = updates.version || (expectedVersion + 1);
        setSaveState(PROJECT_SAVE_STATES.SAVED);
      } catch (err) {
        setSaveState(PROJECT_SAVE_STATES.FAILED);
        setSaveError(err.message || 'Save failed');
      }
    },
    [canonicalProject, onUpdateProject, draftName, draftSummary]
  );

  const progress = useMemo(() => {
    return calculateProjectProgress(projectId, workItems, isAccessible);
  }, [projectId, workItems, isAccessible]);

  return {
    project: canonicalProject,
    draftName,
    draftSummary,
    updateName,
    updateSummary,
    saveState,
    saveError,
    isConflict,
    executeSave,
    progress
  };
}
