import React, { useState } from 'react';
import { TEAMS, PROJECTS, USERS } from '../../../data/mockData';
import { PRIORITY_DEFINITIONS, ITEM_TYPE_DEFINITIONS } from '../../../constants/workItems';
import { Dialog, Button, Kbd } from '../../../design-system';

/**
 * CreateItemModal Component
 * Fast modal dialog triggered by "C" shortcut for quick work item creation
 * Uses the Dialog primitive
 */
export function CreateItemModal({
  isOpen,
  onClose,
  onCreate,
  activeTeamId
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(activeTeamId || 'team-core');
  const [projectId, setProjectId] = useState('proj-1');
  const [type, setType] = useState('task');
  const [priority, setPriority] = useState('medium');
  const [estimate, setEstimate] = useState(3);
  const [assigneeId, setAssigneeId] = useState('usr-1');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    const team = TEAMS.find((t) => t.id === teamId) || TEAMS[0];
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newItem = {
      id: `item-${Date.now()}`,
      identifier: `${team.key}-${randomNum}`,
      title: title.trim(),
      description: description.trim(),
      teamId,
      projectId,
      type,
      status: 'todo',
      priority,
      estimate: Number(estimate) || 0,
      assigneeId,
      subtasks: [],
      blockedBy: [],
      blocks: [],
      createdAt: new Date().toISOString(),
      commentsCount: 0
    };

    onCreate?.(newItem);
    setTitle('');
    setDescription('');
    onClose?.();
  };

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
        Press <Kbd>⌘↵</Kbd> to create
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!title.trim()}>
          Create Item
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="New Work Item"
      width="540px"
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Title Input */}
        <input
          type="text"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title or deliverable..."
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'var(--font-sans)'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add context, acceptance criteria, or technical details..."
          rows={3}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '8px',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)',
            resize: 'none',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            lineHeight: 'var(--line-height-normal)'
          }}
        />

        {/* Property Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
          {/* Team Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              style={{
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                padding: '0 6px',
                outline: 'none'
              }}
            >
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.key})</option>
              ))}
            </select>
          </div>

          {/* Project Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                padding: '0 6px',
                outline: 'none'
              }}
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Type Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                padding: '0 6px',
                outline: 'none'
              }}
            >
              {Object.values(ITEM_TYPE_DEFINITIONS).map((tp) => (
                <option key={tp.id} value={tp.id}>{tp.label}</option>
              ))}
            </select>
          </div>

          {/* Priority Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                padding: '0 6px',
                outline: 'none'
              }}
            >
              {Object.values(PRIORITY_DEFINITIONS).map((pr) => (
                <option key={pr.id} value={pr.id}>{pr.label}</option>
              ))}
            </select>
          </div>

          {/* Assignee Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              style={{
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                padding: '0 6px',
                outline: 'none'
              }}
            >
              {USERS.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Estimate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimate (Points)</label>
            <input
              type="number"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              style={{
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                padding: '0 8px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
