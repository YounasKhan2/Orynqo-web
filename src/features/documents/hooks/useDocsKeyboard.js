import { useEffect } from 'react';
import { registerViewKeyboardHandler } from '../../../hooks/keyboardScopes';

/**
 * useDocsKeyboard Hook
 *
 * Registers PAGE / VIEW level keyboard shortcuts for Docs Hub when active.
 * Centralized keyboard hierarchy:
 * GLOBAL -> PAGE / VIEW -> OVERLAY -> EDITABLE CONTROL
 *
 * @param {Object} options
 * @param {boolean} options.isActive
 * @param {Function} options.onFocusSearch
 * @param {Function} options.onCreateDocument
 */
export function useDocsKeyboard({
  isActive = false,
  onFocusSearch,
  onCreateDocument
} = {}) {
  useEffect(() => {
    if (!isActive) return;

    const unregister = registerViewKeyboardHandler((e) => {
      // '/' focuses search when at hub level (not inside input)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusSearch?.();
        return true;
      }

      // 'c' or 'n' creates document
      if ((e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'n') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onCreateDocument?.();
        return true;
      }

      return false;
    });

    return unregister;
  }, [isActive, onFocusSearch, onCreateDocument]);
}
