import React, { useRef, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button, Checkbox, Kbd } from '../../../design-system';
import {
  TypePicker,
  StatusPicker,
  PriorityPicker,
  AssigneePicker,
  TeamPicker,
  ProjectPicker,
  CyclePicker,
  LabelsPicker,
  DatePicker
} from '../property-pickers';

/**
 * QuickCreateForm Component
 * Presentation form for Quick Create composing Universal Property Pickers.
 */
export function QuickCreateForm({
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
  onSubmit,
  onClose
}) {
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        onSubmit?.('open');
      } else {
        onSubmit?.('close');
      }
    }
  };

  const isTeamMissing = !teamId;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.('close');
      }}
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        fontSize: 'var(--text-xs, 12px)'
      }}
    >
      {/* Top Identity Tier: Type + Team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <TypePicker value={type} onSelect={setType} />
        <TeamPicker
          value={teamId}
          onSelect={setTeamId}
          className={isTeamMissing ? 'team-required-highlight' : ''}
          style={isTeamMissing ? { borderColor: 'var(--priority-urgent, #ef4444)' } : {}}
        />
        {isTeamMissing && (
          <span style={{ fontSize: '10px', color: 'var(--priority-urgent, #ef4444)', fontWeight: 'var(--font-medium)' }}>
            Select execution team *
          </span>
        )}
      </div>

      {/* Primary Content Tier: Title Input */}
      <div>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Work item title..."
          aria-label="Work item title"
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            fontWeight: 'var(--font-semibold, 600)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            padding: '2px 0'
          }}
        />
      </div>

      {/* Description Textarea */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add context, technical specifications, or markdown notes..."
          rows={3}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface, rgba(255, 255, 255, 0.02))',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: 'var(--radius-xs, 4px)',
            padding: '8px',
            fontSize: '11px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'none',
            lineHeight: '1.4'
          }}
        />
      </div>

      {/* Horizontal Property Strip Tier */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          padding: '8px 0',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))'
        }}
      >
        <StatusPicker value={status} teamId={teamId || 'team-core'} onSelect={setStatus} />
        <PriorityPicker value={priority} onSelect={setPriority} />
        <AssigneePicker value={assigneeId} onSelect={setAssigneeId} />
        <ProjectPicker value={projectId} onSelect={setProjectId} />
        <CyclePicker value={cycleId} teamId={teamId || 'team-core'} onSelect={setCycleId} />
        <LabelsPicker value={labels} onSelect={setLabels} />
        <DatePicker value={dueDate} onSelect={setDueDate} label="Due Date" />
      </div>

      {/* Error notification banner if failure occurred */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            backgroundColor: 'var(--priority-urgent-bg, rgba(239, 68, 68, 0.1))',
            border: '1px solid var(--priority-urgent, #ef4444)',
            borderRadius: 'var(--radius-xs, 4px)',
            color: 'var(--priority-urgent, #ef4444)',
            fontSize: '11px'
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Footer & Submission Tier */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '4px',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Checkbox
            id="create-another-checkbox"
            checked={createAnother}
            onChange={(checked) => setCreateAnother(checked)}
            label="Create another"
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            <Kbd>⌘↵</Kbd> create • <Kbd>⌘⇧↵</Kbd> create & open
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            aria-label="Create work item"
            onClick={() => onSubmit?.('close')}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
