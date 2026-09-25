import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * SidebarSection Component
 * Collapsible section container with header and progressive disclosure.
 */
export function SidebarSection({
  title,
  count,
  isExpanded = true,
  onToggle,
  isCollapsed = false,
  children
}) {
  if (isCollapsed) {
    return (
      <div
        style={{
          padding: '4px 0',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          alignItems: 'center'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
      {/* Section Header */}
      {title && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '24px',
            padding: '0 8px',
            background: 'none',
            border: 'none',
            fontSize: '10px',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            textAlign: 'left',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{title}</span>
            {count !== undefined && count > 0 && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({count})</span>
            )}
          </div>
          {onToggle && (
            <span style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center' }}>
              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </span>
          )}
        </button>
      )}

      {/* Section Children */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
