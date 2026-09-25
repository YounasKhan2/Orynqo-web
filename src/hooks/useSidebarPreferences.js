import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  COLLAPSED: 'orynqo:pref:sidebar_collapsed',
  DENSITY: 'orynqo:pref:density',
  SECTIONS: 'orynqo:pref:expanded_sections',
  PROJECTIONS: 'orynqo:pref:projections'
};

const DEFAULT_SECTIONS = {
  personal: true,
  favorites: true,
  workspace: true,
  teams: true
};

/**
 * useSidebarPreferences Hook
 * Manages persistent user preferences for sidebar layout, density, and section disclosures.
 * Keeps presentation preferences isolated behind a clear boundary without coupling to domain data.
 */
export function useSidebarPreferences() {
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COLLAPSED);
      return stored !== null ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Table row density ('compact' | 'default')
  const [density, setDensityState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DENSITY);
      return stored === 'default' ? 'default' : 'compact';
    } catch {
      return 'compact';
    }
  });

  // Collapsible section visibility
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      return stored ? { ...DEFAULT_SECTIONS, ...JSON.parse(stored) } : DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  // Per-resource projection preferences
  const [projectionPreferences, setProjectionPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTIONS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sync isSidebarCollapsed to localStorage
  const setIsSidebarCollapsed = useCallback((val) => {
    setIsSidebarCollapsedState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem(STORAGE_KEYS.COLLAPSED, JSON.stringify(next));
      } catch {
        // Ignore localStorage quota errors
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, [setIsSidebarCollapsed]);

  // Sync density to localStorage
  const setDensity = useCallback((val) => {
    setDensityState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem(STORAGE_KEYS.DENSITY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity((prev) => (prev === 'compact' ? 'default' : 'compact'));
  }, [setDensity]);

  // Sync section toggles
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => {
      const next = { ...prev, [sectionKey]: !prev[sectionKey] };
      try {
        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Save projection preference for a specific resource
  const setProjectionPreference = useCallback((resourceKey, projectionId) => {
    setProjectionPreferences((prev) => {
      const next = { ...prev, [resourceKey]: projectionId };
      try {
        localStorage.setItem(STORAGE_KEYS.PROJECTIONS, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const getProjectionPreference = useCallback(
    (resourceKey, fallback = 'data-grid') => {
      return projectionPreferences[resourceKey] || fallback;
    },
    [projectionPreferences]
  );

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    density,
    setDensity,
    toggleDensity,
    expandedSections,
    toggleSection,
    setProjectionPreference,
    getProjectionPreference
  };
}
