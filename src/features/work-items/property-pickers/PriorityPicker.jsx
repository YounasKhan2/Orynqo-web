import React, { useState, useRef } from 'react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerList,
  PropertyPickerOption
} from '../../../components/property-picker';
import { PriorityBadge } from '../../../components/badges';
import { PRIORITY_DEFINITIONS } from '../../../constants/workItems';

const PRIORITY_KEYS = ['urgent', 'high', 'medium', 'low', 'none'];

/**
 * PriorityPicker Domain Adapter
 * Strictly supports 5 semantic priority levels with icons & badges.
 */
export function PriorityPicker({
  value = 'medium',
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

  const currentDef = PRIORITY_DEFINITIONS[value] || PRIORITY_DEFINITIONS.none;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Priority"
        valueLabel={currentDef.label}
        badge={<PriorityBadge priorityId={value} interactive={false} />}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change priority"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        width={160}
        align={align}
        title="Priority"
      >
        <PropertyPickerList label="Select priority">
          {PRIORITY_KEYS.map((pKey) => {
            const def = PRIORITY_DEFINITIONS[pKey];
            const isSelected = value === pKey;
            return (
              <PropertyPickerOption
                key={pKey}
                label={def.label}
                badge={<PriorityBadge priorityId={pKey} interactive={false} />}
                isSelected={isSelected}
                onClick={() => {
                  onSelect?.(pKey);
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
