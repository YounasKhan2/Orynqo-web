import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, FileText, User, FolderKanban, Users, Lock } from 'lucide-react';

/**
 * DocumentMentionPopover Component
 *
 * Contextual entity selection overlay triggered by '@' inside editor.
 * Queries supplied entities, enforces zero-leakage redaction, and handles keyboard navigation.
 */
export function DocumentMentionPopover({
  isOpen,
  onClose,
  onSelectEntity,
  filterText = '',
  position = { top: 0, left: 0 },
  workItems = [],
  documents = [],
  users = [],
  projects = [],
  teams = [],
  isAccessible = () => true
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const query = filterText.toLowerCase();

  // Assemble candidate list with zero-leakage security
  const candidates = [];

  // WorkItems
  (workItems || []).forEach((item) => {
    const accessible = isAccessible(item, 'work_item');
    if (!accessible) {
      // Redacted item representation
      candidates.push({
        id: item.id,
        entityType: 'work_item',
        title: 'Restricted item',
        identifier: 'LOCK',
        isRestricted: true,
        icon: Lock
      });
      return;
    }
    if (
      !query ||
      (item.title || '').toLowerCase().includes(query) ||
      (item.identifier || '').toLowerCase().includes(query)
    ) {
      candidates.push({
        id: item.id,
        entityType: 'work_item',
        title: item.title,
        identifier: item.identifier,
        status: item.status,
        isRestricted: false,
        icon: CheckCircle2
      });
    }
  });

  // Documents
  (documents || []).forEach((doc) => {
    const accessible = isAccessible(doc, 'document');
    if (!accessible) {
      candidates.push({
        id: doc.id,
        entityType: 'document',
        title: 'Restricted item',
        isRestricted: true,
        icon: Lock
      });
      return;
    }
    if (!query || (doc.title || '').toLowerCase().includes(query)) {
      candidates.push({
        id: doc.id,
        entityType: 'document',
        title: doc.title,
        isRestricted: false,
        icon: FileText
      });
    }
  });

  // Users
  (users || []).forEach((u) => {
    if (!query || (u.name || '').toLowerCase().includes(query)) {
      candidates.push({
        id: u.id,
        entityType: 'user',
        title: u.name,
        isRestricted: false,
        icon: User
      });
    }
  });

  // Projects
  (projects || []).forEach((p) => {
    if (!query || (p.name || '').toLowerCase().includes(query)) {
      candidates.push({
        id: p.id,
        entityType: 'project',
        title: p.name,
        isRestricted: false,
        icon: FolderKanban
      });
    }
  });

  // Teams
  (teams || []).forEach((t) => {
    if (!query || (t.name || '').toLowerCase().includes(query)) {
      candidates.push({
        id: t.id,
        entityType: 'team',
        title: t.name,
        isRestricted: false,
        icon: Users
      });
    }
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % (candidates.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + candidates.length) % (candidates.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (candidates[selectedIndex]) {
          onSelectEntity(candidates[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedIndex, candidates, onSelectEntity, onClose]);

  if (!isOpen || candidates.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Mention entity"
      data-keyboard-scope="OVERLAY"
      data-testid="document-mention-popover"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 50,
        width: '280px',
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
        Mention Workspace Entity
      </div>
      {candidates.slice(0, 15).map((item, idx) => {
        const Icon = item.icon;
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={`${item.entityType}-${item.id}`}
            role="option"
            aria-selected={isSelected}
            data-testid={`mention-option-${item.entityType}-${item.id}`}
            onClick={() => onSelectEntity(item)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Icon size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.identifier ? `${item.identifier}: ` : ''}{item.title}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted, #8b949e)', textTransform: 'capitalize', flexShrink: 0 }}>
              {item.entityType.replace('_', ' ')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
