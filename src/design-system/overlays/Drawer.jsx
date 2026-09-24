import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Drawer Primitive (Domain-Neutral)
 * Context-preserving resizable or docked panel
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  headerActions,
  children,
  footer,
  width = '420px',
  side = 'right',
  isDocked = true,
  className = '',
  style = {}
}) {
  useEffect(() => {
    if (!isOpen || isDocked) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDocked, onClose]);

  if (!isOpen) return null;

  return (
    <aside
      role="complementary"
      aria-label={typeof title === 'string' ? title : 'Detail panel'}
      className={`drawer-primitive ${className}`}
      style={{
        width,
        minWidth: width,
        height: '100%',
        backgroundColor: 'var(--bg-drawer)',
        borderLeft: side === 'right' ? '1px solid var(--border-default)' : 'none',
        borderRight: side === 'left' ? '1px solid var(--border-default)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isDocked ? 'none' : 'var(--shadow-drawer)',
        zIndex: 30,
        overflow: 'hidden',
        position: isDocked ? 'relative' : 'fixed',
        top: 0,
        right: side === 'right' ? 0 : undefined,
        left: side === 'left' ? 0 : undefined,
        bottom: 0,
        ...style
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--header-height)',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {typeof title === 'string' ? (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
              {title}
            </span>
          ) : (
            title
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {headerActions}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close panel (Esc)"
              aria-label="Close panel"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
