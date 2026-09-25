import React, { useState, useRef } from 'react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerList,
  PropertyPickerOption
} from '../../../components/property-picker';
import { TypeBadge } from '../../../components/badges';
import { ITEM_TYPE_DEFINITIONS, CORE_WORK_ITEM_TYPES } from '../../../constants/workItems';

/**
 * TypePicker Domain Adapter
 * Strictly supports CORE types: Task, Issue, Bug.
 */
export function TypePicker({
  value = 'task',
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

  const currentDef = ITEM_TYPE_DEFINITIONS[value] || ITEM_TYPE_DEFINITIONS.task;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Type"
        valueLabel={currentDef.label}
        badge={<TypeBadge type={value} interactive={false} />}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change work item type"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        width={160}
        align={align}
        title="WorkItem Type"
      >
        <PropertyPickerList label="Work item types">
          {CORE_WORK_ITEM_TYPES.map((typeKey) => {
            const def = ITEM_TYPE_DEFINITIONS[typeKey];
            const isSelected = value === typeKey;
            return (
              <PropertyPickerOption
                key={typeKey}
                label={def.label}
                badge={<TypeBadge type={typeKey} interactive={false} />}
                isSelected={isSelected}
                onClick={() => {
                  onSelect?.(typeKey);
                  setIsOpen(false);
                }}
              />
            );
          })}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
