import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { KEYBOARD_SCOPES } from '../../hooks/keyboardScopes';

/**
 * PropertyPicker Component
 * Presentation shell for Universal Property Pickers.
 * Renders as a true overlay via React Portal with dynamic collision positioning.
 * Enforces OVERLAY keyboard scope and deterministic focus restoration to trigger.
 */
export function PropertyPicker({
  isOpen,
  onClose,
  triggerRef,
  children,
  width = 240, // tunable token
  maxHeight = 300,
  align = 'start', // 'start' | 'end'
  title,
  showFooterHints = true,
  className = '',
  style = {}
}) {
  const popoverRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom' });

  // Dynamic collision & viewport positioning
  const updatePosition = useCallback(() => {
    if (!triggerRef?.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();

    const popoverWidth = typeof width === 'number' ? width : 240;
    const popoverHeight = maxHeight || 300;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

    // Non-layout test environments where dimensions are not computed
    if (triggerRect.width === 0 && triggerRect.height === 0 && triggerRect.top === 0 && triggerRect.left === 0) {
      setCoords({ top: 0, left: 0, placement: 'bottom' });
      return;
    }

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    let placement = 'bottom';
    let top = triggerRect.bottom + 4;

    // Viewport collision: flip above if insufficient space below
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      placement = 'top';
      const actualHeight = popoverRef.current?.offsetHeight || popoverHeight;
      top = Math.max(8, triggerRect.top - 4 - actualHeight);
    }

    let left = align === 'end' ? triggerRect.right - popoverWidth : triggerRect.left;

    // Horizontal collision prevention
    if (left + popoverWidth > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - popoverWidth - 8);
    }
    if (left < 8) {
      left = 8;
    }

    setCoords({ top: Math.round(top), left: Math.round(left), placement });
  }, [triggerRef, width, maxHeight, align]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Focus trap & Outside click detection
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose, triggerRef]);

  // Global Escape key interception when open (OVERLAY scope)
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isOpen, onClose]);

  // Focus restoration to trigger element when closed
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      if (triggerRef?.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, triggerRef]);

  // Keyboard navigation interception (OVERLAY scope)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      // Suppress background single-key navigation from leaking
      if (['j', 'k', 'x', 'c', 'g'].includes(e.key.toLowerCase()) && e.target.tagName !== 'INPUT') {
        e.stopPropagation();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const popoverContent = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Property picker'}
      data-keyboard-scope={KEYBOARD_SCOPES.OVERLAY}
      onKeyDown={handleKeyDown}
      className={`property-picker-popover ${className}`}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 2000,
        width: typeof width === 'number' ? `${width}px` : width,
        maxHeight: `${maxHeight}px`,
        backgroundColor: 'var(--bg-modal, #18181b)',
        border: '1px solid var(--border-default, #27272a)',
        borderRadius: 'var(--radius-sm, 6px)',
        boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.4))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontSize: 'var(--text-xs, 12px)',
        userSelect: 'none',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {title && (
        <div
          style={{
            padding: '6px 8px',
            fontSize: '10px',
            fontWeight: 'var(--font-semibold, 600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
          }}
        >
          {title}
        </div>
      )}

      {children}

      {showFooterHints && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            fontSize: '9px',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--bg-surface, rgba(255, 255, 255, 0.02))'
          }}
        >
          <span>↑↓ to navigate</span>
          <span>↵ select • Esc close</span>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' && document.body
    ? createPortal(popoverContent, document.body)
    : popoverContent;
}
