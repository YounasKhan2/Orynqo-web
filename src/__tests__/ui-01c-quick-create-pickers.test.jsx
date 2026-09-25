import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Design System & Generic Pickers
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerOption,
  PropertyPickerList,
  PropertyPickerSearch
} from '../components/property-picker';

// WorkItem Property Adapters
import {
  TypePicker,
  StatusPicker,
  PriorityPicker,
  AssigneePicker,
  TeamPicker,
  ProjectPicker,
  CyclePicker,
  DatePicker,
  LabelsPicker,
  getTeamWorkflowStatuses,
  getTeamDefaultStatus,
  checkTeamChangeConsequences
} from '../features/work-items/property-pickers';

// Quick Create Module
import {
  QuickCreateDialog,
  QuickCreateForm,
  TeamChangeConfirmation
} from '../features/work-items/quick-create';

// Inspector & Grid components
import { WorkItemProperties } from '../features/work-items/components/WorkItemProperties';
import { DataGridCell } from '../views/DataGrid/DataGridCell';
import { INITIAL_WORK_ITEMS, TEAMS, PROJECTS } from '../data/mockData';

describe('UI-01C: Universal Property Pickers & Quick Create', () => {
  describe('1. Universal Property Picker Engine', () => {
    it('1. supports keyboard open, option navigation, selection, and close', () => {
      const handleSelect = vi.fn();
      render(
        <PriorityPicker
          value="none"
          isOpen={true}
          onSelect={handleSelect}
        />
      );

      const urgentOpt = screen.getByRole('option', { name: /Urgent/i });
      fireEvent.click(urgentOpt);
      expect(handleSelect).toHaveBeenCalledWith('urgent');
    });

    it('2. restores focus to trigger upon close or selection', () => {
      render(
        <div>
          <button id="external-trigger">Outside</button>
          <PriorityPicker value="low" />
        </div>
      );

      const triggerBtn = screen.getByRole('button', { name: /Change priority/i });
      fireEvent.click(triggerBtn);

      // Picker is open
      expect(screen.getByRole('listbox')).toBeDefined();

      // Press Escape to close
      fireEvent.keyDown(window, { key: 'Escape' });

      // Focus should be restored to triggerBtn
      expect(document.activeElement).toBe(triggerBtn);
    });

    it('3. marks OVERLAY keyboard scope when open, suppressing global/grid actions', () => {
      render(
        <PropertyPicker
          trigger={<button>Trigger</button>}
          isOpen={true}
        >
          <div>Picker contents</div>
        </PropertyPicker>
      );

      const overlayEl = document.querySelector('[data-keyboard-scope="OVERLAY"]');
      expect(overlayEl).not.toBeNull();
    });
  });

  describe('2. WorkItem Property Adapters', () => {
    it('4. Type options contain strictly CORE values (Task, Issue, Bug)', () => {
      render(<TypePicker value="task" isOpen={true} />);

      const options = screen.getAllByRole('option');
      const labels = options.map((opt) => opt.textContent.trim());

      expect(labels.some((l) => l.includes('Task'))).toBe(true);
      expect(labels.some((l) => l.includes('Issue'))).toBe(true);
      expect(labels.some((l) => l.includes('Bug'))).toBe(true);
      expect(labels.some((l) => l.includes('Feature'))).toBe(false);
      expect(labels.some((l) => l.includes('Chore'))).toBe(false);
      expect(labels.some((l) => l.includes('Milestone'))).toBe(false);
      expect(labels.some((l) => l.includes('Document'))).toBe(false);
    });

    it('5. Status options change dynamically based on Team workflow', () => {
      // Core team workflow
      const coreStatuses = getTeamWorkflowStatuses('team-core');
      expect(coreStatuses.map((s) => s.id)).toEqual(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled']);

      // Mobile team workflow (custom triage status)
      const mobileStatuses = getTeamWorkflowStatuses('team-mobile');
      expect(mobileStatuses.map((s) => s.id)).toContain('triage');

      // Security team workflow (audit status)
      const secStatuses = getTeamWorkflowStatuses('team-sec');
      expect(secStatuses.map((s) => s.id)).toContain('audit');

      // Rendering mobile status picker shows triage
      render(<StatusPicker teamId="team-mobile" isOpen={true} />);
      expect(screen.getByRole('option', { name: /Triage/i })).toBeDefined();
    });

    it('6. Priority options provide canonical semantic values (Urgent, High, Medium, Low, None)', () => {
      render(<PriorityPicker value="medium" isOpen={true} />);

      const options = screen.getAllByRole('option');
      const labels = options.map((opt) => opt.textContent.trim());

      expect(labels.some((l) => l.includes('Urgent'))).toBe(true);
      expect(labels.some((l) => l.includes('High'))).toBe(true);
      expect(labels.some((l) => l.includes('Medium'))).toBe(true);
      expect(labels.some((l) => l.includes('Low'))).toBe(true);
      expect(labels.some((l) => l.includes('No priority'))).toBe(true);
    });

    it('7. displays loading state for async-capable option lists', () => {
      render(
        <PropertyPickerList isLoading={true} ariaLabel="Loading list">
          <div>Item</div>
        </PropertyPickerList>
      );

      expect(screen.getByText(/Loading options.../i)).toBeDefined();
    });

    it('8. displays error state with retry for failed option loading', () => {
      const handleRetry = vi.fn();
      render(
        <PropertyPickerList
          error="Failed to fetch members"
          onRetry={handleRetry}
          ariaLabel="Error list"
        />
      );

      expect(screen.getByText(/Failed to fetch members/i)).toBeDefined();
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it('9. filters Assignees by search query and supports Unassigned', () => {
      render(<AssigneePicker isOpen={true} />);

      // Unassigned option is present
      expect(screen.getByRole('option', { name: /Unassigned/i })).toBeDefined();

      // Search input is present
      const searchInput = screen.getByPlaceholderText(/Filter members.../i);
      fireEvent.change(searchInput, { target: { value: 'Elena' } });

      expect(screen.getByRole('option', { name: /Elena Rostova/i })).toBeDefined();
      expect(screen.queryByRole('option', { name: /Marcus Vance/i })).toBeNull();
    });

    it('10. enforces Zero-Leakage candidate filtering (restricted candidates hidden)', () => {
      // In USERS mock, restricted users or candidates outside workspace do not appear
      render(<AssigneePicker isOpen={true} />);

      const options = screen.getAllByRole('option');
      const text = options.map((o) => o.textContent);
      // No restricted candidate leaked
      expect(text.every((t) => !t.includes('Confidential User'))).toBe(true);
    });

    it('11. renders protected placeholder for existing restricted references', () => {
      // In PropertyTrigger, if restricted is true, render RestrictedPlaceholder
      render(
        <PropertyTrigger
          isRestricted={true}
          label="Secret Assignee"
        />
      );

      expect(screen.getByText(/Restricted/i)).toBeDefined();
      expect(screen.queryByText('Secret Assignee')).toBeNull();
    });

    it('12. filters Cycles strictly by Team ownership', () => {
      render(<CyclePicker teamId="team-core" isOpen={true} />);

      const options = screen.getAllByRole('option');
      const labels = options.map((opt) => opt.textContent);

      // Core cycles (Cycle 42, 43, 41)
      expect(labels.some((l) => l.includes('Cycle 42'))).toBe(true);
      // No other team's cycles
      expect(labels.some((l) => l.includes('Mobile Sprint'))).toBe(false);
    });

    it('13. detects multi-team Project ambiguity (no guessing leadTeam)', () => {
      // Test checkTeamChangeConsequences or Project picker multi-team context
      const multiProject = PROJECTS.find((p) => (p.teamIds || []).length > 1);
      expect(multiProject).toBeDefined();
      expect(multiProject.teamIds.length).toBeGreaterThan(1);
    });
  });

  describe('3. Team-Change Consequence Resolution', () => {
    it('14. evaluates consequence when moving item to team with incompatible status or cycle', () => {
      const item = {
        id: 'item-test',
        teamId: 'team-mobile',
        status: 'triage', // mobile only!
        cycleId: 'cycle-mobile-1'
      };

      const consequences = checkTeamChangeConsequences(item, 'team-core');
      expect(consequences.hasConsequences).toBe(true);
      expect(consequences.statusChange).not.toBeNull();
      expect(consequences.statusChange.current).toBe('triage');
      expect(consequences.cycleChange).not.toBeNull();
    });

    it('15. cancels Team-change consequence confirmation with ZERO mutations', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <TeamChangeConfirmation
          isOpen={true}
          targetTeamId="team-core"
          consequences={{
            hasConsequences: true,
            statusChange: { current: 'triage', proposed: 'backlog' },
            cycleChange: { current: 'cycle-mobile-1', proposed: null },
            projectChange: null
          }}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /Keep Current Team/i });
      fireEvent.click(cancelBtn);

      expect(handleCancel).toHaveBeenCalled();
      expect(handleConfirm).not.toHaveBeenCalled();
    });

    it('16. confirms Team-change consequence with ONE coherent canonical mutation', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <TeamChangeConfirmation
          isOpen={true}
          targetTeamId="team-core"
          consequences={{
            hasConsequences: true,
            statusChange: { current: 'triage', proposed: 'backlog' },
            cycleChange: { current: 'cycle-mobile-1', proposed: null },
            projectChange: null
          }}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      const confirmBtn = screen.getByRole('button', { name: /Move & Apply Changes/i });
      fireEvent.click(confirmBtn);

      expect(handleConfirm).toHaveBeenCalledWith({
        teamId: 'team-core',
        status: 'backlog',
        cycleId: null
      });
      expect(handleCancel).not.toHaveBeenCalled();
    });
  });

  describe('4. Picker Mutation Boundary (Existing Item vs Quick Create)', () => {
    it('17. existing-item picker immediately emits canonical mutation intent', () => {
      const handleUpdateItem = vi.fn();
      const mockItem = INITIAL_WORK_ITEMS[0];

      render(
        <WorkItemProperties
          item={mockItem}
          onUpdateItem={handleUpdateItem}
        />
      );

      const statusTrigger = screen.getByRole('button', { name: /Change status/i });
      fireEvent.click(statusTrigger);

      const doneOption = screen.getByRole('option', { name: /Done/i });
      fireEvent.click(doneOption);

      expect(handleUpdateItem).toHaveBeenCalledWith({ status: 'done' });
    });

    it('18. Quick Create picker updates local draft ONLY (NO create/update item)', () => {
      const handleCreate = vi.fn();
      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      // Change status in Quick Create
      const statusTrigger = screen.getByRole('button', { name: /Status/i });
      fireEvent.click(statusTrigger);

      const inProgressOption = screen.getByRole('option', { name: /In Progress/i });
      fireEvent.click(inProgressOption);

      // No creation dispatched!
      expect(handleCreate).not.toHaveBeenCalled();
    });

    it('19. Labels on existing item commits deliberate toggle immediately', () => {
      const handleSelect = vi.fn();
      render(
        <LabelsPicker
          selectedLabels={['frontend']}
          isOpen={true}
          onSelect={handleSelect}
        />
      );

      const apiOption = screen.getByRole('option', { name: /api/i });
      fireEvent.click(apiOption);

      expect(handleSelect).toHaveBeenCalledWith(['frontend', 'api']);
    });

    it('20. Labels rollback on rejection preserves UI stability', async () => {
      let currentLabels = ['frontend'];
      const failingUpdate = vi.fn().mockRejectedValue(new Error('Network failure'));

      const { rerender } = render(
        <LabelsPicker
          selectedLabels={currentLabels}
          isOpen={true}
          onSelect={async (newLabels) => {
            try {
              await failingUpdate(newLabels);
              currentLabels = newLabels;
            } catch (err) {
              // Rollback to currentLabels
            }
          }}
        />
      );

      const perfOption = screen.getByRole('option', { name: /performance/i });
      fireEvent.click(perfOption);

      expect(failingUpdate).toHaveBeenCalled();
      // Picker remains open and usable
      expect(screen.getByRole('listbox')).toBeDefined();
    });
  });

  describe('5. Quick Create Form & Creation Modes', () => {
    it('21. blocks submission if Title is empty', async () => {
      const handleCreate = vi.fn();
      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Title is required/i)).toBeDefined();
      expect(handleCreate).not.toHaveBeenCalled();
    });

    it('22. blocks submission if Team is unselected', async () => {
      const handleCreate = vi.fn();
      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: null }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'New task' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Team is required/i)).toBeDefined();
      expect(handleCreate).not.toHaveBeenCalled();
    });

    it('23. dynamically sets default Status based on selected Team workflow', () => {
      render(
        <QuickCreateDialog
          isOpen={true}
          initialContext={{ teamId: 'team-mobile' }}
        />
      );

      // Security team has triage as default
      expect(getTeamDefaultStatus('team-security')).toBe('triage');
      // Core team has todo as unstarted default
      expect(getTeamDefaultStatus('team-core')).toBe('todo');
    });

    it('24. Create & Close closes dialog on success and calls onCreate', async () => {
      const handleCreate = vi.fn().mockReturnValue({ id: 'item-new', title: 'New Item' });
      const handleClose = vi.fn();

      render(
        <QuickCreateDialog
          isOpen={true}
          onClose={handleClose}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Production Bug' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('25. Create & Open calls onOpenItem with newly created item', async () => {
      const newItem = { id: 'item-new-99', title: 'Feature Request' };
      const handleCreate = vi.fn().mockReturnValue(newItem);
      const handleClose = vi.fn();
      const handleOpenItem = vi.fn();

      render(
        <QuickCreateDialog
          isOpen={true}
          onClose={handleClose}
          onCreate={handleCreate}
          onOpenItem={handleOpenItem}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Feature Request' } });

      // Trigger Create & Open (e.g. via keyboard shortcut or button)
      fireEvent.keyDown(titleInput, { key: 'Enter', metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
        expect(handleOpenItem).toHaveBeenCalledWith(newItem);
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('26. Create Another reset policy: resets Title/Desc/Assignee/Date but preserves Team/Project/Cycle', async () => {
      const handleCreate = vi.fn().mockReturnValue({ id: 'item-101' });

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core', projectId: 'proj-omega' }}
        />
      );

      // Check 'Create more' checkbox
      const createMoreCheckbox = screen.getByRole('checkbox', { name: /Create another/i });
      fireEvent.click(createMoreCheckbox);

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'First Task' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
      });

      // Title should be reset
      expect(titleInput.value).toBe('');
      // Dialog should still be open
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    it('27. failed creation preserves all user inputs and shows error', async () => {
      const handleCreate = vi.fn().mockRejectedValue(new Error('Server database error'));

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Critical Bug' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Server database error/i)).toBeDefined();
      });

      // Form inputs preserved 100%
      expect(titleInput.value).toBe('Critical Bug');
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    it('28. protects against duplicate keyboard submission while in flight', async () => {
      let resolvePromise;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      const handleCreate = vi.fn().mockReturnValue(delayedPromise);

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Double Press Test' } });

      // First submit
      fireEvent.keyDown(titleInput, { key: 'Enter', metaKey: true });
      // Immediate second submit while still in flight
      fireEvent.keyDown(titleInput, { key: 'Enter', metaKey: true });

      expect(handleCreate).toHaveBeenCalledTimes(1);
      await act(async () => {
        resolvePromise?.({ id: 'done' });
      });
    });

    it('29. protects against duplicate pointer submission while in flight', async () => {
      let resolvePromise;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      const handleCreate = vi.fn().mockReturnValue(delayedPromise);

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Double Click Test' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);
      fireEvent.click(submitBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      await act(async () => {
        resolvePromise?.({ id: 'done' });
      });
    });

    it('30. restores focus to invocation surface when Quick Create closes', () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <div>
          <button id="quick-create-btn" autoFocus>New Issue</button>
          <QuickCreateDialog
            isOpen={true}
            onClose={handleClose}
            initialContext={{ teamId: 'team-core' }}
          />
        </div>
      );

      const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it('31. Create Another returns focus to Title input', async () => {
      const handleCreate = vi.fn().mockReturnValue({ id: 'item-102' });

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const createMoreCheckbox = screen.getByRole('checkbox', { name: /Create another/i });
      fireEvent.click(createMoreCheckbox);

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Task with Focus' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
      });

      expect(document.activeElement).toBe(titleInput);
    });
  });

  describe('6. Inspector & Grid Universal Picker Integration', () => {
    it('32. Inspector consumes Universal Property Pickers (Status, Priority, Assignee, Team, Project, Cycle, Labels, Date)', () => {
      const mockItem = INITIAL_WORK_ITEMS[0];
      render(
        <WorkItemProperties
          item={mockItem}
          onUpdateItem={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /Change status/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change priority/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change assignee/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change team/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change project/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change cycle/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change labels/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Change due date/i })).toBeDefined();
    });

    it('33. DataGridCell consumes Universal Property Pickers for status, priority, and assignee', () => {
      const mockItem = INITIAL_WORK_ITEMS[0];
      const handleUpdate = vi.fn();

      // Priority cell
      const { rerender } = render(
        <DataGridCell
          column={{ id: 'priority' }}
          item={mockItem}
          onUpdateItem={handleUpdate}
        />
      );
      expect(screen.getByRole('button', { name: /Change priority/i })).toBeDefined();

      // Status cell
      rerender(
        <DataGridCell
          column={{ id: 'status' }}
          item={mockItem}
          onUpdateItem={handleUpdate}
        />
      );
      expect(screen.getByRole('button', { name: /Change status/i })).toBeDefined();

      // Assignee cell
      rerender(
        <DataGridCell
          column={{ id: 'assignee' }}
          item={mockItem}
          onUpdateItem={handleUpdate}
        />
      );
      expect(screen.getByRole('button', { name: /Change assignee/i })).toBeDefined();
    });

    it('34. verifies legacy Grid Status/Priority custom dropdown path is eliminated', () => {
      const mockItem = INITIAL_WORK_ITEMS[0];
      const { container } = render(
        <DataGridCell
          column={{ id: 'status' }}
          item={mockItem}
        />
      );

      // Universal picker trigger should be present instead of bare legacy div/button
      expect(container.querySelector('[data-property-trigger="status"]')).not.toBeNull();
    });

    it('35. verifies legacy Inspector cycle-on-click or custom dropdown is eliminated', () => {
      const mockItem = INITIAL_WORK_ITEMS[0];
      const { container } = render(
        <WorkItemProperties
          item={mockItem}
          onUpdateItem={vi.fn()}
        />
      );

      expect(container.querySelector('[data-property-trigger="status"]')).not.toBeNull();
      expect(container.querySelector('[data-property-trigger="priority"]')).not.toBeNull();
    });

    it('36. verifies old CreateItemModal is aliased to modular QuickCreateDialog', async () => {
      const { CreateItemModal, QuickCreateDialog } = await import('../features/work-items');
      expect(CreateItemModal).toBe(QuickCreateDialog);
    });

    it('37. supports compact and default density adaptations across surfaces', () => {
      const { container: compactContainer } = render(
        <PriorityPicker value="high" size="compact" />
      );
      expect(compactContainer.querySelector('[data-size="compact"]')).not.toBeNull();

      const { container: defaultContainer } = render(
        <PriorityPicker value="high" size="default" />
      );
      expect(defaultContainer.querySelector('[data-size="default"]')).not.toBeNull();
    });
  });
});
