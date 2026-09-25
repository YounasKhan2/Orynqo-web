import { useState, useCallback } from 'react';
import { INITIAL_FAVORITES, TEAMS, PROJECTS, INITIATIVES, LIVING_DOCUMENTS } from '../data/mockData';

/**
 * useFavorites Hook
 * Prototype server/domain state adapter for the generic FavoritePointer model.
 *
 * Invariant: Favorites are authoritative server/domain data, not purely localStorage.
 * Optimistic reordering updates client state immediately and supports rollback on failure.
 * Enforces zero-leakage placeholders for restricted/inaccessible targets (SYS-002).
 */
export function useFavorites(initialData = INITIAL_FAVORITES) {
  const [favorites, setFavorites] = useState(() => initialData);

  const addFavorite = useCallback((pointer) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.targetType === pointer.targetType && f.targetId === pointer.targetId)) {
        return prev;
      }
      const newFav = {
        id: pointer.id || `fav-${Date.now()}`,
        userId: pointer.userId || 'usr-1',
        workspaceId: pointer.workspaceId || 'wks-core',
        targetType: pointer.targetType,
        targetId: pointer.targetId,
        title: pointer.title || 'Untitled Resource',
        icon: pointer.icon || 'Bookmark',
        position: prev.length + 1
      };
      return [...prev, newFav];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id && f.targetId !== id));
  }, []);

  const reorderFavorite = useCallback((id, newPosition, onRollback) => {
    setFavorites((prev) => {
      const original = [...prev];
      const targetIndex = prev.findIndex((f) => f.id === id);
      if (targetIndex === -1) return prev;

      const item = prev[targetIndex];
      const next = prev.filter((f) => f.id !== id);
      next.splice(newPosition - 1, 0, item);

      // Re-index positions
      const reindexed = next.map((f, idx) => ({ ...f, position: idx + 1 }));

      // If simulated failure callback provided, trigger rollback
      if (onRollback) {
        setTimeout(() => {
          onRollback(() => setFavorites(original));
        }, 100);
      }

      return reindexed;
    });
  }, []);

  const isFavorited = useCallback(
    (targetType, targetId) => {
      return favorites.some((f) => f.targetType === targetType && f.targetId === targetId);
    },
    [favorites]
  );

  /**
   * Resolves target metadata with Zero-Leakage enforcement.
   * If target is restricted or inaccessible, returns a generic placeholder without leaking metadata.
   */
  const resolveTarget = useCallback((fav) => {
    if (fav.targetId === 'restricted' || fav.restricted) {
      return {
        id: fav.id,
        isRestricted: true,
        title: 'Restricted Item',
        icon: 'Lock',
        path: null
      };
    }

    switch (fav.targetType) {
      case 'team': {
        const team = TEAMS.find((t) => t.id === fav.targetId);
        return {
          id: fav.id,
          isRestricted: false,
          title: team ? team.name : fav.title,
          icon: team ? team.icon : 'Layers',
          path: `/teams/${fav.targetId}`
        };
      }
      case 'project': {
        const project = PROJECTS.find((p) => p.id === fav.targetId);
        return {
          id: fav.id,
          isRestricted: false,
          title: project ? project.name : fav.title,
          icon: 'Shield',
          path: `/projects/${fav.targetId}`
        };
      }
      case 'initiative': {
        const init = INITIATIVES.find((i) => i.id === fav.targetId);
        return {
          id: fav.id,
          isRestricted: false,
          title: init ? init.title : fav.title,
          icon: 'Compass',
          path: `/initiatives/${fav.targetId}`
        };
      }
      case 'doc': {
        const doc = LIVING_DOCUMENTS.find((d) => d.id === fav.targetId);
        return {
          id: fav.id,
          isRestricted: false,
          title: doc ? doc.title : fav.title,
          icon: 'FileText',
          path: `/docs/${fav.targetId}`
        };
      }
      default:
        return {
          id: fav.id,
          isRestricted: false,
          title: fav.title,
          icon: fav.icon || 'Bookmark',
          path: `/${fav.targetType}/${fav.targetId}`
        };
    }
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    reorderFavorite,
    isFavorited,
    resolveTarget
  };
}
