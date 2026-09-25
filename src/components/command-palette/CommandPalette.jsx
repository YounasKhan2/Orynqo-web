import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  Plus,
  Moon,
  Sun,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Kbd } from '../../design-system';
import { PriorityBadge, StatusBadge } from '../badges';

/**
 * CommandPalette Component (Cmd+K)
 * Universal launcher for keyboard-first navigation and actions
 */
export function CommandPalette({
  isOpen,
  onClose,
  items = [],
  onSelectItem,
  onOpenCreateModal,
  onSelectView,
  onNavigate,
  onToggleSidebar,
  onOpenWorkspaceSwitcher,
  onToggleTheme,
  theme
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const staticActions = [
    {
      id: 'act-create',
      type: 'action',
      title: 'Create new work item',
      category: 'Actions',
      shortcut: 'C',
      icon: Plus,
      run: () => { onClose?.(); onOpenCreateModal?.(); }
    },
    {
      id: 'act-inbox',
      type: 'action',
      title: 'Go to Inbox',
      category: 'Navigation',
      shortcut: 'G I',
      icon: CheckCircle2,
      run: () => { onClose?.(); if (onNavigate) onNavigate('inbox'); else onSelectView?.('inbox'); }
    },
    {
      id: 'act-my-work',
      type: 'action',
      title: 'Go to My Work',
      category: 'Navigation',
      shortcut: 'G M',
      icon: CheckCircle2,
      run: () => { onClose?.(); if (onNavigate) onNavigate('my-work'); else onSelectView?.('my-issues'); }
    },
    {
      id: 'act-browse-teams',
      type: 'action',
      title: 'Browse all teams...',
      category: 'Navigation',
      shortcut: 'G T',
      icon: Layers,
      run: () => { onClose?.(); if (onNavigate) onNavigate('teams'); }
    },
    {
      id: 'act-browse-projects',
      type: 'action',
      title: 'Browse projects...',
      category: 'Navigation',
      icon: Layers,
      run: () => { onClose?.(); if (onNavigate) onNavigate('projects'); }
    },
    {
      id: 'act-initiatives',
      type: 'action',
      title: 'Go to Initiatives',
      category: 'Navigation',
      icon: Layers,
      run: () => { onClose?.(); if (onNavigate) onNavigate('initiatives'); }
    },
    {
      id: 'act-docs',
      type: 'action',
      title: 'Go to Docs',
      category: 'Navigation',
      icon: FileText,
      run: () => { onClose?.(); if (onNavigate) onNavigate('docs'); else onSelectView?.('living-spec'); }
    },
    {
      id: 'act-views',
      type: 'action',
      title: 'Go to Saved Views',
      category: 'Navigation',
      icon: Layers,
      run: () => { onClose?.(); if (onNavigate) onNavigate('views'); }
    },
    {
      id: 'act-toggle-sidebar',
      type: 'action',
      title: 'Toggle Sidebar',
      category: 'Navigation',
      shortcut: '⌘[',
      icon: Layers,
      run: () => { onClose?.(); onToggleSidebar?.(); }
    },
    {
      id: 'act-switch-workspace',
      type: 'action',
      title: 'Switch Workspace...',
      category: 'Navigation',
      shortcut: '⌃⌥W',
      icon: Layers,
      run: () => { onClose?.(); onOpenWorkspaceSwitcher?.(); }
    },
    {
      id: 'act-view-table',
      type: 'action',
      title: 'Switch to Table View',
      category: 'Navigation',
      icon: Layers,
      run: () => { onClose?.(); onSelectView?.('data-grid'); }
    },
    {
      id: 'act-view-board',
      type: 'action',
      title: 'Switch to Kanban Board',
      category: 'Navigation',
      icon: CheckCircle2,
      run: () => { onClose?.(); onSelectView?.('kanban'); }
    },
    {
      id: 'act-view-timeline',
      type: 'action',
      title: 'Switch to Timeline / Gantt',
      category: 'Navigation',
      icon: Calendar,
      run: () => { onClose?.(); onSelectView?.('timeline'); }
    },
    {
      id: 'act-toggle-theme',
      type: 'action',
      title: `Toggle Theme (Current: ${theme})`,
      category: 'Settings',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => { onClose?.(); onToggleTheme?.(); }
    }
  ];

  const filteredWorkItems = items.filter(
    (item) =>
      item.identifier.toLowerCase().includes(query.toLowerCase()) ||
      item.title.toLowerCase().includes(query.toLowerCase())
  ).map((item) => ({
    id: item.id,
    type: 'item',
    identifier: item.identifier,
    title: item.title,
    category: 'Work Items',
    priority: item.priority,
    status: item.status,
    run: () => { onClose?.(); onSelectItem?.(item); }
  }));

  const filteredActions = staticActions.filter((act) =>
    act.title.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [...filteredActions, ...filteredWorkItems].slice(0, 10);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(allResults.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(allResults.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          allResults[selectedIndex].run();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxWidth: '92vw',
          backgroundColor: 'var(--bg-modal)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-default)',
            gap: 'var(--space-2)'
          }}
        >
          <Search size={16} color="var(--primary-base)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, item ID, or title..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <Kbd>ESC</Kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: 'var(--space-1-5)' }}>
          {allResults.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              No commands or work items found matching "{query}"
            </div>
          ) : (
            allResults.map((res, index) => {
              const isSelected = selectedIndex === index;
              const Icon = res.icon;

              return (
                <div
                  key={res.id}
                  onClick={res.run}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)'
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    {Icon && <Icon size={14} color={isSelected ? 'var(--primary-base)' : 'var(--text-muted)'} />}
                    {res.identifier && (
                      <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        {res.identifier}
                      </span>
                    )}
                    <span className="truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {res.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {res.priority && <PriorityBadge priorityId={res.priority} />}
                    {res.status && <StatusBadge statusId={res.status} />}
                    {res.shortcut && <Kbd>{res.shortcut}</Kbd>}
                    {isSelected && <ArrowRight size={12} color="var(--primary-base)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><Kbd>↑↓</Kbd> Navigate</span>
            <span><Kbd>↵</Kbd> Select</span>
          </div>
          <span>Orynqo Omnisearch Subsystem</span>
        </div>
      </div>
    </div>
  );
}
