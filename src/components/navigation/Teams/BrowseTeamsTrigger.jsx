import React from 'react';
import { Compass } from 'lucide-react';

/**
 * BrowseTeamsTrigger Component
 * Navigation entry point leading to canonical TEM-001 Teams Directory.
 */
export function BrowseTeamsTrigger({
  isCollapsed = false,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? 'Browse all teams...' : undefined}
      aria-label="Browse all teams"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '8px',
        height: 'var(--sidebar-item-height)',
        padding: isCollapsed ? '0' : '0 8px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-xs)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        userSelect: 'none'
      }}
    >
      <Compass size={13} color="var(--text-muted)" />
      {!isCollapsed && <span>Browse all teams...</span>}
    </button>
  );
}
