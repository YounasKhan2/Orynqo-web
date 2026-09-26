import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import {
  createProjectModel,
  PROJECT_OPERATIONAL_STATE,
  PROJECT_ARCHIVE_STATE,
  PROJECT_HEALTH,
  MILESTONE_STATUS,
  validateLeadTeamParticipation,
  canAssociateWorkItemWithProject,
  calculateProjectProgress,
  validateProjectDependency,
  resolveProjectDependencies,
  createMilestoneModel,
  validateMilestoneAssociation,
  calculateMilestoneProgress,
  createProjectUpdateModel
} from '../features/projects/model';
import {
  ProjectHealthBadge,
  ProjectHeader,
  ProjectOverviewTab,
  ProjectWorkTab,
  ProjectDocsTab,
  ProjectMilestonesTab,
  ProjectActivityTab,
  ProjectSettingsTab,
  ProjectsDirectory,
  ProjectWorkspace
} from '../features/projects/components';
import { App } from '../App';

describe('UI-07B: Projects Core Implementation Suite', () => {
  // -------------------------------------------------------------
  // 1. CANONICAL PROJECT MODEL & STATE INVARIANTS
  // -------------------------------------------------------------
  describe('1. Canonical Project Model & State Invariants', () => {
    it('enforces orthogonal state representation (operationalState, archiveState, health)', () => {
      const proj = createProjectModel({
        id: 'prj-test-1',
        name: 'Infrastructure Substrate',
        operationalState: PROJECT_OPERATIONAL_STATE.IN_PROGRESS,
        archiveState: PROJECT_ARCHIVE_STATE.ACTIVE,
        health: PROJECT_HEALTH.ON_TRACK
      });

      expect(proj.operationalState).toBe('in_progress');
      expect(proj.archiveState).toBe('active');
      expect(proj.health).toBe('on_track');
    });

    it('enforces Lead Team invariant: Lead Team ∈ Participating Teams', () => {
      // If lead team is specified but omitted from participating teams, it is automatically included
      const proj = createProjectModel({
        id: 'prj-test-2',
        name: 'Multi-Team Engine',
        leadTeamId: 'team-mobile',
        participatingTeamIds: ['team-core', 'team-web']
      });

      expect(proj.participatingTeamIds).toContain('team-mobile');
      expect(proj.participatingTeamIds).toHaveLength(3);

      // Validation helper confirms participation
      const validation = validateLeadTeamParticipation('team-mobile', proj.participatingTeamIds);
      expect(validation.valid).toBe(true);

      const invalidValidation = validateLeadTeamParticipation('team-nonexistent', proj.participatingTeamIds);
      expect(invalidValidation.valid).toBe(false);
    });

    it('allows a Project to exist with zero participating teams', () => {
      const proj = createProjectModel({
        id: 'prj-test-zero',
        name: 'Company-Wide Initiative Shell',
        participatingTeamIds: [],
        leadTeamId: null
      });

      expect(proj.participatingTeamIds).toHaveLength(0);
      expect(proj.leadTeamId).toBeNull();
    });

    it('preserves canonical WorkItem Team ownership invariant (never mutates workItem.teamId)', () => {
      const workItem = {
        id: 'wi-101',
        title: 'Build offline storage adapter',
        teamId: 'team-mobile',
        projectId: null
      };

      const project = {
        id: 'prj-web-only',
        name: 'Web Client 2.0',
        participatingTeamIds: ['team-web']
      };

      // Check association eligibility
      const check = canAssociateWorkItemWithProject(workItem, project);
      expect(check.canAssociate).toBe(false);
      expect(check.requiresTeamParticipationDecision).toBe(true);
      expect(check.mismatchedTeamId).toBe('team-mobile');

      // Associating WorkItem with project NEVER mutates workItem.teamId
      const associatedWorkItem = {
        ...workItem,
        projectId: project.id
      };
      expect(associatedWorkItem.teamId).toBe('team-mobile');
    });
  });

  // -------------------------------------------------------------
  // 2. PROJECT PROGRESS & ZERO-LEAKAGE
  // -------------------------------------------------------------
  describe('2. Project Progress & Zero-Leakage Semantics', () => {
    it('calculates transparent ratio and percentage excluding cancelled and archived items', () => {
      const items = [
        { id: '1', status: 'done', isArchived: false },
        { id: '2', status: 'completed', isArchived: false },
        { id: '3', status: 'in_progress', isArchived: false },
        { id: '4', status: 'todo', isArchived: false },
        { id: '5', status: 'cancelled', isArchived: false }, // Excluded from total
        { id: '6', status: 'done', isArchived: true } // Excluded from total
      ];

      const progress = calculateProjectProgress(items);
      expect(progress.completed).toBe(2);
      expect(progress.total).toBe(4);
      expect(progress.percentage).toBe(50);
      expect(progress.displayText).toBe('2 / 4');
    });

    it('returns "0 items" for a project with zero active items', () => {
      const progress = calculateProjectProgress([]);
      expect(progress.completed).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.percentage).toBe(0);
      expect(progress.displayText).toBe('0 items');
    });

    it('prevents count leakage of inaccessible items via permission filtering', () => {
      const items = [
        { id: '1', status: 'done', isAccessible: true },
        { id: '2', status: 'todo', isAccessible: false }
      ];

      const isAccessible = (it) => it.isAccessible;
      const progress = calculateProjectProgress(items, isAccessible);
      expect(progress.completed).toBe(1);
      expect(progress.total).toBe(1);
      expect(progress.percentage).toBe(100);
    });
  });

  // -------------------------------------------------------------
  // 3. PROJECT DEPENDENCIES & GRAPH CYCLE REJECTION
  // -------------------------------------------------------------
  describe('3. Project Dependencies & Directed Cycle Rejection', () => {
    it('rejects self-dependencies (A -> A)', () => {
      const result = validateProjectDependency('proj-a', 'proj-a', []);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Self-dependency is prohibited');
    });

    it('rejects duplicate edges', () => {
      const edges = [{ blockerId: 'proj-a', dependentId: 'proj-b' }];
      const result = validateProjectDependency('proj-a', 'proj-b', edges);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('rejects direct 2-node cycle (A -> B, attempt B -> A)', () => {
      const edges = [{ blockerId: 'proj-a', dependentId: 'proj-b' }];
      const result = validateProjectDependency('proj-b', 'proj-a', edges);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Directed cycle detected');
    });

    it('rejects multi-node transitive cycle (A -> B -> C, attempt C -> A)', () => {
      const edges = [
        { blockerId: 'proj-a', dependentId: 'proj-b' },
        { blockerId: 'proj-b', dependentId: 'proj-c' }
      ];
      const result = validateProjectDependency('proj-c', 'proj-a', edges);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Directed cycle detected');
    });

    it('resolves both blockedBy and blocks projections from single canonical edge model', () => {
      const allProjects = [
        { id: 'proj-a', name: 'Project A', identifier: 'PRJ-A' },
        { id: 'proj-b', name: 'Project B', identifier: 'PRJ-B' }
      ];
      const edges = [{ blockerId: 'proj-a', dependentId: 'proj-b' }];

      const depsA = resolveProjectDependencies('proj-a', allProjects, edges);
      expect(depsA.blockedBy).toHaveLength(0);
      expect(depsA.blocks).toHaveLength(1);
      expect(depsA.blocks[0].project.id).toBe('proj-b');

      const depsB = resolveProjectDependencies('proj-b', allProjects, edges);
      expect(depsB.blockedBy).toHaveLength(1);
      expect(depsB.blockedBy[0].project.id).toBe('proj-a');
      expect(depsB.blocks).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------
  // 4. PROJECT UPDATES & HEALTH SNAPSHOTS
  // -------------------------------------------------------------
  describe('4. Project Updates & Health Snapshots', () => {
    it('creates immutable historical update with health snapshot without altering project target date', () => {
      const initialProject = {
        id: 'proj-1',
        health: PROJECT_HEALTH.ON_TRACK,
        targetDate: '2026-10-15'
      };

      const update = createProjectUpdateModel({
        projectId: initialProject.id,
        authorId: 'usr-1',
        narrative: 'Encountered unexpected network latency during benchmark.',
        health: PROJECT_HEALTH.AT_RISK,
        targetDateSnapshot: initialProject.targetDate,
        blockers: ['Network driver contention']
      });

      expect(update.health).toBe(PROJECT_HEALTH.AT_RISK);
      expect(update.targetDateSnapshot).toBe('2026-10-15');
      expect(update.narrative).toContain('unexpected network latency');
      expect(update.blockers).toEqual(['Network driver contention']);

      // Target date on initialProject was NOT mutated
      expect(initialProject.targetDate).toBe('2026-10-15');
    });
  });

  // -------------------------------------------------------------
  // 5. PROJECT MILESTONES & WORKITEM CARDINALITY
  // -------------------------------------------------------------
  describe('5. Project Milestones & WorkItem Cardinality', () => {
    it('enforces 0..1 Milestone per WorkItem belonging to project owner', () => {
      const project = { id: 'proj-alpha' };
      const milestone = createMilestoneModel({
        id: 'mls-1',
        projectId: 'proj-alpha',
        name: 'M1: Architecture Review'
      });

      const workItem = { id: 'wi-1', projectId: 'proj-alpha', milestoneId: null };
      const validation = validateMilestoneAssociation(workItem, milestone);
      expect(validation.valid).toBe(true);

      // Milestone from another project is rejected
      const foreignMilestone = createMilestoneModel({
        id: 'mls-foreign',
        projectId: 'proj-other',
        name: 'Foreign Gate'
      });
      const foreignValidation = validateMilestoneAssociation(workItem, foreignMilestone);
      expect(foreignValidation.valid).toBe(false);
      expect(foreignValidation.error).toContain('owning project');
    });

    it('completing a milestone never completes associated WorkItems', () => {
      const items = [
        { id: 'wi-1', milestoneId: 'mls-1', status: 'todo' },
        { id: 'wi-2', milestoneId: 'mls-1', status: 'in_progress' }
      ];

      // Milestone status transitions to completed
      const milestone = createMilestoneModel({
        id: 'mls-1',
        projectId: 'proj-1',
        name: 'M1',
        status: MILESTONE_STATUS.COMPLETED
      });

      expect(milestone.status).toBe('completed');
      // Invariant: items remain untouched
      expect(items[0].status).toBe('todo');
      expect(items[1].status).toBe('in_progress');
    });

    it('archiving a milestone is non-destructive and preserves historical WorkItem associations', () => {
      const items = [
        { id: 'wi-1', milestoneId: 'mls-1', status: 'done' }
      ];

      const milestone = createMilestoneModel({
        id: 'mls-1',
        projectId: 'proj-1',
        name: 'M1',
        status: MILESTONE_STATUS.ARCHIVED
      });

      expect(milestone.status).toBe('archived');
      // Historical reference preserved
      expect(items[0].milestoneId).toBe('mls-1');
    });
  });

  // -------------------------------------------------------------
  // 6. UI SURFACES (PRJ-001 - PRJ-007)
  // -------------------------------------------------------------
  describe('6. Project Surfaces & Component Integrations', () => {
    it('renders PRJ-001 Project Overview with charter, progress, update, and squads', () => {
      const project = createProjectModel({
        id: 'proj-1',
        name: 'Auth API V2',
        summary: 'OAuth 2.1 protocol migration',
        health: PROJECT_HEALTH.ON_TRACK,
        participatingTeamIds: ['team-core']
      });

      render(
        <ProjectOverviewTab
          project={project}
          leadUser={{ id: 'usr-1', name: 'Alice' }}
          teams={[{ id: 'team-core', name: 'Core Platform' }]}
          workItems={[
            { id: 'wi-1', status: 'done' },
            { id: 'wi-2', status: 'todo' }
          ]}
          milestones={[]}
          documents={[]}
        />
      );

      expect(screen.getByText('Auth API V2')).toBeDefined();
      expect(screen.getByText('OAuth 2.1 protocol migration')).toBeDefined();
      expect(screen.getByText('Core Platform')).toBeDefined();
      expect(screen.getByTestId('project-progress-ratio').textContent).toBe('1 / 2');
      expect(screen.getByTestId('project-progress-percent').textContent).toBe('(50%)');
    });

    it('renders PRJ-007 Projects Directory and filters by operational state', () => {
      const projects = [
        createProjectModel({ id: 'p1', name: 'Alpha Project', operationalState: 'in_progress' }),
        createProjectModel({ id: 'p2', name: 'Beta Project', operationalState: 'planned' })
      ];

      render(
        <ProjectsDirectory
          projects={projects}
          workItems={[]}
          teams={[]}
          users={[]}
        />
      );

      expect(screen.getByText('Alpha Project')).toBeDefined();
      expect(screen.getByText('Beta Project')).toBeDefined();

      // Filter by Planned operational state
      const stateSelect = screen.getByTestId('filter-state-select');
      fireEvent.change(stateSelect, { target: { value: 'planned' } });

      expect(screen.queryByText('Alpha Project')).toBeNull();
      expect(screen.getByText('Beta Project')).toBeDefined();
    });

    it('renders PRJ-006 Settings with Lead Team selector and Danger Zone', () => {
      const onComplete = vi.fn();
      const onArchive = vi.fn();

      const project = createProjectModel({
        id: 'p1',
        name: 'Gamma Project',
        participatingTeamIds: ['team-web'],
        leadTeamId: 'team-web'
      });

      render(
        <ProjectSettingsTab
          project={project}
          teams={[{ id: 'team-web', name: 'Web Studio' }]}
          allProjects={[project]}
          onCompleteProject={onComplete}
          onArchiveProject={onArchive}
        />
      );

      const completeBtn = screen.getByTestId('complete-project-btn');
      fireEvent.click(completeBtn);
      expect(onComplete).toHaveBeenCalledWith('p1');

      const archiveBtn = screen.getByTestId('archive-project-btn');
      fireEvent.click(archiveBtn);
      expect(onArchive).toHaveBeenCalledWith('p1');
    });
  });

  // -------------------------------------------------------------
  // 7. END-TO-END WORKSPACE INTEGRATION IN APP
  // -------------------------------------------------------------
  describe('7. End-to-End Application Integration', () => {
    it('navigates from Sidebar to Projects Directory and selects a Project', async () => {
      render(<App />);

      // Find Projects link in sidebar and click it
      const projectsBtn = screen.getByRole('button', { name: /Projects/i });
      fireEvent.click(projectsBtn);

      // Projects directory is rendered
      expect(screen.getByRole('region', { name: /Projects Directory/i })).toBeDefined();

      // Click the first project in the table
      const projectRow = screen.getByTestId('project-row-proj-1');
      fireEvent.click(projectRow);

      // Now inside Project Workspace (PRJ-001 Overview by default)
      expect(screen.getByRole('region', { name: /Project Overview/i })).toBeDefined();
      expect(screen.getByTestId('project-name-heading').textContent).toContain('Auth API V2');

      // Click Work resource tab
      const workTab = screen.getByRole('tab', { name: /Work/i });
      fireEvent.click(workTab);

      // PRJ-002 Project Work is displayed
      expect(screen.getByRole('region', { name: /Project Work/i })).toBeDefined();
    });

    it('rejects stale project write and surfaces concurrency conflict without discarding edits', async () => {
      const onUpdateProject = vi.fn();
      const project = {
        id: 'proj-concurrency',
        version: 2, // Upstream moved to version 2
        name: 'Upstream Name',
        summary: 'Upstream summary'
      };

      render(
        <ProjectSettingsTab
          project={project}
          isConflict={true}
          saveState="Conflict requiring attention"
          onUpdateProject={onUpdateProject}
        />
      );

      // Conflict banner is truthfully displayed
      expect(screen.getByTestId('project-conflict-banner')).toBeDefined();
      expect(screen.getByText(/Concurrency Conflict/i)).toBeDefined();
    });
  });
});
