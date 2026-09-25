import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Keyboard, Settings, Shield, User, LogOut } from 'lucide-react';
import { CURRENT_USER } from '../../data/mockData';
import { UserAvatar } from '../../components/avatars/UserAvatar';

/**
 * SidebarFooter Component
 * Bottom utility rail anchoring identity, theme, shortcuts, and role-partitioned settings.
 */
export function SidebarFooter({
  isCollapsed = false,
  theme = 'dark',
  onToggleTheme,
  onOpenShortcutsModal,
  onNavigate
}) {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isSettingsMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsMenuOpen]);

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: isCollapsed ? '8px 0' : '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        {/* User Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <UserAvatar user={CURRENT_USER} size="sm" />
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                className="truncate"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--text-primary)'
                }}
              >
                {CURRENT_USER.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Online
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              aria-label="Toggle theme"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            {/* Shortcuts Modal Trigger */}
            <button
              type="button"
              onClick={onOpenShortcutsModal}
              title="Keyboard shortcuts (?)"
              aria-label="Keyboard shortcuts"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Keyboard size={13} />
            </button>

            {/* Role-Partitioned Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsMenuOpen((prev) => !prev)}
              title="Settings & Administration"
              aria-label="Settings"
              aria-expanded={isSettingsMenuOpen}
              style={{
                background: 'none',
                border: 'none',
                color: isSettingsMenuOpen ? 'var(--primary-base)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Settings size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSettingsMenuOpen((prev) => !prev)}
            title="Settings"
            aria-label="Settings"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Settings size={13} />
          </button>
        )}
      </div>

      {/* Role-Partitioned Settings Menu */}
      {isSettingsMenuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Settings navigation"
          style={{
            position: 'absolute',
            bottom: '48px',
            left: isCollapsed ? '56px' : '12px',
            width: '210px',
            backgroundColor: 'var(--bg-modal)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-popover)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '4px'
          }}
        >
          <div
            style={{
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Settings
          </div>

          {/* Personal Settings PER-003 */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsSettingsMenuOpen(false);
              onNavigate?.({ scope: 'settings', tab: 'profile' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '26px',
              padding: '0 8px',
              background: 'none',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <User size={12} color="var(--text-muted)" />
            <span>Personal Settings</span>
          </button>

          {/* Workspace Settings WKS-001 */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsSettingsMenuOpen(false);
              onNavigate?.({ scope: 'settings', tab: 'workspace' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '26px',
              padding: '0 8px',
              background: 'none',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Settings size={12} color="var(--text-muted)" />
            <span>Workspace Settings</span>
          </button>

          {/* Enterprise Administration ADM-001 */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsSettingsMenuOpen(false);
              onNavigate?.({ scope: 'settings', tab: 'admin' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '26px',
              padding: '0 8px',
              background: 'none',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Shield size={12} color="var(--text-muted)" />
            <span>Enterprise Admin</span>
          </button>
        </div>
      )}
    </div>
  );
}
