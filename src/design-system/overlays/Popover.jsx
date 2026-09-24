import React, { useEffect, useRef } from 'react';

/**
 * Popover Primitive (Domain-Neutral)
 * Anchored container with outside-click detection and escape listener
 */
export function Popover({
  isOpen,
  onClose,
  children,
  align = 'left',
  width = 'auto',
  className = '',
  style = {}
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`popover-primitive ${className}`}
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: align === 'left' ? 0 : undefined,
        right: align === 'right' ? 0 : undefined,
        width,
        backgroundColor: 'var(--bg-modal)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-popover)',
        padding: '4px',
        zIndex: 100,
        ...style
      }}
    >
      {children}
    </div>
  );
}
