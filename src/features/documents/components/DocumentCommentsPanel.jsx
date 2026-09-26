import React, { useState } from 'react';
import { MessageSquare, Check, RotateCcw, AlertTriangle, Send } from 'lucide-react';
import { COMMENT_THREAD_STATUS } from '../model';

/**
 * DocumentCommentsPanel Component
 *
 * Renders threaded discussion supporting:
 * - Document-level & inline comments
 * - Thread resolution & history
 * - Resilient orphaned anchor status display without deleting discussion
 */
export function DocumentCommentsPanel({
  threads = [],
  unresolvedCount = 0,
  onAddThread,
  onAddReply,
  onToggleResolve,
  users = [],
  currentUserId = 'usr-1'
}) {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [showResolved, setShowResolved] = useState(false);

  const displayedThreads = threads.filter((t) => {
    if (showResolved) return true;
    return t.status !== COMMENT_THREAD_STATUS.RESOLVED;
  });

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddThread?.({ content: newCommentText.trim() });
    setNewCommentText('');
  };

  const handleReply = (threadId) => {
    const text = replyTextMap[threadId];
    if (!text || !text.trim()) return;
    onAddReply?.(threadId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [threadId]: '' }));
  };

  return (
    <div
      role="region"
      aria-label="Document Discussion"
      data-testid="document-comments-panel"
      style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle, #30363d)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={14} color="var(--primary-base, #58a6ff)" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #8b949e)', textTransform: 'uppercase' }}>
            Discussion ({unresolvedCount} active)
          </span>
        </div>
        <button
          type="button"
          data-testid="toggle-resolved-comments"
          onClick={() => setShowResolved((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-base, #58a6ff)',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          {showResolved ? 'Hide Resolved' : 'Show Resolved'}
        </button>
      </div>

      {/* New thread input */}
      <form onSubmit={handleCreateThread} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          data-testid="new-comment-input"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a document-level comment..."
          aria-label="New comment"
          style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-default, #30363d)',
            borderRadius: '4px',
            padding: '6px 8px',
            fontSize: '12px',
            color: 'var(--text-primary, #c9d1d9)',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          data-testid="post-comment-btn"
          aria-label="Post comment"
          disabled={!newCommentText.trim()}
          style={{
            padding: '6px 10px',
            backgroundColor: 'var(--primary-base, #58a6ff)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: newCommentText.trim() ? 'pointer' : 'default',
            opacity: newCommentText.trim() ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Send size={12} />
        </button>
      </form>

      {/* Thread List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedThreads.map((thread) => {
          const isResolved = thread.status === COMMENT_THREAD_STATUS.RESOLVED;
          const isOrphaned = thread.isOrphaned;

          return (
            <div
              key={thread.id}
              data-testid={`comment-thread-${thread.id}`}
              style={{
                padding: '8px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle, #30363d)',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px'
              }}
            >
              {/* Orphan warning if anchor text was removed */}
              {isOrphaned && (
                <div
                  data-testid="orphaned-anchor-notice"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--priority-high, #f59e0b)',
                    fontStyle: 'italic'
                  }}
                >
                  <AlertTriangle size={11} />
                  <span>Original anchored text was modified or removed. Thread preserved.</span>
                </div>
              )}

              {/* Thread Comments */}
              {thread.comments.map((cmt) => (
                <div key={cmt.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted, #8b949e)' }}>
                    <span>User {cmt.authorId}</span>
                    <span>{new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary, #c9d1d9)' }}>{cmt.content}</div>
                </div>
              ))}

              {/* Thread Actions & Reply */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button
                  type="button"
                  data-testid={`resolve-thread-btn-${thread.id}`}
                  onClick={() => onToggleResolve?.(thread.id, !isResolved)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: isResolved ? 'var(--color-success, #2ea043)' : 'var(--text-muted, #8b949e)',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={11} />
                  <span>{isResolved ? 'Resolved' : 'Resolve'}</span>
                </button>

                {/* Inline reply box */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    data-testid={`reply-input-${thread.id}`}
                    placeholder="Reply..."
                    value={replyTextMap[thread.id] || ''}
                    onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleReply(thread.id);
                      }
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-subtle, #30363d)',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      color: 'var(--text-primary, #c9d1d9)',
                      outline: 'none',
                      width: '120px'
                    }}
                  />
                  <button
                    type="button"
                    data-testid={`reply-btn-${thread.id}`}
                    onClick={() => handleReply(thread.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-base, #58a6ff)',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
