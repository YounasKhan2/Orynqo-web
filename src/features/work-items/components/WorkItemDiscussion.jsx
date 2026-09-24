import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { UserAvatar } from '../../../components/avatars/UserAvatar';

/**
 * WorkItemDiscussion Component (COL-001)
 * High-velocity threaded discussion hub for canonical WorkItems
 */
export function WorkItemDiscussion({
  comments = [],
  onAddComment,
  currentUser,
  isReadOnly = false,
  className = '',
  composerRef
}) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isReadOnly) return;
    onAddComment?.(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`work-item-discussion ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)'
            }}
          >
            {/* Header: Author + Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserAvatar user={c.author} size="xs" />
                <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                  {c.author?.name || 'Collaborator'}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {c.timestamp}
              </span>
            </div>

            {/* Comment Body */}
            <div style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-normal)', whiteSpace: 'pre-wrap' }}>
              {c.text}
            </div>

            {/* Reactions if present */}
            {c.reactions && c.reactions.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {c.reactions.map((r, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '1px 5px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px'
                    }}
                  >
                    <span>{r.emoji}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {comments.length === 0 && (
          <div
            style={{
              padding: 'var(--space-4)',
              textAlign: 'center',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            No comments yet. Start the discussion below.
          </div>
        )}
      </div>

      {/* Composer Footer */}
      {isReadOnly ? (
        <div
          style={{
            padding: 'var(--space-2)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}
        >
          Read-only archive — commenting disabled
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '6px 8px'
            }}
          >
            <textarea
              ref={composerRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Leave a comment or update... (Markdown supported, ⌘↵ to send)"
              rows={2}
              aria-label="Comment input"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-sans)',
                resize: 'none',
                outline: 'none',
                lineHeight: 'var(--line-height-normal)'
              }}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              title="Post comment (⌘↵)"
              aria-label="Post comment"
              style={{
                height: '26px',
                padding: '0 8px',
                backgroundColor: 'var(--primary-base)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                cursor: text.trim() ? 'pointer' : 'default',
                opacity: text.trim() ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                flexShrink: 0
              }}
            >
              <Send size={11} />
              <span>Send</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
