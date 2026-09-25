import { useEffect, useCallback } from 'react';
import { isEditableElement, registerViewKeyboardHandler } from '../../../hooks/keyboardScopes';

/**
 * useInboxKeyboard Hook (UI-04A / UI-04B)
 *
 * Implements high-speed zero-mouse triage navigation:
 * - j / ArrowDown: Next item
 * - k / ArrowUp: Previous item
 * - Enter / Space: Open item / inspect / expand bundle
 * - e: Archive selected item
 * - u: Toggle read/unread state
 * - z: Snooze item (open snooze selector)
 * - r: Reply / Focus discussion in detail
 * - o: Open canonical source entity
 * - Escape: Close inspection / deselect
 *
 * Scope Invariant:
 * Strictly respects GLOBAL -> PAGE/VIEW -> OVERLAY -> EDITABLE CONTROL.
 * Registers centrally into the PAGE/VIEW scope without competing global listeners.
 */

export function useInboxKeyboard({
  isActive = true,
  items = [],
  selectedIndex = 0,
  onSelectIndex,
  onOpenItem,
  onArchiveItem,
  onToggleRead,
  onOpenSnooze,
  onReply,
  onOpenSource,
  onCloseDetail
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!isActive) return false;

      // 1. Highest Isolation: Suppress shortcuts inside editable controls
      if (isEditableElement(e.target)) {
        if (e.key === 'Escape') {
          e.target.blur?.();
          onCloseDetail?.();
          return true;
        }
        return false;
      }

      // Check if any modal/overlay is open
      if (document.querySelector('[data-keyboard-scope="OVERLAY"]')) {
        return false;
      }

      const activeItem = items[selectedIndex];

      // Navigation: J or ArrowDown
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length > 0) {
          onSelectIndex?.(Math.min(selectedIndex + 1, items.length - 1));
        }
        return true;
      }

      // Navigation: K or ArrowUp
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
          onSelectIndex?.(Math.max(selectedIndex - 1, 0));
        }
        return true;
      }

      // Open / Inspect: Enter or Space
      if (e.key === 'Enter' || (e.key === ' ' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        if (activeItem) {
          onOpenItem?.(activeItem);
        }
        return true;
      }

      // Archive: E
      if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeItem) {
          onArchiveItem?.(activeItem);
        }
        return true;
      }

      // Toggle Read: U
      if (e.key.toLowerCase() === 'u' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeItem) {
          onToggleRead?.(activeItem);
        }
        return true;
      }

      // Snooze: Z
      if (e.key.toLowerCase() === 'z' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeItem) {
          onOpenSnooze?.(activeItem);
        }
        return true;
      }

      // Reply: R
      if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeItem) {
          onReply?.(activeItem);
        }
        return true;
      }

      // Open Source: O
      if (e.key.toLowerCase() === 'o' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeItem) {
          onOpenSource?.(activeItem);
        }
        return true;
      }

      // Escape: Close detail / clear selection
      if (e.key === 'Escape') {
        onCloseDetail?.();
        return true;
      }

      return false;
    },
    [
      isActive,
      items,
      selectedIndex,
      onSelectIndex,
      onOpenItem,
      onArchiveItem,
      onToggleRead,
      onOpenSnooze,
      onReply,
      onOpenSource,
      onCloseDetail
    ]
  );

  // Centralized PAGE/VIEW registration
  useEffect(() => {
    if (!isActive) return;
    return registerViewKeyboardHandler(handleKeyDown);
  }, [isActive, handleKeyDown]);
}

