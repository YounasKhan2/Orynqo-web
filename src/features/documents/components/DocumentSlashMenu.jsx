import React, { useState, useEffect, useRef } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Minus,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { BLOCK_TYPES } from '../model';

export const SLASH_COMMANDS = [
  { id: BLOCK_TYPES.HEADING_1, title: 'Heading 1', icon: Heading1, shortcut: '#' },
  { id: BLOCK_TYPES.HEADING_2, title: 'Heading 2', icon: Heading2, shortcut: '##' },
  { id: BLOCK_TYPES.HEADING_3, title: 'Heading 3', icon: Heading3, shortcut: '###' },
  { id: BLOCK_TYPES.BULLET_LIST_ITEM, title: 'Bullet List', icon: List, shortcut: '-' },
  { id: BLOCK_TYPES.ORDERED_LIST_ITEM, title: 'Numbered List', icon: ListOrdered, shortcut: '1.' },
  { id: BLOCK_TYPES.TASK_CHECKLIST_ITEM, title: 'Task Checklist', icon: CheckSquare, shortcut: '[]' },
  { id: BLOCK_TYPES.CODE_BLOCK, title: 'Code Block', icon: Code, shortcut: '```' },
  { id: BLOCK_TYPES.CALLOUT, title: 'Callout Box', icon: Quote, shortcut: '>' },
  { id: BLOCK_TYPES.DIVIDER, title: 'Divider', icon: Minus, shortcut: '---' },
  { id: 'entity-work-item', title: 'WorkItem Reference', icon: CheckCircle2, shortcut: '@' },
  { id: 'entity-document', title: 'Document Link', icon: FileText, shortcut: '[[' }
];

/**
 * DocumentSlashMenu Component
 *
 * Contextual insertion overlay triggered by '/' inside editor.
 * Operates under OVERLAY keyboard scope, handling ArrowUp/ArrowDown/Enter/Escape.
 */
export function DocumentSlashMenu({
  isOpen,
  onClose,
  onSelectCommand,
  filterText = '',
  position = { top: 0, left: 0 }
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredCommands[selectedIndex]) {
          onSelectCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedIndex, filteredCommands, onSelectCommand, onClose]);

  if (!isOpen || filteredCommands.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Insert block"
      data-keyboard-scope="OVERLAY"
      data-testid="document-slash-menu"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 50,
        width: '240px',
        backgroundColor: 'var(--bg-surface, #161b22)',
        border: '1px solid var(--border-default, #30363d)',
        borderRadius: 'var(--radius-md, 6px)',
        boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.4))',
        padding: '4px',
        maxHeight: '280px',
        overflowY: 'auto'
      }}
    >
      <div style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--text-muted, #8b949e)', fontWeight: 600, textTransform: 'uppercase' }}>
        Basic Blocks
      </div>
      {filteredCommands.map((cmd, idx) => {
        const Icon = cmd.icon;
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={cmd.id}
            role="option"
            aria-selected={isSelected}
            data-testid={`slash-option-${cmd.id}`}
            onClick={() => onSelectCommand(cmd)}
            onMouseEnter={() => setSelectedIndex(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: 'var(--radius-xs, 4px)',
              backgroundColor: isSelected ? 'var(--primary-subtle, rgba(88,166,255,0.15))' : 'transparent',
              color: isSelected ? 'var(--primary-base, #58a6ff)' : 'var(--text-primary, #c9d1d9)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon size={14} />
              <span>{cmd.title}</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted, #8b949e)', fontFamily: 'monospace' }}>
              {cmd.shortcut}
            </span>
          </div>
        );
      })}
    </div>
  );
}
