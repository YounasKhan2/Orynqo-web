import React, { useState } from 'react';
import {
  Search,
  Inbox,
  CheckCircle2,
  Compass,
  FileText,
  Bookmark
} from 'lucide-react';
import { Kbd } from '../../design-system';
import { TEAMS } from '../../data/mockData';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { SidebarFooter } from './SidebarFooter';
import {
  WorkspaceSwitcherPopover,
  FavoritesList,
  TeamSidebarGroup,
  BrowseTeamsTrigger
} from '../../components/navigation';

/**
 * Production Sidebar Component
 * High-density, keyboard-first navigation rail strictly enforcing:
 * - SIDEBAR = WHERE
 * - Progressive disclosure for Teams & Favorites
 * - Zero projections in the sidebar
 * - Semantic layout modes: Expanded (--sidebar-width) and Collapsed (--sidebar-collapsed-width)
 */
export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  activeScope = 'teams',
  activeTeamId = 'team-core',
  activeTargetId = null,
  currentWorkspace,
  onSelectWorkspace,
  onOpenWorkspaceSettings,
  onCreateWorkspace,
  onNavigate,
  onOpenCommandPalette,
  onOpenShortcutsModal,
  theme = 'dark',
  onToggleTheme,
  unreadInboxCount = 2,
  favorites = [],
  resolveTarget,
  onSelectFavorite,
  onRemoveFavorite,
  expandedSections = { personal: true, favorites: true, workspace: true, teams: true },
  onToggleSection,
  // Backward compatibility props
  activeView,
  onSelectView,
  onSelectTeam
}) {
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);

  // Progressive team disclosure: render joined/pinned teams
  const joinedTeams = TEAMS;

  // Resolve effective active scope
  const effectiveScope = (() => {
    if (activeView === 'inbox') return 'inbox';
    if (activeView === 'my-issues') return 'my-work';
    return activeScope;
  })();

  const handleNavigate = (dest) => {
    if (typeof dest === 'string') {
      if (dest === 'inbox') {
        onSelectView?.('inbox');
        onNavigate?.('inbox');
      } else if (dest === 'my-work') {
        onSelectView?.('my-issues');
        onNavigate?.('my-work');
      } else {
        onNavigate?.(dest);
      }
    } else if (typeof dest === 'object' && dest !== null) {
      if (dest.scope === 'teams' && dest.teamId) {
        onSelectTeam?.(dest.teamId);
        onSelectView?.('data-grid');
      }
      onNavigate?.(dest);
    }
  };

  return (
    <nav
      aria-label="Workspace navigation"
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minWidth: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: '100%',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--duration-normal) var(--ease-out)',
        userSelect: 'none',
        zIndex: 20,
        position: 'relative'
      }}
    >
      {/* Scrollable Navigation Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1
        }}
      >
        {/* Workspace Switcher Header */}
        <SidebarHeader
          currentWorkspace={currentWorkspace}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onOpenWorkspaceSwitcher={() => setIsWorkspaceSwitcherOpen((prev) => !prev)}
        />

        {/* Workspace Switcher Popover */}
        <WorkspaceSwitcherPopover
          isOpen={isWorkspaceSwitcherOpen}
          onClose={() => setIsWorkspaceSwitcherOpen(false)}
          currentWorkspaceId={currentWorkspace?.id}
          onSelectWorkspace={(w) => {
            onSelectWorkspace?.(w);
            setIsWorkspaceSwitcherOpen(false);
          }}
          onOpenWorkspaceSettings={onOpenWorkspaceSettings}
          onCreateWorkspace={onCreateWorkspace}
        />

        {/* Search & Command Trigger */}
        <div
          style={{
            padding: isCollapsed ? '6px 4px' : '6px 10px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title={isCollapsed ? 'Search & Commands (⌘K)' : undefined}
            aria-label="Search and commands"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              height: 'var(--sidebar-item-height)',
              padding: isCollapsed ? '0' : '0 8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={13} color="var(--text-muted)" />
              {!isCollapsed && <span>Search & Commands</span>}
            </div>
            {!isCollapsed && <Kbd>⌘K</Kbd>}
          </button>
        </div>

        {/* Navigation Sections */}
        <div
          style={{
            padding: isCollapsed ? '0 4px' : '0 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {/* PERSONAL SECTION */}
          <SidebarSection
            title="Personal"
            isExpanded={expandedSections.personal !== false}
            onToggle={() => onToggleSection?.('personal')}
            isCollapsed={isCollapsed}
          >
            <SidebarItem
              icon={Inbox}
              label="Inbox"
              badge={unreadInboxCount}
              shortcut="G I"
              isActive={effectiveScope === 'inbox'}
              isCollapsed={isCollapsed}
              onClick={() => handleNavigate('inbox')}
            />
            <SidebarItem
              icon={CheckCircle2}
              label="My Work"
              shortcut="G M"
              isActive={effectiveScope === 'my-work'}
              isCollapsed={isCollapsed}
              onClick={() => handleNavigate('my-work')}
            />
          </SidebarSection>

          {/* FAVORITES SECTION */}
          <SidebarSection
            title="Favorites"
            count={favorites.length}
            isExpanded={expandedSections.favorites !== false}
            onToggle={() => onToggleSection?.('favorites')}
            isCollapsed={isCollapsed}
          >
            <FavoritesList
              favorites={favorites}
              resolveTarget={resolveTarget}
              activeTargetId={activeTargetId}
              isCollapsed={isCollapsed}
              onSelectFavorite={(fav) => {
                if (fav.targetType === 'team') {
                  handleNavigate({ scope: 'teams', teamId: fav.targetId, tab: 'work' });
                } else if (fav.targetType === 'project') {
                  handleNavigate({ scope: 'projects', projectId: fav.targetId, tab: 'work' });
                } else {
                  handleNavigate(fav.targetType);
                }
                onSelectFavorite?.(fav);
              }}
              onRemoveFavorite={onRemoveFavorite}
            />
          </SidebarSection>

          {/* WORKSPACE SECTION */}
          <SidebarSection
            title="Workspace"
            isExpanded={expandedSections.workspace !== false}
            onToggle={() => onToggleSection?.('workspace')}
            isCollapsed={isCollapsed}
          >
            <SidebarItem
              icon={Compass}
              label="Initiatives"
              isActive={effectiveScope === 'initiatives'}
              isCollapsed={isCollapsed}
              onClick={() => handleNavigate('initiatives')}
            />
            <SidebarItem
              icon={FileText}
              label="Docs"
              isActive={effectiveScope === 'docs'}
              isCollapsed={isCollapsed}
              onClick={() => handleNavigate('docs')}
            />
            <SidebarItem
              icon={Bookmark}
              label="Views"
              isActive={effectiveScope === 'views'}
              isCollapsed={isCollapsed}
              onClick={() => handleNavigate('views')}
            />
          </SidebarSection>

          {/* TEAMS SECTION (Progressive Disclosure) */}
          <SidebarSection
            title="Teams"
            count={joinedTeams.length}
            isExpanded={expandedSections.teams !== false}
            onToggle={() => onToggleSection?.('teams')}
            isCollapsed={isCollapsed}
          >
            {joinedTeams.map((team) => (
              <TeamSidebarGroup
                key={team.id}
                team={team}
                isActive={effectiveScope === 'teams' && activeTeamId === team.id}
                isCollapsed={isCollapsed}
                onSelectTeam={(t) =>
                  handleNavigate({ scope: 'teams', teamId: t.id, tab: 'work' })
                }
                onSelectCycle={(t, cycle) =>
                  handleNavigate({ scope: 'teams', teamId: t.id, cycleId: cycle.id, tab: 'cycles' })
                }
              />
            ))}

            {/* Canonical Browse Teams Directory Trigger (TEM-001) */}
            <BrowseTeamsTrigger
              isCollapsed={isCollapsed}
              onClick={() => handleNavigate('teams')}
            />
          </SidebarSection>
        </div>
      </div>

      {/* Bottom Utility Area */}
      <SidebarFooter
        isCollapsed={isCollapsed}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenShortcutsModal={onOpenShortcutsModal}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
