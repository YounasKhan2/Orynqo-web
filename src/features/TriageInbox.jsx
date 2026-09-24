import React, { useState, useEffect } from 'react';
import { INBOX_NOTIFICATIONS, USERS } from '../data/mockData';
import { Avatar } from '../design-system/primitives/Avatar';
import { Button } from '../design-system/primitives/Button';
import {
  Inbox,
  Check,
  Archive,
  MessageSquare,
  GitPullRequest,
  CheckSquare,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';

/**
 * TriageInbox Feature
 * High-velocity zero-mouse notification and issue triage feed
 */
export function TriageInbox({
  onOpenItemById
}) {
  const [notifications, setNotifications] = useState(INBOX_NOTIFICATIONS);
  const [filterUnread, setFilterUnread] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayedList = filterUnread
    ? notifications.filter((n) => n.unread)
    : notifications;

  const handleArchive = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  // Keyboard navigation for inbox (j/k, e to archive, enter to open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, displayedList.length - 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'e') {
        e.preventDefault();
        if (displayedList[selectedIndex]) {
          handleArchive(displayedList[selectedIndex].id);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayedList[selectedIndex] && displayedList[selectedIndex].itemId) {
          onOpenItemById(displayedList[selectedIndex].itemId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedList, selectedIndex, onOpenItemById]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflowY: 'auto'
      }}
    >
      {/* Inbox Subheader */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--action-strip-height)',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Inbox size={14} color="var(--primary-base)" />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            Notification Triage Feed
          </span>
          <span className="kbd-shortcut">E to archive</span>
          <span className="kbd-shortcut">↵ to inspect</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setFilterUnread(!filterUnread)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 8px',
              fontSize: 'var(--text-xs)',
              backgroundColor: filterUnread ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)',
              border: `1px solid ${filterUnread ? 'var(--primary-base)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xs)',
              color: filterUnread ? 'var(--primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Filter size={11} />
            <span>{filterUnread ? 'Unread only' : 'All updates'}</span>
          </button>
        </div>
      </div>

      {/* Inbox Items */}
      <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {displayedList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Inbox Zero. All notifications cleared.
          </div>
        ) : (
          displayedList.map((notif, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  if (notif.itemId) onOpenItemById(notif.itemId);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)',
                  backgroundColor: isSelected ? 'var(--bg-surface-selected)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--border-focus)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'background-color var(--duration-fast) ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  {/* Unread indicator dot */}
                  <div style={{ paddingTop: '5px' }}>
                    <span
                      style={{
                        display: 'block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: notif.unread ? 'var(--primary-base)' : 'transparent'
                      }}
                    />
                  </div>

                  <Avatar user={notif.author} size="sm" />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {notif.timestamp}
                      </span>
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-normal)' }}>
                      {notif.snippet}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    title={notif.unread ? 'Mark as read' : 'Mark as unread'}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(notif.id);
                    }}
                    title="Archive (E)"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Archive size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
