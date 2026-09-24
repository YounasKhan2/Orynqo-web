import React from 'react';
import { Keyboard } from 'lucide-react';
import { Dialog, Kbd } from '../../design-system';

/**
 * ShortcutsModal Product Component
 * Interactive keyboard shortcut reference guide using Dialog primitive
 */
export function ShortcutsModal({ isOpen, onClose }) {
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts Reference"
      icon={Keyboard}
      width="520px"
    >
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
                  <Kbd>{it.key}</Kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
