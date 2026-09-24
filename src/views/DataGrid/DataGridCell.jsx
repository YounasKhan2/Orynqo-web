import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Lock,
  MessageSquare,
  FileText,
  ChevronDown,
  Check
} from 'lucide-react';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/badges';
import { UserAvatar } from '../../components/avatars/UserAvatar';
import { Checkbox } from '../../design-system';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../constants/workItems';
import { USERS, PROJECTS } from '../../data/mockData';

/**
 * DataGridCell Component
 * High-density polymorphic cell renderer with explicit property trigger dropdowns (NO cycle-on-click)
 */
export function DataGridCell({
  column,
  item,
  width,
  isSelected = false,
  isChecked = false,
  onToggleSelect,
  onUpdateItem,
  isEditingTitle = false,
  onCommitTitle,
  onCancelTitle,
  isFilterMismatch = false,
  activeDropdown = null,
  setActiveDropdown,
  style = {}
}) {
  const [inlineEstimate, setInlineEstimate] = useState(item.estimate || '');
  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const cellRef = useRef(null);

  // Sync draft title when item changes
  useEffect(() => {
    setTitleDraft(item.title);
  }, [item.title]);

  // Click outside to close active cell dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (cellRef.current && !cellRef.current.contains(e.target)) {
        if (activeDropdown) setActiveDropdown?.(null);
        if (isEditingEstimate) setIsEditingEstimate(false);
      }
    };
    if (activeDropdown || isEditingEstimate) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeDropdown, isEditingEstimate, setActiveDropdown]);

  const isReadOnly = item.isReadOnly === true;

  // Resolve relation entities
  const blockedRelations = (item.relations || []).filter((r) => r.type === 'blocked_by');
  const hasBlocker = blockedRelations.length > 0;
  const hasRestrictedRelation = (item.relations || []).some((r) => r.restricted);
  const hasSpecDoc = (item.documentLinks || []).some((d) => d.type === 'source_spec');
  const assignee = USERS.find((u) => u.id === item.assigneeId);
  const project = PROJECTS.find((p) => p.id === item.projectId);

  // Render cell contents by column id
  let content = null;

  switch (column.id) {
    case 'select':
      content = (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(item.id);
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
        >
          <Checkbox
            checked={isChecked}
            onChange={() => onToggleSelect?.(item.id)}
            aria-label={`Select work item ${item.identifier}`}
          />
        </div>
      );
      break;

    case 'identifier':
      content = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            className="font-mono"
            style={{
              fontSize: '11px',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-muted)'
            }}
          >
            {item.identifier}
          </span>
          {isReadOnly && (
            <Lock size={10} style={{ color: 'var(--text-muted)' }} title="Read-only work item" />
          )}
        </div>
      );
      break;

    case 'type':
      content = <TypeBadge typeId={item.type} showLabel={false} />;
      break;

    case 'priority': {
      const isDropdownOpen = activeDropdown === `priority-${item.id}`;
      content = (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Change priority"
            disabled={isReadOnly}
            onClick={(e) => {
              e.stopPropagation();
              if (isReadOnly) return;
              setActiveDropdown?.(isDropdownOpen ? null : `priority-${item.id}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: isReadOnly ? 'default' : 'pointer'
            }}
          >
            <PriorityBadge priorityId={item.priority} interactive={false} />
          </button>

          {isDropdownOpen && !isReadOnly && (
            <div
              role="listbox"
              aria-label="Select priority"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 100,
                width: '130px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '4px 0'
              }}
            >
              {['urgent', 'high', 'medium', 'low', 'none'].map((pKey) => {
                const def = PRIORITY_DEFINITIONS[pKey];
                const isActive = item.priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onUpdateItem?.(item.id, { priority: pKey });
                      setActiveDropdown?.(null);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: isActive ? 'var(--bg-surface-selected)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--primary-text)' : 'var(--text-primary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <PriorityBadge priorityId={pKey} interactive={false} />
                    <span style={{ flex: 1 }}>{def.label}</span>
                    {isActive && <Check size={11} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
      break;
    }

    case 'title':
      content = isEditingTitle ? (
        <input
          type="text"
          value={titleDraft}
          autoFocus
          onChange={(e) => setTitleDraft(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              onCommitTitle?.(item.id, titleDraft);
            } else if (e.key === 'Escape') {
              setTitleDraft(item.title);
              onCancelTitle?.();
            }
          }}
          onBlur={() => {
            onCommitTitle?.(item.id, titleDraft);
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: '22px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--primary-base)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-xs)',
            padding: '0 4px',
            outline: 'none'
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflow: 'hidden',
            width: '100%'
          }}
        >
          <span
            className="truncate"
            style={{
              color: item.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: item.status === 'done' ? 'line-through' : 'none',
              fontWeight: isSelected ? 'var(--font-medium)' : 'var(--font-regular)',
              fontSize: '12px'
            }}
          >
            {item.title}
          </span>

          {/* Blocked Badge */}
          {hasBlocker && (
            <span
              title="Blocked by dependency"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--priority-urgent)',
                fontSize: '10px',
                backgroundColor: 'var(--priority-urgent-bg)',
                padding: '1px 4px',
                borderRadius: 'var(--radius-xs)',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={10} />
              <span>Blocked</span>
            </span>
          )}

          {/* Living Spec Badge */}
          {hasSpecDoc && (
            <span
              title="Linked to Living PRD Spec"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--primary-text)',
                fontSize: '10px',
                backgroundColor: 'var(--primary-subtle)',
                padding: '1px 4px',
                borderRadius: 'var(--radius-xs)',
                flexShrink: 0
              }}
            >
              <FileText size={10} />
              <span>Spec</span>
            </span>
          )}

          {/* Comments Count */}
          {item.commentsCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--text-subtle)',
                fontSize: '10px',
                flexShrink: 0
              }}
            >
              <MessageSquare size={10} />
              {item.commentsCount}
            </span>
          )}

          {/* Filter Mismatch Indicator */}
          {isFilterMismatch && (
            <span
              title="Item updated and will be removed once unfocused"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--status-in-progress)',
                backgroundColor: 'var(--status-in-progress-bg)',
                fontSize: '9px',
                padding: '1px 4px',
                borderRadius: 'var(--radius-xs)',
                flexShrink: 0
              }}
            >
              Modified
            </span>
          )}
        </div>
      );
      break;

    case 'status': {
      const isDropdownOpen = activeDropdown === `status-${item.id}`;
      content = (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Change status"
            disabled={isReadOnly}
            onClick={(e) => {
              e.stopPropagation();
              if (isReadOnly) return;
              setActiveDropdown?.(isDropdownOpen ? null : `status-${item.id}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: isReadOnly ? 'default' : 'pointer'
            }}
          >
            <StatusBadge statusId={item.status} interactive={false} />
            {!isReadOnly && <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} />}
          </button>

          {isDropdownOpen && !isReadOnly && (
            <div
              role="listbox"
              aria-label="Select status"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 100,
                width: '150px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '4px 0'
              }}
            >
              {Object.entries(STATUS_DEFINITIONS).map(([sKey, def]) => {
                const isActive = item.status === sKey;
                return (
                  <button
                    key={sKey}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onUpdateItem?.(item.id, { status: sKey });
                      setActiveDropdown?.(null);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: isActive ? 'var(--bg-surface-selected)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--primary-text)' : 'var(--text-primary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <StatusBadge statusId={sKey} interactive={false} />
                    <span style={{ flex: 1 }}>{def.label}</span>
                    {isActive && <Check size={11} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
      break;
    }

    case 'estimate':
      content = isEditingEstimate && !isReadOnly ? (
        <input
          type="number"
          min="0"
          max="100"
          value={inlineEstimate}
          autoFocus
          onChange={(e) => setInlineEstimate(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              const val = inlineEstimate === '' ? null : Number(inlineEstimate);
              onUpdateItem?.(item.id, { estimate: val });
              setIsEditingEstimate(false);
            } else if (e.key === 'Escape') {
              setInlineEstimate(item.estimate || '');
              setIsEditingEstimate(false);
            }
          }}
          onBlur={() => {
            const val = inlineEstimate === '' ? null : Number(inlineEstimate);
            onUpdateItem?.(item.id, { estimate: val });
            setIsEditingEstimate(false);
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '45px',
            height: '20px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--primary-base)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            textAlign: 'right',
            padding: '0 2px',
            outline: 'none'
          }}
        />
      ) : (
        <span
          className="font-mono"
          onClick={(e) => {
            if (!isReadOnly) {
              e.stopPropagation();
              setIsEditingEstimate(true);
            }
          }}
          style={{
            color: item.estimate ? 'var(--text-secondary)' : 'var(--text-subtle)',
            fontSize: '11px',
            cursor: isReadOnly ? 'default' : 'pointer'
          }}
        >
          {item.estimate ? `${item.estimate} pts` : '—'}
        </span>
      );
      break;

    case 'assignee': {
      const isDropdownOpen = activeDropdown === `assignee-${item.id}`;
      content = (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Assign to team member"
            disabled={isReadOnly}
            onClick={(e) => {
              e.stopPropagation();
              if (isReadOnly) return;
              setActiveDropdown?.(isDropdownOpen ? null : `assignee-${item.id}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: isReadOnly ? 'default' : 'pointer'
            }}
          >
            <UserAvatar user={assignee} size="xs" showName />
          </button>

          {isDropdownOpen && !isReadOnly && (
            <div
              role="listbox"
              aria-label="Select assignee"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 100,
                width: '160px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '4px 0'
              }}
            >
              <button
                type="button"
                role="option"
                aria-selected={!item.assigneeId}
                onClick={() => {
                  onUpdateItem?.(item.id, { assigneeId: null });
                  setActiveDropdown?.(null);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: !item.assigneeId ? 'var(--bg-surface-selected)' : 'transparent',
                  border: 'none',
                  color: !item.assigneeId ? 'var(--primary-text)' : 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <span>Unassigned</span>
                {!item.assigneeId && <Check size={11} />}
              </button>

              {USERS.map((user) => {
                const isActive = item.assigneeId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onUpdateItem?.(item.id, { assigneeId: user.id });
                      setActiveDropdown?.(null);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: isActive ? 'var(--bg-surface-selected)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--primary-text)' : 'var(--text-primary)',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    <UserAvatar user={user} size="xs" showName />
                    {isActive && <Check size={11} style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
      break;
    }

    case 'project':
      content = (
        <span className="truncate" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
          {project ? project.name : 'Ad-hoc'}
        </span>
      );
      break;

    case 'cycle':
      content = (
        <span className="truncate" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
          {item.cycleId || '—'}
        </span>
      );
      break;

    case 'dueDate':
      content = (
        <span
          className="font-mono"
          style={{
            fontSize: '11px',
            color: item.dueDate ? 'var(--text-secondary)' : 'var(--text-subtle)'
          }}
        >
          {item.dueDate ? item.dueDate.slice(5) : '—'}
        </span>
      );
      break;

    case 'relations':
      content = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hasRestrictedRelation ? (
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: '10px',
                fontStyle: 'italic'
              }}
              title="Confidential relationship"
            >
              [Restricted WorkItem]
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {(item.relations || []).length > 0 ? `${(item.relations || []).length} rel` : '—'}
            </span>
          )}
        </div>
      );
      break;

    case 'documentLinks':
      content = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasSpecDoc ? (
            <FileText size={12} style={{ color: 'var(--primary-text)' }} title="Living PRD Spec" />
          ) : (
            <span style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>—</span>
          )}
        </div>
      );
      break;

    case 'createdAt':
      content = (
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {item.createdAt ? item.createdAt.slice(0, 10) : '—'}
        </span>
      );
      break;

    case 'updatedAt':
      content = (
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {item.updatedAt ? item.updatedAt.slice(0, 10) : '—'}
        </span>
      );
      break;

    default:
      content = <span>{item[column.accessor || column.id] ?? '—'}</span>;
  }

  return (
    <div
      ref={cellRef}
      role="gridcell"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          column.alignment === 'right'
            ? 'flex-end'
            : column.alignment === 'center'
            ? 'center'
            : 'flex-start',
        width: `${width}px`,
        minWidth: `${column.minWidth}px`,
        height: '100%',
        padding: '0 8px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {content}
    </div>
  );
}
