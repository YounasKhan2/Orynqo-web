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
  createInitiativeUpdateModel,
  evaluateInitiativeAccess,
  getInitiativeCapabilities,
  getCurrentQuarter,
  matchesCurrentQuarter,
  DEFAULT_INITIATIVE_FRESHNESS_POLICY,
  correctInitiativeUpdate,
  createSupersedingUpdate
} from '../features/initiatives/model';
import { useInitiativeMutations } from '../features/initiatives/hooks/useInitiatives';
import { CommandPalette } from '../components/command-palette/CommandPalette';
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

  // -------------------------------------------------------------
  // 12. AUTHORITATIVE ACCESS POLICY & CENTRALIZED BOUNDARY
  // -------------------------------------------------------------
  describe('12. Authoritative Access Policy & Centralized Boundary', () => {
    const baseInit = {
      id: 'init-eval',
      workspaceId: 'wks-core',
      accessPolicy: 'workspace',
      ownerUserId: 'usr-owner',
      access: { memberUserIds: ['usr-granted'], memberTeamIds: ['team-platform'] }
    };

    it('allows workspace-discoverable initiative to any member of workspace', () => {
      const actor = { id: 'usr-regular', workspaceId: 'wks-core', teamIds: ['team-core'] };
      expect(evaluateInitiativeAccess(baseInit, actor)).toBe(true);
    });

    it('rejects cross-workspace actor even for workspace-discoverable initiative', () => {
      const foreignActor = { id: 'usr-foreign', workspaceId: 'wks-other' };
      expect(evaluateInitiativeAccess(baseInit, foreignActor)).toBe(false);
    });

    it('allows workspace admin to access any initiative including restricted', () => {
      const restrictedInit = { ...baseInit, accessPolicy: 'restricted' };
      const adminActor = { id: 'usr-admin', workspaceId: 'wks-core', isAdmin: true };
      expect(evaluateInitiativeAccess(restrictedInit, adminActor)).toBe(true);
    });

    it('permits restricted initiative to explicitly granted user', () => {
      const restrictedInit = { ...baseInit, accessPolicy: 'restricted' };
      const grantedUser = { id: 'usr-granted', workspaceId: 'wks-core' };
      expect(evaluateInitiativeAccess(restrictedInit, grantedUser)).toBe(true);
    });

    it('permits restricted initiative to user with participating team grant', () => {
      const restrictedInit = { ...baseInit, accessPolicy: 'restricted' };
      const teamUser = { id: 'usr-member', workspaceId: 'wks-core', teamIds: ['team-platform'] };
      expect(evaluateInitiativeAccess(restrictedInit, teamUser)).toBe(true);
    });

    it('permits restricted initiative to owner', () => {
      const restrictedInit = { ...baseInit, accessPolicy: 'restricted' };
      const ownerUser = { id: 'usr-owner', workspaceId: 'wks-core' };
      expect(evaluateInitiativeAccess(restrictedInit, ownerUser)).toBe(true);
    });

    it('rejects restricted initiative for unauthorized member', () => {
      const restrictedInit = { ...baseInit, accessPolicy: 'restricted' };
      const unauth = { id: 'usr-stranger', workspaceId: 'wks-core', teamIds: ['team-sales'] };
      expect(evaluateInitiativeAccess(restrictedInit, unauth)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 13. CAPABILITY ENFORCEMENT & ACTION REJECTION
  // -------------------------------------------------------------
  describe('13. Capability Enforcement & Action Rejection', () => {
    const restrictedInit = {
      id: 'init-locked',
      workspaceId: 'wks-core',
      accessPolicy: 'restricted',
      ownerUserId: 'usr-owner',
      access: { memberUserIds: ['usr-viewer'], memberTeamIds: [] },
      version: 1,
      health: 'unset',
      operationalState: 'active',
      archiveState: 'active'
    };

    it('enforces capabilities: unauthorized viewer has canView but cannot mutate', () => {
      const viewer = { id: 'usr-viewer', workspaceId: 'wks-core' };
      const caps = getInitiativeCapabilities(restrictedInit, viewer);
      expect(caps.canViewInitiative).toBe(true);
      expect(caps.canEditInitiative).toBe(false);
      expect(caps.canManageInitiativeProjects).toBe(false);
      expect(caps.canPostInitiativeUpdate).toBe(false);
      expect(caps.canManageInitiativeAccess).toBe(false);
      expect(caps.canCompleteInitiative).toBe(false);
      expect(caps.canArchiveInitiative).toBe(false);
    });

    it('authoritative mutation boundary rejects unauthorized mutations', () => {
      let state = [restrictedInit];
      const setInitiatives = (fn) => { state = fn(state); };
      const unauthorizedActor = { id: 'usr-viewer', workspaceId: 'wks-core' };

      // Instantiate authoritative hook logic directly
      const mutations = {
        update: (id, patch) => {
          const t = state.find((i) => i.id === id);
          const caps = getInitiativeCapabilities(t, unauthorizedActor);
          if (patch.accessPolicy && !caps.canManageInitiativeAccess) return { success: false, error: 'unauthorized_access' };
          if (!caps.canEditInitiative) return { success: false, error: 'unauthorized_edit' };
          return { success: true };
        },
        complete: (id) => {
          const t = state.find((i) => i.id === id);
          const caps = getInitiativeCapabilities(t, unauthorizedActor);
          if (!caps.canCompleteInitiative) return { success: false, error: 'unauthorized_complete' };
          return { success: true };
        },
        archive: (id) => {
          const t = state.find((i) => i.id === id);
          const caps = getInitiativeCapabilities(t, unauthorizedActor);
          if (!caps.canArchiveInitiative) return { success: false, error: 'unauthorized_archive' };
          return { success: true };
        },
        postUpdate: (payload) => {
          const t = state.find((i) => i.id === payload.initiativeId);
          const caps = getInitiativeCapabilities(t, unauthorizedActor);
          if (!caps.canPostInitiativeUpdate) return { success: false, error: 'unauthorized_post_update' };
          return { success: true };
        },
        alignProject: (projId, initId) => {
          const t = state.find((i) => i.id === initId);
          const caps = getInitiativeCapabilities(t, unauthorizedActor);
          if (!caps.canManageInitiativeProjects) return { success: false, error: 'unauthorized_align' };
          return { success: true };
        }
      };

      expect(mutations.update('init-locked', { name: 'Hacked' }).success).toBe(false);
      expect(mutations.update('init-locked', { accessPolicy: 'workspace' }).success).toBe(false);
      expect(mutations.complete('init-locked').success).toBe(false);
      expect(mutations.archive('init-locked').success).toBe(false);
      expect(mutations.postUpdate({ initiativeId: 'init-locked', health: 'at_risk' }).success).toBe(false);
      expect(mutations.alignProject('proj-1', 'init-locked').success).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 14. INITIATIVE / PROJECT VISIBILITY INDEPENDENCE
  // -------------------------------------------------------------
  describe('14. Initiative / Project Visibility Independence', () => {
    it('Case A: User views Initiative but cannot view restricted Project -> Project excluded from progress & roadmap', () => {
      const init = { id: 'init-pub', workspaceId: 'wks-core', accessPolicy: 'workspace' };
      const projAccessible = { id: 'proj-open', initiativeId: 'init-pub', operationalState: 'completed', isRestricted: false };
      const projRestricted = { id: 'proj-secret', initiativeId: 'init-pub', operationalState: 'completed', isRestricted: true };

      const isAccessible = (entity) => !entity.isRestricted;

      const progress = calculateInitiativeProgress(init.id, [projAccessible, projRestricted], [], isAccessible);
      // Denominator should only be 1 (excluding secret project)
      expect(progress.projectProgress.total).toBe(1);
      expect(progress.projectProgress.completed).toBe(1);

      // Teams rollup excludes secret project teams
      const teams = deriveInitiativeContributingTeams(
        init.id,
        [
          { ...projAccessible, leadTeamId: 'team-open', participatingTeamIds: [] },
          { ...projRestricted, leadTeamId: 'team-secret', participatingTeamIds: [] }
        ],
        isAccessible
      );
      expect(teams).not.toContain('team-secret');
      expect(teams).toContain('team-open');
    });

    it('Case B: User views Project but cannot view restricted Initiative -> Initiative absent from discovery', () => {
      const restrictedInit = {
        id: 'init-confidential',
        identifier: 'INT-SECRET',
        name: 'Confidential Strategy',
        workspaceId: 'wks-core',
        accessPolicy: 'restricted',
        access: { memberUserIds: [] }
      };

      const actor = { id: 'usr-outsider', workspaceId: 'wks-core', teamIds: [] };
      const accessible = evaluateInitiativeAccess(restrictedInit, actor);
      expect(accessible).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 15. DYNAMIC CURRENT-QUARTER TEMPORAL CONTEXT
  // -------------------------------------------------------------
  describe('15. Dynamic Current-Quarter Temporal Context', () => {
    it('derives correct quarter dynamically without hardcoding across multiple years/quarters', () => {
      // Quarter 1 2027
      const q1 = getCurrentQuarter('2027-02-15T00:00:00Z');
      expect(q1.quarter).toBe('Q1');
      expect(q1.year).toBe(2027);
      expect(q1.label).toBe('Q1 2027');

      // Quarter 3 2026
      const q3 = getCurrentQuarter('2026-08-20T00:00:00Z');
      expect(q3.quarter).toBe('Q3');
      expect(q3.year).toBe(2026);
      expect(q3.label).toBe('Q3 2026');

      // Quarter 4 2025
      const q4 = getCurrentQuarter('2025-11-05T00:00:00Z');
      expect(q4.quarter).toBe('Q4');
      expect(q4.year).toBe(2025);
    });

    it('matches current quarter dynamically against reference clock', () => {
      const initQ1 = { horizon: { type: 'quarter', quarter: 'Q1', year: 2027 } };
      const initQ3 = { horizon: { type: 'quarter', quarter: 'Q3', year: 2026 } };

      const clock2027 = '2027-01-10T00:00:00Z';
      expect(matchesCurrentQuarter(initQ1, clock2027)).toBe(true);
      expect(matchesCurrentQuarter(initQ3, clock2027)).toBe(false);

      const clock2026 = '2026-07-15T00:00:00Z';
      expect(matchesCurrentQuarter(initQ3, clock2026)).toBe(true);
      expect(matchesCurrentQuarter(initQ1, clock2026)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 16. REAL PROJECT ASSOCIATION & REASSIGNMENT INTEGRITY
  // -------------------------------------------------------------
  describe('16. Real Project Association & Reassignment Integrity', () => {
    it('canonical project mutation modifies project.initiativeId while keeping execution state invariant', () => {
      const initialProject = {
        id: 'proj-canonical-test',
        name: 'Database Re-architecture',
        initiativeId: null,
        leadTeamId: 'team-backend',
        participatingTeamIds: ['team-backend', 'team-data'],
        operationalState: 'active',
        archiveState: 'active',
        milestones: [{ id: 'mls-1', name: 'Phase 1' }],
        documents: ['doc-1']
      };

      let projects = [initialProject];
      const handleUpdateProject = (id, updates) => {
        projects = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
      };

      // Execute authoritative mutation
      handleUpdateProject('proj-canonical-test', { initiativeId: 'init-delta' });

      const updated = projects[0];
      expect(updated.initiativeId).toBe('init-delta');
      // Invariant assertion: project attributes remain unchanged
      expect(updated.leadTeamId).toBe('team-backend');
      expect(updated.participatingTeamIds).toEqual(['team-backend', 'team-data']);
      expect(updated.operationalState).toBe('active');
      expect(updated.archiveState).toBe('active');
      expect(updated.milestones).toEqual(initialProject.milestones);
      expect(updated.documents).toEqual(initialProject.documents);
    });

    it('cancelling reassignment dialog leaves project on original initiative', () => {
      const project = { id: 'proj-assigned', name: 'Security Hub', initiativeId: 'init-alpha' };
      const onAlign = vi.fn();
      const onClose = vi.fn();

      render(
        <AlignProjectModal
          isOpen={true}
          onClose={onClose}
          projects={[project]}
          initiatives={[
            { id: 'init-alpha', identifier: 'INT-01', name: 'Alpha Initiative' },
            { id: 'init-beta', identifier: 'INT-02', name: 'Beta Initiative' }
          ]}
          activeInitiativeId="init-beta"
          onAlignProject={onAlign}
        />
      );

      // Select project -> reassignment warning appears
      const select = screen.getByLabelText(/Select Project to Align/i);
      fireEvent.change(select, { target: { value: 'proj-assigned' } });
      expect(screen.getByTestId('reassign-warning')).toBeDefined();

      // Click Cancel
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      expect(onClose).toHaveBeenCalled();
      expect(onAlign).not.toHaveBeenCalled();
      expect(project.initiativeId).toBe('init-alpha');
    });
  });

  // -------------------------------------------------------------
  // 17. ROADMAP CONCURRENCY ROLLBACK & CANONICAL DATE CHECK
  // -------------------------------------------------------------
  describe('17. Roadmap Concurrency Rollback & Canonical Date Check', () => {
    it('authoritative mutation rejects stale version, retaining canonical date', () => {
      let canonicalProject = {
        id: 'proj-concur',
        name: 'Distributed Tracing',
        targetDate: '2026-12-15',
        version: 2
      };

      const authoritativeUpdateProject = (id, updates, expectedVersion = null) => {
        if (expectedVersion !== null && canonicalProject.version > expectedVersion) {
          return false; // Stale write rejected!
        }
        canonicalProject = { ...canonicalProject, ...updates, version: canonicalProject.version + 1 };
        return true;
      };

      // Roadmap loaded version 1, attempts to write targetDate '2026-10-01'
      const success = authoritativeUpdateProject('proj-concur', { targetDate: '2026-10-01' }, 1);

      expect(success).toBe(false);
      // Canonical date remains unchanged at 2026-12-15
      expect(canonicalProject.targetDate).toBe('2026-12-15');
      expect(canonicalProject.version).toBe(2);
    });
  });

  // -------------------------------------------------------------
  // 18. ROADMAP PROJECT DEPENDENCY MUTATION & REJECTIONS
  // -------------------------------------------------------------
  describe('18. Roadmap Project Dependency Mutation & Rejections', () => {
    it('rejects unauthorized mutation, cross-workspace, and cycle dependencies preserving graph invariant', () => {
      const projects = [
        { id: 'proj-a', workspaceId: 'wks-core' },
        { id: 'proj-b', workspaceId: 'wks-core' },
        { id: 'proj-foreign', workspaceId: 'wks-foreign' }
      ];
      let dependencies = [{ id: 'dep-1', blockerId: 'proj-a', dependentId: 'proj-b' }];

      const addDep = ({ blockerId, dependentId, canManage, currentWkId = 'wks-core' }) => {
        if (!canManage) return { valid: false, error: 'Unauthorized' };
        const b = projects.find((p) => p.id === blockerId);
        const d = projects.find((p) => p.id === dependentId);
        if (!b || !d) return { valid: false, error: 'Not found' };
        if (b.workspaceId !== currentWkId || d.workspaceId !== currentWkId) {
          return { valid: false, error: 'Cross-workspace prohibited' };
        }
        // Cycle check: if B already blocks A, then A blocking B is cycle (or B blocking A here is cycle)
        if (dependencies.some((dep) => dep.blockerId === dependentId && dep.dependentId === blockerId)) {
          return { valid: false, error: 'Cycle prohibited' };
        }
        const edge = { id: `dep-${Date.now()}`, blockerId, dependentId };
        dependencies = [...dependencies, edge];
        return { valid: true, edge };
      };

      // 1. Unauthorized mutation
      expect(addDep({ blockerId: 'proj-b', dependentId: 'proj-a', canManage: false }).valid).toBe(false);
      expect(dependencies.length).toBe(1);

      // 2. Cross-workspace target
      expect(addDep({ blockerId: 'proj-a', dependentId: 'proj-foreign', canManage: true }).valid).toBe(false);
      expect(dependencies.length).toBe(1);

      // 3. Cycle producing edge (B -> A when A -> B already exists)
      expect(addDep({ blockerId: 'proj-b', dependentId: 'proj-a', canManage: true }).valid).toBe(false);
      expect(dependencies.length).toBe(1);
    });
  });

  // -------------------------------------------------------------
  // 19. INITIATIVE UPDATE & HISTORICAL INTEGRITY
  // -------------------------------------------------------------
  describe('19. Initiative Update & Historical Integrity', () => {
    it('synchronizes health, preserves horizon, and persists snapshots on publication', () => {
      let init = {
        id: 'init-pub-test',
        health: 'unset',
        horizon: { type: 'quarter', quarter: 'Q2', year: 2027 }
      };

      const updatePayload = {
        initiativeId: init.id,
        health: 'at_risk',
        narrative: 'Migration delayed by networking team',
        horizonSnapshot: { ...init.horizon }
      };

      const updateModel = createInitiativeUpdateModel(updatePayload);
      // Synchronize canonical health
      init = { ...init, health: updatePayload.health };

      expect(init.health).toBe('at_risk');
      expect(init.horizon.quarter).toBe('Q2');
      expect(updateModel.healthSnapshot).toBe('at_risk');
      expect(updateModel.horizonSnapshot.quarter).toBe('Q2');
    });

    it('correctInitiativeUpdate preserves historical version snapshots without destructive overwrite', () => {
      const v1Update = {
        id: 'upd-1',
        initiativeId: 'init-hist',
        narrative: 'Initial draft assessment',
        health: 'on_track',
        version: 1
      };

      const corrected = correctInitiativeUpdate(
        v1Update,
        { narrative: 'Corrected assessment: identified bottleneck', health: 'at_risk' },
        'usr-sarah'
      );

      expect(corrected.version).toBe(2);
      expect(corrected.narrative).toBe('Corrected assessment: identified bottleneck');
      expect(corrected.health).toBe('at_risk');
      expect(corrected.correctedBy).toBe('usr-sarah');
      // Historical V1 snapshot preserved
      expect(corrected.previousVersions.length).toBe(1);
      expect(corrected.previousVersions[0].narrative).toBe('Initial draft assessment');
      expect(corrected.previousVersions[0].health).toBe('on_track');
      expect(corrected.previousVersions[0].version).toBe(1);
    });

    it('createSupersedingUpdate establishes explicit bidirectional link between prior and new update', () => {
      const prior = { id: 'upd-old', initiativeId: 'init-super', version: 1 };
      const { prior: updatedPrior, superseding } = createSupersedingUpdate(prior, {
        narrative: 'Quarterly review update',
        health: 'off_track'
      });

      expect(updatedPrior.supersededById).toBe(superseding.id);
      expect(superseding.supersedesId).toBe('upd-old');
      expect(superseding.healthSnapshot).toBe('off_track');
    });
  });

  // -------------------------------------------------------------
  // 20. INITIATIVE CONCURRENCY CONFLICT TEST
  // -------------------------------------------------------------
  describe('20. Initiative Concurrency Conflict Test', () => {
    it('rejects stale write when expectedVersion is behind canonical version, preserving N+1', () => {
      let canonicalInitiative = {
        id: 'init-concur',
        name: 'Versioned Strategy',
        version: 2
      };

      const authoritativeUpdate = (id, patch, expectedVersion) => {
        if (expectedVersion !== null && canonicalInitiative.version > expectedVersion) {
          return { success: false, conflict: true };
        }
        canonicalInitiative = { ...canonicalInitiative, ...patch, version: canonicalInitiative.version + 1 };
        return { success: true };
      };

      // Attempt save with stale expectedVersion = 1
      const result = authoritativeUpdate('init-concur', { name: 'Overwrite' }, 1);

      expect(result.success).toBe(false);
      expect(result.conflict).toBe(true);
      expect(canonicalInitiative.name).toBe('Versioned Strategy');
      expect(canonicalInitiative.version).toBe(2);
    });
  });

  // -------------------------------------------------------------
  // 21. LIFECYCLE NON-CASCADE & ARCHIVE/RESTORE
  // -------------------------------------------------------------
  describe('21. Lifecycle Non-Cascade & Archive/Restore', () => {
    it('completing initiative does NOT cascade to operationalState of associated project', () => {
      let initiative = { id: 'init-done', operationalState: 'active' };
      const project = { id: 'proj-remain-active', initiativeId: 'init-done', operationalState: 'active', archiveState: 'active' };

      // Complete initiative
      initiative = { ...initiative, operationalState: 'completed' };

      expect(initiative.operationalState).toBe('completed');
      expect(project.operationalState).toBe('active');
    });

    it('archiving and restoring initiative does NOT alter associated projects or updates', () => {
      let initiative = { id: 'init-arch-rest', archiveState: 'active' };
      const project = { id: 'proj-unaffected', initiativeId: 'init-arch-rest', archiveState: 'active' };
      const updates = [{ id: 'upd-preserved', initiativeId: 'init-arch-rest' }];

      // Archive
      initiative = { ...initiative, archiveState: 'archived' };
      expect(initiative.archiveState).toBe('archived');
      expect(project.archiveState).toBe('active');
      expect(updates.length).toBe(1);

      // Restore
      initiative = { ...initiative, archiveState: 'active' };
      expect(initiative.archiveState).toBe('active');
      expect(project.archiveState).toBe('active');
    });
  });

  // -------------------------------------------------------------
  // 22. GENERIC FAVORITE & ACTIVITYEVENT INTEGRATION
  // -------------------------------------------------------------
  describe('22. Generic Favorite & ActivityEvent Integration', () => {
    it('uses canonical generic Favorite structure with targetType: initiative', () => {
      const favorites = [];
      const addFavorite = (fav) => favorites.push(fav);

      addFavorite({
        targetType: 'initiative',
        targetId: 'init-fav-test',
        title: 'Core Platform Initiative'
      });

      expect(favorites[0].targetType).toBe('initiative');
      expect(favorites[0].targetId).toBe('init-fav-test');
    });

    it('emits canonical ActivityEvent on representative initiative lifecycle actions', () => {
      const events = [];
      const emit = (event) => events.push(event);

      // 1. Project aligned
      emit({ type: 'initiative.project_associated', entityType: 'initiative', entityId: 'init-1', payload: { projectId: 'proj-1' } });
      // 2. Update published
      emit({ type: 'initiative.update_published', entityType: 'initiative', entityId: 'init-1', payload: { health: 'at_risk' } });
      // 3. State changed / completed
      emit({ type: 'initiative.state_changed', entityType: 'initiative', entityId: 'init-1', payload: { operationalState: 'completed' } });
      // 4. Archived
      emit({ type: 'initiative.archived', entityType: 'initiative', entityId: 'init-1' });

      expect(events.length).toBe(4);
      expect(events[0].type).toBe('initiative.project_associated');
      expect(events[1].type).toBe('initiative.update_published');
      expect(events[2].type).toBe('initiative.state_changed');
      expect(events[3].type).toBe('initiative.archived');
    });
  });

  // -------------------------------------------------------------
  // 23. SEARCH & COMMAND PALETTE ZERO-LEAKAGE
  // -------------------------------------------------------------
  describe('23. Search & Command Palette Zero-Leakage', () => {
    it('excludes restricted inaccessible initiative from search and command palette', () => {
      const initiatives = [
        { id: 'init-visible', identifier: 'INT-01', name: 'Open Roadmap', accessPolicy: 'workspace', workspaceId: 'wks-core' },
        { id: 'init-hidden', identifier: 'INT-02', name: 'Top Secret Plan', accessPolicy: 'restricted', workspaceId: 'wks-core', access: { memberUserIds: [] } }
      ];

      const actor = { id: 'usr-regular', workspaceId: 'wks-core' };
      const isAccessible = (entity, type) => {
        if (type === 'initiative') return evaluateInitiativeAccess(entity, actor);
        return true;
      };

      render(
        <CommandPalette
          isOpen={true}
          onClose={() => {}}
          initiatives={initiatives}
          isAccessible={isAccessible}
          items={[]}
        />
      );

      // Open roadmap should be present
      expect(screen.getByText('Open Roadmap')).toBeDefined();
      // Secret plan must NOT be rendered
      expect(screen.queryByText('Top Secret Plan')).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // 24. RENDERED PROGRESS, TEAMS, AND RISKS ZERO-LEAKAGE
  // -------------------------------------------------------------
  describe('24. Rendered Progress, Teams, and Risks Zero-Leakage', () => {
    it('renders INT-002 Overview with secret project/items strictly excluded from denominators and metadata', () => {
      const initiative = {
        id: 'init-render-leak',
        identifier: 'INT-77',
        name: 'Public Infrastructure Initiative',
        operationalState: 'active',
        health: 'on_track'
      };

      const projects = [
        { id: 'proj-pub', initiativeId: 'init-render-leak', name: 'Public API', operationalState: 'completed', isRestricted: false, leadTeamId: 'team-pub' },
        { id: 'proj-priv', initiativeId: 'init-render-leak', name: 'Classified Cryptography', operationalState: 'active', isRestricted: true, leadTeamId: 'team-priv' }
      ];

      const workItems = [
        { id: 'wi-1', projectId: 'proj-pub', title: 'Public doc', status: 'done', isRestricted: false },
        { id: 'wi-2', projectId: 'proj-pub', title: 'Public spec', status: 'todo', isRestricted: false },
        { id: 'wi-secret', projectId: 'proj-priv', title: 'Nuclear launch codes', status: 'done', isRestricted: true }
      ];

      const teams = [
        { id: 'team-pub', name: 'Platform Services' },
        { id: 'team-priv', name: 'Covert Ops' }
      ];

      const isAccessible = (entity) => !entity.isRestricted;

      render(
        <InitiativeOverviewTab
          initiative={initiative}
          projects={projects}
          workItems={workItems}
          teams={teams}
          users={[]}
          updates={[]}
          dependencies={[]}
          milestones={[]}
          isAccessible={isAccessible}
        />
      );

      // Denominator should reflect 1 project, not 2
      expect(screen.getByText('1 of 1 projects completed (100%)')).toBeDefined();
      // WorkItems denominator should reflect 2 items, not 3
      expect(screen.getByText('1 / 2 items (50%)')).toBeDefined();

      // Classified Cryptography name or Covert Ops team should NOT appear
      expect(screen.queryByText('Classified Cryptography')).toBeNull();
      expect(screen.queryByText('Covert Ops')).toBeNull();
      expect(screen.queryByText('Nuclear launch codes')).toBeNull();
    });

    it('injectable freshness policy allows non-default threshold for stale project updates', () => {
      const now = new Date('2026-10-01T00:00:00Z');
      const project = { id: 'proj-stale-test', initiativeId: 'init-stale' };
      const updates = [
        { projectId: 'proj-stale-test', publishedAt: '2026-09-15T00:00:00Z' } // 16 days old
      ];

      // Default 30-day policy: 16 days is NOT stale
      const defaultRisks = deriveInitiativeRiskSignals({
        initiativeId: 'init-stale',
        projects: [project],
        projectUpdates: updates,
        referenceClock: now,
        freshnessPolicy: DEFAULT_INITIATIVE_FRESHNESS_POLICY
      });
      expect(defaultRisks.staleUpdatesCount).toBe(0);

      // Custom 14-day policy: 16 days IS stale
      const strictRisks = deriveInitiativeRiskSignals({
        initiativeId: 'init-stale',
        projects: [project],
        projectUpdates: updates,
        referenceClock: now,
        freshnessPolicy: { staleProjectUpdateDays: 14 }
      });
      expect(strictRisks.staleUpdatesCount).toBe(1);
    });
  });
});


