import React, { useState, useEffect, useRef } from 'react';
import { Edit3 } from 'lucide-react';

/**
 * WorkItemDescription Component
 * Formatted markdown preview with seamless in-place click-to-edit canvas
 */
export function WorkItemDescription({
  description,
  onUpdateDescription,
  isReadOnly = false,
  className = '',
  editorRef
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localDesc, setLocalDesc] = useState(description || '');
  const internalRef = useRef(null);
  const activeRef = editorRef || internalRef;

  useEffect(() => {
    setLocalDesc(description || '');
  }, [description]);

  const handleSave = () => {
    setIsEditing(false);
    if (localDesc !== (description || '')) {
      onUpdateDescription?.(localDesc);
    }
  };

  const handleCancel = () => {
    setLocalDesc(description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className={`work-item-description ${className}`} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
          fontWeight: 'var(--font-bold)',
          color: 'var(--text-subtle)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '6px'
        }}
      >
        <span>Description</span>
        {!isReadOnly && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setTimeout(() => activeRef.current?.focus(), 50);
            }}
            title="Edit description (D)"
            aria-label="Edit description"
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
            <Edit3 size={11} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <textarea
            ref={activeRef}
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add detailed description, reproduction steps, or architecture specs... (Markdown supported)"
            rows={5}
            aria-label="Work item description"
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--primary-base)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              lineHeight: 'var(--line-height-normal)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Cancel (Esc)
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                backgroundColor: 'var(--primary-base)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Save (⌘↵)
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!isReadOnly) {
              setIsEditing(true);
              setTimeout(() => activeRef.current?.focus(), 50);
            }
          }}
          style={{
            fontSize: 'var(--text-xs)',
            lineHeight: 'var(--line-height-normal)',
            color: description ? 'var(--text-secondary)' : 'var(--text-muted)',
            fontStyle: description ? 'normal' : 'italic',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            cursor: isReadOnly ? 'default' : 'pointer',
            minHeight: '48px',
            whiteSpace: 'pre-wrap',
            transition: 'border-color var(--duration-fast)'
          }}
        >
          {description || (isReadOnly ? 'No description provided.' : 'Click to add a detailed description, reproduction steps, or architecture specs...')}
        </div>
      )}
    </div>
  );
}
