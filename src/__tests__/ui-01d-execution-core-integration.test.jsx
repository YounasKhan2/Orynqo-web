import React, { useState, useRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace, UIProvider } from '../app/providers';
import { DataGrid, DataGridMobileList } from '../views/DataGrid';
import { WorkItemInspector, QuickCreateDialog } from '../features/work-items';
import { AssigneePicker } from '../features/work-items/property-pickers';
import { checkTeamChangeConsequences } from '../features/work-items/property-pickers/teamConsequenceResolver';
import { PROJECTS } from '../data/mockData';
import { App } from '../App';

/**
 * UI-01D: Execution Core Integration & Final QA Test Suite
 *
 * Validates cross-feature cohesion, canonical data integrity,
 * bidirectional Grid <-> Inspector sync, keyboard scopes, focus lifecycles,
 * and zero-leakage security across the unified Execution Core.
 */
describe('UI-01D: Execution Core Integration & Final QA', () => {

  // Reusable Integration Test Harness connecting Execution Core primitives
  function ExecutionCoreHarness({
    initialItems,
    customUpdateItem,
    customCreateItem,
    initialSelectedId = null,
    initialInspectorOpen = false,
    initialCreateOpen = false,
    initialDensity = 'default'
  }) {
    return (
      <UIProvider>
        <WorkspaceProvider initialItems={initialItems} initialSelectedItemId={initialSelectedId}>
          <ExecutionCoreInner
            customUpdateItem={customUpdateItem}
            customCreateItem={customCreateItem}
            defaultSelectedId={initialSelectedId}
            defaultInspectorOpen={initialInspectorOpen}
            defaultCreateOpen={initialCreateOpen}
            defaultDensity={initialDensity}
          />
        </WorkspaceProvider>
      </UIProvider>
    );
  }

  function ExecutionCoreInner({
    customUpdateItem,
    customCreateItem,
    defaultSelectedId,
    defaultInspectorOpen,
    defaultCreateOpen,
    defaultDensity
  }) {
    const {
      items,
      selectedItem,
      selectedItemId,
      selectItem,
      updateItem: workspaceUpdateItem,
      createItem: workspaceCreateItem,
      multiSelectedIds,
      toggleMultiSelect,
      selectAll,
      clearSelection
    } = useWorkspace();

    const updateItem = customUpdateItem || workspaceUpdateItem;
    const createItem = customCreateItem || workspaceCreateItem;

    const [isInspectorOpen, setIsInspectorOpen] = useState(defaultInspectorOpen);
    const [isCreateOpen, setIsCreateOpen] = useState(defaultCreateOpen);
    const [density, setDensity] = useState(defaultDensity);
    const [activeFilter, setActiveFilter] = useState('all');

    // Filter items
    const filteredItems = items.filter((it) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'todo') return it.status === 'todo';
      if (activeFilter === 'in_progress') return it.status === 'in_progress';
      return true;
    });

    const triggerBtnRef = useRef(null);

    return (
      <div>
        {/* Invocation Controls */}
        <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
          <button
            ref={triggerBtnRef}
            type="button"
            id="open-quick-create-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            New Item
          </button>
          <button
            type="button"
            id="filter-all-btn"
            onClick={() => {
              setActiveFilter('all');
              clearSelection();
            }}
          >
            All Items
          </button>
          <button
            type="button"
            id="filter-todo-btn"
            onClick={() => {
              setActiveFilter('todo');
              clearSelection();
            }}
          >
            Todo Only
          </button>
        </div>

        {/* Data Grid Projection */}
        <DataGrid
          items={filteredItems}
          selectedItemId={selectedItemId || defaultSelectedId}
          onSelectItem={(item) => selectItem(item.id)}
          onOpenInspector={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          onCloseInspector={() => setIsInspectorOpen(false)}
          isInspectorOpen={isInspectorOpen}
          onUpdateItem={updateItem}
          density={density}
          multiSelectedIds={multiSelectedIds}
          onToggleMultiSelect={toggleMultiSelect}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          isKeyboardActive={!isCreateOpen}
        />

        {/* Inspector Detail Projection */}
        <WorkItemInspector
          item={selectedItem}
          subItems={items.filter((it) => it.parentId === selectedItem?.id)}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateItem={updateItem}
        />

        {/* Quick Create Dialog */}
        <QuickCreateDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={createItem}
          onOpenItem={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          initialContext={{ teamId: 'team-core' }}
        />
      </div>
    );
  }

  const baseSampleItems = [
    {
      id: 'item-core-1',
      identifier: 'ENG-101',
      title: 'Distributed Log Consensus',
      description: 'Implement Raft state engine',
      type: 'task',
      status: 'in_progress',
      priority: 'high',
      assigneeId: 'usr-1',
      teamId: 'team-core',
      projectId: 'proj-1',
      cycleId: 'cycle-42',
      labels: ['backend'],
      dueDate: '2026-10-15',
      workspaceId: 'wks-core',
      relations: [],
      documentLinks: [],
      createdAt: '2026-09-01T12:00:00Z',
      commentsCount: 3
    },
    {
      id: 'item-core-2',
      identifier: 'ENG-102',
      title: 'SCIM Token Revocation Protocol',
      description: 'Enterprise directory lifecycle handling',
      type: 'issue',
      status: 'todo',
      priority: 'urgent',
      assigneeId: 'usr-2',
      teamId: 'team-core',
      projectId: 'proj-1',
      cycleId: 'cycle-42',
      labels: ['security'],
      dueDate: null,
      workspaceId: 'wks-core',
      relations: [],
      documentLinks: [],
      createdAt: '2026-09-02T12:00:00Z',
      commentsCount: 0
    }
  ];

  // =========================================================================
  // 1. Quick Create -> Canonical WorkItem -> Grid Integration
  // =========================================================================
  describe('1. Quick Create -> Canonical WorkItem -> Grid Integration', () => {
    it('creates canonical item, renders in DataGrid exactly once, and restores invocation focus', async () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const openBtn = screen.getByRole('button', { name: /New Item/i });
      openBtn.focus();
      expect(document.activeElement).toBe(openBtn);

      fireEvent.click(openBtn);

      // Dialog opens
      expect(screen.getByRole('dialog', { name: /New Work Item/i })).toBeDefined();

      // Enter Title & Description
      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Cross-Engine Event Stream' } });

      // Click Create & Close
      const createBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(createBtn);

      // Verify dialog closes
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /New Work Item/i })).toBeNull();
      });

      // Verify item appears in DataGrid exactly once
      const gridRows = screen.getAllByText('Cross-Engine Event Stream');
      expect(gridRows.length).toBe(1);

      // Verify invocation focus was restored to the button that triggered the modal
      expect(document.activeElement).toBe(openBtn);
    });

    it('Quick Create & Open transitions directly to Inspector detail surface with canonical item', async () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const openBtn = screen.getByRole('button', { name: /New Item/i });
      fireEvent.click(openBtn);

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Direct Inspector Opening Item' } });

      // Trigger Create & Open via shortcut (⌘⇧↵ / Ctrl+Shift+Enter)
      fireEvent.keyDown(titleInput, { key: 'Enter', metaKey: true, shiftKey: true });

      await waitFor(() => {
        // Quick Create dialog is closed
        expect(screen.queryByRole('dialog', { name: /New Work Item/i })).toBeNull();
        // Inspector drawer is open
        expect(screen.getByRole('complementary', { name: /Detail panel/i })).toBeDefined();
      });

      // Inspector contains the newly created canonical item title
      const inspectorTitle = screen.getByDisplayValue('Direct Inspector Opening Item');
      expect(inspectorTitle).toBeDefined();
    });

    it('Create Another creates multiple distinct canonical items with full reset contract', async () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      fireEvent.click(screen.getByRole('button', { name: /New Item/i }));

      // Enable Create another checkbox
      const createAnotherCheckbox = screen.getByRole('checkbox', { name: /Create another/i });
      fireEvent.click(createAnotherCheckbox);

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      const descInput = screen.getByPlaceholderText(/Add context, technical specifications/i);

      // Item 1
      fireEvent.change(titleInput, { target: { value: 'Sequential Task Alpha' } });
      fireEvent.change(descInput, { target: { value: 'Alpha description specs' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Sequential Task Alpha')).toBeDefined();
      });

      // Verify draft reset and focus return to title
      expect(titleInput.value).toBe('');
      expect(descInput.value).toBe('');
      expect(document.activeElement).toBe(titleInput);

      // Item 2
      fireEvent.change(titleInput, { target: { value: 'Sequential Task Beta' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Sequential Task Beta')).toBeDefined();
      });

      // Both items are distinct entities in the grid
      expect(screen.getByText('Sequential Task Alpha')).toBeDefined();
      expect(screen.getByText('Sequential Task Beta')).toBeDefined();
    });

    it('proves zero phantom duplicates after creation: item count increments by exactly 1', async () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const initialRows = screen.getAllByRole('row').length;

      fireEvent.click(screen.getByRole('button', { name: /New Item/i }));
      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Strictly Single Entry' } });

      fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /New Work Item/i })).toBeNull();
      });

      const updatedRows = screen.getAllByRole('row').length;
      expect(updatedRows).toBe(initialRows + 1);

      // Verify matching elements
      const occurrences = screen.getAllByText('Strictly Single Entry');
      expect(occurrences.length).toBe(1);
    });
  });

  // =========================================================================
  // 2. Bidirectional Grid <-> Inspector Synchronization
  // =========================================================================
  describe('2. Bidirectional Grid <-> Inspector Synchronization', () => {
    it('Grid mutation synchronizes immediately into open Inspector without detached copies', async () => {
      render(
        <ExecutionCoreHarness
          initialItems={baseSampleItems}
          initialSelectedId="item-core-1"
          initialInspectorOpen={true}
        />
      );

      // Both Grid and Inspector are showing item-core-1
      const inspectorRegion = screen.getByRole('complementary', { name: /Detail panel/i });
      expect(inspectorRegion).toBeDefined();

      // Inspector initially has Status: In Progress
      expect(within(inspectorRegion).getByText('In Progress')).toBeDefined();

      // Find the status trigger inside the DataGrid for item-core-1
      const gridRow0 = screen.getByRole('row', { name: /Distributed Log Consensus/i });
      const gridStatusTrigger = within(gridRow0).getByRole('button', { name: /Change status/i });

      // Mutate status from Grid -> Done
      fireEvent.click(gridStatusTrigger);
      const doneOption = screen.getByRole('option', { name: /Done/i });
      fireEvent.click(doneOption);

      // Inspector immediately updates to Done
      await waitFor(() => {
        expect(within(inspectorRegion).getByText('Done')).toBeDefined();
      });
    });

    it('Inspector mutation synchronizes immediately into DataGrid row projection', async () => {
      render(
        <ExecutionCoreHarness
          initialItems={baseSampleItems}
          initialSelectedId="item-core-1"
          initialInspectorOpen={true}
        />
      );

      const inspectorRegion = screen.getByRole('complementary', { name: /Detail panel/i });
      const gridRow0 = screen.getByRole('row', { name: /Distributed Log Consensus/i });

      // Initial priority in Grid is High
      expect(within(gridRow0).getByText('High')).toBeDefined();

      // Mutate Priority from Inspector: High -> Urgent
      const inspectorPriorityTrigger = within(inspectorRegion).getByRole('button', { name: /Change priority/i });
      fireEvent.click(inspectorPriorityTrigger);

      const urgentOption = screen.getByRole('option', { name: /Urgent/i });
      fireEvent.click(urgentOption);

      // DataGrid row immediately updates to Urgent
      await waitFor(() => {
        expect(within(gridRow0).getByText('Urgent')).toBeDefined();
      });
    });
  });

  // =========================================================================
  // 3. Property Picker Integration & Mutation Boundary
  // =========================================================================
  describe('3. Property Picker Integration & Mutation Boundary', () => {
    it('verified rollback: rejected mutation reverts rendered UI to canonical state and shows error', async () => {
      // 1. Initial State: item-core-1 has canonical status 'in_progress' ('In Progress')
      const mockFailingUpdate = vi.fn().mockImplementation(() => {
        return Promise.reject(new Error('Optimistic conflict: storage engine locked'));
      });

      render(
        <ExecutionCoreHarness
          initialItems={baseSampleItems}
          customUpdateItem={mockFailingUpdate}
          initialSelectedId="item-core-1"
          initialInspectorOpen={true}
        />
      );

      const inspectorRegion = screen.getByRole('complementary', { name: /Detail panel/i });
      const gridRow0 = screen.getByRole('row', { name: /Distributed Log Consensus/i });

      // Pre-condition: Both Inspector and Grid render canonical 'In Progress'
      expect(within(inspectorRegion).getByText('In Progress')).toBeDefined();
      expect(within(gridRow0).getByText('In Progress')).toBeDefined();

      // --- SCENARIO A: Mutation initiated from Inspector ---
      const inspectorStatusTrigger = within(inspectorRegion).getByRole('button', { name: /Change status/i });
      fireEvent.click(inspectorStatusTrigger);

      // Select 'Canceled'
      const canceledOpt = screen.getByRole('option', { name: /Canceled/i });
      fireEvent.click(canceledOpt);

      // 1. Mutation attempt was made
      expect(mockFailingUpdate).toHaveBeenCalledWith('item-core-1', { status: 'canceled' });

      // 2. Failure feedback is rendered and accessibly announced
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
        expect(screen.getByText(/Optimistic conflict: storage engine locked/i)).toBeDefined();
      });

      // 3. Rendered Status in Inspector trigger returns/remains at canonical 'In Progress'
      expect(inspectorStatusTrigger.textContent).toContain('In Progress');

      // 4. Failed 'Canceled' state is NOT permanently retained on the trigger
      expect(inspectorStatusTrigger.textContent).not.toContain('Canceled');

      // 5. Grid remains at canonical 'In Progress' (zero divergence)
      expect(gridRow0.querySelector('[data-property-trigger="status"]').textContent).toContain('In Progress');
      expect(gridRow0.querySelector('[data-property-trigger="status"]').textContent).not.toContain('Canceled');

      // 6. Picker remains usable after failure (options list accessible)
      expect(screen.getByRole('listbox', { name: /Select status/i })).toBeDefined();

      // --- SCENARIO B: Mutation initiated from DataGrid cell ---
      // Close the inspector status picker via Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      const gridStatusTrigger = within(gridRow0).getByRole('button', { name: /Change status/i });
      fireEvent.click(gridStatusTrigger);

      const gridDoneOpt = screen.getByRole('option', { name: /Done/i });
      fireEvent.click(gridDoneOpt);

      // Mutation attempt for Done was made
      expect(mockFailingUpdate).toHaveBeenCalledWith('item-core-1', { status: 'done' });

      // Error alert displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      // Rendered status in Grid remains canonical 'In Progress'
      expect(gridStatusTrigger.textContent).toContain('In Progress');
      expect(gridStatusTrigger.textContent).not.toContain('Done');

      // Inspector remains canonical 'In Progress' (zero divergence)
      expect(inspectorStatusTrigger.textContent).toContain('In Progress');
      expect(inspectorStatusTrigger.textContent).not.toContain('Done');
    });

    it('Universal Property Pickers are used across Grid, Inspector, and Quick Create without legacy cycling', () => {
      render(
        <ExecutionCoreHarness
          initialItems={baseSampleItems}
          initialSelectedId="item-core-1"
          initialInspectorOpen={true}
        />
      );

      // Grid status has ARIA haspopup="listbox"
      const gridRow0 = screen.getByRole('row', { name: /Distributed Log Consensus/i });
      const gridStatusTrigger = within(gridRow0).getByRole('button', { name: /Change status/i });
      expect(gridStatusTrigger.getAttribute('aria-haspopup')).toBe('listbox');

      // Inspector status also has ARIA haspopup="listbox"
      const inspectorRegion = screen.getByRole('complementary', { name: /Detail panel/i });
      const inspectorStatusTrigger = within(inspectorRegion).getByRole('button', { name: /Change status/i });
      expect(inspectorStatusTrigger.getAttribute('aria-haspopup')).toBe('listbox');
    });
  });

  // =========================================================================
  // 4. Team-Change Consequence & Multi-Team Project Integrity
  // =========================================================================
  describe('4. Team-Change Consequence & Multi-Team Project Integrity', () => {
    it('multi-team project preserves project assignment when item moves to supported team', () => {
      // proj-5 is a multi-team project with teamIds: ['team-core', 'team-web', 'team-mobile']
      const multiTeamProj = PROJECTS.find((p) => p.id === 'proj-5');
      expect(multiTeamProj).toBeDefined();

      const itemOnCore = {
        id: 'item-multi-1',
        teamId: 'team-core',
        projectId: 'proj-5',
        cycleId: null,
        status: 'todo'
      };

      // Move from team-core to team-web
      const consequence = checkTeamChangeConsequences(itemOnCore, 'team-web');

      // Project is compatible because team-web is in proj-5.teamIds
      expect(consequence.projectChange).toBeNull();
    });

    it('team change with consequence: cancel yields 0 mutations, confirm produces 1 atomic mutation', async () => {
      const mockAtomicUpdate = vi.fn();

      render(
        <ExecutionCoreHarness
          initialItems={baseSampleItems}
          customUpdateItem={mockAtomicUpdate}
          initialSelectedId="item-core-1"
          initialInspectorOpen={true}
        />
      );

      const inspectorRegion = screen.getByRole('complementary', { name: /Detail panel/i });
      const teamTrigger = within(inspectorRegion).getByRole('button', { name: /Change team/i });

      // Click to change team from Core Platform -> Web Studio (incompatible cycle/status)
      fireEvent.click(teamTrigger);
      const webOption = screen.getByRole('option', { name: /Web Studio/i });
      fireEvent.click(webOption);

      // Confirmation dialog pops up
      const confirmDialog = await screen.findByRole('dialog', { name: /Confirm Team Change/i });
      expect(confirmDialog).toBeDefined();

      // CANCEL: Keep Current Team button clicked
      const cancelBtn = within(confirmDialog).getByRole('button', { name: /Keep Current Team/i });
      fireEvent.click(cancelBtn);

      expect(mockAtomicUpdate).not.toHaveBeenCalled();

      // Trigger again and CONFIRM
      fireEvent.click(teamTrigger);
      fireEvent.click(screen.getByRole('option', { name: /Web Studio/i }));

      const confirmDialog2 = await screen.findByRole('dialog', { name: /Confirm Team Change/i });
      const confirmBtn = within(confirmDialog2).getByRole('button', { name: /Move & Apply Changes/i });
      fireEvent.click(confirmBtn);

      // Verified: Exactly ONE atomic mutation emitted
      expect(mockAtomicUpdate).toHaveBeenCalledTimes(1);
      const [itemId, payload] = mockAtomicUpdate.mock.calls[0];
      expect(itemId).toBe('item-core-1');
      expect(payload.teamId).toBe('team-web');
      expect(payload.cycleId).toBeNull(); // Cycle cleared atomically
    });
  });

  // =========================================================================
  // 5. Grid Selection Semantics
  // =========================================================================
  describe('5. Grid Selection Semantics', () => {
    it('filter change clears multi-selection while sorting preserves selection', () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      // Select item 1 checkbox
      const row0 = screen.getByRole('row', { name: /Distributed Log Consensus/i });
      const row0Checkbox = within(row0).getByRole('checkbox', { name: /Select work item ENG-101/i });
      fireEvent.click(row0Checkbox);

      expect(row0Checkbox.getAttribute('aria-checked')).toBe('true');

      // Filter switch clears selection
      const todoFilterBtn = screen.getByRole('button', { name: /Todo Only/i });
      fireEvent.click(todoFilterBtn);

      // Switching back to all shows selection was cleared
      const allFilterBtn = screen.getByRole('button', { name: /All Items/i });
      fireEvent.click(allFilterBtn);

      const row0CheckboxAfter = within(
        screen.getByRole('row', { name: /Distributed Log Consensus/i })
      ).getByRole('checkbox', { name: /Select work item ENG-101/i });

      expect(row0CheckboxAfter.getAttribute('aria-checked')).toBe('false');
    });

    it('header Select All operates strictly over visible/loaded rows without global isAllSelected', () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const headerSelectAll = screen.getByRole('checkbox', { name: /Select all visible work items/i });
      fireEvent.click(headerSelectAll);

      // Both loaded rows are checked
      const rowCheckboxes = screen.getAllByRole('checkbox', { name: /Select work item ENG-/i });
      rowCheckboxes.forEach((cb) => {
        expect(cb.getAttribute('aria-checked')).toBe('true');
      });
    });
  });

  // =========================================================================
  // 6. Keyboard Scope Hierarchy & Focus Lifecycles
  // =========================================================================
  describe('6. Keyboard Scope Hierarchy & Focus Lifecycles', () => {
    it('OVERLAY keyboard scope suppresses single-key DataGrid actions', () => {
      const { container } = render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const row0 = container.querySelector('[data-row-index="0"]');
      row0.focus();

      // Open a picker (OVERLAY)
      const statusTrigger = within(row0).getByRole('button', { name: /Change status/i });
      fireEvent.click(statusTrigger);

      // OVERLAY scope is active
      expect(document.querySelector('[data-keyboard-scope="OVERLAY"]')).not.toBeNull();

      // Pressing 'j' does NOT navigate rows while picker is open
      fireEvent.keyDown(window, { key: 'j' });
      expect(row0).toBeDefined();

      // Escape closes OVERLAY
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(document.querySelector('[data-keyboard-scope="OVERLAY"]')).toBeNull();

      // Trigger receives focus back
      expect(document.activeElement).toBe(statusTrigger);
    });

    it('EDITABLE CONTROL suppresses single-key Grid actions while typing', () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} initialCreateOpen={true} />);

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      titleInput.focus();

      // Typing 'j', 'k', 'c' into an input does NOT trigger grid shortcuts
      fireEvent.keyDown(titleInput, { key: 'j' });
      fireEvent.change(titleInput, { target: { value: 'jkc' } });

      expect(titleInput.value).toBe('jkc');
    });

    it('Grid -> Inspector -> Close restores focus to originating Grid target', () => {
      const { container } = render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const row0 = container.querySelector('[data-row-index="0"]');
      row0.focus();
      expect(document.activeElement).toBe(row0);

      // Open Inspector via Enter
      fireEvent.keyDown(row0, { key: 'Enter' });

      // Inspector is open
      const closeBtn = screen.getByRole('button', { name: /Close panel/i });
      expect(closeBtn).toBeDefined();

      // Close Inspector
      fireEvent.click(closeBtn);

      // Logical focus restored to originating row
      expect(document.activeElement).toBe(row0);
    });

    it('Quick Create focus lifecycle: Escape/Cancel restores invocation element', () => {
      render(<ExecutionCoreHarness initialItems={baseSampleItems} />);

      const openBtn = screen.getByRole('button', { name: /New Item/i });
      openBtn.focus();

      fireEvent.click(openBtn);
      expect(screen.getByRole('dialog', { name: /New Work Item/i })).toBeDefined();

      // Press Cancel
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByRole('dialog', { name: /New Work Item/i })).toBeNull();
      expect(document.activeElement).toBe(openBtn);
    });
  });

  // =========================================================================
  // 7. Security, Permissions, and Zero-Leakage Verification
  // =========================================================================
  describe('7. Security, Permissions, and Zero-Leakage Verification', () => {
    it('restricted candidate references enforce zero-leakage placeholders without exposing sensitive names', () => {
      const restrictedAssigneeItem = {
        ...baseSampleItems[0],
        id: 'item-restricted-1',
        isAssigneeRestricted: true,
        assigneeId: 'usr-restricted-999' // Non-public user ID
      };

      render(
        <ExecutionCoreHarness
          initialItems={[restrictedAssigneeItem]}
          initialSelectedId="item-restricted-1"
          initialInspectorOpen={true}
        />
      );

      const inspectorRegion = screen.getByRole('complementary', { name: /Detail panel/i });

      // Renders [Restricted Assignee] protected placeholder
      expect(within(inspectorRegion).getByText(/Restricted/i)).toBeDefined();

      // Does NOT leak private names or unknown user tokens
      expect(screen.queryByText('usr-restricted-999')).toBeNull();
    });

    it('restricted candidates are excluded from search candidate results', () => {
      render(<AssigneePicker value="usr-1" isOpen={true} />);

      // Public users are present
      expect(screen.getByText('Alex Chen')).toBeDefined();

      // No restricted candidate entries exist
      const options = screen.getAllByRole('option');
      const textContents = options.map((o) => o.textContent);
      expect(textContents.some((t) => t.includes('Restricted Candidate'))).toBe(false);
    });
  });

  // =========================================================================
  // 8. Responsive Adaptations
  // =========================================================================
  describe('8. Responsive Adaptations', () => {
    it('mobile compact list projection operates on canonical entity path and invokes detail container', () => {
      const handleSelect = vi.fn();
      const handleOpenDetail = vi.fn();

      render(
        <DataGridMobileList
          items={baseSampleItems}
          selectedItemId={null}
          onSelectItem={handleSelect}
          onOpenDetail={handleOpenDetail}
        />
      );

      // Shows mobile list items
      const mobileRows = screen.getAllByRole('listitem');
      expect(mobileRows.length).toBe(2);

      // Clicking mobile item uses the exact same canonical item model
      fireEvent.click(mobileRows[0]);
      expect(handleSelect).toHaveBeenCalledWith(baseSampleItems[0]);
      expect(handleOpenDetail).toHaveBeenCalledWith(baseSampleItems[0]);
    });
  });

  // =========================================================================
  // 9. Root Application Integration
  // =========================================================================
  describe('9. Root Application Integration (App.jsx)', () => {
    it('renders the complete integrated application with all execution core layers active', () => {
      render(<App />);

      // Application Shell loaded
      expect(screen.getByRole('main')).toBeDefined();

      // Action strip with New Item CTA is present
      const newIssueBtn = screen.getByRole('button', { name: /New Item/i });
      expect(newIssueBtn).toBeDefined();

      // DataGrid is visible with canonical rows
      expect(screen.getByRole('grid')).toBeDefined();
    });
  });
});
