import { useEffect } from 'react';
import { isEditableElement } from './keyboardScopes';

export { isEditableElement, KEYBOARD_SCOPES } from './keyboardScopes';

/**
 * useKeyboardShortcuts Hook
 * Shell-level keyboard shortcut manager respecting explicit keyboard scopes:
 * GLOBAL -> PAGE/VIEW -> OVERLAY -> EDITABLE CONTROL
 */
export function useKeyboardShortcuts({
  isOverlayActive = false,
  onToggleCommandPalette,
  onToggleSidebar,
  onOpenCreateModal,
  onOpenShortcutsModal,
  onToggleInspector,
  onSelectView,
  onEscape
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. EDITABLE CONTROL SCOPE (Highest Isolation)
      // Ignore product shortcuts if typing in input, textarea, select, or contenteditable
      if (isEditableElement(e.target)) {
        if (e.key === 'Escape') {
          e.target.blur?.();
          onEscape?.();
        }
        return;
      }

      // 2. Escape: Closes active overlay or deselects
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // 3. Command + K / Ctrl + K: Toggle Command Palette (always allowed)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCommandPalette?.();
        return;
      }

      // 4. OVERLAY SCOPE: If an overlay is active, suppress all remaining global/view shortcuts
      if (isOverlayActive || Boolean(document.querySelector('[data-keyboard-scope="OVERLAY"]'))) {
        return;
      }

      // 5. GLOBAL SCOPE SHORTCUTS (Only when no overlay and not typing in editable control)

      // Command + [: Toggle Sidebar Collapse
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // 'c': Quick Create Item
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onOpenCreateModal?.();
        return;
      }

      // '?': Keyboard Shortcuts Modal
      if (e.key === '?') {
        e.preventDefault();
        onOpenShortcutsModal?.();
        return;
      }

      // 'i': Toggle Inspector Drawer
      if (e.key.toLowerCase() === 'i' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onToggleInspector?.();
        return;
      }

      // Number keys 1-5: Fast View Switching
      if (e.key === '1') { onSelectView?.('data-grid'); return; }
      if (e.key === '2') { onSelectView?.('kanban'); return; }
      if (e.key === '3') { onSelectView?.('timeline'); return; }
      if (e.key === '4') { onSelectView?.('living-spec'); return; }
      if (e.key === '5') { onSelectView?.('workload'); return; }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOverlayActive,
    onToggleCommandPalette,
    onToggleSidebar,
    onOpenCreateModal,
    onOpenShortcutsModal,
    onToggleInspector,
    onSelectView,
    onEscape
  ]);
}
