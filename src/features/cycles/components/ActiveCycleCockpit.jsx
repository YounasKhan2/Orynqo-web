import React, { useState } from 'react';
import { DataGrid } from '../../../views/DataGrid/DataGrid';
import { KanbanBoard } from '../../../views/KanbanBoard/KanbanBoard';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Table,
  Kanban
} from 'lucide-react';

/**
 * ActiveCycleCockpit Component (CYC-001)
 *
 * High-intensity timeboxed sprint execution surface:
 * - Active sprint dates & days remaining
 * - Execution progress & velocity status
 * - Attention signals (blocked & overdue items)
 * - Grid / Board execution projection
 * - Trigger for cycle completion
 */
export function ActiveCycleCockpit({
  activeCycle,
  progress,
  items = [],
  selectedItemId,
  onSelectItem,
  onOpenInspector,
  onCloseInspector,
  isInspectorOpen = false,
  onUpdateItem,
  density = 'compact',
  onCompleteCycle,
  userTimezone
}) {
  const [projection, setProjection] = useState('grid'); // 'grid' | 'board'

  if (!activeCycle) {
    return (
      <div
        role="region"
        aria-label="Active Cycle"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--bg-canvas)',
          gap: 'var(--space-3)'
        }}
      >
        <Calendar size={32} color="var(--text-muted)" />
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
          No active cycle in progress
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
          Head to Cycle Planning to schedule candidate backlog items and start a new cycle.
        </p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Active Cycle Execution Cockpit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Sprint Header Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary-base)" />
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
              {activeCycle.name || `Cycle ${activeCycle.number}`}
            </h2>
            <span
              style={{
                fontSize: 'var(--text-2xs)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--status-in-progress-bg)',
                color: 'var(--status-in-progress)',
                fontWeight: 'var(--font-semibold)'
              }}
            >
              Active
            </span>
          </div>

          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {activeCycle.startDate} to {activeCycle.endDate}
            {activeCycle.daysRemaining !== undefined && ` • ${activeCycle.daysRemaining} days remaining`}
          </span>

          {progress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-semibold)' }}>
                {progress.completedItems} / {progress.totalItems} items ({progress.percentComplete}%)
              </span>
              {progress.blockedItems > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)', fontWeight: 'var(--font-medium)' }}>
                  <AlertTriangle size={12} />
                  {progress.blockedItems} blocked
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Projection Switcher + Complete Cycle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-surface-raised)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            <button
              type="button"
              aria-label="Grid View"
              onClick={() => setProjection('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '20px',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: projection === 'grid' ? 'var(--bg-surface)' : 'transparent',
                color: projection === 'grid' ? 'var(--primary-base)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <Table size={12} />
            </button>
            <button
              type="button"
              aria-label="Board View"
              onClick={() => setProjection('board')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '20px',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: projection === 'board' ? 'var(--bg-surface)' : 'transparent',
                color: projection === 'board' ? 'var(--primary-base)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <Kanban size={12} />
            </button>
          </div>

          <button
            type="button"
            data-testid="complete-cycle-btn"
            onClick={() => onCompleteCycle?.(activeCycle.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '28px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={14} color="var(--status-done)" />
            <span>Complete Cycle</span>
          </button>
        </div>
      </div>

      {/* Main Execution View */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {projection === 'grid' ? (
          <DataGrid
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            onUpdateItem={onUpdateItem}
            onOpenInspector={onOpenInspector}
            onCloseInspector={onCloseInspector}
            isInspectorOpen={isInspectorOpen}
            density={density}
            userTimezone={userTimezone}
          />
        ) : (
          <KanbanBoard
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            onOpenInspector={onOpenInspector}
            onUpdateItem={onUpdateItem}
          />
        )}
      </div>
    </div>
  );
}
