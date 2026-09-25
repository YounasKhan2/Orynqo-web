import React, { useState, useRef, useEffect } from 'react';
import { Check, Search, Plus, Settings, Building2 } from 'lucide-react';
import { WORKSPACES, CURRENT_ORGANIZATION } from '../../../data/mockData';

/**
 * WorkspaceSwitcherPopover Component
 * Multi-tenant / Multi-workspace selector.
 * Allows searching workspaces, inspecting active role, and switching collaborative boundary.
 */
export function WorkspaceSwitcherPopover({
  isOpen,
  onClose,
  currentWorkspaceId = 'wks-core',
  onSelectWorkspace,
  onOpenWorkspaceSettings,
  onCreateWorkspace
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredWorkspaces = WORKSPACES.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.slug.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredWorkspaces.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredWorkspaces[selectedIndex]) {
          onSelectWorkspace?.(filteredWorkspaces[selectedIndex]);
          onClose?.();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, filteredWorkspaces, selectedIndex, onSelectWorkspace]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Switch workspace"
      style={{
        position: 'absolute',
        top: '48px',
        left: '8px',
        width: '280px',
        backgroundColor: 'var(--bg-modal)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-popover)',
        zIndex: 200,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Organization Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Building2 size={13} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            {CURRENT_ORGANIZATION.name}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {CURRENT_ORGANIZATION.plan} Plan
          </span>
        </div>
      </div>

      {/* Search Input when scale warrants */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={12} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Find workspace..."
            style={{
              width: '100%',
              height: '26px',
              paddingLeft: '26px',
              paddingRight: '8px',
              fontSize: 'var(--text-xs)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Workspaces List */}
      <div
        role="listbox"
        aria-label="Available workspaces"
        style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}
      >
        {filteredWorkspaces.map((w, idx) => {
          const isSelected = w.id === currentWorkspaceId;
          const isFocused = idx === selectedIndex;
          return (
            <div
              key={w.id}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onSelectWorkspace?.(w);
                onClose?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                backgroundColor: isFocused
                  ? 'var(--bg-surface-hover)'
                  : isSelected
                  ? 'var(--bg-surface-selected)'
                  : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px' }}>{w.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)' }}>
                    {w.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {w.role}
                  </span>
                </div>
              </div>
              {isSelected && <Check size={13} color="var(--primary-base)" />}
            </div>
          );
        })}
        {filteredWorkspaces.length === 0 && (
          <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
            No workspaces found
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}
      >
        <button
          type="button"
          onClick={() => {
            onCreateWorkspace?.();
            onClose?.();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '26px',
            padding: '0 8px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Plus size={12} color="var(--text-muted)" />
          <span>Create Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenWorkspaceSettings?.();
            onClose?.();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '26px',
            padding: '0 8px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Settings size={12} color="var(--text-muted)" />
          <span>Workspace Settings</span>
        </button>
      </div>
    </div>
  );
}
