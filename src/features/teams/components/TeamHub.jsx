import React, { useState, useRef, useMemo, useCallback } from 'react';
import { TeamHeader } from './TeamHeader';
import { TeamResourceNav } from './TeamResourceNav';
import { TeamOverview } from './TeamOverview';
import { TeamWork } from './TeamWork';
import { TeamProjects } from './TeamProjects';
import { TeamDocs } from './TeamDocs';
import { TeamMembers } from './TeamMembers';
import { ActiveCycleCockpit, CyclePlanningWorkbench, CycleRolloverModal } from '../../cycles';
import {
  useTeam,
  useTeamWorkQuery,
  useTeamProjectsQuery,
  useTeamDocumentsQuery,
  useTeamMembersQuery,
  useTeamKeyboard,
} from '../hooks';
import { useCycles } from '../../cycles/hooks/useCycles';
import { filterTeamBacklog } from '../model/backlogClassifier';

/**
 * TEM-001: TeamHub
 * Operational Team resource shell orchestrating:
 * - Header (compact identity, contextual search, quick create, permissions)
 * - Capability-aware ResourceNav (Overview, Work, Cycles, Projects, Docs, Members)
 * - Active Team Resource (TEM-002, TEM-003, TEM-004, TEM-005, TEM-007, CYC-001, CYC-002)
 * - Atomic cycle rollover review modal (CYC-001/CYC-002 rollover workflow)
 */
