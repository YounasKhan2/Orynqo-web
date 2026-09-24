import React, { useState, useEffect, useRef } from 'react';

/**
 * WorkItemTitle Component
 * High-density inline editable title for WorkItems
 */
export function WorkItemTitle({
  title,
  onUpdateTitle,
  isReadOnly = false,
  className = '',
  inputRef
}) {
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const internalRef = useRef(null);
  const activeRef = inputRef || internalRef;

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = localTitle.trim();
    if (trimmed && trimmed !== title) {
      onUpdateTitle?.(trimmed);
    } else {
      setLocalTitle(title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      handleSave();
      activeRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setLocalTitle(title);
      setIsEditing(false);
      activeRef.current?.blur();
    }
  };

  if (isReadOnly) {
    return (
      <h2
        className={`work-item-title ${className}`}
        style={{
          margin: 0,
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          lineHeight: 'var(--line-height-tight)',
          userSelect: 'text'
        }}
      >
        {title}
      </h2>
    );
  }

  return (
    <div className={`work-item-title-wrapper ${className}`} style={{ width: '100%' }}>
      <textarea
        ref={activeRef}
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder="Issue title..."
        rows={isEditing || localTitle.length > 50 ? 2 : 1}
        aria-label="Work item title"
        style={{
          width: '100%',
          backgroundColor: isEditing ? 'var(--bg-surface)' : 'transparent',
          border: isEditing ? '1px solid var(--border-default)' : '1px solid transparent',
          borderRadius: 'var(--radius-xs)',
          padding: '4px 6px',
          margin: '-4px -6px',
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          resize: 'none',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
          lineHeight: 'var(--line-height-tight)',
          transition: 'border-color var(--duration-fast), background-color var(--duration-fast)'
        }}
      />
    </div>
  );
}
