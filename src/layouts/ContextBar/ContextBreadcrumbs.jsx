import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';

/**
 * ContextBreadcrumbs Component
 * Navigable breadcrumb trail adhering strictly to UI-02A contract:
 * - Label: Direct navigation to ancestor container
 * - Chevron: Opens sibling/context switcher popover
 */
export function ContextBreadcrumbs({
  crumbs = [],
  onNavigate
}) {
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (activeMenuIndex === null) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuIndex]);

  return (
    <nav aria-label="Breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {crumbs.map((rawCrumb, idx) => {
        const crumb = typeof rawCrumb === 'string' ? { id: rawCrumb, label: rawCrumb } : rawCrumb;
        const isLast = idx === crumbs.length - 1;
        const hasSiblings = crumb.siblings && crumb.siblings.length > 1;

        return (
          <React.Fragment key={crumb.id || crumb.label}>
            {/* Ancestor / Current Label */}
            <button
              type="button"
              onClick={() => {
                if (crumb.onClick) crumb.onClick();
                else if (crumb.path) onNavigate?.(crumb.path);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                borderRadius: 'var(--radius-xs)',
                fontSize: 'var(--text-xs)',
                fontWeight: isLast ? 'var(--font-semibold)' : 'var(--font-regular)',
                color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: isLast ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                userSelect: 'none'
              }}
            >
              {crumb.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{crumb.icon}</span>}
              <span>{crumb.label}</span>
            </button>

            {/* Separator / Sibling Switcher Chevron */}
            {!isLast && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (hasSiblings) {
                      setActiveMenuIndex(activeMenuIndex === idx ? null : idx);
                    }
                  }}
                  title={hasSiblings ? `Switch ${crumb.label} sibling` : undefined}
                  aria-label={hasSiblings ? `Switch ${crumb.label}` : 'Breadcrumb separator'}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    color: hasSiblings ? 'var(--text-secondary)' : 'var(--text-muted)',
                    cursor: hasSiblings ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <ChevronRight size={12} />
                </button>

                {/* Sibling Dropdown Popover */}
                {hasSiblings && activeMenuIndex === idx && (
                  <div
                    ref={menuRef}
                    role="menu"
                    aria-label={`Select ${crumb.label} sibling`}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '0',
                      width: '180px',
                      backgroundColor: 'var(--bg-modal)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-popover)',
                      zIndex: 150,
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    {crumb.siblings.map((sibling) => {
                      const isSelected = sibling.id === crumb.id;
                      return (
                        <button
                          key={sibling.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            sibling.onSelect?.();
                            setActiveMenuIndex(null);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: isSelected ? 'var(--bg-surface-selected)' : 'none',
                            border: 'none',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: 'var(--text-xs)',
                            color: isSelected ? 'var(--primary-base)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span className="truncate">{sibling.name || sibling.label}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
