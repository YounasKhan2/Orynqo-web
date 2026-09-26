import React from 'react';
import {
  Layers,
  Smartphone,
  Globe,
  Users,
  Search,
  Plus,
  Star,
  Settings,
  MoreHorizontal
} from 'lucide-react';

const ICON_MAP = {
  Layers,
  Smartphone,
  Globe
};

/**
 * TeamHeader Component (TEM-001)
 *
 * Compact, high-density team identity surface:
 * - Team icon/avatar & key badge
 * - Lead/owner handle & member count indicator
 * - Quick Create action
 * - Contextual search trigger
 * - Favorite toggle & settings entry
 */
export function TeamHeader({
  team,
  lead,
  memberCount = 0,
  isFavorite = false,
  onToggleFavorite,
  onOpenQuickCreate,
  onOpenSettings,
  searchQuery = '',
  onSearchChange,
  canManageSettings = false,
  isSearchActive = false,
  onToggleSearch,
  searchInputRef
}) {
  const IconComponent = team?.icon ? ICON_MAP[team.icon] || Layers : Layers;

  return (
    <div
      role="banner"
      aria-label={`${team?.name || 'Team'} Header`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        height: '48px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        flexShrink: 0
      }}
    >
      {/* Left: Identity & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--primary-base)'
          }}
        >
          <IconComponent size={16} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
          <h1
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text-primary)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {team?.name || 'Team'}
          </h1>

          {team?.key && (
            <span
              className="font-mono"
              style={{
                fontSize: 'var(--text-2xs)',
                fontWeight: 'var(--font-semibold)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)'
              }}
            >
              {team.key}
            </span>
          )}
        </div>

        {/* Compact Metadata Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginLeft: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)'
          }}
        >
          {lead && (
            <span>
              Lead: <span style={{ color: 'var(--text-secondary)', fontWeight: 'var(--font-medium)' }}>@{lead.name?.split(' ')[0]}</span>
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} />
            {memberCount} members
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {/* Contextual search input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '8px',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            ref={searchInputRef}
            data-testid="team-search-input"
            type="text"
            placeholder="Search team... (/)"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{
              height: '28px',
              paddingLeft: '28px',
              paddingRight: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              width: '160px',
              outline: 'none',
              transition: 'width var(--duration-fast) ease, border-color var(--duration-fast) ease'
            }}
            onFocus={(e) => {
              e.target.style.width = '220px';
              e.target.style.borderColor = 'var(--border-focus)';
            }}
            onBlur={(e) => {
              if (!searchQuery) {
                e.target.style.width = '160px';
              }
              e.target.style.borderColor = 'var(--border-default)';
            }}
          />
        </div>

        {/* Favorite toggle */}
        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onToggleFavorite}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            backgroundColor: isFavorite ? 'var(--bg-surface-raised)' : 'transparent',
            color: isFavorite ? 'var(--accent-amber)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Create Action */}
        <button
          type="button"
          data-testid="team-quick-create-btn"
          aria-label="Create Team Item"
          onClick={onOpenQuickCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '28px',
            padding: '0 var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-base)',
            color: 'var(--text-inverse)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={14} />
          <span>Create Item</span>
        </button>

        {/* Permission-gated Settings Action */}
        {canManageSettings && (
          <button
            type="button"
            data-testid="team-settings-btn"
            aria-label="Team Settings"
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <Settings size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
