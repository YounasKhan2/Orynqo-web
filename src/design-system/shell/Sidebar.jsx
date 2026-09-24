import React from 'react';
import {
  Search,
  Inbox,
  CheckCircle2,
  Clock,
  Layers,
  Smartphone,
  Globe,
  Compass,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Keyboard,
  FileText
} from 'lucide-react';
import { CURRENT_USER } from '../../data/mockData';
import { Avatar } from '../primitives/Avatar';

/**
 * Sidebar Component
 * Collapsible left rail preserving orientation and high density
 */
export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeView,
  onSelectView,
  activeTeamId,
  onSelectTeam,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  onOpenShortcutsModal,
  unreadInboxCount = 2
}) {
  return (
    <aside
      style={{
        width: isCollapsed ? '52px' : '230px',
        minWidth: isCollapsed ? '52px' : '230px',
        height: '100%',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--duration-normal) var(--ease-out)',
        userSelect: 'none',
        zIndex: 20
      }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Workspace Switcher Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            height: 'var(--header-height)',
            padding: isCollapsed ? '0' : '0 var(--space-3)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--primary-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 'var(--font-bold)',
                  fontSize: '11px'
                }}
              >
                O
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                  Orynqo Corp
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Product & Engineering
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--primary-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'var(--font-bold)',
                fontSize: '12px'
              }}
            >
              O
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar (⌘[)' : 'Collapse sidebar (⌘[)'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: isCollapsed ? 'none' : 'flex',
              padding: '4px'
            }}
          >
            <PanelLeftClose size={14} />
          </button>
        </div>

        {/* Global Nav Links */}
        <div style={{ padding: 'var(--space-2) var(--space-1-5)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
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
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={13} color="var(--text-muted)" />
              {!isCollapsed && <span>Search & Commands</span>}
            </div>
            {!isCollapsed && <span className="kbd-shortcut">⌘K</span>}
          </button>

          {/* Inbox Link */}
          <button
            type="button"
            onClick={() => onSelectView('inbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              height: 'var(--sidebar-item-height)',
              padding: isCollapsed ? '0' : '0 8px',
              backgroundColor: activeView === 'inbox' ? 'var(--bg-surface-selected)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: activeView === 'inbox' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Inbox size={13} color={activeView === 'inbox' ? 'var(--primary-base)' : 'var(--text-muted)'} />
              {!isCollapsed && <span>Inbox</span>}
            </div>
            {!isCollapsed && unreadInboxCount > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: 'var(--primary-base)',
                  color: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  fontWeight: 'var(--font-semibold)'
                }}
              >
                {unreadInboxCount}
              </span>
            )}
          </button>

          {/* My Issues */}
          <button
            type="button"
            onClick={() => onSelectView('my-issues')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              height: 'var(--sidebar-item-height)',
              padding: isCollapsed ? '0' : '0 8px',
              backgroundColor: activeView === 'my-issues' ? 'var(--bg-surface-selected)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: activeView === 'my-issues' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={13} color={activeView === 'my-issues' ? 'var(--primary-base)' : 'var(--text-muted)'} />
              {!isCollapsed && <span>My Issues</span>}
            </div>
          </button>
        </div>

        {/* Teams & Spaces Section */}
        {!isCollapsed && (
          <div style={{ padding: 'var(--space-2) var(--space-2)' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
                paddingLeft: '4px'
              }}
            >
              Teams
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                onClick={() => { onSelectTeam('team-core'); onSelectView('data-grid'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: 'var(--sidebar-item-height)',
                  padding: '0 8px',
                  backgroundColor: activeTeamId === 'team-core' ? 'var(--bg-surface-raised)' : 'transparent',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-xs)',
                  color: activeTeamId === 'team-core' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Layers size={13} color="var(--primary-base)" />
                <span className="truncate">Core Platform</span>
              </div>

              <div
                onClick={() => { onSelectTeam('team-mobile'); onSelectView('data-grid'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: 'var(--sidebar-item-height)',
                  padding: '0 8px',
                  backgroundColor: activeTeamId === 'team-mobile' ? 'var(--bg-surface-raised)' : 'transparent',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-xs)',
                  color: activeTeamId === 'team-mobile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Smartphone size={13} color="#a855f7" />
                <span className="truncate">Mobile Client</span>
              </div>

              <div
                onClick={() => { onSelectTeam('team-web'); onSelectView('data-grid'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: 'var(--sidebar-item-height)',
                  padding: '0 8px',
                  backgroundColor: activeTeamId === 'team-web' ? 'var(--bg-surface-raised)' : 'transparent',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-xs)',
                  color: activeTeamId === 'team-web' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Globe size={13} color="#10b981" />
                <span className="truncate">Web Studio</span>
              </div>
            </div>
          </div>
        )}

        {/* Living Documents / Specs Section */}
        {!isCollapsed && (
          <div style={{ padding: 'var(--space-2) var(--space-2)' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
                paddingLeft: '4px'
              }}
            >
              Living Specs
            </div>

            <div
              onClick={() => onSelectView('living-spec')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: 'var(--sidebar-item-height)',
                padding: '0 8px',
                backgroundColor: activeView === 'living-spec' ? 'var(--bg-surface-raised)' : 'transparent',
                borderRadius: 'var(--radius-xs)',
                fontSize: 'var(--text-xs)',
                color: activeView === 'living-spec' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <FileText size={13} color="var(--primary-text)" />
              <span className="truncate">PRD: Offline Sync</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: User, Theme, Shortcuts */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: 'var(--space-2) var(--space-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar user={CURRENT_USER} size="sm" />
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="truncate" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                  {CURRENT_USER.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Online
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                type="button"
                onClick={onToggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </button>

              <button
                type="button"
                onClick={onOpenShortcutsModal}
                title="Keyboard shortcuts (?)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Keyboard size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
