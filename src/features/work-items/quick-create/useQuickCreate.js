import { useState, useEffect, useCallback, useRef } from 'react';
import { TEAMS, PROJECTS, CYCLES } from '../../../data/mockData';
import { getTeamDefaultStatus } from '../property-pickers/teamWorkflows';

/**
 * Custom hook managing Quick Create state, context inheritance, and submission lifecycle.
 *
 * Enforces UI-01C Precedence:
 * Explicit User Choice > Invocation View Context > Session Defaults > Team Defaults
 */
export function useQuickCreate({
  isOpen,
  invocationContext = {},
  onCreate,
  onSuccess,
  onClose
}) {
  const initialProjectId = invocationContext?.projectId || null;
  const initialTeamId = invocationContext?.teamId || null;
  const initialCycleId = invocationContext?.cycleId || null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(() => initialTeamId || '');
  const [projectId, setProjectId] = useState(() => initialProjectId);
  const [cycleId, setCycleId] = useState(() => initialCycleId);
  const [type, setType] = useState('task');
  const [status, setStatus] = useState(() =>
    initialTeamId ? getTeamDefaultStatus(initialTeamId, 'unstarted') : 'todo'
  );
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState(null);
  const [labels, setLabels] = useState([]);
  const [dueDate, setDueDate] = useState(null);

  const [createAnother, setCreateAnother] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // In-flight guard ref to block concurrent duplicate submissions
  const isSubmittingRef = useRef(false);

  // Initialize draft when opened with invocation context
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setIsSubmitting(false);
    isSubmittingRef.current = false;

    // 1. Resolve Project Context
    setProjectId(initialProjectId);

    // 2. Resolve Team Context with Multi-Team Project Rules
    let resolvedTeamId = '';
    if (initialProjectId) {
      const proj = PROJECTS.find((p) => p.id === initialProjectId);
      if (proj && proj.teamIds && proj.teamIds.length > 1) {
        // Multi-team project
        if (initialTeamId && proj.teamIds.includes(initialTeamId)) {
          resolvedTeamId = initialTeamId;
        } else {
          // Ambiguous: DO NOT GUESS. Render "Select Team *"
          resolvedTeamId = '';
        }
      } else if (proj && proj.teamId) {
        resolvedTeamId = proj.teamId;
      } else if (initialTeamId) {
        resolvedTeamId = initialTeamId;
      }
    } else if (initialTeamId) {
      resolvedTeamId = initialTeamId;
    } else {
      // Do NOT guess TEAMS[0]. Leave unselected to require explicit choice.
      resolvedTeamId = '';
    }
    setTeamId(resolvedTeamId);

    // 3. Resolve Cycle Context
    if (initialCycleId && resolvedTeamId) {
      const cycle = CYCLES.find((c) => c.id === initialCycleId);
      if (cycle && cycle.teamId === resolvedTeamId) {
        setCycleId(cycle.id);
      } else {
        setCycleId(null);
      }
    } else {
      setCycleId(null);
    }

    // 4. Resolve Dynamic Workflow Defaults
    if (resolvedTeamId) {
      setStatus(getTeamDefaultStatus(resolvedTeamId, 'unstarted'));
    } else {
      setStatus('todo');
    }

    setType('task');
    setPriority('medium');
    setAssigneeId(null);
    setLabels([]);
    setDueDate(null);
    setTitle('');
    setDescription('');
  }, [isOpen, initialProjectId, initialTeamId, initialCycleId]);

  // Handle Team change inside draft
  const handleTeamChange = useCallback((newTeamId) => {
    setTeamId(newTeamId);
    setError(null);

    // Dynamically update status to new team's default workflow status
    setStatus(getTeamDefaultStatus(newTeamId, 'unstarted'));

    // Validate cycle ownership
    setCycleId((prevCycleId) => {
      if (!prevCycleId) return null;
      const cycle = CYCLES.find((c) => c.id === prevCycleId);
      if (cycle && cycle.teamId === newTeamId) return prevCycleId;
      return null; // Reset cycle if invalid for new team
    });
  }, []);

  // Submit Handler with deduplication and failure preservation
  const submit = useCallback(
    async (mode = 'close') => {
      // Guard against duplicate submission while in flight
      if (isSubmittingRef.current || isSubmitting) return;

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError('Title is required');
        return;
      }

      if (!teamId) {
        setError('Team is required');
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setError(null);

      const creationInput = {
        title: trimmedTitle,
        description: description.trim(),
        teamId,
        projectId,
        cycleId,
        type,
        status,
        priority,
        assigneeId,
        labels,
        dueDate,
        workspaceId: 'wks-core',
        parentId: null,
        relations: [],
        documentLinks: []
      };

      try {
        const result = onCreate?.(creationInput);
        const resolvedItem = result && typeof result.then === 'function' ? await result : (result || creationInput);

        isSubmittingRef.current = false;
        setIsSubmitting(false);

        if (createAnother || mode === 'another') {
          // Reset item-specific fields
          setTitle('');
          setDescription('');
          setAssigneeId(null);
          setDueDate(null);
          setError(null);
          // Preserve container: teamId, projectId, cycleId, type, priority, labels
          onSuccess?.(resolvedItem, 'another');
        } else {
          onSuccess?.(resolvedItem, mode);
          onClose?.();
        }
      } catch (err) {
        // Failure preservation: 100% user input remains intact
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setError(err.message || 'Failed to create work item. Please try again.');
      }
    },
    [
      title,
      description,
      teamId,
      projectId,
      cycleId,
      type,
      status,
      priority,
      assigneeId,
      labels,
      dueDate,
      createAnother,
      isSubmitting,
      onCreate,
      onSuccess,
      onClose
    ]
  );

  return {
    title,
    setTitle,
    description,
    setDescription,
    teamId,
    setTeamId: handleTeamChange,
    projectId,
    setProjectId,
    cycleId,
    setCycleId,
    type,
    setType,
    status,
    setStatus,
    priority,
    setPriority,
    assigneeId,
    setAssigneeId,
    labels,
    setLabels,
    dueDate,
    setDueDate,
    createAnother,
    setCreateAnother,
    isSubmitting,
    error,
    submit
  };
}
