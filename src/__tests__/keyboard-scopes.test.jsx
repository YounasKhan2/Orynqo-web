import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, render } from '@testing-library/react';
import { isEditableElement } from '../hooks/keyboardScopes';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

describe('Keyboard Scopes & Precedence', () => {
  describe('isEditableElement detection', () => {
    it('identifies standard HTML form controls as editable', () => {
      const input = document.createElement('input');
      const textarea = document.createElement('textarea');
      const select = document.createElement('select');

      expect(isEditableElement(input)).toBe(true);
      expect(isEditableElement(textarea)).toBe(true);
      expect(isEditableElement(select)).toBe(true);
    });

    it('identifies contenteditable elements as editable', () => {
      const divWithAttr = document.createElement('div');
      divWithAttr.setAttribute('contenteditable', 'true');

      const spanWithBlankAttr = document.createElement('span');
      spanWithBlankAttr.setAttribute('contenteditable', '');

      expect(isEditableElement(divWithAttr)).toBe(true);
      expect(isEditableElement(spanWithBlankAttr)).toBe(true);
    });

    it('identifies standard non-editable elements as non-editable', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      const button = document.createElement('button');

      expect(isEditableElement(div)).toBe(false);
      expect(isEditableElement(span)).toBe(false);
      expect(isEditableElement(button)).toBe(false);
      expect(isEditableElement(null)).toBe(false);
    });
  });

  describe('Scope Precedence in useKeyboardShortcuts', () => {
    it('executes global single-key shortcuts when no overlay and no editable element active', () => {
      const onOpenCreateModal = vi.fn();
      const onSelectView = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          isOverlayActive: false,
          onOpenCreateModal,
          onSelectView
        })
      );

      // Press 'c' to create
      const eventC = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
      window.dispatchEvent(eventC);
      expect(onOpenCreateModal).toHaveBeenCalledTimes(1);

      // Press '2' to switch view
      const event2 = new KeyboardEvent('keydown', { key: '2', bubbles: true });
      window.dispatchEvent(event2);
      expect(onSelectView).toHaveBeenCalledWith('kanban');
    });

    it('SUPPRESSES single-key shortcuts when isOverlayActive is true (OVERLAY SCOPE)', () => {
      const onOpenCreateModal = vi.fn();
      const onSelectView = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          isOverlayActive: true,
          onOpenCreateModal,
          onSelectView
        })
      );

      // Press 'c' while overlay is open
      const eventC = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
      window.dispatchEvent(eventC);
      expect(onOpenCreateModal).not.toHaveBeenCalled();

      // Press '2' while overlay is open
      const event2 = new KeyboardEvent('keydown', { key: '2', bubbles: true });
      window.dispatchEvent(event2);
      expect(onSelectView).not.toHaveBeenCalled();
    });

    it('SUPPRESSES single-key shortcuts when typing in an editable element (EDITABLE SCOPE)', () => {
      const onOpenCreateModal = vi.fn();
      const onSelectView = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          isOverlayActive: false,
          onOpenCreateModal,
          onSelectView
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);

      // Dispatch 'c' targeted at input
      const eventC = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
      Object.defineProperty(eventC, 'target', { value: input });
      window.dispatchEvent(eventC);

      expect(onOpenCreateModal).not.toHaveBeenCalled();

      // Dispatch 'c' targeted at contenteditable
      const editableDiv = document.createElement('div');
      editableDiv.setAttribute('contenteditable', 'true');
      document.body.appendChild(editableDiv);

      const eventDiv = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
      Object.defineProperty(eventDiv, 'target', { value: editableDiv });
      window.dispatchEvent(eventDiv);

      expect(onOpenCreateModal).not.toHaveBeenCalled();

      document.body.removeChild(input);
      document.body.removeChild(editableDiv);
    });
  });
});
