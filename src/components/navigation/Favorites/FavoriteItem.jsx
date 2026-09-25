import React from 'react';
import {
  Layers,
  Shield,
  Compass,
  FileText,
  Bookmark,
  Lock,
  X
} from 'lucide-react';

const ICON_MAP = {
  Layers,
  Shield,
  Compass,
  FileText,
  Bookmark,
  Lock
};

/**
 * FavoriteItem Component
 * Renders a polymorphic favorite target link with Zero-Leakage protection.
 */
export function FavoriteItem({
  favorite,
  target: rawTarget,
  isActive = false,
  isCollapsed = false,
  onSelect,
  onRemove
}) {
  const isRestricted = !rawTarget || rawTarget.isRestricted || rawTarget.isAccessible === false;
  const title = isRestricted
    ? 'Restricted Favorite (SYS-002)'
    : (rawTarget.title || rawTarget.name || 'Untitled');
  const IconComponent = isRestricted ? Lock : (ICON_MAP[rawTarget.icon] || Bookmark);

  return (
    <div
      role="button"
      tabIndex={isRestricted ? -1 : 0}
      aria-label={title}
      onClick={() => {
        if (!isRestricted) {
          onSelect?.(favorite);
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isRestricted) {
          e.preventDefault();
          onSelect?.(favorite);
        }
      }}
      title={isCollapsed ? title : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        height: 'var(--sidebar-item-height)',
        padding: isCollapsed ? '0' : '0 8px',
        backgroundColor: isActive ? 'var(--bg-surface-selected)' : 'transparent',
        borderRadius: 'var(--radius-xs)',
        fontSize: 'var(--text-xs)',
        color: isRestricted
          ? 'var(--text-disabled)'
          : isActive
          ? 'var(--text-primary)'
          : 'var(--text-secondary)',
        cursor: isRestricted ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <IconComponent
          size={13}
          color={isRestricted ? 'var(--text-disabled)' : 'var(--text-muted)'}
        />
        {!isCollapsed && (
          <span
            className="truncate"
            style={{
              fontStyle: isRestricted ? 'italic' : 'normal'
            }}
          >
            {title}
          </span>
        )}
      </div>

      {!isCollapsed && onRemove && !isRestricted && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(favorite.id);
          }}
          aria-label={`Remove ${title} from favorites`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.6
          }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
