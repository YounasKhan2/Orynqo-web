import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
