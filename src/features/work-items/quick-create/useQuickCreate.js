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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [cycleId, setCycleId] = useState(null);
  const [type, setType] = useState('task');
  const [status, setStatus] = useState('todo');
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
    const initialProjectId = invocationContext.projectId || null;
    setProjectId(initialProjectId);

    // 2. Resolve Team Context with Multi-Team Project Rules
    let resolvedTeamId = '';
    if (initialProjectId) {
      const proj = PROJECTS.find((p) => p.id === initialProjectId);
      if (proj && proj.teamIds && proj.teamIds.length > 1) {
        // Multi-team project
        if (invocationContext.teamId && proj.teamIds.includes(invocationContext.teamId)) {
          resolvedTeamId = invocationContext.teamId;
        } else {
          // Ambiguous: DO NOT GUESS. Render "Select Team *"
          resolvedTeamId = '';
        }
      } else if (proj && proj.teamId) {
        resolvedTeamId = proj.teamId;
      } else if (invocationContext.teamId) {
        resolvedTeamId = invocationContext.teamId;
      }
    } else if (invocationContext.teamId !== undefined) {
      resolvedTeamId = invocationContext.teamId || '';
    } else {
      // Default to first accessible team if available in session
      resolvedTeamId = TEAMS[0]?.id || '';
    }
    setTeamId(resolvedTeamId);

    // 3. Resolve Cycle Context
    if (invocationContext.cycleId && resolvedTeamId) {
      const cycle = CYCLES.find((c) => c.id === invocationContext.cycleId);
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
  }, [isOpen, invocationContext]);

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

      const team = TEAMS.find((t) => t.id === teamId) || TEAMS[0];
      const randomNum = Math.floor(1000 + Math.random() * 9000);

      const newItemPayload = {
        id: `item-${Date.now()}`,
        identifier: `${team?.key || 'TASK'}-${randomNum}`,
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
        documentLinks: [],
        createdAt: new Date().toISOString(),
        commentsCount: 0
      };

      try {
        const result = onCreate?.(newItemPayload);
        const resolvedItem = result && typeof result.then === 'function' ? await result : (result || newItemPayload);

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
