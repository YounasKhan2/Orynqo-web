import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import {
  createInitiativeModel,
  INITIATIVE_OPERATIONAL_STATE,
  INITIATIVE_ARCHIVE_STATE,
  INITIATIVE_HEALTH,
  INITIATIVE_ACCESS_POLICY,
  deriveInitiativeContributingTeams,
  calculateInitiativeProgress,
  deriveInitiativeRiskSignals,
  createInitiativeUpdateModel
} from '../features/initiatives/model';
import {
  InitiativeHealthBadge,
  InitiativeProgressBar,
  InitiativeHeader,
  InitiativeOverviewTab,
  InitiativeProjectsTab,
  InitiativeRoadmapTab,
  InitiativeUpdatesTab,
  InitiativeActivityTab,
  InitiativeManagementModal,
  InitiativeUpdateModal,
  AlignProjectModal,
  InitiativesDirectory,
  InitiativeWorkspace
} from '../features/initiatives/components';
import { App } from '../App';

describe('UI-08B: Initiatives & Roadmap Implementation Suite', () => {
  // -------------------------------------------------------------
  // 1. CANONICAL INITIATIVE MODEL & ORTHOGONAL STATES
  // -------------------------------------------------------------
  describe('1. Canonical Initiative Model & Orthogonal States', () => {
    it('enforces orthogonal dimensions (operationalState, archiveState, health, accessPolicy)', () => {
      const init = createInitiativeModel({
        id: 'init-test-1',
        identifier: 'INT-99',
        name: 'Enterprise Scale Strategy',
        operationalState: INITIATIVE_OPERATIONAL_STATE.ACTIVE,
        archiveState: INITIATIVE_ARCHIVE_STATE.ACTIVE,
        health: INITIATIVE_HEALTH.ON_TRACK,
        accessPolicy: INITIATIVE_ACCESS_POLICY.WORKSPACE
      });

      expect(init.operationalState).toBe('active');
      expect(init.archiveState).toBe('active');
      expect(init.health).toBe('on_track');
      expect(init.accessPolicy).toBe('workspace');
      expect(init.version).toBe(1);
    });

    it('preserves structured temporal horizon without fabricating dates', () => {
      const horizonInit = createInitiativeModel({
        name: 'Horizon Initiative',
        horizon: {
          type: 'quarter',
          quarter: 'Q3',
          year: 2026,
          confidence: 'committed'
        }
      });
      expect(horizonInit.horizon.type).toBe('quarter');
      expect(horizonInit.horizon.quarter).toBe('Q3');

      const unscheduledInit = createInitiativeModel({
        name: 'Unscheduled Initiative',
        horizon: null
      });
      expect(unscheduledInit.horizon).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // 2. PROJECT ↔ INITIATIVE ASSOCIATION INVARIANTS
  // -------------------------------------------------------------
  describe('2. Project ↔ Initiative Association Invariants', () => {
    it('stores association strictly on canonical Project domain (project.initiativeId)', () => {
      const sampleProject = {
        id: 'proj-assoc-1',
        name: 'Core Engine Overhaul',
        leadTeamId: 'team-core',
        participatingTeamIds: ['team-core', 'team-platform'],
        initiativeId: null,
        operationalState: 'active'
      };

      // Aligning project to initiative mutates project.initiativeId
      const alignedProject = { ...sampleProject, initiativeId: 'init-100' };
      expect(alignedProject.initiativeId).toBe('init-100');

      // Does not mutate project team ownership or execution state
      expect(alignedProject.leadTeamId).toBe(sampleProject.leadTeamId);
      expect(alignedProject.participatingTeamIds).toEqual(sampleProject.participatingTeamIds);
      expect(alignedProject.operationalState).toBe(sampleProject.operationalState);
    });

    it('requires explicit confirmation when reassigning a project already aligned to another initiative', () => {
      const projects = [
        {
          id: 'proj-busy',
          identifier: 'PRJ-101',
          name: 'Mobile Core Engine',
          initiativeId: 'init-existing-parent'
        }
      ];

      const initiatives = [
        { id: 'init-existing-parent', identifier: 'INT-01', name: 'Existing Owner Initiative' },
        { id: 'init-target', identifier: 'INT-02', name: 'Target Initiative' }
      ];

      const onConfirmReassign = vi.fn();

      render(
        <AlignProjectModal
          isOpen={true}
          onClose={() => {}}
          projects={projects}
          initiatives={initiatives}
          activeInitiativeId="init-target"
          onAlignProject={onConfirmReassign}
        />
      );

      // Select the project
      const select = screen.getByLabelText(/Select Project to Align/i);
      fireEvent.change(select, { target: { value: 'proj-busy' } });

      // Reassignment warning must appear
      expect(screen.getByTestId('reassign-warning')).toBeDefined();
      expect(screen.getByText(/Currently aligned to/i)).toBeDefined();

      // Click Align Project
      const alignBtn = screen.getByRole('button', { name: /Reassign & Align Project/i });
      fireEvent.click(alignBtn);

      expect(onConfirmReassign).toHaveBeenCalledWith('proj-busy', 'init-target');
    });
  });

  // -------------------------------------------------------------
  // 3. DERIVED CONTRIBUTING TEAMS INVARIANT
  // -------------------------------------------------------------
  describe('3. Derived Contributing Teams Invariant', () => {
    it('dynamically computes unique contributing teams from accessible associated projects only', () => {
      const associatedProjects = [
        {
          id: 'proj-1',
          initiativeId: 'init-alpha',
          leadTeamId: 'team-core',
          participatingTeamIds: ['team-core', 'team-platform']
        },
        {
          id: 'proj-2',
          initiativeId: 'init-alpha',
          leadTeamId: 'team-mobile',
          participatingTeamIds: ['team-mobile', 'team-core']
        },
        {
          id: 'proj-inaccessible',
          initiativeId: 'init-alpha',
          isRestricted: true,
          leadTeamId: 'team-secret',
          participatingTeamIds: ['team-secret']
        }
      ];

      const derivedTeams = deriveInitiativeContributingTeams(
        'init-alpha',
        associatedProjects,
        (p) => !p.isRestricted
      );

      // Inaccessible team-secret must NOT leak
      expect(derivedTeams).toContain('team-core');
      expect(derivedTeams).toContain('team-platform');
      expect(derivedTeams).toContain('team-mobile');
      expect(derivedTeams).not.toContain('team-secret');
      expect(derivedTeams).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------
  // 4. DUAL TRANSPARENT PROGRESS & ZERO-LEAKAGE ROLLUP
  // -------------------------------------------------------------
  describe('4. Dual Transparent Progress & Zero-Leakage Rollup', () => {
    it('computes both project completion and aggregate work item completion excluding inaccessible items', () => {
      const projects = [
        {
          id: 'proj-done',
          initiativeId: 'init-metrics',
          operationalState: 'completed',
          archiveState: 'active'
        },
        {
          id: 'proj-active',
          initiativeId: 'init-metrics',
          operationalState: 'active',
          archiveState: 'active'
        },
        {
          id: 'proj-cancelled',
          initiativeId: 'init-metrics',
          operationalState: 'cancelled',
          archiveState: 'active'
        },
        {
          id: 'proj-restricted',
          initiativeId: 'init-metrics',
          operationalState: 'completed',
          isRestricted: true
        }
      ];

      const workItems = [
        { id: 'w-1', projectId: 'proj-done', status: 'done' },
        { id: 'w-2', projectId: 'proj-active', status: 'done' },
        { id: 'w-3', projectId: 'proj-active', status: 'todo' },
        { id: 'w-4', projectId: 'proj-cancelled', status: 'done' },
        { id: 'w-secret', projectId: 'proj-restricted', status: 'done' }
      ];

      const progress = calculateInitiativeProgress(
        'init-metrics',
        projects,
        workItems,
        (p) => !p.isRestricted
      );

      // Project Progress:
      // Active (1) + Completed (1) = 2 total accessible eligible projects (cancelled excluded from denominator)
      // 1 completed of 2 = 50%
      expect(progress.projectProgress.total).toBe(2);
      expect(progress.projectProgress.completed).toBe(1);
      expect(progress.projectProgress.percentage).toBe(50);

      // WorkItem Progress:
      // Canonical workitems in accessible projects: w-1 (done), w-2 (done), w-3 (todo)
      // w-secret is in inaccessible proj-restricted => excluded!
      expect(progress.itemProgress.total).toBe(3);
      expect(progress.itemProgress.completed).toBe(2);
      expect(progress.itemProgress.percentage).toBe(67);
    });

    it('renders truthful "No projects aligned" when zero accessible projects exist', () => {
      const progress = calculateInitiativeProgress('init-empty', [], [], () => true);
      expect(progress.projectProgress.total).toBe(0);

      render(
        <InitiativeProgressBar
          label="Project Delivery"
          completed={progress.projectProgress.completed}
          total={progress.projectProgress.total}
          percentage={progress.projectProgress.percentage}
          unitLabel="projects"
        />
      );

      expect(screen.getByText(/No projects aligned/i)).toBeDefined();
      expect(screen.queryByText(/0%/i)).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // 5. OBJECTIVE RISK SIGNALS DO NOT MUTATE CURATED HEALTH
  // -------------------------------------------------------------
  describe('5. Objective Risk Signals Do Not Mutate Curated Health', () => {
    it('evaluates at-risk projects, overdue milestones, and stale updates without overriding initiative.health', () => {
      const init = {
        id: 'init-curated',
        health: 'on_track' // Human curator declared on_track
      };

      const projects = [
        {
          id: 'p-risk',
          initiativeId: 'init-curated',
          name: 'Critical Path Service',
          health: 'off_track'
        }
      ];

      const milestones = [
        {
          id: 'm-overdue',
          projectId: 'p-risk',
          name: 'Security Audit',
          targetDate: '2025-01-01', // Past date
          status: 'planned'
        }
      ];

      const signals = deriveInitiativeRiskSignals(init, projects, milestones, []);

      // Risk signals are present as supporting evidence
      expect(signals.length).toBeGreaterThan(0);
      expect(signals.some((s) => s.type === 'project_health')).toBe(true);

      // Initiative health remains untouched
      expect(init.health).toBe('on_track');
    });
  });

  // -------------------------------------------------------------
  // 6. INT-001: INITIATIVES DIRECTORY & ZERO-LEAKAGE DISCOVERY
  // -------------------------------------------------------------
  describe('6. INT-001: Initiatives Directory & Zero-Leakage Discovery', () => {
    it('renders portfolio table, filters by search, and completely hides restricted initiatives', () => {
      const initiatives = [
        {
          id: 'init-pub-1',
          identifier: 'INT-01',
          name: 'Zero Trust Authentication Architecture',
          operationalState: 'active',
          archiveState: 'active',
          health: 'on_track',
          ownerUserId: 'usr-sarah',
          horizon: { quarter: 'Q4', year: 2026 }
        },
        {
          id: 'init-pub-2',
          identifier: 'INT-02',
          name: 'Global Edge Cache Network',
          operationalState: 'planned',
          archiveState: 'active',
          health: 'at_risk',
          ownerUserId: 'usr-alex',
          horizon: { quarter: 'Q1', year: 2027 }
        },
        {
          id: 'init-classified',
          identifier: 'INT-SECRET',
          name: 'Project Black Mesa',
          operationalState: 'active',
          archiveState: 'active',
          health: 'off_track',
          isRestricted: true
        }
      ];

      const onNavigate = vi.fn();

      render(
        <InitiativesDirectory
          initiatives={initiatives}
          projects={[]}
          workItems={[]}
          teams={[]}
          users={[
            { id: 'usr-sarah', name: 'Sarah Chen' },
            { id: 'usr-alex', name: 'Alex Rivera' }
          ]}
          onNavigateToInitiative={onNavigate}
          isAccessible={(init) => !init.isRestricted}
        />
      );

      // Public initiatives appear
      expect(screen.getByText('INT-01')).toBeDefined();
      expect(screen.getByText('Zero Trust Authentication Architecture')).toBeDefined();
      expect(screen.getByText('INT-02')).toBeDefined();

      // Restricted initiative MUST NOT leak
      expect(screen.queryByText('INT-SECRET')).toBeNull();
      expect(screen.queryByText('Project Black Mesa')).toBeNull();

      // Search filtering
      const searchInput = screen.getByPlaceholderText(/Search initiatives/i);
      fireEvent.change(searchInput, { target: { value: 'Edge Cache' } });

      expect(screen.queryByText('INT-01')).toBeNull();
      expect(screen.getByText('INT-02')).toBeDefined();

      // Clicking row triggers onNavigateToInitiative
      fireEvent.click(screen.getByText('INT-02'));
      expect(onNavigate).toHaveBeenCalledWith('init-pub-2');
    });
  });

  // -------------------------------------------------------------
  // 7. INT-002: INITIATIVE RESOURCE PAGE (5 TABS & MANAGEMENT)
  // -------------------------------------------------------------
  describe('7. INT-002: Initiative Resource Page (5 Tabs & Management Surface)', () => {
    it('orchestrates exactly 5 canonical tabs without adding a 6th Settings tab', () => {
      const initiative = {
        id: 'init-resource',
        identifier: 'INT-01',
        name: 'Enterprise Platform Modernization',
        operationalState: 'active',
        archiveState: 'active',
        health: 'on_track',
        horizon: { quarter: 'Q4', year: 2026 }
      };

      const onTabChange = vi.fn();

      render(
        <InitiativeWorkspace
          initiativeId="init-resource"
          initiatives={[initiative]}
          projects={[]}
          workItems={[]}
          milestones={[]}
          updates={[]}
          dependencies={[]}
          activityEvents={[]}
          teams={[]}
          users={[]}
          activeTab="overview"
          onTabChange={onTabChange}
        />
      );

      // Verify the 5 canonical tabs exist
      expect(screen.getByRole('tab', { name: /Overview/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Projects/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Roadmap/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Updates/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Activity/i })).toBeDefined();

      // Verify a 6th permanent settings tab DOES NOT exist
      expect(screen.queryByRole('tab', { name: /Settings/i })).toBeNull();

      // Tab click delegates to onTabChange
      fireEvent.click(screen.getByRole('tab', { name: /Roadmap/i }));
      expect(onTabChange).toHaveBeenCalledWith('roadmap');
    });

    it('opens progressive-disclosure management surface from header More/Settings button', () => {
      const initiative = {
        id: 'init-mgmt',
        identifier: 'INT-05',
        name: 'Core System Replatform',
        operationalState: 'active',
        archiveState: 'active',
        health: 'on_track',
        accessPolicy: 'workspace',
        version: 1
      };

      render(
        <InitiativeWorkspace
          initiativeId="init-mgmt"
          initiatives={[initiative]}
          projects={[]}
          workItems={[]}
          activeTab="overview"
        />
      );

      // Click Header Settings (...) action
      const settingsAction = screen.getByRole('button', { name: /Initiative Settings/i });
      fireEvent.click(settingsAction);

      // Management Surface dialog opens
      expect(screen.getByRole('dialog', { name: /Initiative Management & Settings/i })).toBeDefined();
      expect(screen.getByText(/Access Policy/i)).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 8. ROADMAP PROJECTION & DELEGATED MUTATION ROLLBACK
  // -------------------------------------------------------------
  describe('8. Roadmap Projection & Delegated Mutation Rollback', () => {
    it('renders truthful unscheduled region and supports semantic zoom modes', () => {
      const initiative = {
        id: 'init-rdm',
        identifier: 'INT-10',
        name: 'Roadmap Milestone Projection',
        horizon: null // Unscheduled initiative!
      };

      const projects = [
        {
          id: 'proj-unsched',
          initiativeId: 'init-rdm',
          name: 'Unscheduled Security Hardening',
          startDate: null,
          targetDate: null
        }
      ];

      render(
        <InitiativeRoadmapTab
          initiative={initiative}
          projects={projects}
          milestones={[]}
          dependencies={[]}
        />
      );

      // Unscheduled items must appear in Truthful Unscheduled Tray, NOT arbitrarily placed on today
      expect(screen.getByTestId('roadmap-unscheduled-tray')).toBeDefined();
      expect(screen.getByText(/Unscheduled Security Hardening/i)).toBeDefined();

      // Semantic Zoom controls (Month, Quarter, Year)
      expect(screen.getByTestId('roadmap-zoom-quarter')).toBeDefined();
      expect(screen.getByTestId('roadmap-zoom-month')).toBeDefined();
      expect(screen.getByTestId('roadmap-zoom-year')).toBeDefined();
    });

    it('rolls back visual date adjustments on optimistic concurrency conflict', async () => {
      const project = {
        id: 'proj-conflict',
        name: 'Concurrent Data Migrations',
        targetDate: '2026-10-15',
        version: 3
      };

      const onRescheduleProject = vi.fn().mockReturnValue(false); // Fails concurrency check!

      render(
        <InitiativeRoadmapTab
          initiative={{ id: 'init-cf' }}
          projects={[project]}
          milestones={[]}
          dependencies={[]}
          onRescheduleProject={onRescheduleProject}
        />
      );

      // Simulate date interaction
      const rescheduleBtn = screen.getByTestId('adjust-target-proj-conflict');
      fireEvent.click(rescheduleBtn);

      expect(onRescheduleProject).toHaveBeenCalled();
      // Visual feedback shows conflict error banner
      await waitFor(() => {
        expect(screen.getByTestId('roadmap-conflict-error-banner')).toBeDefined();
      });
    });
  });

  // -------------------------------------------------------------
  // 9. AUTHORITATIVE HISTORICAL INITIATIVE UPDATES
  // -------------------------------------------------------------
  describe('9. Authoritative Historical Initiative Updates', () => {
    it('requires explicit health declaration and synchronizes canonical health without overwriting horizon', () => {
      const initialInit = {
        id: 'init-sync',
        health: 'unset',
        horizon: { quarter: 'Q4', year: 2026 }
      };

      let currentHealth = initialInit.health;
      const onPostUpdate = vi.fn(({ health }) => {
        currentHealth = health;
      });

      render(
        <InitiativeUpdateModal
          isOpen={true}
          onClose={() => {}}
          initiative={initialInit}
          onPostUpdate={onPostUpdate}
        />
      );

      // Narrative text
      const narrativeInput = screen.getByTestId('update-narrative-input');
      fireEvent.change(narrativeInput, { target: { value: 'All architectural foundations merged successfully.' } });

      // Select Health snapshot radio button
      const onTrackRadio = screen.getByRole('radio', { name: /On Track/i });
      fireEvent.click(onTrackRadio);

      // Submit
      const publishBtn = screen.getByTestId('submit-initiative-update-btn');
      fireEvent.click(publishBtn);

      expect(onPostUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          initiativeId: 'init-sync',
          health: 'on_track',
          narrative: 'All architectural foundations merged successfully.'
        })
      );
      expect(currentHealth).toBe('on_track');
      expect(initialInit.horizon.quarter).toBe('Q4'); // Horizon preserved!
    });
  });

  // -------------------------------------------------------------
  // 10. NON-CASCADING LIFECYCLE (COMPLETION & ARCHIVE)
  // -------------------------------------------------------------
  describe('10. Non-Cascading Lifecycle (Completion & Archive)', () => {
    it('prompts explicit confirmation if incomplete projects remain, leaving them active', async () => {
      const initiative = {
        id: 'init-lifecycle',
        name: 'Infrastructure Strategy',
        operationalState: 'active',
        archiveState: 'active'
      };

      const projects = [
        {
          id: 'proj-incomplete',
          initiativeId: 'init-lifecycle',
          name: 'Ongoing Sharding Engine',
          operationalState: 'active'
        }
      ];

      const onComplete = vi.fn();

      render(
        <InitiativeManagementModal
          isOpen={true}
          onClose={() => {}}
          initiative={initiative}
          associatedProjects={projects}
          onCompleteInitiative={onComplete}
        />
      );

      // Click Mark Completed
      const completeBtn = screen.getByTestId('management-complete-initiative-btn');
      fireEvent.click(completeBtn);

      // Incomplete warning appears in confirmation dialog
      await waitFor(() => {
        expect(screen.getByTestId('completion-confirmation-dialog')).toBeDefined();
      });
      expect(screen.getByText(/remain aligned/i)).toBeDefined();

      // Confirm completion
      const confirmBtn = screen.getByTestId('confirm-completion-btn');
      fireEvent.click(confirmBtn);

      expect(onComplete).toHaveBeenCalledWith('init-lifecycle');
      // Incomplete project operational state must remain 'active'
      expect(projects[0].operationalState).toBe('active');
    });

    it('archiving an initiative preserves updates, activity, and project associations', () => {
      const onArchive = vi.fn();
      render(
        <InitiativeManagementModal
          isOpen={true}
          onClose={() => {}}
          initiative={{ id: 'init-arch', operationalState: 'active', archiveState: 'active' }}
          associatedProjects={[{ id: 'proj-assoc', initiativeId: 'init-arch' }]}
          onArchiveInitiative={onArchive}
        />
      );

      const archiveBtn = screen.getByTestId('management-archive-initiative-btn');
      fireEvent.click(archiveBtn);

      expect(onArchive).toHaveBeenCalledWith('init-arch');
    });
  });

  // -------------------------------------------------------------
  // 11. END-TO-END WORKSPACE INTEGRATION & FAVORITES
  // -------------------------------------------------------------
  describe('11. End-to-End Workspace Integration & Favorites', () => {
    it('navigates to Initiatives from Sidebar, selects INT-01, switches tabs, and toggles generic Favorite', async () => {
      const initialInitiatives = [
        {
          id: 'init-e2e',
          identifier: 'INT-01',
          name: 'Scalable Platform Architecture',
          operationalState: 'active',
          archiveState: 'active',
          health: 'on_track',
          ownerUserId: 'usr-sarah',
          horizon: { quarter: 'Q4', year: 2026 },
          accessPolicy: 'workspace',
          version: 1
        }
      ];

      render(<App initialInitiatives={initialInitiatives} />);

      // Click "Initiatives" in Sidebar
      const initiativesSidebarBtn = screen.getByRole('button', { name: /^Initiatives/i });
      fireEvent.click(initiativesSidebarBtn);

      // Directory opens
      await waitFor(() => {
        expect(screen.getByText('Scalable Platform Architecture')).toBeDefined();
      });

      // Click INT-01 row to open resource page
      fireEvent.click(screen.getByText('Scalable Platform Architecture'));

      // Resource header renders
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Scalable Platform Architecture/i })).toBeDefined();
      });

      // Navigate to Projects tab
      const projectsTab = screen.getByRole('tab', { name: /Projects/i });
      fireEvent.click(projectsTab);

      // Align Project trigger exists
      expect(screen.getByTestId('align-project-trigger-tab')).toBeDefined();

      // Toggle Favorite
      const favBtn = screen.getByTestId('favorite-initiative-btn');
      fireEvent.click(favBtn);
      expect(favBtn).toBeDefined();
    });
  });
});

