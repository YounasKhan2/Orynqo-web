import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronRight, MessageSquare, Archive, Check } from 'lucide-react';
import { InboxRow } from './InboxRow';

/**
 * InboxBundle Component (UI-04A / UI-04B)
 *
 * Presentation container for dynamically collapsed event groups:
 * - Displays child update count (e.g. "▸ 3 comments")
 * - Expands inline or opens in detail canvas
 * - Batch operations resolve to underlying child NotificationEvent IDs
 * - Preserves independent child event identities and timestamps
 */

export function InboxBundle({
  bundle,
  isSelected = false,
  onSelect,
  onSelectChild,
  onMarkRead,
  onArchive,
  onSnooze
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    events = [],
    childIds = [],
    unreadCount = 0,
    isUnread = false,
    sourceEntityType,
    latestEvent
  } = bundle;

  const { title, identifier, summary, bodySnippet } = bundle.renderPayload || {};

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      role="group"
      aria-label={`Notification bundle: ${identifier || ''} ${title || ''}, ${events.length} updates`}
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: isSelected ? 'var(--bg-surface-raised)' : 'transparent'
      }}
    >
      {/* Bundle Header Row */}
      <div
        role="article"
        tabIndex={0}
        onClick={onSelect}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '48px',
          padding: '6px var(--space-3)',
          cursor: 'pointer',
          backgroundColor: isUnread ? 'var(--bg-surface)' : 'var(--bg-canvas)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {/* Unread indicator */}
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

          {/* Bundle icon */}
          <Layers size={13} color="var(--primary-base)" style={{ flexShrink: 0 }} />

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
                fontWeight: isUnread ? 'var(--font-semibold)' : 'normal',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title || 'Grouped notifications'}
            </span>
          </div>

          {/* Expand / Collapse toggle & badge */}
          <button
            type="button"
            onClick={toggleExpand}
            aria-expanded={isExpanded}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '20px',
              padding: '0 6px',
              backgroundColor: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>{events.length} updates</span>
          </button>
        </div>

        {/* Latest Activity Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '14px', marginTop: '2px' }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
            Latest: {summary || 'Activity on this item'}
          </span>
          {bodySnippet && (
            <span
              style={{
                fontSize: 'var(--text-2xs)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '280px'
              }}
            >
              "{bodySnippet}"
            </span>
          )}
        </div>
      </div>

      {/* Expanded Child Notification List */}
      {isExpanded && (
        <div
          style={{
            paddingLeft: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          {events.map((childEvent) => (
            <InboxRow
              key={childEvent.id}
              event={childEvent}
              isSelected={false}
              onSelect={() => onSelectChild?.(childEvent)}
              onMarkRead={onMarkRead}
              onArchive={onArchive}
              onSnooze={onSnooze}
            />
          ))}
        </div>
      )}
    </div>
  );
}
