import React from 'react';
import { ITEM_TYPE_DEFINITIONS } from '../../constants/workItems';
import {
  Sparkles,
  Bug,
  CheckSquare,
  Flag,
  Wrench
} from 'lucide-react';

const TYPE_ICONS = {
  Sparkles,
  Bug,
  CheckSquare,
  Flag,
  Wrench
};

/**
 * TypeBadge Product Component
 * Displays issue/work-item type (Bug, Feature, Task, Milestone, Chore)
 */
export function TypeBadge({ typeId, showLabel = true, className = '' }) {
  const type = ITEM_TYPE_DEFINITIONS[typeId] || ITEM_TYPE_DEFINITIONS.task;
  const IconComponent = TYPE_ICONS[type.icon] || CheckSquare;

  return (
    <span
      className={`type-badge ${className}`}
      title={`Type: ${type.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        lineHeight: 1,
        userSelect: 'none'
      }}
    >
      <IconComponent size={12} style={{ color: type.color, flexShrink: 0 }} />
      {showLabel && <span>{type.label}</span>}
    </span>
  );
}
