import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// Domain model imports
import {
  classifyTeamWorkItem,
  filterTeamBacklog,
  filterTeamActiveWork,
  WORK_ITEM_TRIAGE_STATES,
  resolveTeamCapabilities,
  checkTeamPermission,
} from '../features/teams/model';

import {
  deriveCycleProgress,
  validateCycleActivation,
  prepareCycleRollover,
  executeCycleCompletion,
  ROLLOVER_DESTINATIONS,
} from '../features/cycles/model';

// Component imports
import { TeamHub } from '../features/teams/components/TeamHub';
import { TeamHeader } from '../features/teams/components/TeamHeader';
import { TeamResourceNav } from '../features/teams/components/TeamResourceNav';
import { TeamProjects } from '../features/teams/components/TeamProjects';
import { CyclePlanningWorkbench } from '../features/cycles/components/CyclePlanningWorkbench';
import { CycleRolloverModal } from '../features/cycles/components/CycleRolloverModal';
import { dispatchViewKeyboardEvent, isEditableElement } from '../hooks/keyboardScopes';

describe('UI-05B: Team Hub & Core Cycles Domain & Components', () => {

  describe('1. Backlog Classifier (Independent of status literal names)', () => {
    const teamId = 'team-core';
    const mockCycles = [
      { id: 'cycle-active', teamId, status: 'active' },
      { id: 'cycle-upcoming', teamId, status: 'upcoming' },
    ];

    it('classifies unstarted, non-cycle, non-archived work as backlog', () => {
      const item = {
        id: 'it-1',
        teamId: 'team-core',
        status: 'todo',
        cycleId: null,
      };
      expect(classifyTeamWorkItem(item, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.BACKLOG);
    });

    it('classifies started work without cycle as active_out_of_cycle', () => {
      const item = {
        id: 'it-2',
        teamId: 'team-core',
        status: 'in_progress',
        cycleId: null,
      };
      expect(classifyTeamWorkItem(item, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.ACTIVE_OUT_OF_CYCLE);
    });

    it('classifies upcoming cycle commitment as planned_commitment (excluded from backlog)', () => {
      const item = {
        id: 'it-3',
        teamId: 'team-core',
        status: 'todo',
        cycleId: 'cycle-upcoming',
      };
      expect(classifyTeamWorkItem(item, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.PLANNED_COMMITMENT);
    });

    it('classifies active cycle work as active_cycle_execution', () => {
      const item = {
        id: 'it-4',
        teamId: 'team-core',
        status: 'in_progress',
        cycleId: 'cycle-active',
      };
      expect(classifyTeamWorkItem(item, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.ACTIVE_CYCLE_EXECUTION);
    });

    it('excludes finished, cancelled, and archived items from backlog', () => {
      const finished = { id: 'it-5', teamId, status: 'done', cycleId: null };
      const cancelled = { id: 'it-6', teamId, status: 'canceled', cycleId: null };
      const archived = { id: 'it-7', teamId, status: 'todo', archivedAt: '2026-09-01T00:00:00Z', cycleId: null };

      expect(classifyTeamWorkItem(finished, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.COMPLETED);
      expect(classifyTeamWorkItem(cancelled, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.CANCELED);
      expect(classifyTeamWorkItem(archived, teamId, mockCycles)).toBe(WORK_ITEM_TRIAGE_STATES.ARCHIVED);
    });

    it('filters team work correctly across Active and Backlog scopes', () => {
      const items = [
        { id: '1', teamId, status: 'in_progress', cycleId: 'cycle-active' }, // active
        { id: '2', teamId, status: 'todo', cycleId: null }, // backlog
        { id: '3', teamId, status: 'done', cycleId: 'cycle-active' }, // completed
        { id: '4', teamId: 'team-other', status: 'todo', cycleId: null }, // foreign
      ];

      const active = filterTeamActiveWork(items, teamId, mockCycles);
      const backlog = filterTeamBacklog(items, teamId, mockCycles);

      expect(active.map(i => i.id)).toEqual(['1']);
      expect(backlog.map(i => i.id)).toEqual(['2']);
    });
  });

  describe('2. Capability Model & Permissions', () => {
    it('resolves default capabilities when not specified', () => {
      const caps = resolveTeamCapabilities({});
      expect(caps.cyclesEnabled).toBe(true);
      expect(caps.estimatesEnabled).toBe(true);
      expect(caps.triageEnabled).toBe(false);
      expect(caps.workloadEnabled).toBe(false);
    });

    it('respects explicitly disabled capabilities', () => {
      const caps = resolveTeamCapabilities({
        capabilities: {
          cycles: false,
          estimates: false,
        }
      });
      expect(caps.cyclesEnabled).toBe(false);
      expect(caps.estimatesEnabled).toBe(false);
    });

    it('evaluates semantic permissions by role without magic strings', () => {
      expect(checkTeamPermission('team:view', 'viewer')).toBe(true);
      expect(checkTeamPermission('team:create_work', 'viewer')).toBe(false);
      expect(checkTeamPermission('team:create_work', 'member')).toBe(true);
      expect(checkTeamPermission('team:plan_work', 'member')).toBe(true);
      expect(checkTeamPermission('team:manage_cycles', 'member')).toBe(false);
      expect(checkTeamPermission('team:manage_cycles', 'lead')).toBe(true);
      expect(checkTeamPermission('team:manage_settings', 'admin')).toBe(true);
    });
  });

  describe('3. Cycle Domain Model & Invariants', () => {
    it('enforces maximum one active Cycle per team invariant', () => {
      const existingCycles = [
        { id: 'c-1', teamId: 'team-core', status: 'active', name: 'Cycle 1' },
        { id: 'c-2', teamId: 'team-core', status: 'upcoming', name: 'Cycle 2' },
      ];

      // Activating c-2 when c-1 is already active must fail
      const result = validateCycleActivation(existingCycles, 'c-2', 'team-core');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already active');

      // Activating for a different team or when c-1 is completed must pass
      const result2 = validateCycleActivation(
        [{ id: 'c-1', teamId: 'team-core', status: 'completed' }],
        'c-2',
        'team-core'
      );
      expect(result2.valid).toBe(true);
    });

    it('derives cycle progress accurately with or without estimates', () => {
      const cycle = { id: 'c-42', number: 42 };
      const items = [
        { id: '1', cycleId: 'c-42', status: 'done', estimate: 5 },
        { id: '2', cycleId: 'c-42', status: 'in_progress', estimate: 3, priority: 'urgent' },
        { id: '3', cycleId: 'c-42', status: 'todo', estimate: 2 },
      ];

      // With estimates
      const progressWithPts = deriveCycleProgress(cycle, items, true);
      expect(progressWithPts.totalPoints).toBe(10);
      expect(progressWithPts.completedPoints).toBe(5);
      expect(progressWithPts.percentComplete).toBe(50);
      expect(progressWithPts.urgentItems).toBe(1);

      // Without estimates (count-based)
      const progressWithoutPts = deriveCycleProgress(cycle, items, false);
      expect(progressWithoutPts.totalItems).toBe(3);
      expect(progressWithoutPts.completedItems).toBe(1);
      expect(progressWithoutPts.percentComplete).toBe(33);
    });
  });

  describe('4. Rollover Engine & Consistency (Atomic non-silent rollover)', () => {
    const cycle = { id: 'c-42', name: 'Cycle 42', status: 'active', teamId: 'team-core' };
    const items = [
      { id: 'it-1', title: 'Done task', status: 'done', cycleId: 'c-42' },
      { id: 'it-2', title: 'In progress task', status: 'in_progress', cycleId: 'c-42' },
      { id: 'it-3', title: 'Todo task', status: 'todo', cycleId: 'c-42' },
    ];
    const upcoming = [{ id: 'c-43', name: 'Cycle 43', teamId: 'team-core', status: 'upcoming' }];

    it('identifies incomplete committed items for explicit review', () => {
      const rolloverReview = prepareCycleRollover(cycle, items, upcoming);
      expect(rolloverReview.incompleteItems.map(i => i.id)).toEqual(['it-2', 'it-3']);
      expect(rolloverReview.incompleteCount).toBe(2);
      expect(rolloverReview.completedCount).toBe(1);
    });

    it('executes atomic rollover to Backlog (removes cycleId from incomplete items)', () => {
      const incomplete = items.filter(i => i.status !== 'done');
      const outcome = executeCycleCompletion({
        cycle,
        incompleteItems: incomplete,
        destination: ROLLOVER_DESTINATIONS.BACKLOG,
      });

      expect(outcome.cycleUpdate.status).toBe('completed');
      expect(outcome.workItemUpdates.length).toBe(2);
      expect(outcome.workItemUpdates[0].cycleId).toBeNull();
      expect(outcome.workItemUpdates[1].cycleId).toBeNull();
    });

    it('executes atomic rollover to Upcoming Cycle (reassigns cycleId)', () => {
      const incomplete = items.filter(i => i.status !== 'done');
      const outcome = executeCycleCompletion({
        cycle,
        incompleteItems: incomplete,
        destination: ROLLOVER_DESTINATIONS.UPCOMING_CYCLE,
        nextCycleId: 'c-43',
      });

      expect(outcome.cycleUpdate.status).toBe('completed');
      expect(outcome.workItemUpdates[0].cycleId).toBe('c-43');
      expect(outcome.workItemUpdates[1].cycleId).toBe('c-43');
    });
  });

  describe('5. Component Integration & Accessibility', () => {
    const mockTeam = {
      id: 'team-core',
      name: 'Core Platform',
      key: 'ENG',
      description: 'Distributed synchronization engine',
      members: ['usr-1', 'usr-2'],
      capabilities: { cycles: true, triage: true },
    };

    it('renders TEM-001 TeamHeader with key identity elements and actions', () => {
      render(
        <TeamHeader
          team={mockTeam}
          memberCount={2}
          canCreateWork={true}
          canManageSettings={true}
          onQuickCreate={vi.fn()}
        />
      );

      expect(screen.getByText('Core Platform')).toBeDefined();
      expect(screen.getByText('ENG')).toBeDefined();
      expect(screen.getByText('2 members')).toBeDefined();
      expect(screen.getByTestId('team-quick-create-btn')).toBeDefined();
      expect(screen.getByTestId('team-settings-btn')).toBeDefined();
    });

    it('renders capability-aware TeamResourceNav hiding Cycles when disabled', () => {
      const { rerender } = render(
        <TeamResourceNav
          activeTab="overview"
          onTabChange={vi.fn()}
          cyclesEnabled={true}
        />
      );
      expect(screen.getByTestId('team-tab-cycles')).toBeDefined();

      rerender(
        <TeamResourceNav
          activeTab="overview"
          onTabChange={vi.fn()}
          cyclesEnabled={false}
        />
      );
      expect(screen.queryByTestId('team-tab-cycles')).toBeNull();
    });

    it('renders TEM-004 TeamProjects clearly distinguishing Led vs Participating roles', () => {
      const ledProjects = [{ id: 'p1', name: 'Auth API V2', key: 'ENG-AUTH' }];
      const participatingProjects = [{ id: 'p2', name: 'Workspace Sync', key: 'WKS-SYNC' }];

      render(
        <TeamProjects
          ledProjects={ledProjects}
          participatingProjects={participatingProjects}
          onNavigateToProject={vi.fn()}
        />
      );

      expect(screen.getByText(/Projects Led by Team/i)).toBeDefined();
      expect(screen.getByText('Auth API V2')).toBeDefined();
      expect(screen.getByText(/Contributing \/ Participating/i)).toBeDefined();
      expect(screen.getByText('Workspace Sync')).toBeDefined();
    });

    it('renders CYC-002 CyclePlanningWorkbench with dual panes and scheduling actions', () => {
      const backlogItems = [{ id: 'b1', title: 'Task B1', points: 3 }];
      const cycleItems = [{ id: 'c1', title: 'Task C1', points: 5 }];
      const upcomingCycle = { id: 'c-upcoming', name: 'Cycle 43' };
      const onSchedule = vi.fn();
      const onUnschedule = vi.fn();

      render(
        <CyclePlanningWorkbench
          upcomingCycle={upcomingCycle}
          backlogItems={backlogItems}
          cycleItems={cycleItems}
          canPlanWork={true}
          onScheduleItem={onSchedule}
          onUnscheduleItem={onUnschedule}
        />
      );

      expect(screen.getByTestId('planning-pane-backlog')).toBeDefined();
      expect(screen.getByTestId('planning-pane-upcoming')).toBeDefined();
      expect(screen.getByText('Task B1')).toBeDefined();
      expect(screen.getByText('Task C1')).toBeDefined();

      // Click + Add
      fireEvent.click(screen.getByTestId('schedule-btn-b1'));
      expect(onSchedule).toHaveBeenCalledWith('b1', 'c-upcoming');

      // Click - Backlog
      fireEvent.click(screen.getByTestId('unschedule-btn-c1'));
      expect(onUnschedule).toHaveBeenCalledWith('c1');
    });

    it('renders CycleRolloverModal for explicit non-silent rollover confirmation', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const cycle = { id: 'c-42', name: 'Cycle 42' };
      const incompleteItems = [{ id: 'it-2', title: 'Incomplete Task' }];
      const nextCycle = { id: 'c-43', name: 'Cycle 43' };

      render(
        <CycleRolloverModal
          cycle={cycle}
          incompleteItems={incompleteItems}
          nextCycle={nextCycle}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Complete Cycle 42')).toBeDefined();
      expect(screen.getByText(/will not be silently carried over/i)).toBeDefined();
      expect(screen.getByText('Return to Team Backlog')).toBeDefined();

      // Confirm
      fireEvent.click(screen.getByText('Confirm & Complete Cycle'));
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  describe('6. Integration Pass 01A: End-to-End Scenarios & Contracts', () => {
    // Shared fixtures for integration testing
    const testTeam = {
      id: 'team-alpha',
      name: 'Alpha Team',
      key: 'ALP',
      description: 'Alpha mission squad',
      members: ['user-1', 'user-2'],
      capabilities: { cycles: true, triage: false },
    };

    const testUsers = [
      { id: 'user-1', name: 'Alice Admin', teamId: 'team-alpha' },
      { id: 'user-2', name: 'Bob Builder', teamId: 'team-alpha' },
      { id: 'user-3', name: 'Charlie Cross', teamIds: ['team-alpha', 'team-beta'] },
      { id: 'user-foreign', name: 'Frank Foreign', teamId: 'team-other' },
    ];

    const testCycles = [
      { id: 'c-alp-active', teamId: 'team-alpha', name: 'Alpha Cycle 1', status: 'active', startDate: '2026-09-01', endDate: '2026-09-15' },
      { id: 'c-alp-upcoming', teamId: 'team-alpha', name: 'Alpha Cycle 2', status: 'upcoming', startDate: '2026-09-16', endDate: '2026-09-30' },
      { id: 'c-beta-active', teamId: 'team-beta', name: 'Beta Cycle 1', status: 'active', startDate: '2026-09-01', endDate: '2026-09-15' },
    ];

    const testProjects = [
      { id: 'proj-1', name: 'Led Alpha Project', leadTeamId: 'team-alpha', teams: ['team-alpha'] },
      { id: 'proj-2', name: 'Participating Project', leadTeamId: 'team-other', teams: ['team-other', 'team-alpha'] },
      { id: 'proj-3', name: 'Unrelated Project', leadTeamId: 'team-other', teams: ['team-other'] },
    ];

    const testDocuments = [
      { id: 'doc-1', title: 'Alpha Runbook', teamId: 'team-alpha', isPinned: true },
      { id: 'doc-2', title: 'Alpha Specs', teamId: 'team-alpha', isPinned: false },
      { id: 'doc-3', title: 'Shared Guide', teamId: 'team-other', pinnedTeamIds: ['team-alpha'] },
      { id: 'doc-4', title: 'Other Guide', teamId: 'team-other' },
    ];

    const testWorkItems = [
      { id: 'wi-1', title: 'Active Incomplete 1', teamId: 'team-alpha', cycleId: 'c-alp-active', status: 'in_progress' },
      { id: 'wi-2', title: 'Active Done 2', teamId: 'team-alpha', cycleId: 'c-alp-active', status: 'done' },
      { id: 'wi-3', title: 'Alpha Backlog 1', teamId: 'team-alpha', cycleId: null, status: 'todo' },
      { id: 'wi-4', title: 'Alpha Backlog 2', teamId: 'team-alpha', cycleId: null, status: 'backlog' },
      { id: 'wi-5', title: 'Upcoming Item', teamId: 'team-alpha', cycleId: 'c-alp-upcoming', status: 'todo' },
    ];

    it('1. TeamHub consumes supplied Team/Cycle/Project/Document/User datasets rather than global fixtures', () => {
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="overview"
        />
      );

      // Verify custom team name rendered
      expect(screen.getByText('Alpha Team')).toBeDefined();
      expect(screen.getByText('ALP')).toBeDefined();

      // Verify active cycle from supplied cycles rendered in overview
      expect(screen.getByText('Alpha Cycle 1')).toBeDefined();

      // Verify supplied project rendered
      expect(screen.getByText('Led Alpha Project')).toBeDefined();
    });

    it('2. Switching team changes Cycle data correctly', () => {
      const { rerender } = render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
        />
      );

      expect(screen.getByText('Alpha Cycle 1')).toBeDefined();

      const testTeamBeta = {
        id: 'team-beta',
        name: 'Beta Team',
        key: 'BET',
        members: ['user-3'],
        capabilities: { cycles: true },
      };

      rerender(
        <TeamHub
          teamId="team-beta"
          teamOverride={testTeamBeta}
          workItems={[]}
          projects={[]}
          documents={[]}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
        />
      );

      expect(screen.getByText('Beta Cycle 1')).toBeDefined();
      expect(screen.queryByText('Alpha Cycle 1')).toBeNull();
    });

    it('3. Team keyboard ResourceNav changes tabs through centralized PAGE/VIEW dispatch', () => {
      const onTabChange = vi.fn();

      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="overview"
          onTabChange={onTabChange}
        />
      );

      // Available tabs: 1: overview, 2: work, 3: cycles, 4: projects, 5: docs, 6: members
      // Press '2' for Work
      const handled2 = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: '2' }));
      expect(handled2).toBe(true);
      expect(onTabChange).toHaveBeenCalledWith('work');

      // Press '4' for Projects
      const handled4 = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: '4' }));
      expect(handled4).toBe(true);
      expect(onTabChange).toHaveBeenCalledWith('projects');
    });

    it('4. Team search semantic shortcut (/) focuses the Team search control', () => {
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="overview"
        />
      );

      const searchInput = screen.getByTestId('team-search-input');
      const focusSpy = vi.spyOn(searchInput, 'focus');

      const handled = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: '/' }));

      expect(handled).toBe(true);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('5. Overlay and editable controls suppress Team PAGE/VIEW shortcuts', () => {
      const onTabChange = vi.fn();

      render(
        <div>
          <input data-testid="test-input" />
          <TeamHub
            teamId="team-alpha"
            teamOverride={testTeam}
            workItems={testWorkItems}
            projects={testProjects}
            documents={testDocuments}
            users={testUsers}
            cycles={testCycles}
            activeTab="overview"
            onTabChange={onTabChange}
          />
        </div>
      );

      const input = screen.getByTestId('test-input');

      // When target is an editable control, number shortcuts should be suppressed
      const eventInInput = new KeyboardEvent('keydown', { key: '2' });
      Object.defineProperty(eventInInput, 'target', { value: input, writable: false });

      const handledInInput = dispatchViewKeyboardEvent(eventInInput);
      expect(handledInInput).toBe(false);
      expect(onTabChange).not.toHaveBeenCalled();

      // When an OVERLAY scope element exists in DOM, shortcuts should be suppressed
      const overlay = document.createElement('div');
      overlay.setAttribute('data-keyboard-scope', 'OVERLAY');
      document.body.appendChild(overlay);

      const handledInOverlay = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: '2' }));
      expect(handledInOverlay).toBe(false);
      expect(onTabChange).not.toHaveBeenCalled();

      document.body.removeChild(overlay);
    });

    it('6 & 7. Complete Cycle from ActiveCycleCockpit opens rollover review with correct incomplete items', () => {
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
          userRole="lead"
        />
      );

      // Find "Complete Cycle" button in ActiveCycleCockpit
      const completeBtn = screen.getByTestId('complete-cycle-btn');
      expect(completeBtn).toBeDefined();

      // Click Complete Cycle
      fireEvent.click(completeBtn);

      // Verify Rollover Modal opened for 'Alpha Cycle 1'
      expect(screen.getByText('Complete Alpha Cycle 1')).toBeDefined();

      // Verify incomplete item appears in review (wi-1: Active Incomplete 1)
      const reviewContainer = screen.getByTestId('rollover-incomplete-items');
      expect(reviewContainer).toBeDefined();
      expect(screen.getByTestId('rollover-item-wi-1')).toBeDefined();
      expect(screen.queryByTestId('rollover-item-wi-2')).toBeNull();
    });

    it('8. Confirming Backlog rollover clears scheduling relationships', async () => {
      const onUpdateWorkItem = vi.fn().mockResolvedValue({});

      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
          userRole="lead"
          onUpdateWorkItem={onUpdateWorkItem}
        />
      );

      fireEvent.click(screen.getByTestId('complete-cycle-btn'));
      expect(screen.getByText('Complete Alpha Cycle 1')).toBeDefined();

      // Select Backlog radio option (default)
      const backlogRadio = screen.getByTestId('rollover-dest-backlog');
      fireEvent.click(backlogRadio);

      // Confirm rollover
      await act(async () => {
        fireEvent.click(screen.getByText('Confirm & Complete Cycle'));
      });

      // Verify onUpdateWorkItem was called to clear cycleId for wi-1
      expect(onUpdateWorkItem).toHaveBeenCalledWith('wi-1', { cycleId: null });
    });

    it('9. Confirming Upcoming Cycle rollover schedules to the eligible upcoming Cycle', async () => {
      const onUpdateWorkItem = vi.fn().mockResolvedValue({});

      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
          userRole="lead"
          onUpdateWorkItem={onUpdateWorkItem}
        />
      );

      fireEvent.click(screen.getByTestId('complete-cycle-btn'));
      expect(screen.getByText('Complete Alpha Cycle 1')).toBeDefined();

      // Select upcoming_cycle radio option
      const upcomingRadio = screen.getByTestId('rollover-dest-upcoming');
      fireEvent.click(upcomingRadio);

      // Confirm rollover
      await act(async () => {
        fireEvent.click(screen.getByText('Confirm & Complete Cycle'));
      });

      // Verify onUpdateWorkItem was called with nextCycleId: 'c-alp-upcoming'
      expect(onUpdateWorkItem).toHaveBeenCalledWith('wi-1', { cycleId: 'c-alp-upcoming' });
    });

    it('10. Invalid Upcoming Cycle target is rejected by rollover validation', () => {
      const incomplete = [testWorkItems[0]];
      const activeCycle = testCycles[0];

      // Missing nextCycleId when destination is upcoming_cycle
      expect(() => {
        executeCycleCompletion({
          cycle: activeCycle,
          incompleteItems: incomplete,
          destination: ROLLOVER_DESTINATIONS.UPCOMING_CYCLE,
          nextCycleId: null,
          availableCycles: testCycles,
        });
      }).toThrow(/requires an explicit nextCycleId/i);

      // Targeting cycle from different team
      expect(() => {
        executeCycleCompletion({
          cycle: activeCycle,
          incompleteItems: incomplete,
          destination: ROLLOVER_DESTINATIONS.UPCOMING_CYCLE,
          nextCycleId: 'c-beta-active',
          availableCycles: testCycles,
        });
      }).toThrow(/not current team/i);

      // Targeting self
      expect(() => {
        executeCycleCompletion({
          cycle: activeCycle,
          incompleteItems: incomplete,
          destination: ROLLOVER_DESTINATIONS.UPCOMING_CYCLE,
          nextCycleId: activeCycle.id,
          availableCycles: testCycles,
        });
      }).toThrow(/into the cycle being completed/i);
    });

    it('11. Mutation failure triggers rollback and keeps rollover review open with error', async () => {
      const failingUpdate = vi.fn().mockRejectedValue(new Error('Network mutation failed'));

      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
          userRole="lead"
          onUpdateWorkItem={failingUpdate}
        />
      );

      fireEvent.click(screen.getByTestId('complete-cycle-btn'));
      expect(screen.getByText('Complete Alpha Cycle 1')).toBeDefined();

      // Attempt to confirm
      fireEvent.click(screen.getByText('Confirm & Complete Cycle'));

      // Modal must remain open and display failure banner
      await screen.findByTestId('rollover-error-banner');
      expect(screen.getByText(/Network mutation failed/i)).toBeDefined();

      // Cycle completion did NOT succeed
      expect(screen.getByText('Complete Alpha Cycle 1')).toBeDefined();
    });

    it('12. Team Work Backlog and Cycle Planning Backlog resolve the same canonical set', () => {
      // Direct comparison of filterTeamBacklog which powers both surfaces
      const backlogForTeamWork = filterTeamBacklog(testWorkItems, testTeam.id, testCycles);

      // Cycle Planning Workbench receives backlog derived via filterTeamBacklog in TeamHub
      expect(backlogForTeamWork.map(i => i.id)).toEqual(['wi-3', 'wi-4']);

      // Render Cycle Planning view in TeamHub
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="cycles"
        />
      );

      // Switch to planning view
      fireEvent.click(screen.getByTestId('cycle-subnav-planning'));

      // Both wi-3 and wi-4 must appear in the planning backlog pane
      expect(screen.getByText('Alpha Backlog 1')).toBeDefined();
      expect(screen.getByText('Alpha Backlog 2')).toBeDefined();
    });

    it('13. Supplied Projects determine Lead/Participant results', () => {
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="projects"
        />
      );

      expect(screen.getByText('Led Alpha Project')).toBeDefined();
      expect(screen.getByText('Participating Project')).toBeDefined();
      expect(screen.queryByText('Unrelated Project')).toBeNull();
    });

    it('14. Supplied Documents determine Team Docs results with canonical pin metadata', () => {
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="docs"
        />
      );

      // Direct doc
      expect(screen.getByText('Alpha Runbook')).toBeDefined();
      expect(screen.getByText('Alpha Specs')).toBeDefined();
      // Shared guide pinned for team-alpha
      expect(screen.getByText('Shared Guide')).toBeDefined();
      // Foreign unpinned doc
      expect(screen.queryByText('Other Guide')).toBeNull();
    });

    it('15. Supplied Users/membership determine Team Members results with multi-team support', () => {
      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={testTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="members"
        />
      );

      expect(screen.getByText('Alice Admin')).toBeDefined();
      expect(screen.getByText('Bob Builder')).toBeDefined();
      // Multi-team member (user-3 with teamIds: ['team-alpha', ...])
      expect(screen.getByText('Charlie Cross')).toBeDefined();
      // Foreign member
      expect(screen.queryByText('Frank Foreign')).toBeNull();
    });

    it('16. Cycles-disabled Team exposes no active planning surface or cycles tab', () => {
      const disabledTeam = {
        ...testTeam,
        capabilities: { cycles: false },
      };

      render(
        <TeamHub
          teamId="team-alpha"
          teamOverride={disabledTeam}
          workItems={testWorkItems}
          projects={testProjects}
          documents={testDocuments}
          users={testUsers}
          cycles={testCycles}
          activeTab="overview"
        />
      );

      // Cycles tab must not be rendered in ResourceNav
      expect(screen.queryByTestId('team-tab-cycles')).toBeNull();
    });

    it('17. Existing global shortcuts continue working outside Team PAGE/VIEW handling', () => {
      // Team handler only consumes 1-6 and /
      // Other keys such as 'c', 'k', '?' return false to fall through to global handlers
      const handledC = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: 'c' }));
      expect(handledC).toBe(false);

      const handledK = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      expect(handledK).toBe(false);

      const handledQuestion = dispatchViewKeyboardEvent(new KeyboardEvent('keydown', { key: '?' }));
      expect(handledQuestion).toBe(false);
    });
  });
});
