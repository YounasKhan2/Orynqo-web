import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BLOCK_TYPES } from '../model';
import { DocumentSlashMenu } from './DocumentSlashMenu';
import { DocumentMentionPopover } from './DocumentMentionPopover';
import { DocumentMentionChip } from './DocumentMentionChip';
import { Plus, CheckSquare, Square, Quote, Minus, Code as CodeIcon } from 'lucide-react';

/**
 * DocumentEditor Component (DOC-002)
 *
 * Implements a lightweight, structured semantic block editor:
 * - Paragraphs, Headings (H1-H3), Lists (Bullet, Numbered), Task Checklists, Code, Callout, Divider
 * - Invariant: Checking a Document checklist NEVER mutates a WorkItem!
 * - Contextual Slash command menu ('/')
 * - Canonical Entity Mention popover ('@')
 * - Range/selection detection for explicit WorkItem conversion & comments
 * - Centralized keyboard isolation: typing inside editor suppresses PAGE/VIEW shortcuts.
 */
export function DocumentEditor({
  content,
  document,
  onChange,
  onOpenWorkItem,
  onOpenDocument,
  workItems = [],
  documents = [],
  users = [],
  projects = [],
  teams = [],
  isAccessible = () => true,
  onSelectionChange
}) {
  const effectiveContent = content || (document?.blocks ? { blocks: document.blocks } : document?.content) || { blocks: [] };
  const blocks = effectiveContent.blocks || [];

  // Active overlays
  const [slashMenu, setSlashMenu] = useState({ isOpen: false, blockIndex: null, filter: '', position: { top: 0, left: 0 } });
  const [mentionPopover, setMentionPopover] = useState({ isOpen: false, blockIndex: null, filter: '', position: { top: 0, left: 0 } });

  const editorRef = useRef(null);

  // Selection change listener for WorkItem conversion & comments
  const handleSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      onSelectionChange?.(null);
      return;
    }
    const text = selection.toString().trim();
    if (text) {
      onSelectionChange?.({
        text,
        range: selection.getRangeAt(0)
      });
    } else {
      onSelectionChange?.(null);
    }
  }, [onSelectionChange]);

  // Block updates
  const updateBlock = useCallback((index, patch) => {
    const newBlocks = blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange?.({ blocks: newBlocks });
  }, [blocks, onChange]);

  // Add block after
  const addBlockAfter = useCallback((index, type = BLOCK_TYPES.PARAGRAPH) => {
    const newBlock = {
      id: `blk-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      text: '',
      meta: type === BLOCK_TYPES.TASK_CHECKLIST_ITEM ? { checked: false } : {}
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange?.({ blocks: newBlocks });
    return index + 1;
  }, [blocks, onChange]);

  // Delete block
  const deleteBlock = useCallback((index) => {
    if (blocks.length <= 1) return;
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange?.({ blocks: newBlocks });
  }, [blocks, onChange]);

  // Key handling in block inputs
  const handleBlockKeyDown = (e, index, block) => {
    // EDITABLE scope isolation: Stop keyboard events from bubbling to PAGE/VIEW listeners
    e.stopPropagation();

    if (slashMenu.isOpen || mentionPopover.isOpen) {
      // Overlays handle their own keys
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlockAfter(index, block.type === BLOCK_TYPES.TASK_CHECKLIST_ITEM ? BLOCK_TYPES.TASK_CHECKLIST_ITEM : BLOCK_TYPES.PARAGRAPH);
      return;
    }

    if (e.key === 'Backspace' && (block.text === '' || block.content === '') && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(index);
      return;
    }
  };

  // Input change handling for '/' and '@' triggers
  const handleInputChange = (e, index, block) => {
    const val = e.target.value;
    updateBlock(index, { text: val });

    const rect = e.target.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
    const relativePos = {
      top: rect.bottom - editorRect.top + 4,
      left: Math.max(10, rect.left - editorRect.left)
    };

    // Check for Slash Command '/'
    if (val.endsWith('/') || val === '/') {
      setSlashMenu({
        isOpen: true,
        blockIndex: index,
        filter: '',
        position: relativePos
      });
      setMentionPopover((prev) => ({ ...prev, isOpen: false }));
    } else if (slashMenu.isOpen && slashMenu.blockIndex === index) {
      const match = val.match(/\/([a-zA-Z0-9_-]*)$/);
      if (match) {
        setSlashMenu((prev) => ({ ...prev, filter: match[1] }));
      } else {
        setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      }
    }

    // Check for Entity Mention '@'
    if (val.endsWith('@') || val === '@') {
      setMentionPopover({
        isOpen: true,
        blockIndex: index,
        filter: '',
        position: relativePos
      });
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    } else if (mentionPopover.isOpen && mentionPopover.blockIndex === index) {
      const match = val.match(/@([a-zA-Z0-9_-]*)$/);
      if (match) {
        setMentionPopover((prev) => ({ ...prev, filter: match[1] }));
      } else {
        setMentionPopover((prev) => ({ ...prev, isOpen: false }));
      }
    }
  };

  // Slash command selection
  const handleSelectSlashCommand = (cmd) => {
    const { blockIndex } = slashMenu;
    if (blockIndex === null || !blocks[blockIndex]) return;

    const block = blocks[blockIndex];
    // Strip trailing '/'
    const cleanText = block.text.replace(/\/([a-zA-Z0-9_-]*)$/, '');

    if (cmd.id === 'entity-work-item' || cmd.id === 'entity-document') {
      setSlashMenu({ isOpen: false, blockIndex: null, filter: '', position: { top: 0, left: 0 } });
      setMentionPopover({
        isOpen: true,
        blockIndex,
        filter: '',
        position: slashMenu.position
      });
      return;
    }

    updateBlock(blockIndex, {
      type: cmd.id,
      text: cleanText,
      meta: cmd.id === BLOCK_TYPES.TASK_CHECKLIST_ITEM ? { checked: false } : block.meta
    });
    setSlashMenu({ isOpen: false, blockIndex: null, filter: '', position: { top: 0, left: 0 } });
  };

  // Mention selection
  const handleSelectMention = (entity) => {
    const { blockIndex } = mentionPopover;
    if (blockIndex === null || !blocks[blockIndex]) return;

    const block = blocks[blockIndex];
    // Strip trailing '@'
    const cleanText = block.text.replace(/@([a-zA-Z0-9_-]*)$/, '');
    const token = `@[${entity.entityType}:${entity.id}:${entity.title}]`;
    const newText = cleanText ? `${cleanText} ${token} ` : `${token} `;

    const mentions = Array.isArray(block.meta?.mentions) ? [...block.meta.mentions] : [];
    mentions.push({ entityType: entity.entityType, id: entity.id });

    updateBlock(blockIndex, {
      text: newText,
      meta: { ...block.meta, mentions }
    });

    setMentionPopover({ isOpen: false, blockIndex: null, filter: '', position: { top: 0, left: 0 } });
  };

  // Helper to render text with inline mention chips
  const renderInlineMentions = (text = '', block) => {
    const regex = /@\[(work_item|user|document|project|team):([a-zA-Z0-9_-]+)(?::([^\]]+))?\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const type = match[1];
      const id = match[2];
      const title = match[3] || id;

      // Find referenced entity
      let item = null;
      let accessible = true;

      if (type === 'work_item') {
        item = (workItems || []).find((w) => w.id === id);
        accessible = item ? (isAccessible.length >= 2 ? isAccessible(item, 'work_item') : isAccessible(item)) : true;
      } else if (type === 'document') {
        item = (documents || []).find((d) => d.id === id);
        accessible = item ? (isAccessible.length >= 2 ? isAccessible(item, 'document') : isAccessible(item)) : true;
      }

      parts.push(
        <DocumentMentionChip
          key={`${type}-${id}-${match.index}`}
          entityType={type}
          id={id}
          identifier={item?.identifier}
          title={accessible ? (item?.title || title) : 'Restricted item'}
          isRestricted={!accessible}
          onOpenWorkItem={onOpenWorkItem}
          onClick={type === 'document' ? onOpenDocument : undefined}
        />
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      ref={editorRef}
      role="region"
      aria-label="Document content editor"
      data-keyboard-scope="EDITABLE_CONTROL"
      data-testid="document-editor"
      onMouseUp={handleSelect}
      onKeyUp={handleSelect}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        minHeight: '300px'
      }}
    >
      {/* Overlays */}
      <DocumentSlashMenu
        isOpen={slashMenu.isOpen}
        onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
        onSelectCommand={handleSelectSlashCommand}
        filterText={slashMenu.filter}
        position={slashMenu.position}
      />

      <DocumentMentionPopover
        isOpen={mentionPopover.isOpen}
        onClose={() => setMentionPopover((prev) => ({ ...prev, isOpen: false }))}
        onSelectEntity={handleSelectMention}
        filterText={mentionPopover.filter}
        position={mentionPopover.position}
        workItems={workItems}
        documents={documents}
        users={users}
        projects={projects}
        teams={teams}
        isAccessible={isAccessible}
      />

      {/* Render Blocks */}
      {blocks.map((block, index) => {
        const isHeading1 = block.type === BLOCK_TYPES.HEADING_1;
        const isHeading2 = block.type === BLOCK_TYPES.HEADING_2;
        const isHeading3 = block.type === BLOCK_TYPES.HEADING_3;
        const isBullet = block.type === BLOCK_TYPES.BULLET_LIST_ITEM;
        const isOrdered = block.type === BLOCK_TYPES.ORDERED_LIST_ITEM;
        const isTaskChecklist = block.type === BLOCK_TYPES.TASK_CHECKLIST_ITEM;
        const isCode = block.type === BLOCK_TYPES.CODE_BLOCK;
        const isCallout = block.type === BLOCK_TYPES.CALLOUT;
        const isDivider = block.type === BLOCK_TYPES.DIVIDER;

        if (isDivider) {
          return (
            <div key={block.id} style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <hr style={{ width: '100%', border: 'none', borderTop: '1px solid var(--border-subtle, #30363d)' }} />
            </div>
          );
        }

        return (
          <div
            key={block.id}
            data-testid={`document-block-${block.id}`}
            style={{
              display: 'flex',
              alignItems: isCode || isCallout ? 'stretch' : 'flex-start',
              gap: '8px',
              padding: isCallout ? '8px 12px' : '2px 0',
              backgroundColor: isCallout ? 'rgba(88, 166, 255, 0.05)' : isCode ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
              borderLeft: isCallout ? '3px solid var(--primary-base, #58a6ff)' : 'none',
              borderRadius: isCallout || isCode ? 'var(--radius-xs, 4px)' : '0'
            }}
          >
            {/* List or Checklist Prefix */}
            {isBullet && (
              <span style={{ fontSize: '14px', color: 'var(--text-muted, #8b949e)', userSelect: 'none', paddingLeft: '4px' }}>
                •
              </span>
            )}

            {isOrdered && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #8b949e)', userSelect: 'none', minWidth: '16px' }}>
                {index + 1}.
              </span>
            )}

            {isTaskChecklist && (
              <button
                type="button"
                role="checkbox"
                aria-checked={Boolean(block.checked || block.meta?.checked)}
                data-testid={`checklist-toggle-${block.id}`}
                aria-label={(block.checked || block.meta?.checked) ? 'Uncheck task' : 'Check task'}
                onClick={() => {
                  // CHECKLIST INVARIANT: Checking a checklist NEVER touches WorkItems!
                  const isChecked = Boolean(block.checked || block.meta?.checked);
                  updateBlock(index, {
                    checked: !isChecked,
                    meta: { ...block.meta, checked: !isChecked }
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: (block.checked || block.meta?.checked) ? 'var(--primary-base, #58a6ff)' : 'var(--text-muted, #8b949e)',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '2px'
                }}
              >
                {(block.checked || block.meta?.checked) ? <CheckSquare size={14} /> : <Square size={14} />}
              </button>
            )}

            {/* Editable Content */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                data-testid={`document-block-input-${block.id}`}
                value={block.content !== undefined ? block.content : (block.text || '')}
                onChange={(e) => handleInputChange(e, index, block)}
                onKeyDown={(e) => handleBlockKeyDown(e, index, block)}
                onSelect={(e) => {
                  const target = e.target;
                  if (target.selectionStart !== undefined && target.selectionEnd !== undefined && target.selectionStart !== target.selectionEnd) {
                    const selected = target.value.substring(target.selectionStart, target.selectionEnd).trim();
                    if (selected) {
                      onSelectionChange?.({ text: selected, blockIndex: index });
                      return;
                    }
                  }
                  handleSelect();
                }}
                placeholder={
                  isHeading1
                    ? 'Heading 1...'
                    : isHeading2
                    ? 'Heading 2...'
                    : isHeading3
                    ? 'Heading 3...'
                    : isCode
                    ? 'console.log("code block")...'
                    : isCallout
                    ? 'Callout note...'
                    : "Type '/' for commands, '@' to mention..."
                }
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: isTaskChecklist && block.meta?.checked ? 'var(--text-muted, #8b949e)' : 'var(--text-primary, #c9d1d9)',
                  textDecoration: isTaskChecklist && block.meta?.checked ? 'line-through' : 'none',
                  fontSize: isHeading1 ? '20px' : isHeading2 ? '16px' : isHeading3 ? '14px' : '13px',
                  fontWeight: isHeading1 || isHeading2 || isHeading3 ? 600 : 400,
                  fontFamily: isCode ? 'monospace' : 'inherit',
                  padding: '2px 0'
                }}
              />

              {/* Render chip previews below if mentions are in text */}
              {block.text && block.text.includes('@[') && (
                <div style={{ marginTop: '2px', fontSize: '12px' }}>
                  {renderInlineMentions(block.text, block)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Block Affordance */}
      <button
        type="button"
        data-testid="add-block-btn"
        aria-label="Add block"
        onClick={() => addBlockAfter(blocks.length - 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted, #8b949e)',
          fontSize: '12px',
          cursor: 'pointer',
          padding: '6px 0',
          marginTop: '8px'
        }}
      >
        <Plus size={14} />
        <span>Add paragraph</span>
      </button>
    </div>
  );
}
