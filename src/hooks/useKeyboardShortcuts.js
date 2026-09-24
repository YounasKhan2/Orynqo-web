import { useEffect } from 'react';

/**
 * useKeyboardShortcuts Hook
 * Centralized keyboard listener that ignores editable form controls
 */
export function useKeyboardShortcuts({
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
      // Ignore if user is currently typing in an input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
          onEscape?.();
        }
        return;
      }

      // Command + K: Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCommandPalette?.();
        return;
      }

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

      // Escape: Close topmost transient layer
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onToggleCommandPalette,
    onToggleSidebar,
    onOpenCreateModal,
    onOpenShortcutsModal,
    onToggleInspector,
    onSelectView,
    onEscape
  ]);
}
