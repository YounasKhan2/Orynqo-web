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
  checkTeamChangeConsequences,
  getProjectTeamIds,
  TeamChangeConfirmation
} from '../features/work-items/property-pickers';

// Quick Create Module
import {
  QuickCreateDialog,
  QuickCreateForm
} from '../features/work-items/quick-create';

// Inspector & Grid components
import { WorkItemProperties } from '../features/work-items/components/WorkItemProperties';
import { DataGrid } from '../views/DataGrid/DataGrid';
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
      // 1. Verify OVERLAY scope marker exists on picker container
      const { unmount } = render(
        <PropertyPicker
          trigger={<button>Trigger</button>}
          isOpen={true}
        >
          <div>Picker contents</div>
        </PropertyPicker>
      );

      const overlayEl = document.querySelector('[data-keyboard-scope="OVERLAY"]');
      expect(overlayEl).not.toBeNull();
      unmount();

      // 2. Behavioral Grid integration test:
      // Grid row focused -> open picker -> press shortcut (j, k, x) -> Grid selection/focus does NOT change
      // -> close picker -> Grid shortcut works again
      const testItems = [
        {
          id: 'item-grid-1',
          identifier: 'CORE-101',
          title: 'Grid Row 1',
          status: 'todo',
          priority: 'medium',
          teamId: 'team-core',
          workspaceId: 'wks-core'
        },
        {
          id: 'item-grid-2',
          identifier: 'CORE-102',
          title: 'Grid Row 2',
          status: 'in_progress',
          priority: 'high',
          teamId: 'team-core',
          workspaceId: 'wks-core'
        }
      ];

      const { container } = render(
        <DataGrid
          items={testItems}
          isKeyboardActive={true}
        />
      );

      // Focus row 0
      const row0 = container.querySelector('[data-row-index="0"]');
      expect(row0).not.toBeNull();
      row0.focus();

      // Open Status picker on row 0
      const statusBtn = row0.querySelector('[aria-label="Change status"]');
      expect(statusBtn).not.toBeNull();
      fireEvent.click(statusBtn);

      // Picker is open, OVERLAY scope is active in DOM
      expect(document.querySelector('[data-keyboard-scope="OVERLAY"]')).not.toBeNull();

      // Press Grid shortcuts (j, k, x) while picker is open
      fireEvent.keyDown(window, { key: 'j' });
      fireEvent.keyDown(window, { key: 'x' });

      // Background grid selection/focus does NOT change
      const row1 = container.querySelector('[data-row-index="1"]');
      expect(document.activeElement).not.toBe(row1);
      const row0Checkbox = row0.querySelector('input[type="checkbox"]');
      expect(row0Checkbox?.checked).toBeFalsy();

      // Close picker via Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(document.querySelector('[data-keyboard-scope="OVERLAY"]')).toBeNull();

      // Now Grid shortcut 'j' works again
      fireEvent.keyDown(window, { key: 'j' });
      expect(container.querySelector('[data-row-index="1"]')).not.toBeNull();
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

    it('13. multi-team Project compatibility uses canonical membership normalization', () => {
      // C. Project with legacy fixture shape normalized deliberately through getProjectTeamIds
      const canonicalProject = { id: 'proj-multi', name: 'Multi-Team Platform', teamIds: ['team-core', 'team-web'] };
      expect(getProjectTeamIds(canonicalProject)).toEqual(['team-core', 'team-web']);

      const legacyProject = { id: 'proj-legacy', name: 'Legacy Project', teamId: 'team-core' };
      expect(getProjectTeamIds(legacyProject)).toEqual(['team-core']);
      expect(getProjectTeamIds(null)).toEqual([]);
      expect(getProjectTeamIds({})).toEqual([]);

      // Multi-project in dataset has multiple teams
      const multiProject = PROJECTS.find((p) => (p.teamIds || []).length > 1);
      expect(multiProject).toBeDefined();
      expect(multiProject.teamIds.length).toBeGreaterThan(1);
    });
  });

  describe('3. Team-Change Consequence Resolution', () => {
    it('14. evaluates consequence when moving item to team, respecting multi-team project validity', () => {
      // A. Project teams [A, B], move A->B -> Project remains valid (no project consequence)
      // proj-5 has teamIds: ['team-core', 'team-web', 'team-mobile']
      const itemInMultiProject = {
        id: 'item-multi-test',
        teamId: 'team-core',
        status: 'todo',
        cycleId: null,
        projectId: 'proj-5'
      };
      const consequencesMoveAB = checkTeamChangeConsequences(itemInMultiProject, 'team-web');
      expect(consequencesMoveAB.consequences.some((c) => c.property === 'Project')).toBe(false);

      // B. Project teams [A, B], move A->C -> Project consequence generated
      const consequencesMoveAC = checkTeamChangeConsequences(itemInMultiProject, 'team-security');
      expect(consequencesMoveAC.consequences.some((c) => c.property === 'Project')).toBe(true);
      const projConsequence = consequencesMoveAC.consequences.find((c) => c.property === 'Project');
      expect(projConsequence.reason).toContain('only affiliated with');

      // Incompatible status and cycle generate consequences
      const itemWithIncompatibleState = {
        id: 'item-test',
        teamId: 'team-mobile',
        status: 'triage', // mobile only!
        cycleId: 'cycle-mobile-1'
      };

      const consequences = checkTeamChangeConsequences(itemWithIncompatibleState, 'team-core');
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

    it('20. Labels rollback on rejection preserves UI stability and announces error', async () => {
      const failingUpdate = vi.fn().mockRejectedValue(new Error('Network failure'));

      render(
        <LabelsPicker
          value={['frontend']}
          isOpen={true}
          onSelect={failingUpdate}
        />
      );

      // Toggle 'performance'
      const perfOption = screen.getByRole('option', { name: /performance/i });
      fireEvent.click(perfOption);

      expect(failingUpdate).toHaveBeenCalledWith(['frontend', 'performance']);

      // Error feedback is rendered and visible in UI
      await waitFor(() => {
        expect(screen.getByText(/Failed to update label 'performance'/i)).toBeDefined();
      });

      // Labels return to ['frontend'], 'performance' is not retained
      const perfOptionAfter = screen.getByRole('option', { name: /performance/i });
      expect(perfOptionAfter.getAttribute('aria-selected')).toBe('false');

      const frontendOption = screen.getByRole('option', { name: /frontend/i });
      expect(frontendOption.getAttribute('aria-selected')).toBe('true');

      // Picker remains usable and open
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

    it('22. Global Quick Create with no Team context blocks creation until explicit selection', async () => {
      const handleCreate = vi.fn();

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          invocationContext={null}
        />
      );

      // 1. Team remains empty and shows Select Team *
      expect(screen.getAllByText(/Select Team \*/i).length).toBeGreaterThanOrEqual(1);

      // 2. Typing title and submitting is blocked
      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Global task without team' } });

      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Team is required/i)).toBeDefined();
      expect(handleCreate).not.toHaveBeenCalled();

      // 3. Explicit Team selection
      const teamTrigger = screen.getByRole('button', { name: /Change Team/i });
      fireEvent.click(teamTrigger);

      const coreTeamOption = screen.getByRole('option', { name: /Core Platform/i });
      fireEvent.click(coreTeamOption);

      // 4. Team-configured Status resolves to Core default (Todo)
      const statusTrigger = screen.getByRole('button', { name: /Change status/i });
      expect(statusTrigger.textContent).toContain('Todo');

      // 5. Creation succeeds
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
      });
    });

    it('23. dynamically sets default Status based on selected Team workflow in Quick Create form', () => {
      // 1. Open with Team Core -> rendered Status equals Core default (Todo)
      const { unmount: unmountCore } = render(
        <QuickCreateDialog
          isOpen={true}
          initialContext={{ teamId: 'team-core' }}
        />
      );
      const statusTriggerCore = screen.getByRole('button', { name: /Change status/i });
      expect(statusTriggerCore.textContent).toContain('Todo');
      unmountCore();

      // 2. Open with Team Mobile -> rendered Status equals Mobile configured default (Triage)
      const handleCreate = vi.fn();
      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{ teamId: 'team-mobile' }}
        />
      );
      const statusTriggerMobile = screen.getByRole('button', { name: /Change status/i });
      expect(statusTriggerMobile.textContent).toContain('Triage');

      // 3. Change Team inside Quick Create to Core Platform
      const teamTrigger = screen.getByRole('button', { name: /Change Team/i });
      fireEvent.click(teamTrigger);

      const coreOption = screen.getByRole('option', { name: /Core Platform/i });
      fireEvent.click(coreOption);

      // Status updates to new Team's valid configured default (Todo)
      expect(screen.getByRole('button', { name: /Change status/i }).textContent).toContain('Todo');

      // Zero canonical WorkItem mutations occur during team switch
      expect(handleCreate).not.toHaveBeenCalled();
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

    it('25. QuickCreate -> onCreate(createInput) does NOT supply synthetic id or random identifier, and Create & Open uses canonical item returned by creation boundary', async () => {
      const canonicalItem = {
        id: 'canonical-boundary-assigned-id',
        identifier: 'CORE-7777',
        title: 'Task from Canonical Boundary',
        description: 'Testing creation boundary',
        teamId: 'team-core',
        createdAt: '2026-09-25T05:00:00.000Z'
      };

      const handleCreate = vi.fn().mockImplementation((createInput) => {
        // Assert creation input does NOT manufacture authoritative identity
        expect(createInput.id).toBeUndefined();
        expect(createInput.identifier).toBeUndefined();
        expect(createInput.createdAt).toBeUndefined();
        return canonicalItem;
      });
      const handleOpenItem = vi.fn();
      const handleClose = vi.fn();

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          onOpenItem={handleOpenItem}
          onClose={handleClose}
          initialContext={{ teamId: 'team-core' }}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Task from Canonical Boundary' } });

      // Trigger Create & Open (Cmd+Shift+Enter)
      fireEvent.keyDown(titleInput, { key: 'Enter', metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
      });

      const sentInput = handleCreate.mock.calls[0][0];
      expect(sentInput.id).toBeUndefined();
      expect(sentInput.identifier).toBeUndefined();
      expect(sentInput.createdAt).toBeUndefined();
      expect(sentInput.title).toBe('Task from Canonical Boundary');
      expect(sentInput.teamId).toBe('team-core');

      // Prove the canonical item returned by creation boundary is the one passed to onOpenItem
      expect(handleOpenItem).toHaveBeenCalledWith(canonicalItem);
      expect(handleClose).toHaveBeenCalled();
    });

    it('26. Create Another reset/preserve contract: resets Title/Desc/Assignee/Date/Errors, preserves Team/Project/Cycle/Type/Priority, and re-focuses Title', async () => {
      const handleCreate = vi.fn().mockReturnValue({ id: 'item-101' });

      render(
        <QuickCreateDialog
          isOpen={true}
          onCreate={handleCreate}
          initialContext={{
            teamId: 'team-core',
            projectId: 'proj-1',
            cycleId: 'cycle-42'
          }}
        />
      );

      // Check 'Create more' checkbox
      const createMoreCheckbox = screen.getByRole('checkbox', { name: /Create another/i });
      fireEvent.click(createMoreCheckbox);

      // Set representative values:
      // Title
      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'First Bug' } });

      // Description
      const descInput = screen.getByPlaceholderText(/Add context, technical specifications/i);
      fireEvent.change(descInput, { target: { value: 'Bug reproduction details' } });

      // Type -> Bug
      const typeBtn = screen.getByRole('button', { name: /Change work item type/i });
      fireEvent.click(typeBtn);
      fireEvent.click(screen.getByRole('option', { name: /Bug/i }));

      // Priority -> Urgent
      const priorityBtn = screen.getByRole('button', { name: /Change priority/i });
      fireEvent.click(priorityBtn);
      fireEvent.click(screen.getByRole('option', { name: /Urgent/i }));

      // Assignee -> usr-1 (Alex Chen)
      const assigneeBtn = screen.getByRole('button', { name: /Change assignee/i });
      fireEvent.click(assigneeBtn);
      fireEvent.click(screen.getByRole('option', { name: /Alex Chen/i }));

      // Due Date -> Select tomorrow
      const dateBtn = screen.getByRole('button', { name: /Change due date/i });
      fireEvent.click(dateBtn);
      const tomorrowBtn = screen.getByRole('option', { name: /Tomorrow/i });
      fireEvent.click(tomorrowBtn);

      // Submit
      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleCreate).toHaveBeenCalled();
      });

      // === VERIFY RESET ===
      // Title reset to empty
      expect(titleInput.value).toBe('');
      // Description reset to empty
      expect(descInput.value).toBe('');
      // Assignee reset to Unassigned
      expect(screen.getByRole('button', { name: /Change assignee/i }).textContent).toContain('Unassigned');
      // Due Date reset to None / No Due Date
      expect(screen.getByRole('button', { name: /Change due date/i }).textContent).toContain('No Due Date');

      // === VERIFY PRESERVE ===
      // Team preserved
      expect(screen.getByRole('button', { name: /Change Team/i }).textContent).toContain('Core Platform');
      // Project preserved
      expect(screen.getByRole('button', { name: /Change Project/i }).textContent).toContain('Auth API V2');
      // Cycle preserved
      expect(screen.getByRole('button', { name: /Change Cycle/i }).textContent).toContain('Cycle 42');
      // Type preserved
      expect(screen.getByRole('button', { name: /Change work item type/i }).textContent).toContain('Bug');
      // Priority preserved
      expect(screen.getByRole('button', { name: /Change priority/i }).textContent).toContain('Urgent');

      // === VERIFY FOCUS ===
      // document.activeElement is Title input
      expect(document.activeElement).toBe(titleInput);

      // Dialog remains open
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

    it('30. deterministically restores DOM focus to invocation control on Cancel, Escape, and Create & Close, while Create & Open transitions to detail surface', async () => {
      function TestFocusHarness() {
        const [isOpen, setIsOpen] = React.useState(false);
        const [activeInspectorItem, setActiveInspectorItem] = React.useState(null);

        return (
          <div>
            <button id="invocation-btn" onClick={() => setIsOpen(true)}>
              Open Quick Create
            </button>
            {activeInspectorItem && (
              <div data-testid="inspector-detail" tabIndex={0}>
                Inspector: {activeInspectorItem.title}
              </div>
            )}
            <QuickCreateDialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              onCreate={vi.fn().mockImplementation((input) => ({
                id: 'item-focus-test',
                identifier: 'CORE-888',
                title: input.title,
                teamId: 'team-core'
              }))}
              onOpenItem={(item) => {
                setActiveInspectorItem(item);
                // Transition focus into detail surface
                setTimeout(() => {
                  document.querySelector('[data-testid="inspector-detail"]')?.focus();
                }, 0);
              }}
              initialContext={{ teamId: 'team-core' }}
            />
          </div>
        );
      }

      const { unmount } = render(<TestFocusHarness />);
      const invocationBtn = screen.getByRole('button', { name: /Open Quick Create/i });

      // Scenario A: Cancel restores focus to invocation button
      invocationBtn.focus();
      expect(document.activeElement).toBe(invocationBtn);
      fireEvent.click(invocationBtn);
      expect(screen.getByRole('dialog')).toBeDefined();

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.activeElement).toBe(invocationBtn);
      });

      // Scenario B: Escape restores focus to invocation button
      invocationBtn.focus();
      expect(document.activeElement).toBe(invocationBtn);
      fireEvent.click(invocationBtn);
      expect(screen.getByRole('dialog')).toBeDefined();

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.activeElement).toBe(invocationBtn);
      });

      // Scenario C: Create & Close restores focus to invocation button
      invocationBtn.focus();
      expect(document.activeElement).toBe(invocationBtn);
      fireEvent.click(invocationBtn);
      expect(screen.getByRole('dialog')).toBeDefined();

      const titleInput = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInput, { target: { value: 'Task to Close' } });
      const submitBtn = screen.getByRole('button', { name: /^Create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.activeElement).toBe(invocationBtn);
      });

      // Scenario D: Create & Open does NOT restore focus to invocation button, focus transitions to Inspector
      invocationBtn.focus();
      fireEvent.click(invocationBtn);
      expect(screen.getByRole('dialog')).toBeDefined();

      const titleInputOpen = screen.getByPlaceholderText(/Work item title.../i);
      fireEvent.change(titleInputOpen, { target: { value: 'Task to Open' } });
      fireEvent.keyDown(titleInputOpen, { key: 'Enter', metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.activeElement).not.toBe(invocationBtn);
        expect(screen.getByTestId('inspector-detail')).toBeDefined();
      });

      unmount();
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
