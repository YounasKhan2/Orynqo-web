import React from 'react';
import { DataGrid, KanbanBoard, TimelineView } from '../../../views';
import { MyWorkOverview } from './MyWorkOverview';

export function MyWorkCockpit({
  tab,
  projection,
  query,
  density,
  selectedItemId,
  multiSelectedIds,
  isInspectorOpen,
  isKeyboardActive,
  collapsedSections,
  onToggleSection,
  onOpenItem,
  onUpdateItem,
  onQuickCreate,
  onToggleMultiSelect,
  onSelectAll,
  onClearSelection,
  onBrowseTeams,
  filtered,
  onResetFilters
}) {
  if (tab === 'overview') {
    return (
      <MyWorkOverview
        buckets={query.buckets}
        collapsedSections={collapsedSections}
        onToggleSection={onToggleSection}
        onOpenItem={onOpenItem}
        onBrowseTeams={onBrowseTeams}
        filtered={filtered}
        onResetFilters={onResetFilters}
      />
    );
  }

  if (projection === 'kanban') {
    return (
      <KanbanBoard
        items={query.items}
        selectedItemId={selectedItemId}
        onSelectItem={onOpenItem}
        onOpenInspector={onOpenItem}
        onUpdateItem={onUpdateItem}
        onQuickCreate={onQuickCreate}
      />
    );
  }

  if (projection === 'timeline') {
    return (
      <TimelineView
        items={query.items}
        selectedItemId={selectedItemId}
        onSelectItem={onOpenItem}
        onOpenInspector={onOpenItem}
      />
    );
  }

  return (
    <DataGrid
      items={query.items}
      selectedItemId={selectedItemId}
      onSelectItem={onOpenItem}
      onOpenInspector={onOpenItem}
      onUpdateItem={onUpdateItem}
      density={density}
      groupBy="due_date"
      isInspectorOpen={isInspectorOpen}
      multiSelectedIds={multiSelectedIds}
      onToggleMultiSelect={onToggleMultiSelect}
      onSelectAll={onSelectAll}
      onClearSelection={onClearSelection}
      isKeyboardActive={isKeyboardActive}
    />
  );
}
