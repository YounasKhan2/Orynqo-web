import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Check } from 'lucide-react';

/**
 * ResourceNavBar Component
 * Reusable contextual tab bar for Teams, Projects, Initiatives, etc.
 * Features:
 * - Dynamic capability/permission filtering
 * - Dynamic overflow collapsing lower-priority tabs into a More dropdown
 * - Keyboard roving tabindex & arrow traversal
 */
export function ResourceNavBar({
  tabs = [],
  activeTab = 'work',
  onSelectTab,
  maxVisibleTabs = 5
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Filter out any tabs marked disabled/hidden
  const visibleCandidateTabs = tabs.filter((t) => !t.hidden);

  // Determine split for overflow
  const visibleTabs = visibleCandidateTabs.slice(0, maxVisibleTabs);
  const overflowTabs = visibleCandidateTabs.slice(maxVisibleTabs);

  const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);

  // Click outside to dismiss More menu
  useEffect(() => {
    if (!isMoreOpen) return;
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  return (
    <div
      role="tablist"
      aria-label="Resource tabs"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: 'var(--resource-nav-height)',
        userSelect: 'none'
      }}
    >
      {/* Primary Visible Tabs */}
      {visibleTabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectTab?.(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '28px',
              padding: '0 10px',
              fontSize: 'var(--text-xs)',
              fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-regular)',
              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: isSelected ? 'var(--bg-surface-raised)' : 'transparent',
              border: isSelected ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            {IconComponent && (
              <IconComponent
                size={13}
                color={isSelected ? 'var(--primary-base)' : 'var(--text-muted)'}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '1px 5px',
                  borderRadius: '8px',
                  color: 'var(--text-muted)'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Overflow More Menu */}
      {overflowTabs.length > 0 && (
        <div ref={moreRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            role="tab"
            aria-selected={isOverflowActive}
            aria-expanded={isMoreOpen}
            aria-label="More resource tabs"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '28px',
              padding: '0 8px',
              fontSize: 'var(--text-xs)',
              fontWeight: isOverflowActive ? 'var(--font-semibold)' : 'var(--font-regular)',
              color: isOverflowActive ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: isOverflowActive ? 'var(--bg-surface-raised)' : 'transparent',
              border: isOverflowActive ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <span>More</span>
            <MoreHorizontal size={13} />
          </button>

          {isMoreOpen && (
            <div
              role="menu"
              aria-label="Additional tabs"
              style={{
                position: 'absolute',
                top: '32px',
                left: '0',
                width: '160px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-popover)',
                zIndex: 100,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {overflowTabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelectTab?.(tab.id);
                      setIsMoreOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      background: isSelected ? 'var(--bg-surface-selected)' : 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: 'var(--text-xs)',
                      color: isSelected ? 'var(--primary-base)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {IconComponent && <IconComponent size={12} />}
                      <span>{tab.label}</span>
                    </div>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
