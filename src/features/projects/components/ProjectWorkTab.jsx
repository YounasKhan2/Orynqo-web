import React, { useState } from 'react';
import { DataGrid } from '../../../views/DataGrid/DataGrid';
import { KanbanBoard } from '../../../views/KanbanBoard/KanbanBoard';
import { TimelineView } from '../../../views/TimelineView/TimelineView';
import { Table, Kanban, Calendar, AlertCircle } from 'lucide-react';

/**
 * ProjectWorkTab Component (PRJ-002)
 *
 * Execution projection over canonical WorkItems associated with the Project:
 * - Reuses existing canonical views: Grid (WRK-001), Board (WRK-002), Timeline (WRK-003).
 * - Multi-team visibility: Shows owning team for each WorkItem without mutating ownership.
 * - Grouping by team, milestone, status, assignee, priority.
 * - Selecting WorkItem opens canonical WRK-005 WorkItemInspector.
 */
export function ProjectWorkTab({
  project,
  workItems = [],
  selectedItemId,
  onSelectItem,
  onOpenInspector,
  onCloseInspector,
  isInspectorOpen = false,
  onUpdateItem,
  density = 'compact',
  multiSelectedIds = [],
  onToggleMultiSelect,
  onSelectAll,
  onClearSelection,
  isKeyboardActive = true,
  onQuickCreate,
  userTimezone
}) {
  const [projection, setProjection] = useState('grid'); // 'grid' | 'board' | 'timeline'
  const [groupBy, setGroupBy] = useState('team'); // 'team' | 'milestone' | 'status' | 'assignee' | 'priority'

  // Filter canonical workItems for this project
  const projectItems = (workItems || []).filter(
    (item) => item.projectId === project?.id && !item.isArchived
  );

  return (
    <div
      role="region"
      aria-label="Project Work"
      data-testid="project-work-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas, #0f172a)'
      }}
    >
      {/* Sub-toolbar: Grouping options & Projection selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4, 16px)',
          height: '40px',
          backgroundColor: 'var(--bg-surface-subtle, rgba(255,255,255,0.02))',
          borderBottom: '1px solid var(--border-default, #334155)',
          flexShrink: 0
        }}
      >
        {/* Left: Item Count & Grouping */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)' }}>
          <span
            data-testid="project-work-count"
            style={{
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            {projectItems.length} {projectItems.length === 1 ? 'WorkItem' : 'WorkItems'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>Group by:</span>
            <select
              aria-label="Group WorkItems By"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              style={{
                height: '24px',
                fontSize: '11px',
                backgroundColor: 'var(--bg-surface, #1e293b)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-default, #334155)',
                borderRadius: '4px',
                padding: '0 6px',
                cursor: 'pointer'
              }}
            >
              <option value="team">Team (Multi-squad)</option>
              <option value="milestone">Milestone</option>
              <option value="status">Status</option>
              <option value="assignee">Assignee</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {/* Right: Projection Switcher (Grid | Board | Timeline) */}
        <div
          role="tablist"
          aria-label="Project Work Projections"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'var(--bg-surface-raised, #334155)',
            padding: '2px',
            borderRadius: '6px'
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={projection === 'grid'}
            data-testid="projection-grid-btn"
            onClick={() => setProjection('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: projection === 'grid' ? 'var(--primary-base, #3b82f6)' : 'transparent',
              color: projection === 'grid' ? '#ffffff' : 'var(--text-secondary, #94a3b8)'
            }}
          >
            <Table size={13} />
            <span>Grid</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={projection === 'board'}
            data-testid="projection-board-btn"
            onClick={() => setProjection('board')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: projection === 'board' ? 'var(--primary-base, #3b82f6)' : 'transparent',
              color: projection === 'board' ? '#ffffff' : 'var(--text-secondary, #94a3b8)'
            }}
          >
            <Kanban size={13} />
            <span>Board</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={projection === 'timeline'}
            data-testid="projection-timeline-btn"
            onClick={() => setProjection('timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: projection === 'timeline' ? 'var(--primary-base, #3b82f6)' : 'transparent',
              color: projection === 'timeline' ? '#ffffff' : 'var(--text-secondary, #94a3b8)'
            }}
          >
            <Calendar size={13} />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {projectItems.length === 0 ? (
          <div
            data-testid="project-work-empty"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 'var(--space-3, 12px)',
              color: 'var(--text-muted, #94a3b8)',
              padding: 'var(--space-6, 24px)'
            }}
          >
            <AlertCircle size={32} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', margin: '0 0 4px' }}>
                No WorkItems associated yet
              </h3>
              <p style={{ fontSize: 'var(--text-xs, 12px)', margin: 0 }}>
                Link existing items or create new tasks associated with this project.
              </p>
            </div>
            {onQuickCreate && (
              <button
                type="button"
                onClick={onQuickCreate}
                style={{
                  height: '28px',
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
                Create WorkItem
              </button>
            )}
          </div>
        ) : projection === 'board' ? (
          <KanbanBoard
            items={projectItems}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => {
              onSelectItem?.(item);
              onOpenInspector?.(item);
            }}
            onOpenInspector={onOpenInspector}
            onUpdateItem={onUpdateItem}
            onQuickCreate={onQuickCreate}
          />
        ) : projection === 'timeline' ? (
          <TimelineView
            items={projectItems}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => {
              onSelectItem?.(item);
              onOpenInspector?.(item);
            }}
            onOpenInspector={onOpenInspector}
          />
        ) : (
          <DataGrid
            items={projectItems}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => onSelectItem?.(item)}
            onOpenInspector={onOpenInspector}
            onCloseInspector={onCloseInspector}
            isInspectorOpen={isInspectorOpen}
            onUpdateItem={onUpdateItem}
            density={density}
            multiSelectedIds={multiSelectedIds}
            onToggleMultiSelect={onToggleMultiSelect}
            onSelectAll={onSelectAll}
            onClearSelection={onClearSelection}
            isKeyboardActive={isKeyboardActive}
          />
        )}
      </div>
    </div>
  );
}
