import React, { useState, useRef } from 'react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerList,
  PropertyPickerSection,
  PropertyPickerOption
} from '../../../components/property-picker';
import { StatusBadge } from '../../../components/badges';
import { STATUS_CATEGORIES } from '../../../constants/workItems';
import { getTeamWorkflowStatuses, EXTENDED_STATUS_DEFINITIONS } from './teamWorkflows';

/**
 * StatusPicker Domain Adapter
 * Team-workflow driven: queries valid statuses for the active team and groups by category.
 * Enforces optimistic update, rendered rollback on failure, and accessible error reporting.
 */
export function StatusPicker({
  value = 'todo',
  teamId = 'team-core',
  onSelect,
  isReadOnly = false,
  size = 'default',
  align = 'start',
  className = '',
  isOpen: controlledIsOpen,
  defaultOpen = false
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val) => {
    if (typeof val === 'function') {
      setInternalIsOpen(val);
    } else {
      setInternalIsOpen(val);
    }
  };
  const triggerRef = useRef(null);

  const [optimisticStatus, setOptimisticStatus] = useState(null);
  const [mutationError, setMutationError] = useState(null);

  const activeStatus = optimisticStatus !== null ? optimisticStatus : value;

  const availableStatuses = getTeamWorkflowStatuses(teamId);
  const currentDef = EXTENDED_STATUS_DEFINITIONS[activeStatus] || availableStatuses[0];

  // Group available statuses by category
  const categoriesPresent = Object.keys(STATUS_CATEGORIES).filter((catKey) =>
    availableStatuses.some((s) => s.category === catKey)
  );

  const handleSelectStatus = async (statusId) => {
    if (statusId === activeStatus) {
      setIsOpen(false);
      return;
    }

    setMutationError(null);
    setOptimisticStatus(statusId);

    try {
      const res = onSelect?.(statusId);
      if (res && typeof res.then === 'function') {
        await res;
      }
      setOptimisticStatus(null);
      setIsOpen(false);
    } catch (err) {
      // Revert optimistic status immediately to previous canonical status
      setOptimisticStatus(null);
      setMutationError(err.message || `Failed to update status to '${statusId}'`);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Status"
        valueLabel={currentDef?.label}
        badge={<StatusBadge statusId={activeStatus} interactive={false} />}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => {
          setMutationError(null);
          setIsOpen((prev) => !prev);
        }}
        aria-label="Change status"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setMutationError(null);
        }}
        triggerRef={triggerRef}
        width={180}
        align={align}
        title="Status"
      >
        {mutationError && (
          <div
            role="alert"
            style={{
              padding: '6px 8px',
              fontSize: '11px',
              color: 'var(--priority-urgent, #ef4444)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-xs, 4px)',
              margin: '4px 8px'
            }}
          >
            {mutationError}
          </div>
        )}

        <PropertyPickerList label="Select status">
          {categoriesPresent.map((catKey) => {
            const catDef = STATUS_CATEGORIES[catKey];
            const statusesInCat = availableStatuses.filter((s) => s.category === catKey);

            return (
              <PropertyPickerSection key={catKey} title={catDef?.label || catKey}>
                {statusesInCat.map((s) => {
                  const isSelected = activeStatus === s.id;
                  return (
                    <PropertyPickerOption
                      key={s.id}
                      label={s.label}
                      badge={<StatusBadge statusId={s.id} interactive={false} />}
                      isSelected={isSelected}
                      onClick={() => handleSelectStatus(s.id)}
                    />
                  );
                })}
              </PropertyPickerSection>
            );
          })}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
