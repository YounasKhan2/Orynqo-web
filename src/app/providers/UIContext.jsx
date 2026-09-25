import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeView, setActiveView] = useState('data-grid');
  const [density, setDensity] = useState('compact');

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    project: 'all'
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleInspector = () => {
    setIsInspectorOpen((prev) => !prev);
  };

  const toggleDensity = () => {
    setDensity((prev) => (prev === 'compact' ? 'default' : 'compact'));
  };

  const updateFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const resetFilters = () => {
    setFilters({ status: 'all', priority: 'all', assignee: 'all', project: 'all' });
    setSearchQuery('');
  };

  // Derived overlay active state for keyboard scoping
  const isOverlayActive = isCommandPaletteOpen || isCreateModalOpen || isShortcutsModalOpen;

  const value = {
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    setIsSidebarCollapsed,
    isInspectorOpen,
    toggleInspector,
    setIsInspectorOpen,
    activeView,
    setActiveView,
    density,
    toggleDensity,
    isOverlayActive,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    resetFilters
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
