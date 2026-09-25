import React, { useState, useRef } from 'react';
import { Layers } from 'lucide-react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerList,
  PropertyPickerOption
} from '../../../components/property-picker';
import { TEAMS } from '../../../data/mockData';
import { checkTeamChangeConsequences } from './teamConsequenceResolver';

/**
 * TeamPicker Domain Adapter
 * Execution ownership root. Supports consequence checking for existing WorkItems.
 */
export function TeamPicker({
  value = 'team-core',
  item = null, // If provided, evaluates consequences before committing
  onSelect,
  onRequestTeamChange, // (consequenceData) => void for existing items
  isReadOnly = false,
  size = 'default',
  align = 'start',
  className = '',
  teams = TEAMS
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const currentTeam = teams.find((t) => t.id === value);

  const handleSelectTeam = (targetTeamId) => {
    setIsOpen(false);
    if (targetTeamId === value) return;

    if (item) {
      // Evaluate cascading consequences for existing WorkItem
      const check = checkTeamChangeConsequences(item, targetTeamId);
      if (check.hasConsequences) {
        if (onRequestTeamChange) {
          onRequestTeamChange(check);
        } else {
          // If no separate request handler, pass proposed patch directly
          onSelect?.(targetTeamId, check.proposedPatch);
        }
        return;
      }
    }

    onSelect?.(targetTeamId);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Team"
        valueLabel={currentTeam ? currentTeam.name : 'Select Team...'}
        icon={Layers}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change team"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        width={200}
        align={align}
        title="Execution Team"
      >
        <PropertyPickerList label="Select execution team">
          {teams.map((t) => {
            const isSelected = value === t.id;
            return (
              <PropertyPickerOption
                key={t.id}
                label={t.name}
                description={`${t.key} • ${t.description}`}
                icon={Layers}
                isSelected={isSelected}
                onClick={() => handleSelectTeam(t.id)}
              />
            );
          })}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
