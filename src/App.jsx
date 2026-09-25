import React, { useState, useCallback, useMemo } from 'react';
import { WorkspaceProvider, useWorkspace, UIProvider, useUI } from './app/providers';
import { AppShell, Sidebar, ContextBar } from './layouts';
import { DataGrid, KanbanBoard, TimelineView, WorkloadView } from './views';
import { WorkItemInspector, QuickCreateDialog } from './features/work-items';
import { LivingSpecEditor } from './features/living-specs';
import { TriageInbox } from './features/triage';
import { BulkActionBar, ShortcutsModal, CommandPalette } from './components';
import { useWorkItemsFilter } from './hooks/useWorkItemsFilter';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNavigationState } from './hooks/useNavigationState';
import { useFavorites } from './hooks/useFavorites';
import { useSidebarPreferences } from './hooks/useSidebarPreferences';
import { TEAMS, PROJECTS, WORKSPACES } from './data/mockData';
import {
  Kanban,
  Table,
  Calendar,
  Users,
  Compass,
  FileText,
  Bookmark,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';

/**
 * Main Content View Router
 * Renders the active projection or surface over canonical domain state
 */
function MainView({
  activeScope,
  activeTab,
  filteredItems,
  onNavigate
}) {
  const {
    selectedItemId,
    selectItem,
    updateItem,
    multiSelectedIds,
    toggleMultiSelect,
    selectAll,
    clearSelection
  } = useWorkspace();
  const {
    activeView,
    density,
    isInspectorOpen,
    setIsInspectorOpen,
    setIsCreateModalOpen,
    isOverlayActive
  } = useUI();

  // If in a non-work surface, render appropriate minimal surface boundary
  if (activeScope === 'teams-directory') {
    return (
      <div
        role="region"
        aria-label="Teams Directory"
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          width: '100%',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Teams Directory (TEM-001)
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            All workspace teams and execution domains.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {TEAMS.map((team) => (
            <div
              key={team.id}
              onClick={() => onNavigate?.({ scope: 'teams', teamId: team.id, tab: 'work' })}
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{team.icon || '👥'}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                  {team.name}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Key: {team.key} • Lead: {team.leadId}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScope === 'projects-directory') {
    return (
      <div
        role="region"
        aria-label="Projects Directory"
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          width: '100%',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Projects Directory (PRJ-007)
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Global index of active initiatives and cross-functional projects.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
          {PROJECTS.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onNavigate?.({ scope: 'projects', projectId: proj.id, tab: 'work' })}
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={16} color="var(--primary-base)" />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                  {proj.name}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Teams: {(proj.teamIds || (proj.teamId ? [proj.teamId] : [])).join(', ')} • Target: {proj.targetDate}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScope === 'initiatives') {
    return (
      <div role="region" aria-label="Initiatives" style={{ padding: 'var(--space-6)', width: '100%' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
          Workspace Initiatives
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Strategic long-horizon roadmap and quarterly outcome tracking.
        </p>
      </div>
    );
  }

  if (activeScope === 'docs') {
    return (
      <div role="region" aria-label="Documentation" style={{ padding: 'var(--space-6)', width: '100%' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
          Workspace Documentation
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Living product requirements, architectural design docs, and team handbooks.
        </p>
      </div>
    );
  }

  if (activeScope === 'views') {
    return (
      <div role="region" aria-label="Saved Views" style={{ padding: 'var(--space-6)', width: '100%' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
          Saved Views
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Custom filtered views, cross-team queries, and executive rollups.
        </p>
      </div>
    );
  }

  // Projection / Tab based view resolution
  switch (activeView) {
    case 'data-grid':
    case 'my-issues':
    case 'my-work':
      return (
        <DataGrid
          items={filteredItems}
          selectedItemId={selectedItemId}
          onSelectItem={(item) => {
            selectItem(item.id);
          }}
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
          isKeyboardActive={!isOverlayActive}
        />
      );

    case 'kanban':
      return (
        <KanbanBoard
          items={filteredItems}
          selectedItemId={selectedItemId}
          onSelectItem={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          onOpenInspector={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          onUpdateItem={updateItem}
          onQuickCreate={() => setIsCreateModalOpen(true)}
        />
      );

    case 'timeline':
      return (
        <TimelineView
          items={filteredItems}
          selectedItemId={selectedItemId}
          onSelectItem={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          onOpenInspector={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
        />
      );

    case 'workload':
      return (
        <WorkloadView
          items={filteredItems}
          selectedItemId={selectedItemId}
          onSelectItem={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          onOpenInspector={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
        />
      );

    case 'living-spec':
      return (
        <LivingSpecEditor
          items={filteredItems}
          onUpdateItem={updateItem}
          onOpenInspector={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
        />
      );

    case 'inbox':
      return (
        <TriageInbox
          isKeyboardActive={!isOverlayActive}
          onOpenItemById={(itemId) => {
            selectItem(itemId);
            setIsInspectorOpen(true);
          }}
        />
      );

    default:
      // Fallback to DataGrid
      return (
        <DataGrid
          items={filteredItems}
          selectedItemId={selectedItemId}
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
          isKeyboardActive={!isOverlayActive}
        />
      );
  }
}

/**
 * Production Shell Orchestrator
 * Connects Domain Context, Presentation Preferences, Navigation Coordinates, and Overlays
 */
function OrynqoWorkspace() {
  const {
    items,
    activeTeamId: workspaceTeamId,
    setActiveTeamId: setWorkspaceTeamId,
    activeTeam: workspaceTeam,
    selectedItem,
    selectItem,
    multiSelectedIds,
    clearSelection,
    updateItem,
    createItem,
    bulkUpdateStatus,
    bulkAssign,
    deleteSelected
  } = useWorkspace();

  const [bulkOutcome, setBulkOutcome] = useState(null);

  const handleBulkUpdateStatus = useCallback(
    (status) => {
      const outcome = bulkUpdateStatus(status);
      setBulkOutcome(outcome);
      setTimeout(() => setBulkOutcome(null), 4000);
    },
    [bulkUpdateStatus]
  );

  const handleBulkAssign = useCallback(
    (assigneeId) => {
      const outcome = bulkAssign(assigneeId);
      setBulkOutcome(outcome);
      setTimeout(() => setBulkOutcome(null), 4000);
    },
    [bulkAssign]
  );

  // Presentation Preferences
  const {
    isSidebarCollapsed,
    toggleSidebar,
    density,
    toggleDensity,
    expandedSections,
    toggleSection,
    getProjectionPreference,
    setProjectionPreference
  } = useSidebarPreferences();

  // Ephemeral UI states from UIContext
  const {
    theme,
    toggleTheme,
    isInspectorOpen,
    setIsInspectorOpen,
    toggleInspector,
    isOverlayActive,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    resetFilters,
    activeView,
    setActiveView
  } = useUI();

  // Navigation Coordinates & Precedence
  const {
    activeScope,
    setActiveScope,
    activeTeamId,
    setActiveTeamId,
    activeTeam,
    activeProjectId,
    setActiveProjectId,
    activeCycleId,
    setActiveCycleId,
    activeDocId,
    setActiveDocId,
    activeViewId,
    setActiveViewId,
    activeTab,
    setActiveTab,
    activeProjection,
    selectProjection,
    closeInspector,
    isMobileNavOpen,
    setIsMobileNavOpen,
    navigate
  } = useNavigationState({
    initialScope: 'teams',
    initialTeamId: workspaceTeamId || 'team-core',
    initialTab: 'work',
    initialProjection: 'data-grid',
    getProjectionPreference,
    setProjectionPreference,
    isInspectorOpen,
    setIsInspectorOpen
  });

  // Server/domain favorites adapter
  const {
    favorites,
    resolveTarget,
    removeFavorite,
    reorderFavorites
  } = useFavorites();

  // Active tenant workspace state
  const [currentWorkspace, setCurrentWorkspace] = useState(WORKSPACES[0]);

  // Keep navigation activeProjection in sync with activeView
  const handleSelectProjection = useCallback(
    (proj) => {
      selectProjection(proj);
      setActiveView(proj);
    },
    [selectProjection, setActiveView]
  );

  // Compute filtered items for canvas
  const filteredItems = useWorkItemsFilter({
    items,
    activeTeamId,
    activeView,
    searchQuery,
    filters
  });

  // Centralized keyboard shortcuts
  useKeyboardShortcuts({
    isOverlayActive,
    onToggleCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onToggleSidebar: toggleSidebar,
    onOpenCreateModal: () => setIsCreateModalOpen(true),
    onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
    onToggleInspector: () => setIsInspectorOpen((prev) => !prev),
    onSelectView: (v) => {
      setActiveView(v);
      selectProjection(v);
    },
    onEscape: () => {
      if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
      else if (isCreateModalOpen) setIsCreateModalOpen(false);
      else if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
      else if (multiSelectedIds.length > 0) clearSelection();
      else if (isInspectorOpen) {
        setIsInspectorOpen(false);
        closeInspector();
      }
    }
  });

  // Resource tabs configuration for active resource
  const resourceTabs = useMemo(() => {
    if (activeScope === 'teams') {
      const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'work', label: 'Work', icon: Table },
        {
          id: 'cycles',
          label: 'Cycles',
          icon: Calendar,
          hidden: activeTeam?.capabilities?.cycles === false
        },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'docs', label: 'Docs', icon: FileText },
        {
          id: 'triage',
          label: 'Triage',
          hidden: activeTeam?.capabilities?.triage === false
        },
        { id: 'members', label: 'Members', icon: Users }
      ];
      return tabs;
    }

    if (activeScope === 'projects') {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'work', label: 'Work', icon: Table },
        { id: 'docs', label: 'Docs', icon: FileText },
        { id: 'milestones', label: 'Milestones' },
        { id: 'activity', label: 'Activity' }
      ];
    }

    return [];
  }, [activeScope, activeTeam]);

  // Tab switching handler
  const handleSelectTab = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      if (tabId === 'work') {
        setActiveView(activeProjection || 'data-grid');
      } else if (tabId === 'triage') {
        setActiveView('inbox');
      }
    },
    [setActiveTab, setActiveView, activeProjection]
  );

  // Contextual Breadcrumb composition adhering to UI-02A
  const crumbs = useMemo(() => {
    const list = [
      {
        id: 'workspace',
        label: currentWorkspace?.name || 'Orynqo',
        onClick: () => navigate('teams')
      }
    ];

    if (activeScope === 'teams' && activeTeam) {
      list.push({
        id: activeTeam.id,
        label: activeTeam.name,
        onClick: () => navigate({ scope: 'teams', teamId: activeTeam.id, tab: 'work' }),
        siblings: TEAMS.map((t) => ({
          id: t.id,
          name: t.name,
          onSelect: () => {
            navigate({ scope: 'teams', teamId: t.id, tab: 'work' });
            setActiveTeamId(t.id);
            setWorkspaceTeamId(t.id);
          }
        }))
      });

      const tabLabel =
        activeTab === 'work'
          ? activeProjection === 'kanban'
            ? 'Board'
            : activeProjection === 'timeline'
            ? 'Timeline'
            : activeProjection === 'workload'
            ? 'Workload'
            : 'Work'
          : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

      list.push({
        id: activeTab,
        label: tabLabel
      });
    } else if (activeScope === 'inbox') {
      list.push({ id: 'inbox', label: 'Inbox' });
    } else if (activeScope === 'my-work') {
      list.push({ id: 'my-work', label: 'My Work' });
    } else if (activeScope === 'initiatives') {
      list.push({ id: 'initiatives', label: 'Initiatives' });
    } else if (activeScope === 'docs') {
      list.push({ id: 'docs', label: 'Docs' });
    } else if (activeScope === 'views') {
      list.push({ id: 'views', label: 'Views' });
    } else if (activeScope === 'teams-directory') {
      list.push({ id: 'teams-directory', label: 'Teams Directory' });
    } else if (activeScope === 'projects-directory') {
      list.push({ id: 'projects-directory', label: 'Projects Directory' });
    }

    return list;
  }, [
    currentWorkspace,
    activeScope,
    activeTeam,
    activeTab,
    activeProjection,
    navigate,
    setActiveTeamId,
    setWorkspaceTeamId
  ]);

  // Contextual Quick Create initial context
  const quickCreateContext = useMemo(() => {
    if (activeScope === 'teams') {
      return { teamId: activeTeamId };
    }
    if (activeScope === 'projects' && activeProjectId) {
      const proj = PROJECTS.find((p) => p.id === activeProjectId);
      const teamIds = proj?.teamIds || (proj?.teamId ? [proj.teamId] : []);
      if (teamIds.length === 1) {
        return { projectId: activeProjectId, teamId: teamIds[0] };
      }
      // Ambiguous multi-team project: Team remains unresolved, user chooses explicitly
      return { projectId: activeProjectId, teamId: null };
    }
    if (activeCycleId) {
      return { teamId: activeTeamId, cycleId: activeCycleId };
    }
    return {};
  }, [activeScope, activeTeamId, activeProjectId, activeCycleId]);

  // Workspace Switch handler
  const handleSelectWorkspace = useCallback(
    (newWorkspace) => {
      setCurrentWorkspace(newWorkspace);
      // Clear invalid resource/inspector states on workspace switch
      setIsInspectorOpen(false);
      closeInspector();
      clearSelection();
      navigate({ scope: 'teams', teamId: 'team-core', tab: 'work' });
    },
    [closeInspector, clearSelection, navigate, setIsInspectorOpen]
  );

  return (
    <AppShell
      isMobileNavOpen={isMobileNavOpen}
      onCloseMobileNav={() => setIsMobileNavOpen(false)}
      sidebar={
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          activeScope={activeScope}
          activeTeamId={activeTeamId}
          currentWorkspace={currentWorkspace}
          onSelectWorkspace={handleSelectWorkspace}
          onNavigate={(dest) => {
            navigate(dest);
            if (typeof dest === 'string') {
              if (dest === 'inbox') setActiveView('inbox');
              else if (dest === 'my-work') setActiveView('my-issues');
            } else if (dest?.scope === 'teams' && dest?.teamId) {
              setActiveTeamId(dest.teamId);
              setWorkspaceTeamId(dest.teamId);
              setActiveView('data-grid');
            }
          }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          favorites={favorites}
          resolveTarget={resolveTarget}
          onRemoveFavorite={removeFavorite}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          // Backward compatibility props
          activeView={activeView}
          onSelectView={setActiveView}
          onSelectTeam={(tId) => {
            setActiveTeamId(tId);
            setWorkspaceTeamId(tId);
            navigate({ scope: 'teams', teamId: tId, tab: 'work' });
          }}
        />
      }
      contextBar={
        <ContextBar
          crumbs={crumbs}
          onNavigate={navigate}
          density={density}
          onToggleDensity={toggleDensity}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          totalItemsCount={filteredItems.length}
          tabs={resourceTabs}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          showResourceNav={resourceTabs.length > 0}
          showProjections={activeTab === 'work'}
          activeProjection={activeProjection}
          onSelectProjection={handleSelectProjection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
        />
      }
      inspector={
        <WorkItemInspector
          item={selectedItem}
          subItems={items.filter((it) => it.parentId === selectedItem?.id)}
          isOpen={isInspectorOpen}
          onClose={() => {
            setIsInspectorOpen(false);
            closeInspector();
          }}
          onUpdateItem={updateItem}
          onToggleSubItem={(subId, nextStatus) => updateItem(subId, { status: nextStatus })}
          onCreateSubItem={(title) => {
            if (!selectedItem) return;
            createItem({
              workspaceId: selectedItem.workspaceId || 'wks-core',
              teamId: selectedItem.teamId || 'team-core',
              projectId: selectedItem.projectId || null,
              title,
              type: 'task',
              status: 'todo',
              priority: 'medium',
              parentId: selectedItem.id,
              relations: [],
              documentLinks: []
            });
          }}
          onOpenSpec={() => {
            setActiveScope('initiatives');
            setActiveView('living-spec');
          }}
        />
      }
      bulkActionBar={
        <BulkActionBar
          selectedCount={multiSelectedIds.length}
          onMarkDone={() => handleBulkUpdateStatus('done')}
          onBulkUpdateStatus={handleBulkUpdateStatus}
          onBulkAssign={handleBulkAssign}
          onDelete={deleteSelected}
          onClearSelection={clearSelection}
          outcome={bulkOutcome}
        />
      }
      overlays={
        <>
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            items={items}
            onSelectItem={(item) => {
              selectItem(item.id);
              setIsInspectorOpen(true);
            }}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onSelectView={(v) => {
              setActiveView(v);
              selectProjection(v);
            }}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            theme={theme}
          />

          <QuickCreateDialog
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={createItem}
            onOpenItem={(item) => {
              selectItem(item.id);
              setIsInspectorOpen(true);
            }}
            initialContext={quickCreateContext}
          />

          <ShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />
        </>
      }
    >
      <MainView
        activeScope={activeScope}
        activeTab={activeTab}
        filteredItems={filteredItems}
        onNavigate={navigate}
      />
    </AppShell>
  );
}

/**
 * Root Application Bootstrap
 * Provides context boundaries without logic bloat
 */
export function App() {
  return (
    <UIProvider>
      <WorkspaceProvider>
        <OrynqoWorkspace />
      </WorkspaceProvider>
    </UIProvider>
  );
}

export default App;
