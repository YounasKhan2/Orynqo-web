import React, { useState } from 'react';
import {
  Copy,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  User,
  Send,
  FileText
} from 'lucide-react';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../../constants/workItems';
import { Drawer, PropertyRow, Checkbox } from '../../../design-system';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../../components/badges';
import { UserAvatar } from '../../../components/avatars/UserAvatar';
import { USERS, PROJECTS, CYCLES } from '../../../data/mockData';

/**
 * InspectorDrawer Component
 * Bounded feature component for viewing and editing WorkItem details
 * Preserves active view context using the Drawer primitive
 */
export function InspectorDrawer({
  item,
  isOpen,
  onClose,
  onUpdateItem,
  onOpenSpec
}) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: USERS[1],
      text: 'Verified that this unblocks the mobile background sync daemon milestone.',
      timestamp: '2h ago'
    }
  ]);

  if (!isOpen || !item) return null;

  const assignee = USERS.find((u) => u.id === item.assigneeId);
  const project = PROJECTS.find((p) => p.id === item.projectId);
  const cycle = CYCLES.find((c) => c.id === item.cycleId);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: USERS[0],
        text: newComment,
        timestamp: 'Just now'
      }
    ]);
    setNewComment('');
  };

  const toggleSubtask = (subId) => {
    const updatedSubtasks = (item.subtasks || []).map((sub) =>
      sub.id === subId ? { ...sub, done: !sub.done } : sub
    );
    onUpdateItem?.(item.id, { subtasks: updatedSubtasks });
  };

  const headerTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span className="font-mono" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-muted)' }}>
        {item.identifier}
      </span>
      <TypeBadge typeId={item.type} />
    </div>
  );

  const headerActions = (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(window.location.href);
      }}
      title="Copy reference link"
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Copy size={13} />
    </button>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={headerTitle}
      headerActions={headerActions}
      width="420px"
      side="right"
      isDocked={true}
    >
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Title Textarea */}
        <div>
          <textarea
            value={item.title}
            onChange={(e) => onUpdateItem?.(item.id, { title: e.target.value })}
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text-primary)',
              resize: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              lineHeight: 'var(--line-height-tight)'
            }}
          />
        </div>

        {/* Properties Matrix */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-2) 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {/* Status */}
          <PropertyRow label="Status" icon={Clock}>
            <StatusBadge
              statusId={item.status}
              interactive
              onClick={() => {
                const statusKeys = Object.keys(STATUS_DEFINITIONS);
                const nextIdx = (statusKeys.indexOf(item.status) + 1) % statusKeys.length;
                onUpdateItem?.(item.id, { status: statusKeys[nextIdx] });
              }}
            />
          </PropertyRow>

          {/* Priority */}
          <PropertyRow label="Priority" icon={AlertTriangle}>
            <PriorityBadge
              priorityId={item.priority}
              interactive
              onClick={() => {
                const priorityKeys = ['none', 'low', 'medium', 'high', 'urgent'];
                const nextIdx = (priorityKeys.indexOf(item.priority) + 1) % priorityKeys.length;
                onUpdateItem?.(item.id, { priority: priorityKeys[nextIdx] });
              }}
            />
          </PropertyRow>

          {/* Assignee */}
          <PropertyRow label="Assignee" icon={User}>
            <UserAvatar user={assignee} size="xs" showName />
          </PropertyRow>

          {/* Estimate */}
          <PropertyRow label="Estimate" icon={Layers}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number"
                value={item.estimate || ''}
                onChange={(e) => onUpdateItem?.(item.id, { estimate: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: '44px',
                  height: '22px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>pts</span>
            </div>
          </PropertyRow>

          {/* Project */}
          <PropertyRow label="Project" icon={Calendar}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {project ? project.name : 'Ad-hoc Task'}
            </span>
          </PropertyRow>

          {/* Cycle */}
          <PropertyRow label="Cycle" icon={Clock}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {cycle ? cycle.name : 'Backlog'}
            </span>
          </PropertyRow>
        </div>

        {/* Living Spec Bi-Directional Binding Notice */}
        {item.specDocId && (
          <div
            onClick={onOpenSpec}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-base)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} color="var(--primary-text)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                  Linked to Living PRD
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  PRD: Offline-First Synchronization
                </span>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--primary-text)', fontWeight: 'var(--font-semibold)' }}>
              View Spec →
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Description
          </div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              lineHeight: 'var(--line-height-normal)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)'
            }}
          >
            {item.description || 'No detailed specification provided.'}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
              Subtasks ({(item.subtasks || []).filter(s => s.done).length}/{(item.subtasks || []).length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(item.subtasks || []).map((sub) => (
              <div
                key={sub.id}
                onClick={() => toggleSubtask(sub.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 6px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                  color: sub.done ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: sub.done ? 'line-through' : 'none'
                }}
              >
                <Checkbox checked={sub.done} onChange={() => toggleSubtask(sub.id)} />
                <span>{sub.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity & Threaded Comments */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
          <div style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Activity & Discussion
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserAvatar user={c.author} size="xs" />
                    <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{c.author.name}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.timestamp}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-normal)' }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Input Footer */}
        <form
          onSubmit={handleAddComment}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingTop: 'var(--space-2)'
          }}
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment or update..."
            style={{
              flex: 1,
              height: '28px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '0 8px',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            style={{
              height: '28px',
              padding: '0 10px',
              backgroundColor: 'var(--primary-base)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
              opacity: newComment.trim() ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </Drawer>
  );
}
