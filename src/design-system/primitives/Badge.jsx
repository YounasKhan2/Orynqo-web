import React from 'react';
import {
  STATUS_DEFINITIONS,
  PRIORITY_DEFINITIONS,
  ITEM_TYPE_DEFINITIONS
} from '../tokens';
import {
  CircleDashed,
  Circle,
  Clock,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus,
  Sparkles,
  Bug,
  CheckSquare,
  Flag,
  Wrench
} from 'lucide-react';

const ICON_MAP = {
  CircleDashed,
  Circle,
  Clock,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus,
  Sparkles,
  Bug,
  CheckSquare,
  Flag,
  Wrench
};

/**
 * StatusBadge Component
 */
export function StatusBadge({ statusId, onClick, interactive = false }) {
  const status = STATUS_DEFINITIONS[statusId] || STATUS_DEFINITIONS.todo;
  const IconComponent = ICON_MAP[status.icon] || Circle;

  return (
    <span
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 6px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        color: status.color,
        backgroundColor: status.bg || 'transparent',
        border: status.bg ? `1px solid ${status.color}33` : '1px solid transparent',
        borderRadius: 'var(--radius-xs)',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        lineHeight: 1
      }}
    >
      <IconComponent size={12} style={{ color: status.color, flexShrink: 0 }} />
      <span>{status.label}</span>
    </span>
  );
}

/**
 * PriorityBadge Component
 */
export function PriorityBadge({ priorityId, onClick, interactive = false }) {
  const priority = PRIORITY_DEFINITIONS[priorityId] || PRIORITY_DEFINITIONS.none;
  const IconComponent = ICON_MAP[priority.icon] || Minus;

  return (
    <span
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={`Priority: ${priority.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 5px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        color: priority.color,
        backgroundColor: priority.bg || 'transparent',
        borderRadius: 'var(--radius-xs)',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        lineHeight: 1
      }}
    >
      <IconComponent size={12} style={{ color: priority.color, flexShrink: 0 }} />
      <span>{priority.label}</span>
    </span>
  );
}

/**
 * TypeBadge Component
 */
export function TypeBadge({ typeId }) {
  const type = ITEM_TYPE_DEFINITIONS[typeId] || ITEM_TYPE_DEFINITIONS.task;
  const IconComponent = ICON_MAP[type.icon] || CheckSquare;

  return (
    <span
      title={`Type: ${type.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        lineHeight: 1
      }}
    >
      <IconComponent size={12} style={{ color: type.color, flexShrink: 0 }} />
      <span>{type.label}</span>
    </span>
  );
}

/**
 * TagBadge Component
 */
export function TagBadge({ label, onRemove }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '1px 5px',
        fontSize: 'var(--text-2xs)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xs)',
        lineHeight: '1.2'
      }}
    >
      #{label}
      {onRemove && (
        <span
          onClick={onRemove}
          style={{ cursor: 'pointer', marginLeft: '2px', color: 'var(--text-muted)' }}
        >
          ×
        </span>
      )}
    </span>
  );
}
