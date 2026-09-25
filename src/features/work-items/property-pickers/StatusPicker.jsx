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
  const setIsOpen = (val) => setInternalIsOpen(val);
  const triggerRef = useRef(null);

  const availableStatuses = getTeamWorkflowStatuses(teamId);
  const currentDef = EXTENDED_STATUS_DEFINITIONS[value] || availableStatuses[0];

  // Group available statuses by category
  const categoriesPresent = Object.keys(STATUS_CATEGORIES).filter((catKey) =>
    availableStatuses.some((s) => s.category === catKey)
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Status"
        valueLabel={currentDef?.label}
        badge={<StatusBadge statusId={value} interactive={false} />}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change status"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        width={180}
        align={align}
        title="Status"
      >
        <PropertyPickerList label="Select status">
          {categoriesPresent.map((catKey) => {
            const catDef = STATUS_CATEGORIES[catKey];
            const statusesInCat = availableStatuses.filter((s) => s.category === catKey);

            return (
              <PropertyPickerSection key={catKey} title={catDef?.label || catKey}>
                {statusesInCat.map((s) => {
                  const isSelected = value === s.id;
                  return (
                    <PropertyPickerOption
                      key={s.id}
                      label={s.label}
                      badge={<StatusBadge statusId={s.id} interactive={false} />}
                      isSelected={isSelected}
                      onClick={() => {
                        onSelect?.(s.id);
                        setIsOpen(false);
                      }}
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
