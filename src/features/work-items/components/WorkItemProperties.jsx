import React, { useState } from 'react';
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
import {
  StatusPicker,
  PriorityPicker,
  AssigneePicker,
  TeamPicker,
  ProjectPicker,
  CyclePicker,
  LabelsPicker,
  DatePicker,
  TeamChangeConfirmation
} from '../property-pickers';

/**
 * WorkItemProperties Component
 * High-density key-value property matrix for canonical WorkItems.
 * Migrated to Universal Property Pickers (UI-01C).
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
  const [consequenceData, setConsequenceData] = useState(null);

  if (!item) return null;

  const handleTeamSelect = (newTeamId, proposedPatch) => {
    if (proposedPatch) {
      onUpdateItem?.(proposedPatch);
    } else {
      onUpdateItem?.({ teamId: newTeamId });
    }
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
      {/* Status Picker */}
      <PropertyRow label="Status" icon={Clock}>
        <StatusPicker
          value={item.status}
          teamId={item.teamId || 'team-core'}
          isReadOnly={isReadOnly}
          onSelect={(status) => onUpdateItem?.({ status })}
        />
      </PropertyRow>

      {/* Priority Picker */}
      <PropertyRow label="Priority" icon={AlertTriangle}>
        <PriorityPicker
          value={item.priority}
          isReadOnly={isReadOnly}
          onSelect={(priority) => onUpdateItem?.({ priority })}
        />
      </PropertyRow>

      {/* Assignee Picker */}
      <PropertyRow label="Assignee" icon={User}>
        <AssigneePicker
          value={item.assigneeId}
          isReadOnly={isReadOnly}
          isRestricted={item.isAssigneeRestricted || item.isRestricted}
          onSelect={(assigneeId) => onUpdateItem?.({ assigneeId })}
        />
      </PropertyRow>

      {/* Team Picker with Consequence Detection */}
      <PropertyRow label="Team" icon={Layers}>
        <TeamPicker
          value={item.teamId}
          item={item}
          isReadOnly={isReadOnly}
          onRequestTeamChange={setConsequenceData}
          onSelect={handleTeamSelect}
        />
      </PropertyRow>

      {/* Project Picker */}
      <PropertyRow label="Project" icon={Calendar}>
        <ProjectPicker
          value={item.projectId}
          isReadOnly={isReadOnly}
          onSelect={(projectId) => onUpdateItem?.({ projectId })}
        />
      </PropertyRow>

      {/* Cycle Picker (Strictly Team-Owned) */}
      <PropertyRow label="Cycle" icon={Clock}>
        <CyclePicker
          value={item.cycleId}
          teamId={item.teamId || 'team-core'}
          isReadOnly={isReadOnly}
          onSelect={(cycleId) => onUpdateItem?.({ cycleId })}
        />
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
            <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
              pts
            </span>
          </div>
        )}
      </PropertyRow>

      {/* Due Date Picker */}
      <PropertyRow label="Due Date" icon={Calendar}>
        <DatePicker
          value={item.dueDate}
          isReadOnly={isReadOnly}
          onSelect={(dueDate) => onUpdateItem?.({ dueDate })}
        />
      </PropertyRow>

      {/* Labels Multi-Select Picker */}
      <PropertyRow label="Labels" icon={Tag}>
        <LabelsPicker
          value={item.labels || []}
          isReadOnly={isReadOnly}
          onSelect={(labels) => onUpdateItem?.({ labels })}
        />
      </PropertyRow>

      {/* Team Change Consequence Confirmation Modal */}
      {consequenceData && (
        <TeamChangeConfirmation
          isOpen={true}
          onClose={() => setConsequenceData(null)}
          consequenceData={consequenceData}
          onConfirm={(patch) => {
            onUpdateItem?.(patch);
            setConsequenceData(null);
          }}
        />
      )}
    </div>
  );
}
