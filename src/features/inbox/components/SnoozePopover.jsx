import React from 'react';
import { Clock, Calendar, Sun, ArrowRight } from 'lucide-react';
import { Button } from '../../../design-system';

/**
 * SnoozePopover Component (UI-04A / UI-04B)
 *
 * Provides rapid, accessible snooze presets:
 * - Later Today (e.g. 4 hours from now)
 * - Tomorrow Morning (9:00 AM)
 * - Next Week (Monday 9:00 AM)
 * - Custom ISO date picker
 */

export function SnoozePopover({
  isOpen,
  onClose,
  onSnooze,
  targetName = 'item'
}) {
  if (!isOpen) return null;

  const handlePreset = (type) => {
    const now = new Date();
    let target = new Date();

    if (type === 'later_today') {
      target.setHours(target.getHours() + 4);
    } else if (type === 'tomorrow') {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (type === 'next_week') {
      const daysUntilMonday = ((1 + 7 - target.getDay()) % 7) || 7;
      target.setDate(target.getDate() + daysUntilMonday);
      target.setHours(9, 0, 0, 0);
    }

    onSnooze(target.toISOString());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Snooze notification"
      data-keyboard-scope="OVERLAY"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '320px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-4)',
        gap: 'var(--space-3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
          Snooze Notification
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close snooze popover"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
        Temporarily remove this notification until the selected time.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          type="button"
          onClick={() => handlePreset('later_today')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={14} color="var(--primary-base)" />
            <span>Later Today</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>+4 hours</span>
        </button>

        <button
          type="button"
          onClick={() => handlePreset('tomorrow')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} color="var(--primary-base)" />
            <span>Tomorrow Morning</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>9:00 AM</span>
        </button>

        <button
          type="button"
          onClick={() => handlePreset('next_week')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="var(--primary-base)" />
            <span>Next Week</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>Mon 9:00 AM</span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        <Button variant="secondary" size="xs" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
