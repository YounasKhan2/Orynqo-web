import React from 'react';
import { UserAvatar } from '../../../components/avatars/UserAvatar';
import { NOTIFICATION_EVENT_TYPES, getEventTypeDescriptor } from '../model/eventTaxonomy';
import {
  AtSign,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Archive,
  Layers,
  FileText,
  Lock,
  RotateCcw
} from 'lucide-react';

/**
 * Renders an accessible importance icon
 */
function getEventIcon(eventType, importance) {
  if (eventType === NOTIFICATION_EVENT_TYPES.MENTION) {
    return <AtSign size={13} color="var(--primary-base)" />;
  }
  if (eventType === NOTIFICATION_EVENT_TYPES.REVIEW_REQUESTED || eventType === NOTIFICATION_EVENT_TYPES.APPROVAL_REQUESTED) {
    return <CheckCircle2 size={13} color="var(--accent-amber)" />;
  }
  if (eventType === NOTIFICATION_EVENT_TYPES.DEPENDENCY_BLOCKED || eventType === NOTIFICATION_EVENT_TYPES.OVERDUE_TRANSITION) {
    return <AlertTriangle size={13} color="var(--accent-red)" />;
  }
  if (eventType === NOTIFICATION_EVENT_TYPES.ASSIGNED) {
    return <UserCheck size={13} color="var(--accent-blue)" />;
  }
  if (importance === 'focus') {
    return <AlertTriangle size={12} color="var(--accent-amber)" />;
  }
  return <MessageSquare size={12} color="var(--text-muted)" />;
}

/**
 * InboxRow Component (UI-04A / UI-04B)
 *
 * Dense, scannable notification row:
 * - Unread indicator dot (6px)
 * - Importance badge / icon
 * - Actor avatar (20px)
 * - Source identifier + title
 * - Event action summary snippet
 * - Compact relative timestamp
 * - Hover / Focus action buttons (Read, Snooze, Archive)
 * - Safe Tombstone rendering for permission-revoked items
 */

export function InboxRow({
  event,
  isSelected = false,
  isChecked = false,
  onSelect,
  onToggleCheck,
  onMarkRead,
  onArchive,
  onSnooze,
  onUnarchive
}) {
  const isUnread = !event.readAt;
  const isRedacted = Boolean(event.isRedacted);
  const descriptor = getEventTypeDescriptor(event.eventType);

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  if (isRedacted) {
    return (
      <div
        role="article"
        aria-label="Inaccessible notification"
        tabIndex={0}
        onClick={onSelect}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          padding: '0 var(--space-3)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-canvas)',
          opacity: 0.65,
          cursor: 'pointer',
          gap: '8px'
        }}
      >
        <Lock size={13} color="var(--text-muted)" />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          This item is no longer accessible.
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onArchive?.(event);
            }}
            title="Archive"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <Archive size={12} />
          </button>
        </div>
      </div>
    );
  }

  const { title, identifier, summary, bodySnippet } = event.renderPayload || {};

  return (
    <div
      role="article"
      aria-label={`${isUnread ? 'Unread: ' : ''}${event.importance === 'focus' ? 'Focus: ' : ''}${identifier || ''} ${title || ''} ${summary || ''}`}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onSelect}
      className="inbox-row"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '48px',
        padding: '6px var(--space-3)',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: isSelected
          ? 'var(--bg-surface-raised)'
          : isUnread
          ? 'var(--bg-surface)'
          : 'var(--bg-canvas)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color var(--duration-fast) ease',
        outline: isSelected ? '1px solid var(--border-focus)' : 'none'
      }}
    >
      {/* Top Header Line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        {/* Unread indicator dot */}
        <div style={{ width: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isUnread && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-base)'
              }}
            />
          )}
        </div>

        {/* Importance icon */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {getEventIcon(event.eventType, event.importance)}
        </div>

        {/* Identifier & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          {identifier && (
            <span
              className="font-mono"
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-medium)',
                color: 'var(--text-secondary)',
                flexShrink: 0
              }}
            >
              {identifier}
            </span>
          )}
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: isUnread ? 'var(--font-semibold)' : 'var(--font-normal)',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title || 'Untitled resource'}
          </span>
        </div>

        {/* Timestamp */}
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            flexShrink: 0,
            marginLeft: 'auto'
          }}
        >
          {formatTimestamp(event.createdAt)}
        </span>
      </div>

      {/* Bottom Summary & Excerpt Line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '14px', marginTop: '2px', minWidth: 0 }}>
        <span
          style={{
            fontSize: 'var(--text-2xs)',
            color: event.responseRequired ? 'var(--primary-base)' : 'var(--text-muted)',
            fontWeight: event.responseRequired ? 'var(--font-semibold)' : 'normal',
            flexShrink: 0
          }}
        >
          {summary || descriptor.actionText}
        </span>
        {bodySnippet && (
          <span
            style={{
              fontSize: 'var(--text-2xs)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '320px'
            }}
          >
            "{bodySnippet}"
          </span>
        )}
      </div>
    </div>
  );
}
