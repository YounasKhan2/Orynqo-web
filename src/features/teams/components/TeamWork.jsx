import React, { useState } from 'react';
import { DataGrid } from '../../../views/DataGrid/DataGrid';
import { KanbanBoard } from '../../../views/KanbanBoard/KanbanBoard';
import { Table, Kanban } from 'lucide-react';

/**
 * TeamWork Component (TEM-003)
 *
 * Universal execution stream of canonical WorkItems owned by this team:
 * - Filter tabs: Active Work | Backlog | Completed | All
 * - Projections: Grid (Universal High-Density) | Board (Kanban)
 * - Seamless integration with canonical Inspector and property mutations
 */
export function TeamWork({
  items = [],
  counts = {},
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
  workFilterTab = 'active',
  onSelectWorkFilterTab,
  onQuickCreate,
  userTimezone
}) {
  const [projection, setProjection] = useState('grid'); // 'grid' | 'board'

  return (
    <div
      role="region"
      aria-label="Team Work"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Sub-toolbar: Scope filter tabs + Projection switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          height: '36px',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0
        }}
      >
        {/* Left: Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {[
            { id: 'active', label: `Active (${counts.active || 0})` },
            { id: 'backlog', label: `Backlog (${counts.backlog || 0})` },
            { id: 'completed', label: `Completed (${counts.completed || 0})` },
            { id: 'all', label: `All (${counts.all || 0})` }
          ].map((tab) => {
            const isSelected = workFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectWorkFilterTab?.(tab.id)}
                style={{
                  height: '24px',
                  padding: '0 var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-normal)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-default)' : 'none',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Projection Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-surface-raised)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            aria-label="Grid Projection"
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
            aria-label="Board Projection"
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
      </div>

      {/* Projection Content */}
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
            multiSelectedIds={multiSelectedIds}
            onToggleMultiSelect={onToggleMultiSelect}
            onSelectAll={onSelectAll}
            onClearSelection={onClearSelection}
            isKeyboardActive={isKeyboardActive}
            userTimezone={userTimezone}
          />
        ) : (
          <KanbanBoard
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            onOpenInspector={onOpenInspector}
            onUpdateItem={onUpdateItem}
            onQuickCreate={onQuickCreate}
          />
        )}
      </div>
    </div>
  );
}
