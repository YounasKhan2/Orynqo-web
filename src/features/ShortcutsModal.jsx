import React from 'react';
import { X, Keyboard } from 'lucide-react';

/**
 * ShortcutsModal Component
 * Interactive keyboard shortcut reference guide for power users
 */
export function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'Navigation & Focus',
      items: [
        { key: '⌘K', label: 'Command Palette & Omnisearch' },
        { key: 'J / ↓', label: 'Move focus to next item' },
        { key: 'K / ↑', label: 'Move focus to previous item' },
        { key: '↵ (Enter)', label: 'Open inspector drawer for selected item' },
        { key: 'Esc', label: 'Close drawer, modal, or command palette' },
        { key: '⌘[', label: 'Toggle sidebar collapse' }
      ]
    },
    {
      group: 'Quick Item Editing (While Focused)',
      items: [
        { key: 'C', label: 'Create new work item' },
        { key: 'S', label: 'Cycle workflow status' },
        { key: 'P', label: 'Cycle priority' },
        { key: 'X', label: 'Select / deselect row for bulk actions' },
        { key: 'E', label: 'Archive notification (in Inbox)' }
      ]
    },
    {
      group: 'View Jumping',
      items: [
        { key: '1', label: 'Switch to Table / Data Grid view' },
        { key: '2', label: 'Switch to Kanban Board view' },
        { key: '3', label: 'Switch to Timeline / Gantt view' },
        { key: '4', label: 'Switch to Living Spec PRD' },
        { key: '5', label: 'Switch to Capacity / Workload view' }
      ]
    }
  ];

  return (
    <div
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
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '520px',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '40px',
            padding: '0 var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={14} color="var(--primary-base)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
              Keyboard Shortcuts Reference
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '420px', overflowY: 'auto' }}>
          {shortcutGroups.map((grp) => (
            <div key={grp.group} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {grp.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {grp.items.map((it) => (
                  <div
                    key={it.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-xs)',
                      padding: '2px 0'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{it.label}</span>
                    <span className="kbd-shortcut" style={{ minWidth: '24px' }}>{it.key}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
