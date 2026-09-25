import React, { useRef, useEffect, useCallback } from 'react';
import { Dialog } from '../../../design-system';
import { QuickCreateForm } from './QuickCreateForm';
import { useQuickCreate } from './useQuickCreate';

/**
 * QuickCreateDialog Component
 * Primary WorkItem creation modal replacing the legacy prototype CreateItemModal.
 * Supports Desktop compact modal and Mobile responsive presentation.
 */
export function QuickCreateDialog({
  isOpen,
  onClose,
  onCreate,
  onOpenItem,
  activeTeamId,
  activeProjectId,
  activeCycleId,
  invocationContext = null,
  initialContext = null
}) {
  const invocationElementRef = useRef(null);
  const skipRestoreRef = useRef(false);
  const prevIsOpenRef = useRef(false);

  // Capture invocation element before dialog takes focus
  if (isOpen && !prevIsOpenRef.current) {
    invocationElementRef.current = document.activeElement;
    skipRestoreRef.current = false;
  }
  prevIsOpenRef.current = Boolean(isOpen);

  const restoreFocus = useCallback(() => {
    if (!skipRestoreRef.current && invocationElementRef.current) {
      const el = invocationElementRef.current;
      invocationElementRef.current = null;
      if (typeof el.focus === 'function') {
        el.focus();
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    restoreFocus();
    onClose?.();
  }, [onClose, restoreFocus]);

  useEffect(() => {
    return () => {
      restoreFocus();
    };
  }, [restoreFocus]);

  const context = invocationContext || initialContext || {
    teamId: activeTeamId,
    projectId: activeProjectId,
    cycleId: activeCycleId
  };

  const {
    title,
    setTitle,
    description,
    setDescription,
    teamId,
    setTeamId,
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
  } = useQuickCreate({
    isOpen,
    invocationContext: context,
    onCreate,
    onSuccess: (createdItem, mode) => {
      if (mode === 'open') {
        skipRestoreRef.current = true;
        if (onOpenItem) {
          onOpenItem(createdItem);
        }
      }
    },
    onClose: handleClose
  });

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="New Work Item"
      width="560px" // tunable default desktop token
    >
      <QuickCreateForm
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        teamId={teamId}
        setTeamId={setTeamId}
        projectId={projectId}
        setProjectId={setProjectId}
        cycleId={cycleId}
        setCycleId={setCycleId}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
        labels={labels}
        setLabels={setLabels}
        dueDate={dueDate}
        setDueDate={setDueDate}
        createAnother={createAnother}
        setCreateAnother={setCreateAnother}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={submit}
        onClose={handleClose}
      />
    </Dialog>
  );
}
