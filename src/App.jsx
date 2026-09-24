import React from 'react';
import { WorkspaceProvider, useWorkspace, UIProvider, useUI } from './app/providers';
import { AppShell, Sidebar, ActionStrip } from './layouts';
import { DataGrid, KanbanBoard, TimelineView, WorkloadView } from './views';
import { WorkItemInspector, CreateItemModal } from './features/work-items';
import { LivingSpecEditor } from './features/living-specs';
import { TriageInbox } from './features/triage';
import { BulkActionBar, ShortcutsModal, CommandPalette } from './components';
import { useWorkItemsFilter } from './hooks/useWorkItemsFilter';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

/**
 * Main Content View Router
 * Renders the active projection over the canonical domain state
 */
function MainView({ filteredItems }) {
  const {
    selectedItemId,
    selectItem,
    updateItem,
    multiSelectedIds,
    toggleMultiSelect,
    selectAll
  } = useWorkspace();
  const { activeView, density, setIsInspectorOpen, setIsCreateModalOpen, isOverlayActive } = useUI();

  switch (activeView) {
    case 'data-grid':
    case 'my-issues':
      return (
        <DataGrid
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
          density={density}
          multiSelectedIds={multiSelectedIds}
          onToggleMultiSelect={toggleMultiSelect}
          onSelectAll={selectAll}
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
      return null;
  }
}

/**
 * Shell Orchestrator
 * Connects domain context and UI context to the layout and overlays
 */
function OrynqoWorkspace() {
  const {
    items,
    activeTeamId,
    setActiveTeamId,
    activeTeam,
    selectedItem,
    selectItem,
    multiSelectedIds,
    clearSelection,
    updateItem,
    createItem,
    bulkUpdateStatus,
    deleteSelected
  } = useWorkspace();

  const {
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    isInspectorOpen,
    toggleInspector,
    setIsInspectorOpen,
    activeView,
    setActiveView,
    density,
    toggleDensity,
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
    resetFilters
  } = useUI();

  // Compute filtered items
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
    onToggleInspector: toggleInspector,
    onSelectView: setActiveView,
    onEscape: () => {
      if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
      else if (isCreateModalOpen) setIsCreateModalOpen(false);
      else if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
      else if (multiSelectedIds.length > 0) clearSelection();
      else if (isInspectorOpen) setIsInspectorOpen(false);
    }
  });

  const breadcrumbs = [
    activeTeam.name,
    activeView === 'living-spec'
      ? 'Living PRD Spec'
      : activeView === 'inbox'
      ? 'Inbox Feed'
      : activeView === 'my-issues'
      ? 'My Issues'
      : 'Cycle 42'
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          activeView={activeView}
          onSelectView={setActiveView}
          activeTeamId={activeTeamId}
          onSelectTeam={setActiveTeamId}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        />
      }
      actionStrip={
        <ActionStrip
          breadcrumbs={breadcrumbs}
          activeView={activeView}
          onSelectView={setActiveView}
          density={density}
          onToggleDensity={toggleDensity}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          totalItemsCount={filteredItems.length}
        />
      }
      inspector={
        <WorkItemInspector
          item={selectedItem}
          subItems={items.filter((it) => it.parentId === selectedItem?.id)}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateItem={updateItem}
          onToggleSubItem={(subId, nextStatus) => updateItem(subId, { status: nextStatus })}
          onCreateSubItem={(title) => {
            if (!selectedItem) return;
            createItem({
              id: `sub-${Date.now()}`,
              identifier: `${selectedItem.identifier}-S${Math.floor(10 + Math.random() * 90)}`,
              workspaceId: selectedItem.workspaceId || 'wks-core',
              teamId: selectedItem.teamId || 'team-core',
              projectId: selectedItem.projectId || null,
              title,
              type: 'task',
              status: 'todo',
              priority: 'medium',
              parentId: selectedItem.id,
              relations: [],
              documentLinks: [],
              createdAt: new Date().toISOString()
            });
          }}
          onOpenSpec={() => setActiveView('living-spec')}
        />
      }
      bulkActionBar={
        <BulkActionBar
          selectedCount={multiSelectedIds.length}
          onMarkDone={() => bulkUpdateStatus('done')}
          onDelete={deleteSelected}
          onClearSelection={clearSelection}
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
            onSelectView={setActiveView}
            onToggleTheme={toggleTheme}
            theme={theme}
          />

          <CreateItemModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={createItem}
            activeTeamId={activeTeamId}
          />

          <ShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />
        </>
      }
    >
      <MainView filteredItems={filteredItems} />
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
