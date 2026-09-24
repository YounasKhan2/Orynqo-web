import React from 'react';
import { Badge } from '../../design-system';
import { PRIORITY_DEFINITIONS } from '../../constants/workItems';
import {
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus
} from 'lucide-react';

const PRIORITY_ICONS = {
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus
};

/**
 * PriorityBadge Product Component
 * Domain-aware priority representation
 */
export function PriorityBadge({
  priorityId,
  onClick,
  interactive = false,
  className = ''
}) {
  const priority = PRIORITY_DEFINITIONS[priorityId] || PRIORITY_DEFINITIONS.none;
  const IconComponent = PRIORITY_ICONS[priority.icon] || Minus;

  return (
    <Badge
      color={priority.color}
      bg={priority.bg}
      icon={IconComponent}
      interactive={interactive}
      onClick={onClick}
      className={className}
      title={`Priority: ${priority.label}`}
    >
      {priority.label}
    </Badge>
  );
}
