/**
 * Keyboard Scopes & Ownership Contract
 *
 * Explicit Hierarchy:
 * GLOBAL
 *   ↓
 * PAGE / VIEW
 *   ↓
 * OVERLAY
 *   ↓
 * EDITABLE CONTROL
 *
 * Precedence Rules:
 * 1. EDITABLE CONTROL (Highest Isolation):
 *    - Triggered when active element is INPUT, TEXTAREA, SELECT, or contenteditable.
 *    - All single-key navigation shortcuts (c, i, j, k, x, s, p, e, 1-5, ?) are suppressed.
 *    - Escape blurs the active control.
 *
 * 2. OVERLAY (Modal Precedence):
 *    - Triggered when an overlay is open (Command Palette, Create Modal, Shortcuts Modal, Dialogs).
 *    - Overlay handles its own keys (ArrowUp/Down and Enter in Command Palette; Escape to close).
 *    - Lower-priority PAGE / VIEW shortcuts (DataGrid j/k/x/s/p, Triage j/k/e) are strictly suppressed.
 *    - Global view switches (1-5) and quick create (c) are suppressed.
 *
 * 3. PAGE / VIEW (Contextual View Shortcuts):
 *    - Triggered when no overlay is active and focus is not inside an editable control.
 *    - Active projection handles view-specific power user navigation (DataGrid rows, Triage items).
 *
 * 4. GLOBAL (Shell Shortcuts):
 *    - Shell-level actions: Cmd+K / Ctrl+K (Palette), Cmd+[ / Ctrl+[ (Sidebar), Escape (Topmost layer).
 *    - Single-key actions (c, i, ?, 1-5) execute only when no overlay and no editable control is active.
 */

export const KEYBOARD_SCOPES = {
  EDITABLE: 'EDITABLE_CONTROL',
  OVERLAY: 'OVERLAY',
  VIEW: 'PAGE_VIEW',
  GLOBAL: 'GLOBAL'
};

/**
 * Registry of active PAGE / VIEW level keyboard handlers.
 * Allows pages/views (such as Personal Inbox) to participate cleanly in the
 * centralized keyboard architecture without creating competing window listeners.
 */
let activeViewHandler = null;

export function registerViewKeyboardHandler(handler) {
  activeViewHandler = handler;
  return () => {
    if (activeViewHandler === handler) {
      activeViewHandler = null;
    }
  };
}

export function dispatchViewKeyboardEvent(e) {
  if (activeViewHandler && typeof activeViewHandler === 'function') {
    return activeViewHandler(e);
  }
  return false;
}

/**
 * Checks whether an event target is an active text entry or editable surface.
 * Handles standard form controls and rich text contenteditable containers.
 */
export function isEditableElement(element) {
  if (!element || !element.tagName) return false;
  const tag = element.tagName.toUpperCase();
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
    return true;
  }
  if (
    element.isContentEditable ||
    element.getAttribute?.('contenteditable') === 'true' ||
    element.getAttribute?.('contenteditable') === ''
  ) {
    return true;
  }
  return false;
}

