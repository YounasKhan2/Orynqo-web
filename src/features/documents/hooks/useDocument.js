import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { resolveBreadcrumbs } from '../model';

export const SAVE_STATES = {
  SAVED: 'Saved',
  SAVING: 'Saving...',
  FAILED: 'Save failed / retry required',
  CONFLICT: 'Conflict requiring attention'
};

/**
 * useDocument Hook (DOC-002)
 *
 * Real-time document retrieval, continuous autosave, data-loss protection,
 * and optimistic concurrency conflict protection.
 * Operates purely on supplied documents boundary.
 *
 * @param {Object} options
 * @param {string} options.documentId - Active document ID
 * @param {Array<Object>} options.documents - Canonical documents collection
 * @param {Function} options.onUpdateDocument - (id, updates) => Promise<boolean|void> | boolean | void
 * @param {number} [options.debounceMs=500] - Tunable autosave debounce delay
 * @param {Function} [options.isAccessible] - Authorization resolver
 */
export function useDocument({
  documentId,
  documents = [],
  onUpdateDocument,
  debounceMs = 500,
  isAccessible = () => true
} = {}) {
  // Find canonical document
  const canonicalDoc = useMemo(() => {
    return (documents || []).find((d) => d.id === documentId) || null;
  }, [documentId, documents]);

  // Local draft state for continuous typing & data-loss protection
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState(null);
  const [saveState, setSaveState] = useState(SAVE_STATES.SAVED);
  const [saveError, setSaveError] = useState(null);
  const [isConflict, setIsConflict] = useState(false);

  // Tracking refs
  const lastSavedVersionRef = useRef(canonicalDoc?.version || 1);
  const debounceTimerRef = useRef(null);
  const isDirtyRef = useRef(false);
  const inFlightSaveRef = useRef(false);

  // Sync draft when documentId changes or initial load
  useEffect(() => {
    if (canonicalDoc) {
      // Only overwrite draft if not currently dirty with pending changes
      if (!isDirtyRef.current) {
        setDraftTitle(canonicalDoc.title || '');
        const initialContent = canonicalDoc.content || (canonicalDoc.blocks ? { blocks: canonicalDoc.blocks } : { blocks: [] });
        setDraftContent(initialContent);
        lastSavedVersionRef.current = canonicalDoc.version || 1;
        setSaveState(SAVE_STATES.SAVED);
        setSaveError(null);
        setIsConflict(false);
      } else if (canonicalDoc.version > lastSavedVersionRef.current) {
        // Concurrency conflict detected! Upstream changed while local has pending edits.
        setIsConflict(true);
        setSaveState(SAVE_STATES.CONFLICT);
      }
    }
  }, [canonicalDoc?.id]);

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const draftTitleRef = useRef(draftTitle);
  const draftContentRef = useRef(draftContent);

  useEffect(() => {
    draftTitleRef.current = draftTitle;
  }, [draftTitle]);

  useEffect(() => {
    draftContentRef.current = draftContent;
  }, [draftContent]);

  // Internal save executor
  const executeSave = useCallback(async (forcedUpdates = null) => {
    if (!canonicalDoc || !onUpdateDocument) return;

    const currentTitle = draftTitleRef.current;
    const currentContent = draftContentRef.current;

    const updates = forcedUpdates || {
      title: currentTitle,
      content: currentContent,
      updatedAt: new Date().toISOString(),
      version: (lastSavedVersionRef.current || 1) + 1
    };

    // Concurrency check before write
    if (canonicalDoc.version > lastSavedVersionRef.current) {
      setIsConflict(true);
      setSaveState(SAVE_STATES.CONFLICT);
      return;
    }

    inFlightSaveRef.current = true;
    setSaveState(SAVE_STATES.SAVING);
    setSaveError(null);

    try {
      const result = await onUpdateDocument(canonicalDoc.id, updates);
      if (result === false) {
        throw new Error('Server rejected document update');
      }
      isDirtyRef.current = false;
      lastSavedVersionRef.current = updates.version;
      setSaveState(SAVE_STATES.SAVED);
      setSaveError(null);
    } catch (err) {
      // DATA-LOSS PROTECTION: Local state remains 100% intact
      setSaveState(SAVE_STATES.FAILED);
      setSaveError(err.message || 'Failed to save changes. Local edits preserved.');
    } finally {
      inFlightSaveRef.current = false;
    }
  }, [canonicalDoc, onUpdateDocument]);

  // Continuous autosave scheduling
  const scheduleAutosave = useCallback(() => {
    isDirtyRef.current = true;
    setSaveState(SAVE_STATES.SAVING);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSave();
    }, debounceMs);
  }, [executeSave, debounceMs]);

  // Content change handler
  const updateContent = useCallback((newContent) => {
    draftContentRef.current = newContent;
    setDraftContent(newContent);
    scheduleAutosave();
  }, [scheduleAutosave]);

  // Title change handler
  const updateTitle = useCallback((newTitle) => {
    draftTitleRef.current = newTitle;
    setDraftTitle(newTitle);
    scheduleAutosave();
  }, [scheduleAutosave]);

  // Explicit Retry action on failure
  const retrySave = useCallback(() => {
    executeSave();
  }, [executeSave]);

  // Breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    if (!documentId) return [];
    return resolveBreadcrumbs(documentId, documents, isAccessible);
  }, [documentId, documents, isAccessible]);

  return {
    document: canonicalDoc,
    draftTitle,
    draftContent,
    saveState,
    saveError,
    isConflict,
    isDirty: isDirtyRef.current,
    breadcrumbs,
    updateTitle,
    updateContent,
    retrySave
  };
}
