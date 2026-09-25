import { useCallback, useState } from 'react';

const STORAGE_KEY = 'orynqo.myWorkPreferences.v1';

const DEFAULTS = {
  activeTab: 'overview',
  projections: {
    assigned: 'data-grid',
    created: 'data-grid',
    subscribed: 'data-grid'
  },
  collapsedSections: {
    recentlyCompleted: true
  }
};

function readPrefs() {
  if (typeof localStorage === 'undefined') return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function useMyWorkPreferences() {
  const [prefs, setPrefs] = useState(readPrefs);

  const persist = useCallback((updater) => {
    setPrefs((prev) => {
      const next = updater(prev);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return {
    activeTab: prefs.activeTab,
    setActiveTab: (activeTab) => persist((prev) => ({ ...prev, activeTab })),
    getProjection: (tab) => prefs.projections?.[tab] || 'data-grid',
    setProjection: (tab, projection) =>
      persist((prev) => ({
        ...prev,
        projections: { ...prev.projections, [tab]: projection }
      })),
    collapsedSections: prefs.collapsedSections || {},
    toggleSection: (sectionId) =>
      persist((prev) => ({
        ...prev,
        collapsedSections: {
          ...prev.collapsedSections,
          [sectionId]: !prev.collapsedSections?.[sectionId]
        }
      }))
  };
}
