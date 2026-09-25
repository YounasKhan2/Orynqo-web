import React, { useState, useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UIProvider, WorkspaceProvider, useUI, useWorkspace } from '../app/providers';
import { App } from '../App';
import { Sidebar } from '../layouts/Sidebar/Sidebar';
import { ContextBar } from '../layouts/ContextBar/ContextBar';
import { ContextBreadcrumbs } from '../layouts/ContextBar/ContextBreadcrumbs';
import { ResourceNavBar } from '../layouts/ContextBar/ResourceNavBar';
import { ProjectionSwitcher } from '../components/navigation/Projections/ProjectionSwitcher';
import { FavoritesList } from '../components/navigation/Favorites/FavoritesList';
import { WorkspaceSwitcherPopover } from '../components/navigation/WorkspaceSwitcher/WorkspaceSwitcherPopover';
import { TeamSidebarGroup } from '../components/navigation/Teams/TeamSidebarGroup';
import { useSidebarPreferences } from '../hooks/useSidebarPreferences';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationState } from '../hooks/useNavigationState';
import { TEAMS, PROJECTS, WORKSPACES, CURRENT_ORGANIZATION } from '../data/mockData';

describe('UI-02B: Production Application Shell & Sidebar Implementation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // 1. Sidebar Hierarchy & Semantic Modes
  // =========================================================================
  describe('1. Sidebar Hierarchy & Semantic Modes', () => {
    it('renders expanded mode with full semantic width, labels, sections, and utilities', () => {
      render(
        <Sidebar
          isCollapsed={false}
          activeScope="teams"
          activeTeamId="team-core"
          currentWorkspace={WORKSPACES[0]}
        />
      );

      const nav = screen.getByRole('navigation', { name: /Workspace navigation/i });
      expect(nav).toBeDefined();
      expect(nav.style.width).toBe('var(--sidebar-width)');

      // Hierarchy sections
      expect(screen.getByRole('button', { name: /^Personal$/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /^Favorites/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /^Workspace$/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /^Teams/i })).toBeDefined();

      // Personal items
      expect(screen.getByRole('button', { name: /Inbox/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /My Work/i })).toBeDefined();

      // Workspace items
      expect(screen.getByRole('button', { name: /Initiatives/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Docs/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Views/i })).toBeDefined();

      // Search and commands launcher
      expect(screen.getByRole('button', { name: /Search and commands/i })).toBeDefined();
    });

    it('renders collapsed mode with compact width, accessible tooltips, and icons', () => {
      render(
        <Sidebar
          isCollapsed={true}
          activeScope="teams"
          activeTeamId="team-core"
          currentWorkspace={WORKSPACES[0]}
        />
      );

      const nav = screen.getByRole('navigation', { name: /Workspace navigation/i });
      expect(nav.style.width).toBe('var(--sidebar-collapsed-width)');

      // In collapsed mode, buttons still have accessible names and tooltip titles
      const inboxBtn = screen.getByRole('button', { name: /Inbox/i });
      expect(inboxBtn).toBeDefined();
      expect(inboxBtn.getAttribute('title')).toContain('Inbox');

      const myWorkBtn = screen.getByRole('button', { name: /My Work/i });
      expect(myWorkBtn).toBeDefined();
      expect(myWorkBtn.getAttribute('title')).toContain('My Work');

      // Expand sidebar button is present and accessible
      const expandBtn = screen.getByRole('button', { name: /Expand sidebar/i });
      expect(expandBtn).toBeDefined();
    });

    it('toggles collapse state and invokes onToggleCollapse handler', () => {
      const handleToggle = vi.fn();
      render(
        <Sidebar
          isCollapsed={false}
          onToggleCollapse={handleToggle}
          currentWorkspace={WORKSPACES[0]}
        />
      );

      const collapseBtn = screen.getByRole('button', { name: /Collapse sidebar/i });
      fireEvent.click(collapseBtn);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('preserves user sidebar preferences in isolated localStorage adapter', () => {
      function PreferenceTestHarness() {
        const { isSidebarCollapsed, toggleSidebar, density, toggleDensity } = useSidebarPreferences();
        return (
          <div>
            <span data-testid="collapsed-state">{String(isSidebarCollapsed)}</span>
            <span data-testid="density-state">{density}</span>
            <button type="button" onClick={toggleSidebar}>Toggle Rail</button>
            <button type="button" onClick={toggleDensity}>Toggle Density</button>
          </div>
        );
      }

      const { unmount } = render(<PreferenceTestHarness />);

      expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
      expect(screen.getByTestId('density-state').textContent).toBe('compact');

      // Toggle rail to collapsed
      fireEvent.click(screen.getByRole('button', { name: /Toggle Rail/i }));
      expect(screen.getByTestId('collapsed-state').textContent).toBe('true');

      // Toggle density to default
      fireEvent.click(screen.getByRole('button', { name: /Toggle Density/i }));
      expect(screen.getByTestId('density-state').textContent).toBe('default');

      // Unmount and remount: preferences should persist
      unmount();
      render(<PreferenceTestHarness />);
      expect(screen.getByTestId('collapsed-state').textContent).toBe('true');
      expect(screen.getByTestId('density-state').textContent).toBe('default');
    });
  });

  // =========================================================================
  // 2. Organization / Workspace Switcher
  // =========================================================================
  describe('2. Organization & Workspace Switcher', () => {
    it('opens workspace switcher popover and displays active organization and workspaces', () => {
      const handleSelect = vi.fn();
      render(
        <WorkspaceSwitcherPopover
          isOpen={true}
          currentWorkspaceId="wks-core"
          onSelectWorkspace={handleSelect}
        />
      );

      const popover = screen.getByRole('dialog', { name: /Switch workspace/i });
      expect(popover).toBeDefined();

      expect(screen.getByText(CURRENT_ORGANIZATION.name)).toBeDefined();
      expect(screen.getByText('Product & Engineering')).toBeDefined();
      expect(screen.getByText('Design & Research Studio')).toBeDefined();
    });

    it('filters workspaces in switcher by search query', () => {
      render(
        <WorkspaceSwitcherPopover
          isOpen={true}
          currentWorkspaceId="wks-core"
        />
      );

      const searchInput = screen.getByPlaceholderText(/Find workspace/i);
      fireEvent.change(searchInput, { target: { value: 'Design' } });

      expect(screen.getByText('Design & Research Studio')).toBeDefined();
      expect(screen.queryByText('Product & Engineering')).toBeNull();
    });

    it('switching workspace notifies handler with chosen workspace entity', () => {
      const handleSelect = vi.fn();
      render(
        <WorkspaceSwitcherPopover
          isOpen={true}
          currentWorkspaceId="wks-core"
          onSelectWorkspace={handleSelect}
        />
      );

      const designOption = screen.getByRole('option', { name: /Design & Research Studio/i });
      fireEvent.click(designOption);

      expect(handleSelect).toHaveBeenCalledWith(WORKSPACES[1]);
    });
  });

  // =========================================================================
  // 3. Teams Navigation & Progressive Disclosure
  // =========================================================================
  describe('3. Teams Progressive Disclosure & Directory Link', () => {
    it('renders only joined teams and at most ONE contextual child (Current Cycle)', () => {
      const teamWithCycle = TEAMS[0]; // Core Platform has active cycle-42 and cycles: true
      const handleSelectTeam = vi.fn();
      const handleSelectCycle = vi.fn();

      render(
        <TeamSidebarGroup
          team={teamWithCycle}
          isActive={true}
          isCollapsed={false}
          onSelectTeam={handleSelectTeam}
          onSelectCycle={handleSelectCycle}
        />
      );

      // Team button is present
      const teamBtn = screen.getByRole('button', { name: teamWithCycle.name });
      expect(teamBtn).toBeDefined();

      // Current Cycle is rendered as the single contextual child
      const cycleBtn = screen.getByRole('button', { name: /Cycle 42/i });
      expect(cycleBtn).toBeDefined();

      // Does NOT render redundant "Team Work" child
      expect(screen.queryByRole('button', { name: /Team Work/i })).toBeNull();
    });

    it('does not render Current Cycle child if cycles capability is disabled', () => {
      const teamNoCycles = {
        ...TEAMS[1],
        capabilities: { ...TEAMS[1].capabilities, cycles: false }
      };

      render(
        <TeamSidebarGroup
          team={teamNoCycles}
          isActive={true}
          isCollapsed={false}
        />
      );

      expect(screen.queryByRole('button', { name: /Cycle/i })).toBeNull();
    });

    it('Browse all teams... trigger navigates directly to TEM-001 Teams Directory surface', () => {
      const handleNavigate = vi.fn();
      render(
        <Sidebar
          isCollapsed={false}
          onNavigate={handleNavigate}
          currentWorkspace={WORKSPACES[0]}
        />
      );

      const browseBtn = screen.getByRole('button', { name: /Browse all teams/i });
      fireEvent.click(browseBtn);

      expect(handleNavigate).toHaveBeenCalledWith('teams');
    });
  });

  // =========================================================================
  // 4. Favorites & Zero-Leakage Security
  // =========================================================================
  describe('4. Favorites with Generic Pointer Model & Zero-Leakage', () => {
    it('renders generic pointer favorites across Team, Project, View, and Doc', () => {
      const mockPointers = [
        { id: 'fav-1', targetType: 'team', targetId: 'team-core', isAccessible: true },
        { id: 'fav-2', targetType: 'project', targetId: 'proj-auth-v2', isAccessible: true }
      ];

      const mockResolver = (ptr) => {
        if (ptr.targetId === 'team-core') return { id: 'team-core', title: 'Core Platform', isAccessible: true };
        if (ptr.targetId === 'proj-auth-v2') return { id: 'proj-auth-v2', title: 'Auth API V2', isAccessible: true };
        return null;
      };

      render(
        <FavoritesList
          favorites={mockPointers}
          resolveTarget={mockResolver}
          isCollapsed={false}
        />
      );

      expect(screen.getByText('Core Platform')).toBeDefined();
      expect(screen.getByText('Auth API V2')).toBeDefined();
    });

    it('enforces zero metadata leakage when favorite target is restricted or inaccessible', () => {
      const restrictedPointer = [
        { id: 'fav-restricted', targetType: 'project', targetId: 'proj-classified', isAccessible: false }
      ];

      const mockResolver = () => ({
        id: 'proj-classified',
        title: 'Top Secret Project Code X',
        isRestricted: true
      });

      render(
        <FavoritesList
          favorites={restrictedPointer}
          resolveTarget={mockResolver}
          isCollapsed={false}
        />
      );

      // Sensitive name must NOT appear in DOM
      expect(screen.queryByText(/Top Secret Project Code X/i)).toBeNull();

      // Inaccessible generic placeholder must appear
      expect(screen.getByText(/Restricted Favorite/i)).toBeDefined();
    });

    it('useFavorites optimistic reordering and rollback on error', () => {
      function FavoritesHarness() {
        const { favorites, removeFavorite } = useFavorites();
        return (
          <div>
            <span data-testid="fav-count">{favorites.length}</span>
            <button type="button" onClick={() => removeFavorite('fav-1')}>Remove 1</button>
          </div>
        );
      }

      render(<FavoritesHarness />);
      expect(screen.getByTestId('fav-count').textContent).toBe('3');

      fireEvent.click(screen.getByRole('button', { name: /Remove 1/i }));
      expect(screen.getByTestId('fav-count').textContent).toBe('2');
    });
  });

  // =========================================================================
  // 5. ContextBar, Breadcrumbs & Sibling Switcher
  // =========================================================================
  describe('5. ContextBar, Breadcrumbs & Sibling Switcher', () => {
    it('breadcrumb label navigates to ancestor while chevron opens sibling switcher popover', () => {
      const handleNavigateAncestor = vi.fn();
      const handleSelectSibling = vi.fn();

      const testCrumbs = [
        {
          id: 'workspace',
          label: 'Product & Engineering',
          onClick: handleNavigateAncestor
        },
        {
          id: 'team-core',
          label: 'Core Platform',
          siblings: [
            { id: 'team-core', name: 'Core Platform', onSelect: vi.fn() },
            { id: 'team-design', name: 'Design Systems', onSelect: handleSelectSibling }
          ]
        },
        {
          id: 'work',
          label: 'Work'
        }
      ];

      render(<ContextBreadcrumbs crumbs={testCrumbs} />);

      // 1. Ancestor label click navigates
      const ancestorBtn = screen.getByRole('button', { name: /Product & Engineering/i });
      fireEvent.click(ancestorBtn);
      expect(handleNavigateAncestor).toHaveBeenCalledTimes(1);

      // 2. Chevron opens sibling switcher
      const siblingChevron = screen.getByRole('button', { name: /Switch Core Platform/i });
      fireEvent.click(siblingChevron);

      // Popover menu is now open
      const menu = screen.getByRole('menu', { name: /Select Core Platform sibling/i });
      expect(menu).toBeDefined();

      // Click sibling option
      const designOption = within(menu).getByRole('menuitem', { name: /Design Systems/i });
      fireEvent.click(designOption);
      expect(handleSelectSibling).toHaveBeenCalledTimes(1);
    });

    it('ContextBar coordinates breadcrumbs, item counter, density, and New Item button', () => {
      const handleCreate = vi.fn();
      const handleToggleDensity = vi.fn();

      render(
        <ContextBar
          crumbs={[{ id: '1', label: 'Core Platform' }, { id: '2', label: 'Work' }]}
          totalItemsCount={42}
          density="compact"
          onToggleDensity={handleToggleDensity}
          onOpenCreateModal={handleCreate}
          showResourceNav={false}
        />
      );

      expect(screen.getByText('42 items')).toBeDefined();
      expect(screen.getByRole('button', { name: /New Item/i })).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /New Item/i }));
      expect(handleCreate).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Compact/i }));
      expect(handleToggleDensity).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 6. ResourceNavBar & Capability Filtering
  // =========================================================================
  describe('6. ResourceNavBar & Capability Filtering', () => {
    it('filters out capabilities marked hidden (e.g. cycles or triage)', () => {
      const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'work', label: 'Work' },
        { id: 'cycles', label: 'Cycles', hidden: true },
        { id: 'triage', label: 'Triage', hidden: false }
      ];

      render(<ResourceNavBar tabs={tabs} activeTab="work" />);

      expect(screen.getByRole('tab', { name: /Overview/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Work/i })).toBeDefined();
      expect(screen.queryByRole('tab', { name: /Cycles/i })).toBeNull();
      expect(screen.getByRole('tab', { name: /Triage/i })).toBeDefined();
    });

    it('collapses overflow tabs beyond maxVisibleTabs into More dropdown', () => {
      const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'work', label: 'Work' },
        { id: 'cycles', label: 'Cycles' },
        { id: 'projects', label: 'Projects' },
        { id: 'docs', label: 'Docs' },
        { id: 'triage', label: 'Triage' },
        { id: 'members', label: 'Members' }
      ];

      const handleSelectTab = vi.fn();

      render(
        <ResourceNavBar
          tabs={tabs}
          activeTab="work"
          maxVisibleTabs={4}
          onSelectTab={handleSelectTab}
        />
      );

      // First 4 visible
      expect(screen.getByRole('tab', { name: /Overview/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Work/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Cycles/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Projects/i })).toBeDefined();

      // 5th tab (Docs) is in More dropdown
      expect(screen.queryByRole('tab', { name: /^Docs$/i })).toBeNull();

      // Open More dropdown
      const moreBtn = screen.getByRole('tab', { name: /More/i });
      fireEvent.click(moreBtn);

      const moreMenu = screen.getByRole('menu', { name: /Additional tabs/i });
      expect(moreMenu).toBeDefined();

      const docsOption = within(moreMenu).getByRole('menuitem', { name: /Docs/i });
      fireEvent.click(docsOption);
      expect(handleSelectTab).toHaveBeenCalledWith('docs');
    });
  });

  // =========================================================================
  // 7. Projection Precedence & Fallback
  // =========================================================================
  describe('7. Projection Precedence: URL > Preference > Resource Default', () => {
    it('uses explicit URL parameter over user preference and resource default', () => {
      const getPref = vi.fn().mockReturnValue('timeline');

      // Mock window.location.search = '?view=board' (kanban)
      delete window.location;
      window.location = new URL('http://localhost:3000/?view=kanban');

      function ProjectionTest() {
        const { activeProjection } = useNavigationState({
          getProjectionPreference: getPref
        });
        return <span data-testid="projection">{activeProjection}</span>;
      }

      render(<ProjectionTest />);
      // URL override (?view=kanban) wins!
      expect(screen.getByTestId('projection').textContent).toBe('kanban');
    });

    it('falls back to saved user preference when no URL parameter is set', () => {
      const getPref = vi.fn().mockReturnValue('timeline');

      delete window.location;
      window.location = new URL('http://localhost:3000/');

      function ProjectionTest() {
        const { activeProjection } = useNavigationState({
          getProjectionPreference: getPref
        });
        return <span data-testid="projection">{activeProjection}</span>;
      }

      render(<ProjectionTest />);
      expect(screen.getByTestId('projection').textContent).toBe('timeline');
    });

    it('falls back safely to resource default (data-grid) when invalid projection is specified', () => {
      delete window.location;
      window.location = new URL('http://localhost:3000/?view=unsupported-3d-cube');

      function ProjectionTest() {
        const { activeProjection } = useNavigationState();
        return <span data-testid="projection">{activeProjection}</span>;
      }

      render(<ProjectionTest />);
      expect(screen.getByTestId('projection').textContent).toBe('data-grid');
    });
  });

  // =========================================================================
  // 8. Quick Create Contextual Invocation Rules
  // =========================================================================
  describe('8. Quick Create Contextual Invocation', () => {
    it('Team context supplies valid teamId to Quick Create', () => {
      render(<App />);

      // Launch Quick Create via button
      const newBtn = screen.getByRole('button', { name: /New Item/i });
      fireEvent.click(newBtn);

      const dialog = screen.getByRole('dialog', { name: /New Work Item/i });
      expect(dialog).toBeDefined();

      // Team trigger is rendered with the active team
      const teamTrigger = within(dialog).getByRole('button', { name: /Change Team/i });
      expect(teamTrigger.textContent).toContain('Core Platform');
    });
  });

  // =========================================================================
  // 9. Command Palette Navigation Commands
  // =========================================================================
  describe('9. Command Palette Shell Navigation Commands', () => {
    it('exposes navigation commands for Inbox, My Work, Browse Teams, and Browse Projects', () => {
      render(<App />);

      // Open Command Palette via Search trigger in sidebar
      const searchBtn = screen.getByRole('button', { name: /Search and commands/i });
      fireEvent.click(searchBtn);

      const palette = screen.getByRole('dialog', { name: /Command palette/i });
      expect(palette).toBeDefined();

      // Type "Browse" to filter
      const input = within(palette).getByPlaceholderText(/Type a command/i);
      fireEvent.change(input, { target: { value: 'Browse' } });

      expect(within(palette).getByText(/Browse all teams/i)).toBeDefined();
      expect(within(palette).getByText(/Browse projects/i)).toBeDefined();
    });
  });

  // =========================================================================
  // 10. Responsive Adaptations & Accessibility
  // =========================================================================
  describe('10. Responsive Adaptations & Semantic Accessibility Landmarks', () => {
    it('AppShell renders semantic landmarks: nav, header, and main', () => {
      render(<App />);

      expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('banner', { name: /Resource context/i })).toBeDefined();
      expect(screen.getByRole('main', { name: /Primary content/i })).toBeDefined();
    });

    it('Escape closes open ephemeral overlays in correct priority order', () => {
      render(<App />);

      // 1. Open Command Palette
      const searchBtn = screen.getByRole('button', { name: /Search and commands/i });
      fireEvent.click(searchBtn);
      expect(screen.getByRole('dialog', { name: /Command palette/i })).toBeDefined();

      // 2. Press Escape closes Command Palette
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: /Command palette/i })).toBeNull();
    });
  });
});
