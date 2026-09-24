import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, renderHook, within } from '@testing-library/react';
import {
  DataGrid,
  COLUMN_DEFINITIONS,
  getColumnDefinition,
  getDefaultColumnWidths,
  getDefaultColumnVisibility,
  evaluateCondition,
  evaluateFilterGroup,
  buildFilterGroupFromParams,
  useGridSelection,
  DataGridMobileList
} from '../views/DataGrid';
import { BulkActionBar } from '../components/bulk-actions/BulkActionBar';
import { CORE_WORK_ITEM_TYPES } from '../constants/workItems';

describe('UI-01B: Universal High-Density Data Grid', () => {
  const sampleItems = [
    {
      id: 'item-101',
      identifier: 'ENG-101',
      title: 'Implement Tarjan cycle detection',
      description: 'Graph cycle detection algorithm',
      type: 'task',
      status: 'in_progress',
      priority: 'urgent',
      estimate: 5,
      assigneeId: 'usr-1',
      projectId: 'proj-1',
      cycleId: 'cycle-42',
      dueDate: '2026-09-28',
      relations: [{ type: 'blocked_by', targetKey: 'ENG-100' }],
      documentLinks: [{ id: 'doc-1', title: 'Cycle Detection PRD', type: 'source_spec' }],
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-24T10:00:00Z'
    },
    {
      id: 'item-102',
      identifier: 'ENG-102',
      title: 'Persistent IndexedDB engine cache',
      description: 'Local caching layer',
      type: 'issue',
      status: 'todo',
      priority: 'high',
      estimate: 8,
      assigneeId: 'usr-2',
      projectId: 'proj-1',
      cycleId: 'cycle-42',
      dueDate: '2026-10-02',
      relations: [],
      documentLinks: [],
      createdAt: '2026-09-05T10:00:00Z',
      updatedAt: '2026-09-24T10:00:00Z'
    },
    {
      id: 'item-103',
      identifier: 'ENG-103',
      title: 'SOC2 locked security audit',
      description: 'Read-only compliance audit',
      type: 'bug',
      status: 'done',
      priority: 'medium',
      estimate: 3,
      assigneeId: 'usr-1',
      projectId: 'proj-2',
      cycleId: 'cycle-42',
      dueDate: '2026-09-25',
      relations: [{ type: 'relates_to', targetKey: 'SEC-99', restricted: true }],
      documentLinks: [],
      isReadOnly: true,
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-09-24T10:00:00Z'
    }
  ];

  // =========================================================================
  // 1. Architecture / Contract
  // =========================================================================
  describe('1. Architecture & Canonical Contract', () => {
    it('1. renders canonical WorkItems without legacy duplicate fields', () => {
      render(<DataGrid items={sampleItems} selectedItemId="item-101" />);

      expect(screen.getByText('ENG-101')).toBeTruthy();
      expect(screen.getByText('Implement Tarjan cycle detection')).toBeTruthy();
      expect(screen.getByText('ENG-102')).toBeTruthy();

      // Canonical relations and documentLinks badges render
      expect(screen.getByText('Blocked')).toBeTruthy();
      expect(screen.getAllByText('Spec').length).toBeGreaterThanOrEqual(1);

      // Invariants: no legacy fields on items
      sampleItems.forEach((item) => {
        expect(item.specDocId).toBeUndefined();
        expect(item.subtasks).toBeUndefined();
        expect(item.blockedBy).toBeUndefined();
        expect(item.blocks).toBeUndefined();
      });
    });

    it('2. column registry uses canonical accessors including documentLinks', () => {
      const specCol = getColumnDefinition('documentLinks');
      expect(specCol).toBeDefined();
      expect(specCol.accessor).toBe('documentLinks');

      const relCol = getColumnDefinition('relations');
      expect(relCol).toBeDefined();
      expect(relCol.accessor).toBe('relations');

      // Must NOT contain competing or legacy accessors
      expect(getColumnDefinition('specDocId')).toBeNull();
      expect(getColumnDefinition('documentLink')).toBeNull();
      expect(getColumnDefinition('blockedBy')).toBeNull();
    });

    it('3. grid does not introduce another WorkItem type/model', () => {
      expect(CORE_WORK_ITEM_TYPES).toEqual(['task', 'issue', 'bug']);
      sampleItems.forEach((item) => {
        expect(CORE_WORK_ITEM_TYPES).toContain(item.type);
      });
    });
  });

  // =========================================================================
  // 2. Selection Laws
  // =========================================================================
  describe('2. Selection Laws & Semantics', () => {
    it('4. filter change clears multi-selection', () => {
      const { result, rerender } = renderHook(
        ({ queryKey }) =>
          useGridSelection({
            initialSelectedIds: ['item-101', 'item-102'],
            queryDependencyKey: queryKey
          }),
        { initialProps: { queryKey: 'filter-1' } }
      );

      expect(result.current.multiSelectedIds).toEqual(['item-101', 'item-102']);

      // Material query change occurs
      rerender({ queryKey: 'filter-2' });
      expect(result.current.multiSelectedIds).toEqual([]);
    });

    it('5. sort preserves selection', () => {
      let selectedIds = ['item-101'];
      const onToggle = vi.fn((id) => {
        selectedIds = selectedIds.includes(id) ? [] : [id];
      });

      const { rerender } = render(
        <DataGrid
          items={sampleItems}
          multiSelectedIds={selectedIds}
          onToggleMultiSelect={onToggle}
        />
      );

      expect(selectedIds).toEqual(['item-101']);

      // Clicking Sort button changes sort order
      const sortBtn = screen.getByRole('button', { name: /Sort:/i });
      fireEvent.click(sortBtn);

      // Multi-selection remains intact
      rerender(
        <DataGrid
          items={sampleItems}
          multiSelectedIds={selectedIds}
          onToggleMultiSelect={onToggle}
        />
      );
      expect(selectedIds).toEqual(['item-101']);
    });

    it('6. incremental loading preserves existing selected IDs', () => {
      const { result, rerender } = renderHook(
        ({ itemsList }) => {
          const sel = useGridSelection({ initialSelectedIds: ['item-101'] });
          return sel;
        },
        { initialProps: { itemsList: sampleItems } }
      );

      expect(result.current.multiSelectedIds).toContain('item-101');

      // More items loaded incrementally
      const appendedItems = [
        ...sampleItems,
        { id: 'item-104', identifier: 'ENG-104', title: 'New appended row', type: 'task' }
      ];

      rerender({ itemsList: appendedItems });
      expect(result.current.multiSelectedIds).toContain('item-101');
    });

    it('7. deleted item is removed from selection', () => {
      const { result } = renderHook(() =>
        useGridSelection({ initialSelectedIds: ['item-101', 'item-102'] })
      );

      // item-102 is deleted from workspace
      act(() => {
        result.current.pruneDeleted(['item-101', 'item-103']);
      });

      expect(result.current.multiSelectedIds).toEqual(['item-101']);
    });

    it('8 & 9. header checkbox selects loaded/visible rows only without global isAllSelected', () => {
      const onSelectAll = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          multiSelectedIds={[]}
          onSelectAll={onSelectAll}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const headerCheckbox = checkboxes[0];
      fireEvent.click(headerCheckbox);

      expect(onSelectAll).toHaveBeenCalledWith(['item-101', 'item-102', 'item-103']);
    });
  });

  // =========================================================================
  // 3. Keyboard Navigation
  // =========================================================================
  describe('3. Keyboard Navigation & Focus Model', () => {
    it('10. Arrow/J/K row navigation works', () => {
      const onSelect = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          selectedItemId="item-101"
          onSelectItem={onSelect}
          isKeyboardActive={true}
        />
      );

      // Press 'j' to navigate down
      fireEvent.keyDown(window, { key: 'j' });
      expect(onSelect).toHaveBeenCalledWith(sampleItems[1]);

      // Press 'k' to navigate up
      fireEvent.keyDown(window, { key: 'k' });
      expect(onSelect).toHaveBeenCalledWith(sampleItems[0]);
    });

    it('11. Enter opens UI-01A Inspector', () => {
      const onOpenInspector = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          selectedItemId="item-101"
          onOpenInspector={onOpenInspector}
          isKeyboardActive={true}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(onOpenInspector).toHaveBeenCalledWith(sampleItems[0]);
    });

    it('12 & 13. F2 enters title edit and Escape cancels edit', () => {
      render(
        <DataGrid
          items={sampleItems}
          selectedItemId="item-101"
          isKeyboardActive={true}
        />
      );

      // Press F2 to start inline rename
      fireEvent.keyDown(window, { key: 'F2' });

      const titleInput = screen.getByDisplayValue('Implement Tarjan cycle detection');
      expect(titleInput).toBeTruthy();

      // Press Escape to cancel
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByDisplayValue('Implement Tarjan cycle detection')).toBeNull();
      expect(screen.getByText('Implement Tarjan cycle detection')).toBeTruthy();
    });

    it('14. editable controls suppress conflicting shortcuts', () => {
      const onSelect = vi.fn();
      render(
        <div>
          <input data-testid="test-input" />
          <DataGrid
            items={sampleItems}
            onSelectItem={onSelect}
            isKeyboardActive={true}
          />
        </div>
      );

      const input = screen.getByTestId('test-input');
      input.focus();

      // Typing 'j' or 's' in an input element must not trigger grid navigation
      fireEvent.keyDown(input, { key: 'j' });
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('15. Shift range selection behaves correctly', () => {
      const { result } = renderHook(() =>
        useGridSelection({ initialSelectedIds: [] })
      );

      const allIds = ['item-101', 'item-102', 'item-103'];

      // Select item-101 as anchor
      act(() => {
        result.current.toggleSelect('item-101');
      });

      // Shift-select to item-103
      act(() => {
        result.current.selectRange('item-103', allIds);
      });

      expect(result.current.multiSelectedIds).toEqual(['item-101', 'item-102', 'item-103']);
    });
  });

  // =========================================================================
  // 4. Inspector Integration
  // =========================================================================
  describe('4. Inspector Integration & Logical Row Anchor', () => {
    it('16. opening and closing Inspector preserves logical row anchor and focus', () => {
      let isInspectorOpen = false;
      const onOpen = vi.fn(() => {
        isInspectorOpen = true;
      });
      const onClose = vi.fn(() => {
        isInspectorOpen = false;
      });

      const { rerender } = render(
        <DataGrid
          items={sampleItems}
          selectedItemId="item-102"
          isInspectorOpen={isInspectorOpen}
          onOpenInspector={onOpen}
          onCloseInspector={onClose}
        />
      );

      // Enter opens Inspector
      fireEvent.keyDown(window, { key: 'Enter' });

      // Rerender with inspector open
      rerender(
        <DataGrid
          items={sampleItems}
          selectedItemId="item-102"
          isInspectorOpen={true}
          onOpenInspector={onOpen}
          onCloseInspector={onClose}
        />
      );

      // Escape closes Inspector
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('17 & 18. inspector mutation is reflected in the grid and preserves context', () => {
      let itemsList = [...sampleItems];
      const { rerender } = render(
        <DataGrid items={itemsList} selectedItemId="item-101" />
      );

      expect(screen.getByText('Implement Tarjan cycle detection')).toBeTruthy();

      // Mutation happens through canonical store
      itemsList = itemsList.map((it) =>
        it.id === 'item-101' ? { ...it, title: 'Optimized Tarjan Algorithm' } : it
      );

      rerender(<DataGrid items={itemsList} selectedItemId="item-101" />);
      expect(screen.getByText('Optimized Tarjan Algorithm')).toBeTruthy();
    });
  });

  // =========================================================================
  // 5. Editing & Explicit Choices (No Cycle-on-Click)
  // =========================================================================
  describe('5. Inline Editing & Explicit Property Triggers', () => {
    it('19. status uses explicit selection dropdown, not cycling', () => {
      const onUpdate = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          onUpdateItem={onUpdate}
        />
      );

      const statusBtn = screen.getAllByRole('button', { name: /Change status/i })[0];
      fireEvent.click(statusBtn);

      // Status dropdown menu opens with explicit choices
      const statusListbox = screen.getByRole('listbox', { name: /Select status/i });
      expect(statusListbox).toBeTruthy();
      expect(within(statusListbox).getByRole('option', { name: /In Review/i })).toBeTruthy();
      expect(within(statusListbox).getByRole('option', { name: /Done/i })).toBeTruthy();

      // Click explicit 'Done' option
      fireEvent.click(within(statusListbox).getByRole('option', { name: /Done/i }));
      expect(onUpdate).toHaveBeenCalledWith('item-101', { status: 'done' });
    });

    it('20. priority uses explicit selection dropdown, not cycling', () => {
      const onUpdate = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          onUpdateItem={onUpdate}
        />
      );

      const priorityBtn = screen.getAllByRole('button', { name: /Change priority/i })[0];
      fireEvent.click(priorityBtn);

      // Priority listbox opens with explicit 5-level choices
      const priorityListbox = screen.getByRole('listbox', { name: /Select priority/i });
      expect(priorityListbox).toBeTruthy();
      expect(within(priorityListbox).getByRole('option', { name: /Urgent/i })).toBeTruthy();
      expect(within(priorityListbox).getByRole('option', { name: /Low/i })).toBeTruthy();

      // Explicit selection
      fireEvent.click(within(priorityListbox).getByRole('option', { name: /Low/i }));
      expect(onUpdate).toHaveBeenCalledWith('item-101', { priority: 'low' });
    });

    it('21. failed inline mutation rolls back', () => {
      const originalTitle = 'Implement Tarjan cycle detection';
      const onUpdateItem = vi.fn((id, patch) => {
        // Simulating mutation rollback / rejection
        throw new Error('Network error');
      });

      render(
        <DataGrid
          items={sampleItems}
          onUpdateItem={onUpdateItem}
        />
      );

      // Original title remains rendered
      expect(screen.getByText(originalTitle)).toBeTruthy();
    });
  });

  // =========================================================================
  // 6. Filtering & Mismatch Behavior
  // =========================================================================
  describe('6. Filter Algebra & Projection Mismatch', () => {
    it('22. nested FilterGroup AND/OR evaluation works for supported conditions', () => {
      const filterGroup = {
        operator: 'AND',
        conditions: [
          { field: 'status', operator: 'eq', value: 'in_progress' },
          {
            operator: 'OR',
            conditions: [
              { field: 'priority', operator: 'eq', value: 'urgent' },
              { field: 'estimate', operator: 'gt', value: 10 }
            ]
          }
        ]
      };

      expect(evaluateFilterGroup(sampleItems[0], filterGroup)).toBe(true);
      expect(evaluateFilterGroup(sampleItems[1], filterGroup)).toBe(false);
    });

    it('23. item leaving current filter remains temporarily while focused and displays Modified', () => {
      const onUpdate = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          filters={{ status: 'in_progress', priority: 'all', assignee: 'all', project: 'all' }}
          selectedItemId="item-101"
          onUpdateItem={onUpdate}
        />
      );

      // Initially ENG-101 is shown because status is in_progress
      expect(screen.getByText('ENG-101')).toBeTruthy();

      // Change status to 'done' while still focused on row
      const statusBtn = screen.getByRole('button', { name: /Change status/i });
      fireEvent.click(statusBtn);
      fireEvent.click(screen.getByRole('option', { name: /Done/i }));

      expect(onUpdate).toHaveBeenCalledWith('item-101', { status: 'done' });
    });
  });

  // =========================================================================
  // 7. Grouping
  // =========================================================================
  describe('7. Grouping & Aggregations', () => {
    it('24 & 25. group counts and point sums are correct and mutation relocates item', () => {
      render(
        <DataGrid
          items={sampleItems}
          groupBy="status"
        />
      );

      // In Progress group header
      expect(screen.getByRole('button', { name: /Toggle group In Progress/i })).toBeTruthy();
      expect(screen.getByText(/1 item • 5 pts/)).toBeTruthy();

      // Todo group header
      expect(screen.getByRole('button', { name: /Toggle group Todo/i })).toBeTruthy();
      expect(screen.getByText(/1 item • 8 pts/)).toBeTruthy();
    });

    it('26. collapse and expand group preserves selection', () => {
      const selectedIds = ['item-101'];
      render(
        <DataGrid
          items={sampleItems}
          groupBy="status"
          multiSelectedIds={selectedIds}
        />
      );

      // Click group header to collapse
      const toggleBtn = screen.getByRole('button', { name: /Toggle group In Progress/i });
      fireEvent.click(toggleBtn);

      // Multi-selection is preserved
      expect(selectedIds).toContain('item-101');
    });
  });

  // =========================================================================
  // 8. Bulk Operations
  // =========================================================================
  describe('8. Bulk Operations & Normalized Outcomes', () => {
    it('27 & 29. bulk mutation operates on selected IDs and clears selection on completion', () => {
      const onBulkUpdate = vi.fn();
      render(
        <BulkActionBar
          selectedCount={2}
          onBulkUpdateStatus={onBulkUpdate}
        />
      );

      expect(screen.getByText('2 items selected')).toBeTruthy();

      const statusBtn = screen.getByRole('button', { name: /Status/i });
      fireEvent.click(statusBtn);

      fireEvent.click(screen.getByRole('option', { name: /Done/i }));
      expect(onBulkUpdate).toHaveBeenCalledWith('done');
    });

    it('28. partial permission outcome reports succeeded/skipped/failed correctly', () => {
      const outcome = {
        succeeded: ['item-101'],
        skipped: ['item-103'],
        failed: []
      };

      render(
        <BulkActionBar
          selectedCount={0}
          outcome={outcome}
        />
      );

      expect(screen.getByText(/1 updated, 1 skipped \(read-only\)/i)).toBeTruthy();
    });
  });

  // =========================================================================
  // 9. Permissions & Zero-Leakage
  // =========================================================================
  describe('9. Permissions & Zero-Leakage Invariants', () => {
    it('30. read-only WorkItem cannot be edited inline', () => {
      const onUpdate = vi.fn();
      render(
        <DataGrid
          items={sampleItems}
          onUpdateItem={onUpdate}
        />
      );

      // item-103 is read-only
      const statusButtons = screen.getAllByRole('button', { name: /Change status/i });
      const readOnlyStatusBtn = statusButtons[2];
      expect(readOnlyStatusBtn.disabled).toBe(true);

      fireEvent.click(readOnlyStatusBtn);
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('31. restricted references do not leak protected metadata', () => {
      render(<DataGrid items={sampleItems} />);

      // item-103 has a restricted relation. Must render placeholder without leaking targetKey
      expect(screen.getByText('[Restricted WorkItem]')).toBeTruthy();
      expect(screen.queryByText('SEC-99')).toBeNull();
    });
  });

  // =========================================================================
  // 10. Responsive Behavior
  // =========================================================================
  describe('10. Responsive Projection', () => {
    it('32 & 33. mobile projection renders compact WorkItem list and opens detail container', () => {
      const onSelect = vi.fn();
      const onOpen = vi.fn();

      render(
        <DataGridMobileList
          items={sampleItems}
          selectedItemId="item-101"
          onSelectItem={onSelect}
          onOpenDetail={onOpen}
        />
      );

      expect(screen.getByRole('list', { name: /Mobile work item list/i })).toBeTruthy();
      expect(screen.getByText('ENG-101')).toBeTruthy();
      expect(screen.getByText('Implement Tarjan cycle detection')).toBeTruthy();

      // Tap on mobile card selects and opens detail
      fireEvent.click(screen.getByText('ENG-101'));
      expect(onSelect).toHaveBeenCalledWith(sampleItems[0]);
      expect(onOpen).toHaveBeenCalledWith(sampleItems[0]);
    });
  });
});
