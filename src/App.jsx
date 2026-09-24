import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_WORK_ITEMS,
  TEAMS,
  PROJECTS,
  CURRENT_USER
} from './data/mockData';
import { Sidebar } from './design-system/shell/Sidebar';
import { ActionStrip } from './design-system/shell/ActionStrip';
import { InspectorDrawer } from './design-system/shell/InspectorDrawer';
import { CommandPalette } from './design-system/shell/CommandPalette';
import { DataGrid } from './design-system/data/DataGrid';
import { KanbanBoard } from './design-system/data/KanbanBoard';
import { TimelineView } from './design-system/data/TimelineView';
import { WorkloadView } from './design-system/data/WorkloadView';
import { LivingSpecEditor } from './features/LivingSpecEditor';
import { TriageInbox } from './features/TriageInbox';
import { CreateItemModal } from './features/CreateItemModal';
import { ShortcutsModal } from './features/ShortcutsModal';
import { Check, Trash2, X } from 'lucide-react';

export function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Application Shell state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [activeView, setActiveView] = useState('data-grid');
  const [activeTeamId, setActiveTeamId] = useState('team-core');
  const [density, setDensity] = useState('compact');

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Canonical Work Items store
  const [items, setItems] = useState(INITIAL_WORK_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState(INITIAL_WORK_ITEMS[0]?.id || null);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    project: 'all'
  });

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // Command + K: Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Command + [: Toggle Sidebar Collapse
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }

      // 'c': Quick Create Item
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }

      // '?': Keyboard Shortcuts Modal
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
      }

      // 'i': Toggle Inspector Drawer
      if (e.key.toLowerCase() === 'i' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsInspectorOpen((prev) => !prev);
      }

      // Number keys 1-5: Fast View Switching
      if (e.key === '1') setActiveView('data-grid');
      if (e.key === '2') setActiveView('kanban');
      if (e.key === '3') setActiveView('timeline');
      if (e.key === '4') setActiveView('living-spec');
      if (e.key === '5') setActiveView('workload');

      // Escape: Close modals / drawers
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        else if (isCreateModalOpen) setIsCreateModalOpen(false);
        else if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        else if (multiSelectedIds.length > 0) setMultiSelectedIds([]);
        else if (isInspectorOpen) setIsInspectorOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isCommandPaletteOpen,
    isCreateModalOpen,
    isShortcutsModalOpen,
    isInspectorOpen,
    multiSelectedIds
  ]);

  // Reactive Item Update
  const handleUpdateItem = (id, updates) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Create Item
  const handleCreateItem = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
    setSelectedItemId(newItem.id);
    setIsInspectorOpen(true);
  };

  // Multi-select helpers
  const handleToggleMultiSelect = (id) => {
    setMultiSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (multiSelectedIds.length === filteredItems.length) {
      setMultiSelectedIds([]);
    } else {
      setMultiSelectedIds(filteredItems.map((it) => it.id));
    }
  };

  // Bulk actions
  const handleBulkStatusChange = (status) => {
    setItems((prev) =>
      prev.map((it) =>
        multiSelectedIds.includes(it.id) ? { ...it, status } : it
      )
    );
    setMultiSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((it) => !multiSelectedIds.includes(it.id)));
    setMultiSelectedIds([]);
  };

  // Filter and Search logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Team filter (unless special views like my-issues or inbox)
      if (activeView !== 'my-issues' && item.teamId !== activeTeamId) {
        return false;
      }

      // My Issues view filter
      if (activeView === 'my-issues' && item.assigneeId !== CURRENT_USER.id) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          item.identifier.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Status Filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Priority Filter
      if (filters.priority !== 'all' && item.priority !== filters.priority) {
        return false;
      }

      // Assignee Filter
      if (filters.assignee !== 'all' && item.assigneeId !== filters.assignee) {
        return false;
      }

      return true;
    });
  }, [items, activeTeamId, activeView, searchQuery, filters]);

  const selectedItem = items.find((it) => it.id === selectedItemId) || items[0];
  const activeTeam = TEAMS.find((t) => t.id === activeTeamId) || TEAMS[0];

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          setMultiSelectedIds([]);
        }}
        activeTeamId={activeTeamId}
        onSelectTeam={(t) => {
          setActiveTeamId(t);
          setMultiSelectedIds([]);
        }}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* 2. Main Center Canvas & Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          minWidth: 0,
          position: 'relative'
        }}
      >
        {/* Top Context & Action Strip */}
        <ActionStrip
          breadcrumbs={[
            activeTeam.name,
            activeView === 'living-spec'
              ? 'Living PRD Spec'
              : activeView === 'inbox'
              ? 'Inbox Feed'
              : activeView === 'my-issues'
              ? 'My Issues'
              : 'Cycle 42'
          ]}
          activeView={activeView}
          onSelectView={setActiveView}
          density={density}
          onToggleDensity={() => setDensity(density === 'compact' ? 'default' : 'compact')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
          onResetFilters={() => setFilters({ status: 'all', priority: 'all', assignee: 'all', project: 'all' })}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          totalItemsCount={filteredItems.length}
        />

        {/* Dynamic Workspace Canvas */}
        <main style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex' }}>
          {activeView === 'data-grid' || activeView === 'my-issues' ? (
            <DataGrid
              items={filteredItems}
              selectedItemId={selectedItemId}
              onSelectItem={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
              onOpenInspector={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
              onUpdateItem={handleUpdateItem}
              density={density}
              multiSelectedIds={multiSelectedIds}
              onToggleMultiSelect={handleToggleMultiSelect}
              onSelectAll={handleSelectAll}
            />
          ) : activeView === 'kanban' ? (
            <KanbanBoard
              items={filteredItems}
              selectedItemId={selectedItemId}
              onSelectItem={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
              onOpenInspector={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
              onUpdateItem={handleUpdateItem}
              onQuickCreate={() => setIsCreateModalOpen(true)}
            />
          ) : activeView === 'timeline' ? (
            <TimelineView
              items={filteredItems}
              selectedItemId={selectedItemId}
              onSelectItem={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
              onOpenInspector={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
            />
          ) : activeView === 'workload' ? (
            <WorkloadView
              items={filteredItems}
              selectedItemId={selectedItemId}
              onSelectItem={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
              onOpenInspector={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
            />
          ) : activeView === 'living-spec' ? (
            <LivingSpecEditor
              items={items}
              onUpdateItem={handleUpdateItem}
              onOpenInspector={(item) => {
                setSelectedItemId(item.id);
                setIsInspectorOpen(true);
              }}
            />
          ) : activeView === 'inbox' ? (
            <TriageInbox
              onOpenItemById={(itemId) => {
                setSelectedItemId(itemId);
                setIsInspectorOpen(true);
              }}
            />
          ) : null}
        </main>

        {/* Multi-Select Floating Bulk Action Bar */}
        {multiSelectedIds.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: 'var(--text-xs)'
            }}
          >
            <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
              {multiSelectedIds.length} items selected
            </span>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-default)' }} />

            <button
              type="button"
              onClick={() => handleBulkStatusChange('done')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 8px',
                backgroundColor: 'var(--status-done-bg)',
                border: '1px solid var(--status-done)',
                color: 'var(--status-done)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)'
              }}
            >
              <Check size={11} />
              <span>Mark Done</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 8px',
                backgroundColor: 'var(--priority-urgent-bg)',
                border: '1px solid var(--priority-urgent)',
                color: 'var(--priority-urgent)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)'
              }}
            >
              <Trash2 size={11} />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={() => setMultiSelectedIds([])}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Right Contextual Inspector Drawer */}
      <InspectorDrawer
        item={selectedItem}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onUpdateItem={handleUpdateItem}
        onOpenSpec={() => setActiveView('living-spec')}
      />

      {/* 4. Global Modals & Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        items={items}
        onSelectItem={(item) => {
          setSelectedItemId(item.id);
          setIsInspectorOpen(true);
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onSelectView={setActiveView}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        theme={theme}
      />

      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateItem}
        activeTeamId={activeTeamId}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
export default App;
