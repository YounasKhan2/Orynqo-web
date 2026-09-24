import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Checkbox } from '../../../design-system';

/**
 * WorkItemSubItems Component
 * Canonical Sub-item hierarchy checklist with completion counter and progress bar
 */
export function WorkItemSubItems({
  subItems = [],
  subtasks,
  onToggleSubtask,
  onAddSubtask,
  isReadOnly = false,
  className = ''
}) {
  const items = (subItems && subItems.length > 0) ? subItems : (subtasks || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const isItemDone = (s) => s.status === 'done' || s.done === true;
  const completedCount = items.filter(isItemDone).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreate = (e) => {
    e?.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddSubtask?.(trimmed);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className={`work-item-subitems ${className}`} style={{ width: '100%' }}>
      {/* Header with Counter and Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Sub-items ({completedCount}/{totalCount})
          </span>
          {totalCount > 0 && (
            <div
              style={{
                width: '60px',
                height: '4px',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: progressPercent === 100 ? 'var(--status-done)' : 'var(--primary-base)',
                  transition: 'width var(--duration-normal)'
                }}
              />
            </div>
          )}
        </div>

        {!isReadOnly && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            title="Add sub-item"
            aria-label="Add sub-item"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px'
            }}
          >
            <Plus size={11} />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Sub-item List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((sub) => {
          const done = isItemDone(sub);
          return (
            <div
              key={sub.id}
              onClick={() => !isReadOnly && onToggleSubtask?.(sub.id, done ? 'todo' : 'done')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 8px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                cursor: isReadOnly ? 'default' : 'pointer',
                fontSize: 'var(--text-xs)',
                color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: done ? 'line-through' : 'none',
                userSelect: 'none',
                transition: 'background-color var(--duration-fast)'
              }}
            >
              <Checkbox
                checked={done}
                disabled={isReadOnly}
                onChange={() => !isReadOnly && onToggleSubtask?.(sub.id, done ? 'todo' : 'done')}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.title}</span>
            </div>
          );
        })}

        {/* Empty State */}
        {totalCount === 0 && !isAdding && (
          <div
            style={{
              padding: '8px',
              textAlign: 'center',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            No sub-items yet
          </div>
        )}

        {/* Add Input Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '2px'
            }}
          >
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTitle('');
                }
              }}
              placeholder="Sub-item title..."
              style={{
                flex: 1,
                height: '26px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--primary-base)',
                borderRadius: 'var(--radius-xs)',
                padding: '0 8px',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              style={{
                height: '26px',
                padding: '0 8px',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                backgroundColor: 'var(--primary-base)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                cursor: newTitle.trim() ? 'pointer' : 'default',
                opacity: newTitle.trim() ? 1 : 0.5
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
              }}
              style={{
                height: '26px',
                padding: '0 6px',
                fontSize: '11px',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
