import React, { useState, useCallback } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { ProjectWorkTab } from './ProjectWorkTab';
import { ProjectDocsTab } from './ProjectDocsTab';
import { ProjectMilestonesTab } from './ProjectMilestonesTab';
import { ProjectActivityTab } from './ProjectActivityTab';
import { ProjectSettingsTab } from './ProjectSettingsTab';
import { ProjectUpdateModal } from './ProjectUpdateModal';
import {
  useProject,
  useProjectMilestones,
  useProjectUpdates,
  useProjectDependencies
} from '../hooks';

/**
 * ProjectWorkspace Component (PRJ-001 - PRJ-006 Shell)
 *
 * Coordinates project resource projections:
 * - Header (reference, status, health badge, lead, actions)
 * - Active projection tabs: Overview, Work, Docs, Milestones, Activity, Settings
 * - Modal overlays: ProjectUpdateModal
 * - Optimistic concurrency protection
 */
export function ProjectWorkspace({
  projectId,
  projects = [],
  workItems = [],
  documents = [],
  teams = [],
  users = [],
  activeTab = 'overview',
  onTabChange,
  onUpdateProject,
  onArchiveProject,
  onRestoreProject,
  onCompleteProject,
  onOpenWorkItem,
  onNavigateToDoc,
  onCreateDocument,
  selectedWorkItemId = null,
  onSelectItem,
  onOpenInspector,
  onCloseInspector,
  isInspectorOpen = false,
  onUpdateWorkItem,
  density = 'compact',
  multiSelectedIds = [],
  onToggleMultiSelect,
  onSelectAll,
  onClearSelection,
  isKeyboardActive = true,
  onQuickCreate,
  userTimezone,
  isFavorite = false,
  onToggleFavorite,
  canEdit = true,
  canPostUpdate = true,
  canManage = true,
  // Canonical State & Mutation Props
  dependencies: canonicalDependencies = [],
  milestones: canonicalMilestones = null,
  updates: canonicalUpdates = null,
  onAddDependency,
  onRemoveDependency,
  onAddMilestone,
  onUpdateMilestone,
  onArchiveMilestone,
  onCompleteMilestone,
  onPostUpdate
}) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // 1. Single Project Retrieval & Concurrency Hook
  const {
    project,
    draftName,
    draftSummary,
    saveState,
    isConflict,
    executeSave
  } = useProject({
    projectId,
    projects,
    workItems,
    onUpdateProject
  });

  // 2. Project Updates (Canonical if provided, fallback to hook for backwards compatibility)
  const updatesHook = useProjectUpdates({
    projectId,
    initialUpdates: canonicalUpdates || [],
    onUpdateProjectHealth: (pId, newHealth) => {
      onUpdateProject?.(pId, { health: newHealth }, project?.version);
    }
  });

  const updates = canonicalUpdates
    ? canonicalUpdates
        .filter((u) => u.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : updatesHook.updates;
  const latestUpdate = updates.length > 0 ? updates[0] : null;

  const handlePostUpdate = (payload) => {
    if (onPostUpdate) {
      onPostUpdate({ ...payload, projectId: project?.id || projectId });
    } else {
      updatesHook.postUpdate(payload);
    }
  };

  // 3. Project Milestones (Canonical if provided, fallback to hook)
  const milestonesHook = useProjectMilestones({
    projectId,
    initialMilestones: canonicalMilestones || [],
    workItems
  });

  const milestones = canonicalMilestones
    ? canonicalMilestones
        .filter((m) => m.projectId === projectId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : milestonesHook.milestones;

  const addMilestone = useCallback(
    (input) => {
      if (onAddMilestone) {
        return onAddMilestone({ ...input, projectId: project?.id || projectId });
      }
      return milestonesHook.addMilestone(input);
    },
    [onAddMilestone, milestonesHook, project, projectId]
  );
  const updateMilestone = onUpdateMilestone || milestonesHook.updateMilestone;
  const archiveMilestone = onArchiveMilestone || milestonesHook.archiveMilestone;
  const completeMilestone = onCompleteMilestone || milestonesHook.completeMilestone;

  // 4. Project Dependencies Hook (Supplied with authoritative collection)
  const dependencies = useProjectDependencies({
    projectId,
    allProjects: projects,
    dependencies: canonicalDependencies
  });

  if (!project) {
    return (
      <div
        data-testid="project-not-found"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted, #94a3b8)',
          padding: '24px'
        }}
      >
        <h2 style={{ fontSize: '18px', color: 'var(--text-primary, #f8fafc)', margin: '0 0 8px' }}>
          Project Not Found
        </h2>
        <p style={{ fontSize: '13px', margin: 0 }}>
          The requested project does not exist or has been removed.
        </p>
      </div>
    );
  }

  const leadUser = (users || []).find((u) => u.id === (project.leadUserId || project.leadId));

  return (
    <div
      role="region"
      aria-label={`${project.name} Workspace`}
      data-testid="project-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas, #0f172a)'
      }}
    >
      {/* 1. Project Header */}
      <ProjectHeader
        project={project}
        leadUser={leadUser}
        teams={teams}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
        onOpenSettings={() => onTabChange?.('settings')}
        canEdit={canEdit}
        canPostUpdate={canPostUpdate}
      />

      {/* 2. Active Tab Content Projection */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'overview' && (
          <ProjectOverviewTab
            project={project}
            leadUser={leadUser}
            teams={teams}
            workItems={workItems}
            milestones={milestones}
            documents={documents}
            latestUpdate={latestUpdate}
            dependencies={dependencies}
            onNavigateToTab={onTabChange}
            onNavigateToDoc={onNavigateToDoc}
            onNavigateToWorkItem={onOpenWorkItem}
            onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
          />
        )}

        {activeTab === 'work' && (
          <ProjectWorkTab
            project={project}
            workItems={workItems}
            selectedItemId={selectedWorkItemId}
            onSelectItem={onSelectItem}
            onOpenInspector={onOpenInspector}
            onCloseInspector={onCloseInspector}
            isInspectorOpen={isInspectorOpen}
            onUpdateItem={onUpdateWorkItem}
            density={density}
            multiSelectedIds={multiSelectedIds}
            onToggleMultiSelect={onToggleMultiSelect}
            onSelectAll={onSelectAll}
            onClearSelection={onClearSelection}
            isKeyboardActive={isKeyboardActive}
            onQuickCreate={onQuickCreate}
            userTimezone={userTimezone}
          />
        )}

        {activeTab === 'docs' && (
          <ProjectDocsTab
            project={project}
            documents={documents}
            onNavigateToDoc={onNavigateToDoc}
            onCreateDocument={onCreateDocument}
            canCreate={canEdit}
          />
        )}

        {activeTab === 'milestones' && (
          <ProjectMilestonesTab
            project={project}
            milestones={milestones}
            workItems={workItems}
            onAddMilestone={addMilestone}
            onUpdateMilestone={updateMilestone}
            onCompleteMilestone={completeMilestone}
            onArchiveMilestone={archiveMilestone}
            onOpenWorkItem={onOpenWorkItem}
            canManage={canManage}
          />
        )}

        {activeTab === 'activity' && (
          <ProjectActivityTab
            project={project}
            events={[]}
          />
        )}

        {activeTab === 'settings' && (
          <ProjectSettingsTab
            project={project}
            teams={teams}
            allProjects={projects}
            workItems={workItems}
            dependencies={canonicalDependencies}
            onUpdateProject={(updates) => onUpdateProject?.(project.id, updates, project.version)}
            onArchiveProject={onArchiveProject}
            onRestoreProject={onRestoreProject}
            onCompleteProject={onCompleteProject}
            onAddDependency={onAddDependency}
            onRemoveDependency={onRemoveDependency}
            isConflict={isConflict}
            saveState={saveState}
            canManageSettings={canManage}
            canArchive={canManage}
          />
        )}
      </div>

      {/* 3. Project Update Publishing Modal */}
      <ProjectUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentTargetDate={project.targetDate}
        currentHealth={project.health}
        onSubmit={(payload) => {
          handlePostUpdate(payload);
        }}
      />
    </div>
  );
}
