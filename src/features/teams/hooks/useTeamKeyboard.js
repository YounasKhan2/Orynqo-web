import { useEffect, useCallback } from 'react';
import { isEditableElement, registerViewKeyboardHandler } from '../../../hooks/keyboardScopes';

/**
 * useTeamKeyboard Hook (TEM-001)
 *
 * Implements centralized PAGE/VIEW keyboard navigation for Team surfaces:
 * - 1-6: Switch ResourceNav tabs (Overview, Work, Cycles, Projects, Docs, Members)
 * - /: Focus team contextual search
 * - Escape: Close context / blur
 *
 * Invariant: Centralized registration into PAGE/VIEW scope without feature-owned window listeners.
 */
export function useTeamKeyboard({
  isActive = true,
  availableTabs = [],
  activeTab,
  onSelectTab,
  onFocusSearch
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!isActive) return false;

      // 1. Highest Isolation: Suppress shortcuts inside editable controls
      if (isEditableElement(e.target)) {
        if (e.key === 'Escape') {
          e.target.blur?.();
          return true;
        }
        return false;
      }

      // 2. Overlay Scope: Suppress if modal/dialog is open
      if (document.querySelector('[data-keyboard-scope="OVERLAY"]')) {
        return false;
      }

      // Tab switching via number keys 1-6
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= availableTabs.length && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const targetTab = availableTabs[num - 1];
        if (targetTab && targetTab.id !== activeTab) {
          onSelectTab?.(targetTab.id);
        }
        return true;
      }

      // Focus search via '/'
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusSearch?.();
        return true;
      }

      return false;
    },
    [isActive, availableTabs, activeTab, onSelectTab, onFocusSearch]
  );

  useEffect(() => {
    if (!isActive) return;
    return registerViewKeyboardHandler(handleKeyDown);
  }, [isActive, handleKeyDown]);
}
