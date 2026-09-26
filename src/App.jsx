import React, { useState, useCallback, useMemo } from 'react';
import { WorkspaceProvider, useWorkspace, UIProvider, useUI } from './app/providers';
import { AppShell, Sidebar, ContextBar } from './layouts';
import { DataGrid, KanbanBoard, TimelineView, WorkloadView } from './views';
import { WorkItemInspector, QuickCreateDialog } from './features/work-items';
import { LivingSpecEditor } from './features/living-specs';
import { TriageInbox } from './features/triage';
import { MyWorkCockpit, MyWorkSummaryStrip, useMyWorkPreferences, useMyWorkQuery } from './features/my-work';
import {
  InboxCockpit,
  useInboxPreferences,
  useInboxQuery,
  useInboxMutations,
  INITIAL_NOTIFICATIONS
} from './features/inbox';
import { BulkActionBar, ShortcutsModal, CommandPalette } from './components';
import { useWorkItemsFilter } from './hooks/useWorkItemsFilter';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNavigationState } from './hooks/useNavigationState';
import { useFavorites } from './hooks/useFavorites';
import { useSidebarPreferences } from './hooks/useSidebarPreferences';
import { CURRENT_USER, USERS, TEAMS, PROJECTS, WORKSPACES, CYCLES, LIVING_DOCUMENTS } from './data/mockData';
import { INITIAL_CANONICAL_DOCUMENTS, INITIAL_DOCUMENT_COMMENTS } from './data/documentsMockData';
import { INITIAL_CANONICAL_PROJECTS } from './data/projectsMockData';
import { TeamHub } from './features/teams';
import { DocsHub, DocumentCanvas } from './features/documents';
import { ProjectWorkspace, ProjectsDirectory } from './features/projects';
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
  activeTeamId,
  onTabChange,
  filteredItems,
  onNavigate,
  myWorkQuery,
  myWorkProjection,
  myWorkCollapsedSections,
  onToggleMyWorkSection,
  isMyWorkFiltered,
  onResetFilters,
  userTimezone,
  inboxQuery,
  inboxMutations,
  inboxPreferences,
  canonicalWorkItems,
  canonicalDocuments = [],
  documentComments = [],
  onUpdateDocument,
  onArchiveDocument,
  onRestoreDocument,
  onCreateDocument,
  activeDocId,
  favoriteDocIds = [],
  onToggleDocFavorite,
  onOpenWorkItem,
  onCreateWorkItemFromSelection,
  canonicalProjects = [],
  activeProjectId,
  onUpdateProject,
  onArchiveProject,
  onRestoreProject,
  onCompleteProject,
  onCreateProject,
  favoriteProjectIds = [],
  onToggleProjectFavorite
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

  if (activeScope === 'inbox') {
    return (
      <InboxCockpit
        tab={activeTab}
        query={inboxQuery}
        mutations={inboxMutations}
        preferences={inboxPreferences}
        canonicalWorkItems={canonicalWorkItems}
        onUpdateWorkItem={updateItem}
        onNavigateToSource={onNavigate}
        isKeyboardActive={!isOverlayActive}
        onResetFilters={onResetFilters}
      />
    );
  }

  if (activeScope === 'my-work') {
    return (
      <MyWorkCockpit
        tab={activeTab}
        projection={myWorkProjection}
        query={myWorkQuery}
        density={density}
        selectedItemId={selectedItemId}
        multiSelectedIds={multiSelectedIds}
        isInspectorOpen={isInspectorOpen}
        isKeyboardActive={!isOverlayActive}
        collapsedSections={myWorkCollapsedSections}
        onToggleSection={onToggleMyWorkSection}
        onOpenItem={(item) => {
          selectItem(item.id);
          setIsInspectorOpen(true);
        }}
        onUpdateItem={updateItem}
        onQuickCreate={() => setIsCreateModalOpen(true)}
        onToggleMultiSelect={toggleMultiSelect}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBrowseTeams={() => onNavigate?.('teams')}
        filtered={isMyWorkFiltered}
        onResetFilters={onResetFilters}
        userTimezone={userTimezone}
      />
    );
  }

  if (activeScope === 'teams') {
    return (
      <TeamHub
        teamId={activeTeamId || 'team-core'}
        workItems={canonicalWorkItems}
        projects={PROJECTS}
        documents={canonicalDocuments}
        users={USERS}
        cycles={CYCLES}
        activeTab={activeTab || 'overview'}
        onTabChange={onTabChange || ((tab) => onNavigate?.({ scope: 'teams', teamId: activeTeamId || 'team-core', tab }))}
        onUpdateWorkItem={updateItem}
        onOpenQuickCreate={({ teamId }) => setIsCreateModalOpen(true)}
        onSelectWorkItem={(id) => {
          selectItem(id);
          setIsInspectorOpen(true);
        }}
        selectedWorkItemId={selectedItemId}
        onNavigateToProject={(id) => onNavigate?.({ scope: 'projects', projectId: id, tab: 'work' })}
        onNavigateToDoc={(id) => onNavigate?.({ scope: 'docs', docId: id })}
        userRole="lead"
      />
    );
  }

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
      <ProjectsDirectory
        projects={canonicalProjects}
        workItems={canonicalWorkItems}
        teams={TEAMS}
        users={USERS}
        onNavigateToProject={(id) => onNavigate?.({ scope: 'projects', projectId: id, tab: 'overview' })}
        onOpenCreateProject={() => onCreateProject?.()}
      />
    );
  }

  if (activeScope === 'projects') {
    if (activeProjectId) {
      return (
        <ProjectWorkspace
          projectId={activeProjectId}
          projects={canonicalProjects}
          workItems={canonicalWorkItems}
          documents={canonicalDocuments}
          teams={TEAMS}
          users={USERS}
          activeTab={activeTab || 'overview'}
          onTabChange={onTabChange}
          onUpdateProject={onUpdateProject}
          onArchiveProject={onArchiveProject}
          onRestoreProject={onRestoreProject}
          onCompleteProject={onCompleteProject}
          onOpenWorkItem={onOpenWorkItem}
          onNavigateToDoc={(id) => onNavigate?.({ scope: 'docs', docId: id })}
          onCreateDocument={onCreateDocument}
          selectedWorkItemId={selectedItemId}
          onSelectItem={(item) => selectItem(item.id)}
          onOpenInspector={(item) => {
            selectItem(item.id);
            setIsInspectorOpen(true);
          }}
          onCloseInspector={() => setIsInspectorOpen(false)}
          isInspectorOpen={isInspectorOpen}
          onUpdateWorkItem={updateItem}
          density={density}
          multiSelectedIds={multiSelectedIds}
          onToggleMultiSelect={toggleMultiSelect}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          isKeyboardActive={!isOverlayActive}
          onQuickCreate={() => setIsCreateModalOpen(true)}
          userTimezone={userTimezone}
          isFavorite={favoriteProjectIds.includes(activeProjectId)}
          onToggleFavorite={() => onToggleProjectFavorite?.(activeProjectId)}
        />
      );
    }

    return (
      <ProjectsDirectory
        projects={canonicalProjects}
        workItems={canonicalWorkItems}
        teams={TEAMS}
        users={USERS}
        onNavigateToProject={(id) => onNavigate?.({ scope: 'projects', projectId: id, tab: 'overview' })}
        onOpenCreateProject={() => onCreateProject?.()}
      />
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
    if (activeDocId) {
      return (
        <DocumentCanvas
          documentId={activeDocId}
          documents={canonicalDocuments}
          workItems={canonicalWorkItems}
          users={USERS}
          projects={PROJECTS}
          teams={TEAMS}
          comments={documentComments}
          favoriteDocIds={favoriteDocIds}
          onToggleFavorite={onToggleDocFavorite}
          onUpdateDocument={onUpdateDocument}
          onArchiveDocument={onArchiveDocument}
          onRestoreDocument={onRestoreDocument}
          onBackToHub={() => onNavigate?.({ scope: 'docs', docId: null })}
          onOpenWorkItem={(id) => {
            selectItem(id);
            setIsInspectorOpen(true);
          }}
          onOpenDocument={(id) => onNavigate?.({ scope: 'docs', docId: id })}
          onCreateWorkItemFromSelection={onCreateWorkItemFromSelection}
        />
      );
    }

    return (
      <DocsHub
        documents={canonicalDocuments}
        teams={TEAMS}
        projects={PROJECTS}
        currentUserId={CURRENT_USER.id}
        favoriteDocIds={favoriteDocIds}
        onToggleFavorite={onToggleDocFavorite}
        onSelectDocument={(id) => onNavigate?.({ scope: 'docs', docId: id })}
        onCreateDocument={onCreateDocument}
        isKeyboardActive={!isOverlayActive}
      />
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
  const myWorkPreferences = useMyWorkPreferences();

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

  const myWorkScope = ['overview', 'assigned', 'created', 'subscribed'].includes(activeTab)
    ? activeTab
    : 'overview';
  const isMyWorkFiltered = useMemo(() => {
    return Boolean(
      (searchQuery && searchQuery.trim().length > 0) ||
      (filters.status && filters.status !== 'all') ||
      (filters.priority && filters.priority !== 'all') ||
      (filters.assignee && filters.assignee !== 'all') ||
      (filters.project && filters.project !== 'all')
    );
  }, [searchQuery, filters]);
  const userTimezone = CURRENT_USER.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  const myWorkFilters = useMemo(() => ({ searchQuery, ...filters }), [searchQuery, filters]);
  const myWorkQuery = useMyWorkQuery({
    items,
    workspaceId: currentWorkspace.id,
    currentUserId: CURRENT_USER.id,
    scope: myWorkScope,
    filters: myWorkFilters,
    userTimezone
  });
  const myWorkProjection = myWorkScope === 'overview'
    ? 'data-grid'
    : myWorkPreferences.getProjection(myWorkScope);

  const handleSelectMyWorkProjection = useCallback(
    (projection) => {
      myWorkPreferences.setProjection(myWorkScope, projection);
      setActiveView(projection);
    },
    [myWorkPreferences, myWorkScope, setActiveView]
  );
  // Canonical Documents State (DOC-001 / DOC-002)
  const [documents, setDocuments] = useState(() => INITIAL_CANONICAL_DOCUMENTS);
  const [documentComments, setDocumentComments] = useState(() => INITIAL_DOCUMENT_COMMENTS);
  const [favoriteDocIds, setFavoriteDocIds] = useState(() => ['doc-handbook']);

  const handleUpdateDocument = useCallback((docId, updates, expectedVersion = null) => {
    let succeeded = false;
    setDocuments((prev) => {
      const current = prev.find((d) => d.id === docId);
      if (!current) return prev;

      // Authoritative concurrency check: reject if expectedVersion is provided and stale
      if (expectedVersion !== null && current.version > expectedVersion) {
        succeeded = false;
        return prev;
      }

      succeeded = true;
      return prev.map((d) => (d.id === docId ? { ...d, ...updates } : d));
    });
    return succeeded;
  }, []);

  const handleArchiveDocument = useCallback((docId, descendantResolution = 'reject_if_children') => {
    let succeeded = false;
    setDocuments((prev) => {
      const current = prev.find((d) => d.id === docId);
      if (!current) return prev;

      // ARCHIVE DESCENDANT SAFETY:
      // A parent Document with children cannot be archived in a way that silently
      // deletes descendants, hides descendants unexpectedly, breaks hierarchy, or reparents implicitly.
      const hasChildren = prev.some((d) => d.parentId === docId && d.lifecycle === 'active');
      if (hasChildren && descendantResolution === 'reject_if_children') {
        // Explicit descendant resolution required: fail mutation
        succeeded = false;
        return prev;
      }

      succeeded = true;
      return prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              lifecycle: 'archived',
              archivedAt: new Date().toISOString(),
              archivedBy: CURRENT_USER.id
            }
          : d
      );
    });
    return succeeded;
  }, []);

  const handleRestoreDocument = useCallback((docId) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              lifecycle: 'active',
              archivedAt: null,
              archivedBy: null
            }
          : d
      )
    );
  }, []);

  const handleCreateDocument = useCallback((input = {}) => {
    const newDoc = {
      id: `doc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      workspaceId: currentWorkspace?.id || 'wks-core',
      title: input.title || 'Untitled Document',
      icon: '📄',
      content: {
        blocks: [
          {
            id: `blk-${Date.now()}-1`,
            type: 'paragraph',
            text: '',
            meta: {}
          }
        ]
      },
      creatorId: CURRENT_USER.id,
      lastEditorId: CURRENT_USER.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: input.parentId || null,
      teamIds: input.teamId ? [input.teamId] : (input.teamIds || (activeScope === 'teams' && activeTeamId ? [activeTeamId] : [])),
      projectIds: input.projectId ? [input.projectId] : (input.projectIds || (activeScope === 'projects' && activeProjectId ? [activeProjectId] : [])),
      initiativeIds: [],
      cycleIds: [],
      lifecycle: 'active',
      version: 1
    };
    setDocuments((prev) => [newDoc, ...prev]);
    navigate({ scope: 'docs', docId: newDoc.id });
    return newDoc;
  }, [currentWorkspace, activeScope, activeTeamId, activeProjectId, navigate]);

  const handleToggleDocFavorite = useCallback((docId) => {
    setFavoriteDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  }, []);

  const handleCreateWorkItemFromSelection = useCallback(({ title: selectionTitle, sourceDocId }) => {
    const createdItem = createItem({
      title: selectionTitle || 'New WorkItem from living spec',
      description: `Referenced from living spec: ${sourceDocId}`,
      teamId: activeTeamId || 'team-core',
      projectId: activeProjectId || null
    });
    // Link document to created item
    if (createdItem) {
      updateItem(createdItem.id, {
        documentLinks: [sourceDocId]
      });
      selectItem(createdItem.id);
      setIsInspectorOpen(true);
    }
  }, [createItem, updateItem, selectItem, setIsInspectorOpen, activeTeamId, activeProjectId]);

  // Canonical Projects State (PRJ-001 - PRJ-007)
  const [projects, setProjects] = useState(() => INITIAL_CANONICAL_PROJECTS);
  const [favoriteProjectIds, setFavoriteProjectIds] = useState(() => ['proj-1']);

  const handleUpdateProject = useCallback((projectId, updates, expectedVersion = null) => {
    let succeeded = false;
    setProjects((prev) => {
      const current = prev.find((p) => p.id === projectId);
      if (!current) return prev;

      // Authoritative concurrency check: reject if expectedVersion is provided and stale
      if (expectedVersion !== null && current.version > expectedVersion) {
        succeeded = false;
        return prev;
      }

      succeeded = true;
      return prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              ...updates,
              version: (current.version || 1) + 1,
              updatedAt: new Date().toISOString()
            }
          : p
      );
    });
    return succeeded;
  }, []);

  const handleArchiveProject = useCallback((projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, archiveState: 'archived', updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const handleRestoreProject = useCallback((projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, archiveState: 'active', updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const handleCompleteProject = useCallback((projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, operationalState: 'completed', updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const handleCreateProject = useCallback((input = {}) => {
    const newProject = {
      id: `proj-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      identifier: input.identifier || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      workspaceId: currentWorkspace?.id || 'wks-core',
      name: input.name || 'Untitled Project',
      summary: input.summary || '',
      operationalState: 'planned',
      archiveState: 'active',
      health: 'unset',
      leadUserId: input.leadUserId || CURRENT_USER.id,
      leadTeamId: input.leadTeamId || (activeScope === 'teams' && activeTeamId ? activeTeamId : null),
      participatingTeamIds: input.participatingTeamIds || (activeScope === 'teams' && activeTeamId ? [activeTeamId] : []),
      targetDate: input.targetDate || null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects((prev) => [...prev, newProject]);
    navigate({ scope: 'projects', projectId: newProject.id, tab: 'overview' });
    return newProject;
  }, [currentWorkspace, activeScope, activeTeamId, navigate]);

  const handleToggleProjectFavorite = useCallback((projectId) => {
    setFavoriteProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  }, []);

  // Inbox State & Hooks
  const [inboxNotifications, setInboxNotifications] = useState(INITIAL_NOTIFICATIONS);
  const inboxPreferences = useInboxPreferences();
  const inboxTab = ['focus', 'all', 'later', 'archive'].includes(activeTab)
    ? activeTab
    : (inboxPreferences.activeTab || 'focus');

  const inboxFilters = useMemo(
    () => ({
      isUnreadOnly: inboxPreferences.isUnreadOnly,
      importance: inboxPreferences.importanceFilter,
      responseRequiredOnly: inboxPreferences.responseRequiredOnly
    }),
    [inboxPreferences.isUnreadOnly, inboxPreferences.importanceFilter, inboxPreferences.responseRequiredOnly]
  );

  const inboxQuery = useInboxQuery({
    notifications: inboxNotifications,
    workspaceId: currentWorkspace.id,
    recipientId: CURRENT_USER.id,
    tab: inboxTab,
    filters: inboxFilters,
    searchQuery
  });

  const inboxMutations = useInboxMutations({
    notifications: inboxNotifications,
    setNotifications: setInboxNotifications
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
    if (activeScope === 'inbox') {
      return [
        { id: 'focus', label: `Focus (${inboxQuery.focusCount})` },
        { id: 'all', label: `All (${inboxQuery.totalActiveCount})` },
        { id: 'later', label: 'Later' },
        { id: 'archive', label: 'Archive' }
      ];
    }

    if (activeScope === 'my-work') {
      const scopeCount = (scope) =>
        items.filter((item) => {
          if (item.workspaceId !== currentWorkspace.id || item.parentId) return false;
          if (scope === 'created') return item.creatorId === CURRENT_USER.id;
          if (scope === 'subscribed') return (item.subscriberIds || []).includes(CURRENT_USER.id);
          return item.assigneeId === CURRENT_USER.id;
        }).length;

      return [
        { id: 'overview', label: 'Overview' },
        { id: 'assigned', label: `Assigned (${scopeCount('assigned')})`, icon: Table },
        { id: 'created', label: `Created (${scopeCount('created')})` },
        { id: 'subscribed', label: `Subscribed (${scopeCount('subscribed')})` }
      ];
    }

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
        { id: 'activity', label: 'Activity' },
        { id: 'settings', label: 'Settings' }
      ];
    }

    return [];
  }, [activeScope, activeTeam, currentWorkspace.id, items]);

  // Tab switching handler
  const handleSelectTab = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      if (activeScope === 'inbox') {
        inboxPreferences.setActiveTab(tabId);
      } else if (activeScope === 'my-work') {
        myWorkPreferences.setActiveTab(tabId);
        setActiveView(tabId === 'overview' ? 'my-work' : myWorkPreferences.getProjection(tabId));
      } else if (tabId === 'work') {
        setActiveView(activeProjection || 'data-grid');
      } else if (tabId === 'triage') {
        setActiveView('inbox');
      }
    },
    [activeScope, setActiveTab, setActiveView, activeProjection, myWorkPreferences, inboxPreferences]
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
      list.push({ id: myWorkScope, label: myWorkScope.charAt(0).toUpperCase() + myWorkScope.slice(1) });
    } else if (activeScope === 'initiatives') {
      list.push({ id: 'initiatives', label: 'Initiatives' });
    } else if (activeScope === 'docs') {
      list.push({ id: 'docs', label: 'Docs', onClick: () => navigate({ scope: 'docs', docId: null }) });
      if (activeDocId) {
        const doc = documents.find((d) => d.id === activeDocId);
        list.push({ id: activeDocId, label: doc?.title || 'Document' });
      }
    } else if (activeScope === 'projects') {
      list.push({ id: 'projects', label: 'Projects', onClick: () => navigate({ scope: 'projects-directory' }) });
      if (activeProjectId) {
        const proj = projects.find((p) => p.id === activeProjectId);
        list.push({ id: activeProjectId, label: proj?.name || 'Project' });
        if (activeTab && activeTab !== 'overview') {
          list.push({ id: activeTab, label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1) });
        }
      }
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
    myWorkScope,
    activeDocId,
    documents,
    activeProjectId,
    projects,
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
    if (activeScope === 'my-work') {
      return { assigneeId: CURRENT_USER.id, teamId: null };
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
          unreadInboxCount={inboxQuery.unreadCount}
          onNavigate={(dest) => {
            navigate(dest);
            if (typeof dest === 'string') {
              if (dest === 'inbox') {
                setActiveScope('inbox');
                setActiveTab(inboxPreferences.activeTab || 'focus');
                setActiveView('inbox');
              } else if (dest === 'my-work') {
                const tab = myWorkPreferences.activeTab || 'overview';
                setActiveTab(tab);
                setActiveView(tab === 'overview' ? 'my-work' : myWorkPreferences.getProjection(tab));
              }
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
          totalItemsCount={
            activeScope === 'inbox'
              ? inboxQuery.totalFilteredCount
              : activeScope === 'my-work'
              ? myWorkQuery.items.length
              : filteredItems.length
          }
          summarySlot={activeScope === 'my-work' ? <MyWorkSummaryStrip metrics={myWorkQuery.summaryMetrics} /> : null}
          tabs={resourceTabs}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          showResourceNav={resourceTabs.length > 0}
          showProjections={
            activeScope === 'inbox'
              ? false
              : activeScope === 'my-work'
              ? activeTab !== 'overview'
              : activeTab === 'work'
          }
          activeProjection={activeScope === 'my-work' ? myWorkProjection : activeProjection}
          onSelectProjection={activeScope === 'my-work' ? handleSelectMyWorkProjection : handleSelectProjection}
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
        activeTeamId={activeTeamId}
        onTabChange={handleSelectTab}
        filteredItems={filteredItems}
        onNavigate={navigate}
        myWorkQuery={myWorkQuery}
        myWorkProjection={myWorkProjection}
        myWorkCollapsedSections={myWorkPreferences.collapsedSections}
        onToggleMyWorkSection={myWorkPreferences.toggleSection}
        isMyWorkFiltered={isMyWorkFiltered}
        onResetFilters={resetFilters}
        userTimezone={userTimezone}
        inboxQuery={inboxQuery}
        inboxMutations={inboxMutations}
        inboxPreferences={inboxPreferences}
        canonicalWorkItems={items}
        canonicalDocuments={documents}
        documentComments={documentComments}
        onUpdateDocument={handleUpdateDocument}
        onArchiveDocument={handleArchiveDocument}
        onRestoreDocument={handleRestoreDocument}
        onCreateDocument={handleCreateDocument}
        activeDocId={activeDocId}
        favoriteDocIds={favoriteDocIds}
        onToggleDocFavorite={handleToggleDocFavorite}
        onOpenWorkItem={(id) => {
          selectItem(id);
          setIsInspectorOpen(true);
        }}
        onCreateWorkItemFromSelection={handleCreateWorkItemFromSelection}
        canonicalProjects={projects}
        activeProjectId={activeProjectId}
        onUpdateProject={handleUpdateProject}
        onArchiveProject={handleArchiveProject}
        onRestoreProject={handleRestoreProject}
        onCompleteProject={handleCompleteProject}
        onCreateProject={handleCreateProject}
        favoriteProjectIds={favoriteProjectIds}
        onToggleProjectFavorite={handleToggleProjectFavorite}
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
