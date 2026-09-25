import React, { useState } from 'react';
import { DataGridRow } from './DataGridRow';
import { DataGridGroupHeader } from './DataGridGroupHeader';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../constants/workItems';
import { USERS, PROJECTS } from '../../data/mockData';

/**
 * DataGridBody Component
 * Handles grouping partitions, group collapse/expansion, empty states, and row rendering
 */
export function DataGridBody({
  items = [],
  visibleColumns = [],
  columnWidths = {},
  selectedItemId,
  multiSelectedIds = [],
  focusedRowIndex = 0,
  rowHeight = 28,
  groupBy = 'none',
  onSelectItem,
  onOpenInspector,
  onToggleSelect,
  onUpdateItem,
  isEditingTitle = false,
  onCommitTitle,
  onCancelTitle,
  activeDropdown = null,
  setActiveDropdown,
  filterMismatchItemId = null
}) {
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '240px',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-xs)',
          gap: '8px',
          width: '100%',
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          No work items match current filter
        </span>
        <span>Try adjusting status, priority, or search parameters.</span>
      </div>
    );
  }

  // Flat rendering when no grouping
  if (groupBy === 'none') {
    return (
      <div role="rowgroup" style={{ display: 'flex', flexDirection: 'column', minWidth: '100%', width: 'max-content' }}>
        {items.map((item, index) => {
          const isFocused = focusedRowIndex === index;
          const isInspectorActive = selectedItemId === item.id;
          const isMultiSelected = multiSelectedIds.includes(item.id);
          const isMismatch = filterMismatchItemId === item.id;

          return (
            <DataGridRow
              key={item.id}
              item={item}
              index={index}
              visibleColumns={visibleColumns}
              columnWidths={columnWidths}
              isFocused={isFocused}
              isInspectorActive={isInspectorActive}
              isMultiSelected={isMultiSelected}
              rowHeight={rowHeight}
              onSelectItem={onSelectItem}
              onOpenInspector={onOpenInspector}
              onToggleSelect={onToggleSelect}
              onUpdateItem={onUpdateItem}
              isEditingTitle={isEditingTitle && isFocused}
              onCommitTitle={onCommitTitle}
              onCancelTitle={onCancelTitle}
              isFilterMismatch={isMismatch}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          );
        })}
      </div>
    );
  }

  // Grouped rendering
  const groupsMap = new Map();

  items.forEach((item) => {
    let groupKey = 'other';
    let groupLabel = 'Other';

    if (groupBy === 'status') {
      groupKey = item.status || 'backlog';
      groupLabel = STATUS_DEFINITIONS[groupKey]?.label || groupKey;
    } else if (groupBy === 'priority') {
      groupKey = item.priority || 'none';
      groupLabel = PRIORITY_DEFINITIONS[groupKey]?.label || groupKey;
    } else if (groupBy === 'assignee') {
      groupKey = item.assigneeId || 'unassigned';
      const u = USERS.find((user) => user.id === item.assigneeId);
      groupLabel = u ? u.name : 'Unassigned';
    } else if (groupBy === 'project') {
      groupKey = item.projectId || 'ad-hoc';
      const p = PROJECTS.find((proj) => proj.id === item.projectId);
      groupLabel = p ? p.name : 'Ad-hoc';
    } else if (groupBy === 'cycle') {
      groupKey = item.cycleId || 'no-cycle';
      groupLabel = item.cycleId || 'No Cycle';
    }

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id: groupKey,
        label: groupLabel,
        items: []
      });
    }
    groupsMap.get(groupKey).items.push(item);
  });

  // Calculate cumulative item index for roving focus across groups
  let runningIndex = 0;

  return (
    <div role="rowgroup" style={{ display: 'flex', flexDirection: 'column', minWidth: '100%', width: 'max-content' }}>
      {Array.from(groupsMap.values()).map((group) => {
        const isCollapsed = collapsedGroups.has(group.id);
        const pointsSum = group.items.reduce((sum, it) => sum + (it.estimate || 0), 0);

        const groupRows = !isCollapsed
          ? group.items.map((item) => {
              const itemIndex = runningIndex++;
              const isFocused = focusedRowIndex === itemIndex;
              const isInspectorActive = selectedItemId === item.id;
              const isMultiSelected = multiSelectedIds.includes(item.id);
              const isMismatch = filterMismatchItemId === item.id;

              return (
                <DataGridRow
                  key={item.id}
                  item={item}
                  index={itemIndex}
                  visibleColumns={visibleColumns}
                  columnWidths={columnWidths}
                  isFocused={isFocused}
                  isInspectorActive={isInspectorActive}
                  isMultiSelected={isMultiSelected}
                  rowHeight={rowHeight}
                  onSelectItem={onSelectItem}
                  onOpenInspector={onOpenInspector}
                  onToggleSelect={onToggleSelect}
                  onUpdateItem={onUpdateItem}
                  isEditingTitle={isEditingTitle && isFocused}
                  onCommitTitle={onCommitTitle}
                  onCancelTitle={onCancelTitle}
                  isFilterMismatch={isMismatch}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
              );
            })
          : null;

        return (
          <div key={group.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <DataGridGroupHeader
              groupId={group.id}
              label={group.label}
              count={group.items.length}
              pointsSum={pointsSum}
              isCollapsed={isCollapsed}
              onToggleCollapse={toggleGroupCollapse}
            />
            {groupRows}
          </div>
        );
      })}
    </div>
  );
}
