import React, { useState } from 'react';
import {
  Compass,
  FolderKanban,
  Layers,
  Send,
  History,
  AlertTriangle
} from 'lucide-react';
import { InitiativeHeader } from './InitiativeHeader';
import { InitiativeOverviewTab } from './InitiativeOverviewTab';
import { InitiativeProjectsTab } from './InitiativeProjectsTab';
import { InitiativeRoadmapTab } from './InitiativeRoadmapTab';
import { InitiativeUpdatesTab } from './InitiativeUpdatesTab';
import { InitiativeActivityTab } from './InitiativeActivityTab';
import { InitiativeManagementModal } from './InitiativeManagementModal';
import { InitiativeUpdateModal } from './InitiativeUpdateModal';
import { AlignProjectModal } from './AlignProjectModal';

/**
 * InitiativeWorkspace (INT-002)
 *
 * Resource Shell orchestrating exactly five canonical tabs:
 * 1. Overview
 * 2. Projects
 * 3. Roadmap
 * 4. Updates
 * 5. Activity
 *
 * Header More / Settings (...) triggers progressive-disclosure Management Surface.
 */
export function InitiativeWorkspace({
  initiativeId,
  initiatives = [],
  projects = [],
  workItems = [],
  milestones = [],
  updates = [],
  dependencies = [],
  activityEvents = [],
  teams = [],
  users = [],
  activeTab = 'overview',
  onTabChange,
  onUpdateInitiative,
  onArchiveInitiative,
  onRestoreInitiative,
  onCompleteInitiative,
  onPostInitiativeUpdate,
  onAlignProject,
  onDissociateProject,
  onRescheduleProject,
  onNavigateToProject,
  isFavorite = false,
  onToggleFavorite,
  canManage = true,
  canManageAccess = true,
  isAccessible = () => true
}) {
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAlignProjectModalOpen, setIsAlignProjectModalOpen] = useState(false);

  const initiative = (initiatives || []).find((i) => i.id === initiativeId);

  if (!initiative || !isAccessible(initiative, 'initiative')) {
    return (
      <div
        role="region"
        aria-label="Initiative Not Found"
        data-testid="initiative-not-found"
        style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}
      >
        <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Initiative not found or you lack permission to view it.
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          This initiative may be restricted or has been archived.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'roadmap', label: 'Roadmap', icon: Layers },
    { id: 'updates', label: 'Updates', icon: Send },
    { id: 'activity', label: 'Activity', icon: History }
  ];

  const accessibleProjects = (projects || []).filter(
    (p) => p.initiativeId === initiative.id && isAccessible(p, 'project') && p.archiveState !== 'archived'
  );

  return (
    <div
      role="main"
      aria-label={`Initiative: ${initiative.name}`}
      data-testid="initiative-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <InitiativeHeader
        initiative={initiative}
        users={users}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onUpdateInitiative={(updates) => onUpdateInitiative?.(initiative.id, updates)}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
        onOpenAlignProjectModal={() => setIsAlignProjectModalOpen(true)}
        onOpenManagementSurface={() => setIsManagementModalOpen(true)}
        canManage={canManage}
      />

      {/* Resource Tab Navigation (Exactly Five Canonical Tabs) */}
      <div
        role="tablist"
        aria-label="Initiative Resource Sections"
        data-testid="initiative-tablist"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '0 var(--space-8, 32px)',
          borderBottom: '1px solid var(--border-default, #1e293b)',
          backgroundColor: 'var(--bg-canvas, #0f172a)'
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              data-testid={`initiative-tab-${tab.id}`}
              onClick={() => onTabChange?.(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--primary-base, #3b82f6)' : 'transparent'}`,
                color: isActive ? 'var(--primary-base, #3b82f6)' : 'var(--text-secondary, #94a3b8)',
                fontSize: '12px',
                fontWeight: isActive ? 'var(--font-semibold, 600)' : 'var(--font-medium, 500)',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body Viewport */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <InitiativeOverviewTab
            initiative={initiative}
            projects={projects}
            workItems={workItems}
            teams={teams}
            users={users}
            updates={updates}
            dependencies={dependencies}
            milestones={milestones}
            onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
            onNavigateToProject={onNavigateToProject}
            isAccessible={isAccessible}
          />
        )}

        {activeTab === 'projects' && (
          <InitiativeProjectsTab
            initiative={initiative}
            projects={projects}
            workItems={workItems}
            teams={teams}
            users={users}
            onNavigateToProject={onNavigateToProject}
            onOpenAlignProjectModal={() => setIsAlignProjectModalOpen(true)}
            onDissociateProject={(projId) => onDissociateProject?.(projId)}
            canManage={canManage}
            isAccessible={isAccessible}
          />
        )}

        {activeTab === 'roadmap' && (
          <InitiativeRoadmapTab
            initiative={initiative}
            initiatives={initiatives}
            projects={projects}
            milestones={milestones}
            dependencies={dependencies}
            teams={teams}
            onRescheduleProject={onRescheduleProject}
            onNavigateToProject={onNavigateToProject}
            canManage={canManage}
            isAccessible={isAccessible}
          />
        )}

        {activeTab === 'updates' && (
          <InitiativeUpdatesTab
            initiative={initiative}
            updates={updates}
            users={users}
            onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
            canManage={canManage}
          />
        )}

        {activeTab === 'activity' && (
          <InitiativeActivityTab
            initiative={initiative}
            activityEvents={activityEvents}
            users={users}
          />
        )}
      </div>

      {/* Progressive-Disclosure Management Modal */}
      <InitiativeManagementModal
        initiative={initiative}
        associatedProjects={accessibleProjects}
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        onUpdateInitiative={(updates) => onUpdateInitiative?.(initiative.id, updates)}
        onArchiveInitiative={onArchiveInitiative}
        onRestoreInitiative={onRestoreInitiative}
        onCompleteInitiative={onCompleteInitiative}
        canManageAccess={canManageAccess}
        canArchive={canManage}
        canComplete={canManage}
      />

      {/* Authoritative Initiative Update Composer Modal */}
      <InitiativeUpdateModal
        initiative={initiative}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onPublishUpdate={onPostInitiativeUpdate}
      />

      {/* Align Project Modal */}
      <AlignProjectModal
        initiative={initiative}
        projects={projects}
        initiatives={initiatives}
        isOpen={isAlignProjectModalOpen}
        onClose={() => setIsAlignProjectModalOpen(false)}
        onAlignProject={onAlignProject}
        isAccessible={isAccessible}
      />
    </div>
  );
}
