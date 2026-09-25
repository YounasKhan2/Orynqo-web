import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../../design-system';

/**
 * InboxEmptyState Component (UI-04A / UI-04B)
 *
 * Dense, calm, operational empty state:
 * - Active empty: "You're caught up."
 * - Filtered empty: "No notifications match these filters." with Reset Filters affordance.
 * - No oversized graphics, no gamified celebrations.
 */

export function InboxEmptyState({
  tab = 'focus',
  filtered = false,
  onResetFilters
}) {
  if (filtered) {
    return (
      <div
        role="status"
        aria-label="No matching notifications"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--space-4)',
          gap: 'var(--space-3)',
          color: 'var(--text-muted)',
          textAlign: 'center',
          flex: 1
        }}
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          No notifications match these filters.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="xs" onClick={onResetFilters}>
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  const getEmptyMessage = () => {
    switch (tab) {
      case 'later':
        return {
          title: 'No snoozed notifications',
          subtitle: 'Items postponed with Snooze (Z) will appear here until their scheduled return.'
        };
      case 'archive':
        return {
          title: 'Archive is empty',
          subtitle: 'Notifications cleared from your active inbox will be stored here for reference.'
        };
      case 'all':
        return {
          title: "You're caught up.",
          subtitle: 'All active notifications across the workspace have been processed.'
        };
      case 'focus':
      default:
        return {
          title: "You're caught up.",
          subtitle: 'No direct mentions, review requests, or blocking dependencies require your attention.'
        };
    }
  };

  const message = getEmptyMessage();

  return (
    <div
      role="status"
      aria-label={message.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-4)',
        gap: 'var(--space-2)',
        textAlign: 'center',
        flex: 1
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-raised)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-base)'
        }}
      >
        <CheckCircle2 size={18} />
      </div>
      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
        {message.title}
      </h3>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.4 }}>
        {message.subtitle}
      </p>
    </div>
  );
}
