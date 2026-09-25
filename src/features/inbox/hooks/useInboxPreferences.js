import { useState, useCallback } from 'react';

const STORAGE_KEY = 'orynqo.inboxPreferences.v1';

const DEFAULTS = {
  activeTab: 'focus', // 'focus' | 'all' | 'later' | 'archive'
  isUnreadOnly: false,
  importanceFilter: null, // 'focus' | 'normal' | null
  responseRequiredOnly: false,
  eventTypeFilter: null,
  sourceTypeFilter: null,
  sortBy: 'newest', // 'newest' | 'focus_first'
  snoozePreset: 'tomorrow'
};

function readPrefs() {
  if (typeof localStorage === 'undefined') return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

/**
 * useInboxPreferences Hook (UI-04B)
 * Completely isolated from Sidebar and My Work preferences.
 */
export function useInboxPreferences() {
  const [prefs, setPrefs] = useState(readPrefs);

  const persist = useCallback((updater) => {
    setPrefs((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return {
    preferences: prefs,
    activeTab: prefs.activeTab,
    setActiveTab: (activeTab) => persist((prev) => ({ ...prev, activeTab })),
    isUnreadOnly: prefs.isUnreadOnly,
    setIsUnreadOnly: (isUnreadOnly) => persist((prev) => ({ ...prev, isUnreadOnly })),
    importanceFilter: prefs.importanceFilter,
    setImportanceFilter: (importanceFilter) => persist((prev) => ({ ...prev, importanceFilter })),
    responseRequiredOnly: prefs.responseRequiredOnly,
    setResponseRequiredOnly: (responseRequiredOnly) =>
      persist((prev) => ({ ...prev, responseRequiredOnly })),
    sortBy: prefs.sortBy,
    setSortBy: (sortBy) => persist((prev) => ({ ...prev, sortBy })),
    resetFilters: () =>
      persist((prev) => ({
        ...prev,
        isUnreadOnly: false,
        importanceFilter: null,
        responseRequiredOnly: false,
        eventTypeFilter: null,
        sourceTypeFilter: null
      }))
  };
}
