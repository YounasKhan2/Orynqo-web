import { useState, useCallback, useEffect, useMemo } from 'react';
import { TEAMS } from '../data/mockData';

const VALID_PROJECTIONS = ['data-grid', 'kanban', 'timeline', 'workload'];

/**
 * useNavigationState Hook
 * Authoritative resolver for URL / Navigation state, active resource container,
 * resource sub-tab, and projection resolution precedence.
 *
 * Precedence Rule:
 * Explicit URL (?view=...) >> Saved User Preference >> Resource Default ('data-grid')
 */
export function useNavigationState({
  initialScope = 'teams',
  initialTeamId = 'team-core',
  initialTab = 'work',
  initialProjection = 'data-grid',
  getProjectionPreference,
  setProjectionPreference,
  isInspectorOpen: externalIsInspectorOpen,
  setIsInspectorOpen: externalSetIsInspectorOpen
} = {}) {
  // Navigation coordinates
  const [activeScope, setActiveScope] = useState(initialScope);
  const [activeTeamId, setActiveTeamId] = useState(initialTeamId);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeCycleId, setActiveCycleId] = useState(null);
  const [activeDocId, setActiveDocId] = useState(null);
  const [activeViewId, setActiveViewId] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Inspector and selection
  const [internalIsInspectorOpen, setInternalIsInspectorOpen] = useState(false);
  const isInspectorOpen = externalIsInspectorOpen !== undefined ? externalIsInspectorOpen : internalIsInspectorOpen;
  const setIsInspectorOpen = externalSetIsInspectorOpen || setInternalIsInspectorOpen;
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deepLinkedItemRef, setDeepLinkedItemRef] = useState(null);

  // Mobile navigation drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Parse URL query parameters if in browser environment
  const parseUrlParams = useCallback(() => {
    if (typeof window === 'undefined' || !window.location) return {};
    try {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      return {
        view: params.get('view'),
        item: params.get('item'),
        tab: params.get('tab')
      };
    } catch {
      return {};
    }
  }, []);

  const [urlParams, setUrlParams] = useState(parseUrlParams);

  // Listen to popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlParams();
      setUrlParams(parsed);
      if (parsed.item) {
        setDeepLinkedItemRef(parsed.item);
        setIsInspectorOpen(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseUrlParams]);

  // Sync ?item= parameter to deepLinkedItemRef on initial mount
  useEffect(() => {
    const parsed = parseUrlParams();
    if (parsed.item) {
      setDeepLinkedItemRef(parsed.item);
      setIsInspectorOpen(true);
    }
  }, [parseUrlParams]);

  // Compute resource key for projection preference lookup
  const currentResourceKey = useMemo(() => {
    if (activeScope === 'teams' && activeTeamId) return `team:${activeTeamId}`;
    if (activeScope === 'projects' && activeProjectId) return `project:${activeProjectId}`;
    return activeScope;
  }, [activeScope, activeTeamId, activeProjectId]);

  // Projection Precedence: URL ?view= >> saved preference >> resource default
  const [rawProjection, setRawProjection] = useState(initialProjection);

  const activeProjection = useMemo(() => {
    // 1. Explicit URL parameter
    if (urlParams.view && VALID_PROJECTIONS.includes(urlParams.view)) {
      return urlParams.view;
    }
    // 2. Saved user preference
    if (getProjectionPreference) {
      const saved = getProjectionPreference(currentResourceKey, null);
      if (saved && VALID_PROJECTIONS.includes(saved)) {
        return saved;
      }
    }
    // 3. Fallback to state or resource default
    return VALID_PROJECTIONS.includes(rawProjection) ? rawProjection : 'data-grid';
  }, [urlParams.view, getProjectionPreference, currentResourceKey, rawProjection]);

  // Select projection with preference saving
  const selectProjection = useCallback(
    (projectionId) => {
      if (!VALID_PROJECTIONS.includes(projectionId)) return;
      setRawProjection(projectionId);
      if (setProjectionPreference) {
        setProjectionPreference(currentResourceKey, projectionId);
      }
      // Update URL query param if permitted
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('view', projectionId);
          window.history.replaceState({}, '', url.toString());
          setUrlParams((prev) => ({ ...prev, view: projectionId }));
        } catch {
          // Ignore
        }
      }
    },
    [currentResourceKey, setProjectionPreference]
  );

  // Inspector item selection with deep-link sync
  const selectItemForInspector = useCallback((itemOrId) => {
    const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
    setSelectedItemId(id);
    setIsInspectorOpen(true);
    setDeepLinkedItemRef(id);

    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        if (id) {
          url.searchParams.set('item', id);
        } else {
          url.searchParams.delete('item');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore
      }
    }
  }, []);

  const closeInspector = useCallback(() => {
    setIsInspectorOpen(false);
    setDeepLinkedItemRef(null);
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('item');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore
      }
    }
  }, []);

  // Canonical navigation action
  const navigate = useCallback((dest) => {
    if (!dest) return;
    if (typeof dest === 'string') {
      // Shorthand string routes
      if (dest === 'inbox' || dest === '/inbox') {
        setActiveScope('inbox');
        setActiveTab('inbox');
      } else if (dest === 'my-work' || dest === 'my-issues' || dest === '/my-work') {
        setActiveScope('my-work');
        setActiveTab('assigned');
      } else if (dest === 'initiatives' || dest === '/initiatives') {
        setActiveScope('initiatives');
        setActiveTab('overview');
      } else if (dest === 'docs' || dest === '/docs') {
        setActiveScope('docs');
        setActiveTab('all');
      } else if (dest === 'views' || dest === '/views') {
        setActiveScope('views');
        setActiveTab('all');
      } else if (dest === 'teams' || dest === '/teams') {
        setActiveScope('teams-directory');
        setActiveTab('directory');
      } else if (dest === 'projects' || dest === '/projects') {
        setActiveScope('projects-directory');
        setActiveTab('directory');
      }
    } else {
      if (dest.scope) setActiveScope(dest.scope);
      if (dest.teamId !== undefined) setActiveTeamId(dest.teamId);
      if (dest.projectId !== undefined) setActiveProjectId(dest.projectId);
      if (dest.cycleId !== undefined) setActiveCycleId(dest.cycleId);
      if (dest.docId !== undefined) setActiveDocId(dest.docId);
      if (dest.viewId !== undefined) setActiveViewId(dest.viewId);
      if (dest.tab !== undefined) setActiveTab(dest.tab);
    }
    // Close mobile drawer upon navigating
    setIsMobileNavOpen(false);
  }, []);

  // Compute active team object
  const activeTeam = useMemo(() => {
    return TEAMS.find((t) => t.id === activeTeamId) || TEAMS[0];
  }, [activeTeamId]);

  return {
    activeScope,
    setActiveScope,
    activeTeamId,
    setActiveTeamId,
    activeTeam,
    activeProjectId,
    setActiveProjectId,
    activeCycleId,
    setActiveCycleId,
    activeDocId,
    setActiveDocId,
    activeViewId,
    setActiveViewId,
    activeTab,
    setActiveTab,
    activeProjection,
    selectProjection,
    isInspectorOpen,
    setIsInspectorOpen,
    selectedItemId,
    setSelectedItemId,
    deepLinkedItemRef,
    selectItemForInspector,
    closeInspector,
    isMobileNavOpen,
    setIsMobileNavOpen,
    navigate
  };
}
