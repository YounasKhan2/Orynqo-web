import React, { useState } from 'react';
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
  canManage = true
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

  // 2. Project Updates Hook
  const {
    updates,
    latestUpdate,
    postUpdate
  } = useProjectUpdates({
    projectId,
    onUpdateProjectHealth: (pId, newHealth) => {
      onUpdateProject?.(pId, { health: newHealth }, project?.version);
    }
  });

  // 3. Project Milestones Hook
  const {
    milestones,
    addMilestone,
    updateMilestone,
    archiveMilestone,
    completeMilestone
  } = useProjectMilestones({
    projectId,
    workItems
  });

  // 4. Project Dependencies Hook
  const dependencies = useProjectDependencies({
    projectId,
    allProjects: projects,
    dependencies: []
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
            dependencies={[]}
            onUpdateProject={(updates) => onUpdateProject?.(project.id, updates, project.version)}
            onArchiveProject={onArchiveProject}
            onRestoreProject={onRestoreProject}
            onCompleteProject={onCompleteProject}
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
          postUpdate(payload);
        }}
      />
    </div>
  );
}
