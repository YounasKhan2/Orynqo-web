import React from 'react';
import { PanelLeftClose, PanelLeftOpen, ChevronsUpDown } from 'lucide-react';
import { CURRENT_ORGANIZATION } from '../../data/mockData';

/**
 * SidebarHeader Component
 * Anchors the Organization / Workspace Switcher trigger and rail collapse button.
 */
export function SidebarHeader({
  currentWorkspace,
  isCollapsed = false,
  onToggleCollapse,
  onOpenWorkspaceSwitcher
}) {
  const workspaceName = currentWorkspace?.name || 'Product & Engineering';
  const orgName = CURRENT_ORGANIZATION.name;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        height: 'var(--header-height)',
        padding: isCollapsed ? '0' : '0 var(--space-3)',
        borderBottom: '1px solid var(--border-subtle)',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Switcher Trigger */}
      <button
        type="button"
        onClick={onOpenWorkspaceSwitcher}
        title={isCollapsed ? `${orgName} — ${workspaceName}` : undefined}
        aria-label="Switch workspace"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: 'var(--radius-xs)',
          textAlign: 'left',
          minWidth: 0
        }}
      >
        <div
          style={{
            width: isCollapsed ? '26px' : '22px',
            height: isCollapsed ? '26px' : '22px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--primary-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 'var(--font-bold)',
            fontSize: '11px',
            flexShrink: 0
          }}
        >
          O
        </div>

        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              className="truncate"
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                lineHeight: 1.1
              }}
            >
              {orgName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                className="truncate"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2
                }}
              >
                {workspaceName}
              </span>
              <ChevronsUpDown size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </div>
          </div>
        )}
      </button>

      {isCollapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand sidebar (⌘[)"
          aria-label="Expand sidebar"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
            marginTop: '2px'
          }}
        >
          <PanelLeftOpen size={13} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Collapse sidebar (⌘[)"
          aria-label="Collapse sidebar"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-xs)'
          }}
        >
          <PanelLeftClose size={14} />
        </button>
      )}
    </div>
  );
}
