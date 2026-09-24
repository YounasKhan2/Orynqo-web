import React, { useState, useRef } from 'react';
import { MessageSquare, History, AlertCircle, Lock } from 'lucide-react';
import { WorkItemHeader } from './WorkItemHeader';
import { WorkItemTitle } from './WorkItemTitle';
import { WorkItemProperties } from './WorkItemProperties';
import { WorkItemLinkedDocs } from './WorkItemLinkedDocs';
import { WorkItemDescription } from './WorkItemDescription';
import { WorkItemSubItems } from './WorkItemSubItems';
import { WorkItemRelationships } from './WorkItemRelationships';
import { WorkItemDiscussion } from './WorkItemDiscussion';
import { WorkItemActivity } from './WorkItemActivity';
import { USERS, TEAMS, PROJECTS, CYCLES } from '../../../data/mockData';

/**
 * WorkItemDetailContainer Component
 * Canonical content and interaction engine for WorkItems
 * Reused identically in Inspector Drawer, Maximized Canvas, and Full-Screen Mobile
 */
export function WorkItemDetailContainer({
  item,
  onUpdateItem,
  onOpenSpec,
  onClose,
  isExpanded = false,
  onToggleExpand,
  isReadOnly = false,
  isLoading = false,
  isRestricted = false,
  isNotFound = false,
  currentUser = USERS[0],
  className = '',
  style = {}
}) {
  const [activeTab, setActiveTab] = useState('discussion'); // 'discussion' | 'activity'
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: USERS[1] || { name: 'Sarah Jenkins' },
      text: 'Verified that this unblocks the mobile background sync daemon milestone.',
      timestamp: '2h ago',
      reactions: [{ emoji: '👍', count: 2 }]
    }
  ]);

  const titleInputRef = useRef(null);
  const descEditorRef = useRef(null);
  const commentInputRef = useRef(null);

  // If loading, show high-density skeleton
  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }}>
        <div style={{ height: '24px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', opacity: 0.6 }} />
        <div style={{ height: '32px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', opacity: 0.6 }} />
        <div style={{ height: '140px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', opacity: 0.6 }} />
        <div style={{ height: '80px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', opacity: 0.6 }} />
      </div>
    );
  }

  // If tombstone / not found
  if (isNotFound || !item) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', ...style }}>
        <AlertCircle size={28} color="var(--text-muted)" />
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
          Work Item Not Found
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          This item may have been archived, deleted, or transferred.
        </div>
      </div>
    );
  }

  // If restricted
  if (isRestricted) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', ...style }}>
        <Lock size={28} color="var(--text-muted)" />
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
          Access Restricted
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          You do not have permission to view this work item.
        </div>
      </div>
    );
  }

  const assignee = USERS.find((u) => u.id === item.assigneeId);
  const team = TEAMS.find((t) => t.id === item.teamId);
  const project = PROJECTS.find((p) => p.id === item.projectId);
  const cycle = CYCLES.find((c) => c.id === item.cycleId);

  // Default activity events
  const defaultActivities = [
    {
      id: 'act-1',
      actor: USERS[0],
      action: 'changed status',
      from: 'Todo',
      to: 'In Progress',
      timestamp: '1h ago'
    },
    {
      id: 'act-2',
      actor: USERS[2],
      action: 'assigned item to',
      to: assignee?.name || 'Assignee',
      timestamp: '3h ago'
    },
    {
      id: 'act-3',
      actor: USERS[1],
      action: 'created work item',
      timestamp: item.createdAt ? 'Recently' : 'Yesterday'
    }
  ];

  const handleAddComment = (text) => {
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: currentUser,
        text,
        timestamp: 'Just now'
      }
    ]);
  };

  const handleToggleSubtask = (subId) => {
    const updated = (item.subtasks || []).map((s) =>
      s.id === subId ? { ...s, done: !s.done } : s
    );
    onUpdateItem?.(item.id, { subtasks: updated });
  };

  const handleAddSubtask = (title) => {
    const newSub = {
      id: `sub-${Date.now()}`,
      title,
      done: false
    };
    onUpdateItem?.(item.id, { subtasks: [...(item.subtasks || []), newSub] });
  };

  return (
    <div
      className={`work-item-detail-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        ...style
      }}
    >
      {/* 1. Header */}
      <WorkItemHeader
        item={item}
        teamName={team?.name}
        projectName={project?.name}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        isSubscribed={isSubscribed}
        onToggleSubscribe={() => setIsSubscribed((p) => !p)}
        onClose={onClose}
        isReadOnly={isReadOnly}
      />

      {/* 2. Title */}
      <WorkItemTitle
        inputRef={titleInputRef}
        title={item.title}
        onUpdateTitle={(title) => onUpdateItem?.(item.id, { title })}
        isReadOnly={isReadOnly}
      />

      {/* 3. Properties Matrix */}
      <WorkItemProperties
        item={item}
        assignee={assignee}
        project={project}
        cycle={cycle}
        team={team}
        onUpdateItem={(patch) => onUpdateItem?.(item.id, patch)}
        isReadOnly={isReadOnly}
      />

      {/* 4. Linked Living Spec PRD Banner */}
      <WorkItemLinkedDocs item={item} onOpenSpec={onOpenSpec} />

      {/* 5. Description */}
      <WorkItemDescription
        editorRef={descEditorRef}
        description={item.description}
        onUpdateDescription={(description) => onUpdateItem?.(item.id, { description })}
        isReadOnly={isReadOnly}
      />

      {/* 6. Sub-Items Checklist */}
      <WorkItemSubItems
        subtasks={item.subtasks || []}
        onToggleSubtask={handleToggleSubtask}
        onAddSubtask={handleAddSubtask}
        isReadOnly={isReadOnly}
      />

      {/* 7. Relationships & Dependencies */}
      <WorkItemRelationships
        relations={item.relations || []}
        onNavigateToItem={(targetKey) => {
          // If navigation handler provided, pass target key
        }}
      />

      {/* 8. Collaboration Hub (Segmented Tabs: Discussion vs Activity) */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: activeTab === 'discussion' ? 'var(--font-semibold)' : 'var(--font-normal)',
              color: activeTab === 'discussion' ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'discussion' ? 'var(--bg-surface)' : 'transparent',
              border: activeTab === 'discussion' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={12} />
            <span>Discussion ({comments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: activeTab === 'activity' ? 'var(--font-semibold)' : 'var(--font-normal)',
              color: activeTab === 'activity' ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'activity' ? 'var(--bg-surface)' : 'transparent',
              border: activeTab === 'activity' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <History size={12} />
            <span>Activity ({defaultActivities.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'discussion' ? (
          <WorkItemDiscussion
            composerRef={commentInputRef}
            comments={comments}
            onAddComment={handleAddComment}
            currentUser={currentUser}
            isReadOnly={isReadOnly}
          />
        ) : (
          <WorkItemActivity activities={defaultActivities} />
        )}
      </div>
    </div>
  );
}
