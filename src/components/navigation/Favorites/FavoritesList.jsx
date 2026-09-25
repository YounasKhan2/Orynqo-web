import React from 'react';
import { FavoriteItem } from './FavoriteItem';

/**
 * FavoritesList Component
 * Renders user's pinned shortcuts across projects, teams, docs, and views.
 */
export function FavoritesList({
  favorites = [],
  resolveTarget,
  activeTargetId,
  isCollapsed = false,
  onSelectFavorite,
  onRemoveFavorite
}) {
  if (favorites.length === 0) {
    if (isCollapsed) return null;
    return (
      <div
        style={{
          padding: '6px 8px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontStyle: 'italic'
        }}
      >
        Pin projects & docs here
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {favorites.map((fav) => {
        const target = resolveTarget(fav);
        const isActive = activeTargetId === fav.targetId;
        return (
          <FavoriteItem
            key={fav.id}
            favorite={fav}
            target={target}
            isActive={isActive}
            isCollapsed={isCollapsed}
            onSelect={onSelectFavorite}
            onRemove={onRemoveFavorite}
          />
        );
      })}
    </div>
  );
}
