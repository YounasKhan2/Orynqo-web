import React from 'react';
import { Badge } from '../../design-system';
import { STATUS_DEFINITIONS } from '../../constants/workItems';
import {
  CircleDashed,
  Circle,
  Clock,
  GitPullRequest,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const STATUS_ICONS = {
  CircleDashed,
  Circle,
  Clock,
  GitPullRequest,
  CheckCircle2,
  XCircle
};

/**
 * StatusBadge Product Component
 * Domain-aware status representation with Orynqo semantic states
 */
export function StatusBadge({
  statusId,
  onClick,
  interactive = false,
  className = ''
}) {
  const status = STATUS_DEFINITIONS[statusId] || STATUS_DEFINITIONS.todo;
  const IconComponent = STATUS_ICONS[status.icon] || Circle;

  return (
    <Badge
      color={status.color}
      bg={status.bg}
      icon={IconComponent}
      interactive={interactive}
      onClick={onClick}
      className={className}
      title={`Status: ${status.label}`}
    >
      {status.label}
    </Badge>
  );
}
