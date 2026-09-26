import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Archive,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { MILESTONE_STATUS } from '../model/projectModel';

/**
 * ProjectMilestonesTab Component (PRJ-004)
 *
 * Project-owned sequential delivery gates:
 * - Ordered sequence of milestones.
 * - Invariant: WorkItem belongs to 0..1 Milestone.
 * - Non-destructive archive semantics: preserves historical WorkItem associations.
 * - Milestone completion does NOT complete WorkItems; surfaces unresolved open items.
 */
export function ProjectMilestonesTab({
  project,
  milestones = [],
  workItems = [],
  onAddMilestone,
  onUpdateMilestone,
  onCompleteMilestone,
  onArchiveMilestone,
  onOpenWorkItem,
  canManage = true
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState(() => new Set());
  const [showArchived, setShowArchived] = useState(false);

  const toggleExpand = (id) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;

    onAddMilestone?.({
      name: newMilestoneName.trim(),
      targetDate: newTargetDate || null
    });

    setNewMilestoneName('');
    setNewTargetDate('');
    setIsCreating(false);
  };

  // Filter milestones based on showArchived toggle
  const visibleMilestones = (milestones || []).filter((m) => {
    if (m.projectId !== project?.id) return false;
    if (!showArchived && m.status === MILESTONE_STATUS.ARCHIVED) return false;
    return true;
  });

  return (
    <div
      role="region"
      aria-label="Project Milestones"
      data-testid="project-milestones-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        padding: 'var(--space-6, 24px)',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        gap: 'var(--space-4, 16px)'
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="var(--primary-base, #3b82f6)" />
          <h2 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            Delivery Milestones ({visibleMilestones.length})
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            <span>Show Archived</span>
          </label>

          {canManage && (
            <button
              type="button"
              data-testid="create-milestone-btn"
              onClick={() => setIsCreating(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '30px',
                padding: '0 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--primary-base, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                fontSize: 'var(--text-xs, 12px)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>New Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Create Milestone Form */}
      {isCreating && (
        <form
          data-testid="create-milestone-form"
          onSubmit={handleCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)'
          }}
        >
          <input
            type="text"
            data-testid="milestone-name-input"
            placeholder="Milestone name (e.g. M1: Alpha Preview)"
            value={newMilestoneName}
            onChange={(e) => setNewMilestoneName(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              height: '32px',
              padding: '0 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-surface-raised, #334155)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              fontSize: '13px'
            }}
          />

          <input
            type="date"
            data-testid="milestone-target-date-input"
            value={newTargetDate}
            onChange={(e) => setNewTargetDate(e.target.value)}
            style={{
              height: '32px',
              padding: '0 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-surface-raised, #334155)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-default, #475569)',
              fontSize: '12px'
            }}
          />

          <button
            type="submit"
            data-testid="submit-milestone-btn"
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '4px',
              backgroundColor: 'var(--primary-base, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(false)}
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #94a3b8)',
              border: '1px solid var(--border-default, #475569)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Milestones List */}
      {visibleMilestones.length === 0 ? (
        <div
          data-testid="project-milestones-empty"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12, 48px) var(--space-4, 16px)',
            gap: 'var(--space-3, 12px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            color: 'var(--text-muted, #94a3b8)'
          }}
        >
          <Target size={32} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', margin: '0 0 4px' }}>
              No milestones defined
            </h3>
            <p style={{ fontSize: 'var(--text-xs, 12px)', margin: 0 }}>
              Milestones act as sequential delivery gates to group and sequence project execution.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visibleMilestones.map((m) => {
            const isExpanded = expandedMilestones.has(m.id);
            const isCompleted = m.status === MILESTONE_STATUS.COMPLETED;
            const isArchived = m.status === MILESTONE_STATUS.ARCHIVED;

            // WorkItems associated with this milestone
            const associatedItems = (workItems || []).filter((it) => it.milestoneId === m.id);
            const completedCount = associatedItems.filter((it) => it.status === 'done' || it.status === 'completed').length;
            const openCount = associatedItems.length - completedCount;

            return (
              <div
                key={m.id}
                data-testid={`milestone-card-${m.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bg-surface, #1e293b)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: isCompleted
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : isArchived
                    ? '1px dashed var(--border-default, #475569)'
                    : '1px solid var(--border-default, #334155)',
                  overflow: 'hidden'
                }}
              >
                {/* Milestone Summary Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleExpand(m.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', padding: 0, cursor: 'pointer' }}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    <CheckCircle2
                      size={18}
                      color={isCompleted ? 'var(--color-success, #22c55e)' : 'var(--text-muted, #64748b)'}
                    />

                    <div>
                      <span
                        data-testid={`milestone-name-${m.id}`}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--color-success, #22c55e)' : 'var(--text-primary, #f8fafc)',
                          textDecoration: isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {m.name}
                      </span>
                      {isArchived && (
                        <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                          [Archived]
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
                    {/* Item count ratio */}
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                      {completedCount} / {associatedItems.length} items
                    </span>

                    {/* Target Date */}
                    {m.targetDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                        <Clock size={13} />
                        <span>{m.targetDate}</span>
                      </div>
                    )}

                    {/* Actions Menu */}
                    {canManage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!isCompleted && !isArchived && (
                          <button
                            type="button"
                            data-testid={`complete-milestone-btn-${m.id}`}
                            onClick={() => {
                              // If there are open items, completeMilestone still completes milestone
                              // but does NOT complete items (invariants preserved)
                              onCompleteMilestone?.(m.id);
                            }}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              color: 'var(--color-success, #22c55e)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Completed
                          </button>
                        )}

                        {!isArchived && (
                          <button
                            type="button"
                            data-testid={`archive-milestone-btn-${m.id}`}
                            onClick={() => onArchiveMilestone?.(m.id)}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-muted, #94a3b8)',
                              border: '1px solid var(--border-default, #475569)',
                              cursor: 'pointer'
                            }}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded WorkItem listing */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                      padding: '12px 16px 12px 42px',
                      backgroundColor: 'rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {associatedItems.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                        No WorkItems associated with this milestone yet.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {associatedItems.map((item) => (
                          <div
                            key={item.id}
                            data-testid={`milestone-item-${item.id}`}
                            onClick={() => onOpenWorkItem?.(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-surface-raised, #334155)',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'monospace', color: 'var(--text-muted, #94a3b8)', fontSize: '11px' }}>
                                {item.identifier || item.id}
                              </span>
                              <span style={{ color: 'var(--text-primary, #f8fafc)', fontWeight: 500 }}>
                                {item.title}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: item.status === 'done' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: item.status === 'done' ? 'var(--color-success, #22c55e)' : 'var(--text-muted, #94a3b8)'
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
