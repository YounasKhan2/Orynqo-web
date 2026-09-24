import React from 'react';
import {
  Clock,
  AlertTriangle,
  User,
  Layers,
  Calendar,
  Tag,
  Flag
} from 'lucide-react';
import { PropertyRow } from '../../../design-system';
import { StatusBadge, PriorityBadge } from '../../../components/badges';
import { UserAvatar } from '../../../components/avatars/UserAvatar';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../../constants/workItems';

/**
 * WorkItemProperties Component
 * High-density key-value property matrix for canonical WorkItems
 */
export function WorkItemProperties({
  item,
  assignee,
  project,
  cycle,
  team,
  onUpdateItem,
  isReadOnly = false,
  className = ''
}) {
  const statusKeys = Object.keys(STATUS_DEFINITIONS);
  const priorityKeys = ['none', 'low', 'medium', 'high', 'urgent'];

  const handleNextStatus = () => {
    if (isReadOnly) return;
    const currentIdx = statusKeys.indexOf(item.status);
    const nextIdx = (currentIdx + 1) % statusKeys.length;
    onUpdateItem?.({ status: statusKeys[nextIdx] });
  };

  const handleNextPriority = () => {
    if (isReadOnly) return;
    const currentIdx = priorityKeys.indexOf(item.priority);
    const nextIdx = (currentIdx + 1) % priorityKeys.length;
    onUpdateItem?.({ priority: priorityKeys[nextIdx] });
  };

  return (
    <div
      className={`work-item-properties ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-2) 0',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* Status */}
      <PropertyRow label="Status" icon={Clock}>
        <StatusBadge
          statusId={item.status}
          interactive={!isReadOnly}
          onClick={handleNextStatus}
        />
      </PropertyRow>

      {/* Priority */}
      <PropertyRow label="Priority" icon={AlertTriangle}>
        <PriorityBadge
          priorityId={item.priority}
          interactive={!isReadOnly}
          onClick={handleNextPriority}
        />
      </PropertyRow>

      {/* Assignee */}
      <PropertyRow label="Assignee" icon={User}>
        {assignee ? (
          <UserAvatar user={assignee} size="xs" showName />
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Unassigned</span>
        )}
      </PropertyRow>

      {/* Team */}
      {team && (
        <PropertyRow label="Team" icon={Layers}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {team.name}
          </span>
        </PropertyRow>
      )}

      {/* Project */}
      <PropertyRow label="Project" icon={Calendar}>
        <span style={{ fontSize: 'var(--text-xs)', color: project ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {project ? project.name : 'None'}
        </span>
      </PropertyRow>

      {/* Cycle */}
      <PropertyRow label="Cycle" icon={Clock}>
        <span style={{ fontSize: 'var(--text-xs)', color: cycle ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {cycle ? cycle.name : 'Backlog'}
        </span>
      </PropertyRow>

      {/* Milestone (Checkpoint entity - not WorkItem subtype) */}
      {item.milestoneId && (
        <PropertyRow label="Milestone" icon={Flag}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {item.milestoneId}
          </span>
        </PropertyRow>
      )}

      {/* Estimate */}
      <PropertyRow label="Estimate" icon={Layers}>
        {isReadOnly ? (
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {item.estimate ? `${item.estimate} pts` : '-'}
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              value={item.estimate || ''}
              onChange={(e) => onUpdateItem?.({ estimate: parseInt(e.target.value, 10) || 0 })}
              aria-label="Story points estimate"
              style={{
                width: '44px',
                height: '22px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>pts</span>
          </div>
        )}
      </PropertyRow>

      {/* Due Date */}
      {item.dueDate && (
        <PropertyRow label="Due Date" icon={Calendar}>
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {item.dueDate}
          </span>
        </PropertyRow>
      )}

      {/* Labels */}
      {item.labels && item.labels.length > 0 && (
        <PropertyRow label="Labels" icon={Tag}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {item.labels.map((lbl) => (
              <span
                key={lbl}
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-secondary)'
                }}
              >
                {lbl}
              </span>
            ))}
          </div>
        </PropertyRow>
      )}
    </div>
  );
}
