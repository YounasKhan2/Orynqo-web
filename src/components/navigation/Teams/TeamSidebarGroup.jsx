import React from 'react';
import { Layers, Smartphone, Globe, RefreshCw, ChevronRight } from 'lucide-react';
import { CYCLES } from '../../../data/mockData';

const TEAM_ICONS = {
  Layers,
  Smartphone,
  Globe
};

/**
 * TeamSidebarGroup Component
 * Renders a joined team entry in the sidebar.
 * Strictly enforces: at most ONE contextual child link: `Current Cycle` (when cycles capability is enabled).
 */
export function TeamSidebarGroup({
  team,
  isActive = false,
  isCollapsed = false,
  onSelectTeam,
  onSelectCycle
}) {
  const IconComponent = TEAM_ICONS[team.icon] || Layers;

  // Check if team has active cycle and cycles capability enabled
  const hasCyclesCapability = team.capabilities?.cycles !== false;
  const activeCycle = hasCyclesCapability
    ? CYCLES.find((c) => c.teamId === team.id && c.status === 'active')
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      {/* Team Primary Row */}
      <button
        type="button"
        onClick={() => onSelectTeam?.(team)}
        title={isCollapsed ? team.name : undefined}
        aria-label={team.name}
        aria-current={isActive ? 'true' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          height: 'var(--sidebar-item-height)',
          padding: isCollapsed ? '0' : '0 8px',
          backgroundColor: isActive ? 'var(--bg-surface-selected)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-xs)',
          fontSize: 'var(--text-xs)',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <IconComponent
            size={13}
            color={isActive ? 'var(--primary-base)' : 'var(--text-muted)'}
          />
          {!isCollapsed && <span className="truncate">{team.name}</span>}
        </div>
      </button>

      {/* Conditional At-Most-One Sub-Link: Current Cycle */}
      {!isCollapsed && activeCycle && (
        <button
          type="button"
          onClick={() => onSelectCycle?.(team, activeCycle)}
          aria-label={`${team.name} active cycle: ${activeCycle.name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '24px',
            marginLeft: '16px',
            padding: '0 8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            textAlign: 'left',
            userSelect: 'none'
          }}
        >
          <RefreshCw size={11} color="var(--primary-text)" />
          <span className="truncate">{activeCycle.name}</span>
        </button>
      )}
    </div>
  );
}