export const TeamHub = ({
  teamId,
  teamOverride = null,
  workItems = [],
  projects = [],
  documents = [],
  users = [],
  cycles = [],
  activeTab = 'overview',
  onTabChange,
  onUpdateWorkItem,
  onOpenQuickCreate,
  onSelectWorkItem,
  selectedWorkItemId = null,
  onNavigateToProject,
  onNavigateToDoc,
  userRole = 'member',
  currentUser = null,
}) => {
  const searchInputRef = useRef(null);

  // 1. Team Metadata & Capabilities
  const { team, capabilities, permissions, lead, members } = useTeam(
    teamId,
    currentUser,
    teamOverride,
    users
  );

  // 2. Active sub-tab inside Cycles view ('active' | 'planning')
  const [cycleSubView, setCycleSubView] = useState('active');

  // 3. Team-scoped queries querying supplied datasets
  const teamWork = useTeamWorkQuery({
    workItems,
    teamId: team?.id,
    cycles,
    tab: 'active'
  });

  const teamProjects = useTeamProjectsQuery({
    teamId: team?.id,
    projects,
    workItems
  });

  const teamDocs = useTeamDocumentsQuery({
    teamId: team?.id,
    documents
  });

  const teamMembers = useTeamMembersQuery({
    teamId: team?.id,
    users,
    workItems,
    activeCycleId: null,
    team
  });

  // 4. Team-scoped Cycles management consuming supplied cycles
  const cyclesHook = useCycles({
    teamId: team?.id,
    cycles,
    workItems,
    estimatesEnabled: capabilities.estimatesEnabled,
    onUpdateWorkItem,
  });

  // 5. Compute available capability-visible tabs
  const availableTabs = useMemo(() => {
    return [
      { id: 'overview', label: 'Overview' },
      { id: 'work', label: 'Work' },
      ...(capabilities.cyclesEnabled ? [{ id: 'cycles', label: 'Cycles' }] : []),
      { id: 'projects', label: 'Projects' },
      { id: 'docs', label: 'Docs' },
      { id: 'members', label: 'Members' }
    ];
  }, [capabilities.cyclesEnabled]);

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // 6. Centralized keyboard registration matching hook contract
  useTeamKeyboard({
    isActive: true,
    availableTabs,
    activeTab,
    onSelectTab: onTabChange,
    onFocusSearch: handleFocusSearch
  });

  if (!team) {
    return (
      <div
        data-testid="team-not-found"
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          color: 'var(--color-text-muted, #8B949E)',
        }}
      >
        <h3>Team Not Found</h3>
        <p style={{ fontSize: '13px', marginTop: '8px' }}>
          The requested team does not exist or you do not have permission to view it.
        </p>
      </div>
    );
  }

  const ledProjects = teamProjects.ledProjects || [];
  const participatingProjects = teamProjects.participatingProjects || [];
  const docsList = teamDocs.documents || [];
  const membersList = teamMembers.members || members || [];
  const activeWorkCount = teamWork.counts?.active || 0;

  return (
    <div
      className="team-hub-container"
      data-testid="team-hub-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--color-bg-canvas, #0D1117)',
      }}
    >
      {/* TEM-001 Header */}
      <TeamHeader
        team={team}
        lead={lead}
        memberCount={membersList.length}
        canCreateWork={permissions.canCreateWork}
        canManageSettings={permissions.canManageSettings}
        onOpenQuickCreate={() => onOpenQuickCreate && onOpenQuickCreate({ teamId: team.id })}
        searchInputRef={searchInputRef}
      />

      {/* TEM-001 Capability-Aware ResourceNav */}
      <TeamResourceNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        cyclesEnabled={capabilities.cyclesEnabled}
        workCount={activeWorkCount}
        docsCount={docsList.length}
        projectsCount={ledProjects.length + participatingProjects.length}
        membersCount={membersList.length}
      />

      {/* Active Team Resource Area */}
      <div
        className="team-resource-viewport"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'overview' && (
          <TeamOverview
            team={team}
            lead={lead}
            memberCount={membersList.length}
            activeCycle={cyclesHook.activeCycle}
            activeCycleProgress={cyclesHook.activeCycleProgress}
            onNavigateToCycles={() => onTabChange?.('cycles')}
            projects={[...ledProjects, ...participatingProjects]}
            documents={docsList}
            onNavigateToProject={onNavigateToProject}
            onNavigateToDoc={onNavigateToDoc}
          />
        )}

        {activeTab === 'work' && (
          <TeamWork
            items={teamWork.items}
            counts={teamWork.counts}
            selectedItemId={selectedWorkItemId}
            onSelectItem={onSelectWorkItem}
            onOpenInspector={onSelectWorkItem}
            onUpdateItem={onUpdateWorkItem}
            onQuickCreate={() => onOpenQuickCreate && onOpenQuickCreate({ teamId: team.id })}
          />
        )}

        {activeTab === 'cycles' && capabilities.cyclesEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            {/* Cycles Sub-bar: Active Cycle vs Planning Workbench */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 24px',
                borderBottom: '1px solid var(--color-border-subtle, #21262D)',
                background: 'rgba(255, 255, 255, 0.01)',
              }}
            >
              <button
                type="button"
                data-testid="cycle-subnav-active"
                onClick={() => setCycleSubView('active')}
                style={{
                  fontSize: '12px',
                  fontWeight: cycleSubView === 'active' ? 600 : 400,
                  color: cycleSubView === 'active' ? '#58A6FF' : 'var(--color-text-muted, #8B949E)',
                  background: cycleSubView === 'active' ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                Active Cycle ({cyclesHook.activeCycle ? (cyclesHook.activeCycle.name || `Cycle ${cyclesHook.activeCycle.number}`) : 'None'})
              </button>
              <button
                type="button"
                data-testid="cycle-subnav-planning"
                onClick={() => setCycleSubView('planning')}
                style={{
                  fontSize: '12px',
                  fontWeight: cycleSubView === 'planning' ? 600 : 400,
                  color: cycleSubView === 'planning' ? '#58A6FF' : 'var(--color-text-muted, #8B949E)',
                  background: cycleSubView === 'planning' ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                Planning Workbench
              </button>
            </div>

            {/* CYC-001 vs CYC-002 */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {cycleSubView === 'active' ? (
                <ActiveCycleCockpit
                  activeCycle={cyclesHook.activeCycle}
                  items={cyclesHook.activeCycleItems}
                  progress={cyclesHook.activeCycleProgress}
                  selectedItemId={selectedWorkItemId}
                  onSelectItem={onSelectWorkItem}
                  onOpenInspector={onSelectWorkItem}
                  onUpdateItem={onUpdateWorkItem}
                  onCompleteCycle={() => cyclesHook.activeCycle && cyclesHook.promptCompleteCycle(cyclesHook.activeCycle.id)}
                />
              ) : (
                <CyclePlanningWorkbench
                  upcomingCycle={cyclesHook.nextUpcomingCycle}
                  backlogItems={filterTeamBacklog(workItems, team?.id, cycles)}
                  cycleItems={cyclesHook.upcomingCycleItems}
                  estimatesEnabled={capabilities.estimatesEnabled}
                  canPlanWork={permissions.canPlanWork}
                  onScheduleItem={cyclesHook.assignWorkItemToCycle}
                  onUnscheduleItem={cyclesHook.removeWorkItemFromCycle}
                  onSelectItem={onSelectWorkItem}
                  selectedItemId={selectedWorkItemId}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <TeamProjects
            ledProjects={ledProjects}
            participatingProjects={participatingProjects}
            onNavigateToProject={onNavigateToProject}
          />
        )}

        {activeTab === 'docs' && (
          <TeamDocs
            documents={docsList}
            onNavigateToDoc={onNavigateToDoc}
          />
        )}

        {activeTab === 'members' && (
          <TeamMembers
            members={membersList}
            lead={lead}
          />
        )}
      </div>

      {/* Atomic Cycle Rollover Modal */}
      {cyclesHook.rolloverModalState && (
        <CycleRolloverModal
          cycle={cyclesHook.rolloverModalState.cycle}
          incompleteItems={cyclesHook.rolloverModalState.incompleteItems}
          nextCycle={cyclesHook.nextUpcomingCycle}
          error={cyclesHook.rolloverModalState.error}
          onConfirm={cyclesHook.confirmCompleteCycle}
          onCancel={cyclesHook.cancelRollover}
        />
      )}
    </div>
  );
};

export default TeamHub;
