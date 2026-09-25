import React from 'react';
import { Kbd } from '../../design-system';

/**
 * SidebarItem Component
 * High-density navigation link with icon, label, badge, and keyboard hint.
 */
export function SidebarItem({
  icon: IconComponent,
  label,
  badge,
  shortcut,
  isActive = false,
  isCollapsed = false,
  onClick,
  color
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? (shortcut ? `${label} (${shortcut})` : label) : undefined}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        height: 'var(--sidebar-item-height)',
        padding: isCollapsed ? '0' : '0 8px',
        backgroundColor: isActive ? 'var(--bg-surface-selected)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-xs)',
        fontSize: 'var(--text-xs)',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        userSelect: 'none',
        position: 'relative',
        transition: 'background-color var(--duration-fast) ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {IconComponent && (
          <IconComponent
            size={13}
            color={color || (isActive ? 'var(--primary-base)' : 'var(--text-muted)')}
          />
        )}
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>

      {!isCollapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {badge !== undefined && badge !== null && badge > 0 && (
            <span
              style={{
                fontSize: '10px',
                backgroundColor: 'var(--primary-base)',
                color: '#ffffff',
                padding: '1px 5px',
                borderRadius: '10px',
                fontWeight: 'var(--font-semibold)',
                lineHeight: 1
              }}
            >
              {badge}
            </span>
          )}
          {shortcut && <Kbd>{shortcut}</Kbd>}
        </div>
      )}
    </button>
  );
}
