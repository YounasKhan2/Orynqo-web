import React, { useState, useRef, useMemo } from 'react';
import { Calendar, CircleDashed } from 'lucide-react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerList,
  PropertyPickerOption,
  PropertyPickerSection
} from '../../../components/property-picker';
import { CYCLES } from '../../../data/mockData';

/**
 * CyclePicker Domain Adapter
 * Strictly Team-owned: queries cycles strictly belonging to the item's teamId.
 */
export function CyclePicker({
  value = null, // cycleId | null
  teamId = 'team-core',
  onSelect,
  isReadOnly = false,
  size = 'default',
  align = 'start',
  className = '',
  cycles = CYCLES,
  isOpen: controlledIsOpen,
  defaultOpen = false
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val) => setInternalIsOpen(val);
  const triggerRef = useRef(null);

  // Filter cycles strictly belonging to the given teamId
  const teamCycles = useMemo(
    () => cycles.filter((c) => c.teamId === teamId),
    [cycles, teamId]
  );

  const currentCycle = useMemo(
    () => teamCycles.find((c) => c.id === value),
    [teamCycles, value]
  );

  const activeCycles = teamCycles.filter((c) => c.status === 'active');
  const upcomingCycles = teamCycles.filter((c) => c.status === 'upcoming');
  const completedCycles = teamCycles.filter((c) => c.status === 'completed');

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Cycle"
        valueLabel={currentCycle ? currentCycle.name : 'No Cycle / Backlog'}
        icon={Calendar}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change cycle"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        width={220}
        align={align}
        title="Sprint Cycle"
      >
        <PropertyPickerList label="Select cycle">
          {/* No Cycle / Backlog */}
          <PropertyPickerOption
            label="No Cycle / Backlog"
            icon={CircleDashed}
            isSelected={value === null}
            onClick={() => {
              onSelect?.(null);
              setIsOpen(false);
            }}
          />

          {/* Active Cycle */}
          {activeCycles.length > 0 && (
            <PropertyPickerSection title="Active Cycle">
              {activeCycles.map((c) => (
                <PropertyPickerOption
                  key={c.id}
                  label={c.name}
                  description={`${c.daysRemaining ?? 0} days remaining`}
                  icon={Calendar}
                  isSelected={value === c.id}
                  onClick={() => {
                    onSelect?.(c.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </PropertyPickerSection>
          )}

          {/* Upcoming Cycles */}
          {upcomingCycles.length > 0 && (
            <PropertyPickerSection title="Upcoming">
              {upcomingCycles.map((c) => (
                <PropertyPickerOption
                  key={c.id}
                  label={c.name}
                  description={`Starts ${c.startDate}`}
                  icon={Calendar}
                  isSelected={value === c.id}
                  onClick={() => {
                    onSelect?.(c.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </PropertyPickerSection>
          )}

          {/* Completed Cycles (if current value is a completed cycle) */}
          {completedCycles.some((c) => c.id === value) && (
            <PropertyPickerSection title="Completed">
              {completedCycles
                .filter((c) => c.id === value)
                .map((c) => (
                  <PropertyPickerOption
                    key={c.id}
                    label={c.name}
                    description="Completed"
                    icon={Calendar}
                    isSelected={true}
                    onClick={() => {
                      onSelect?.(c.id);
                      setIsOpen(false);
                    }}
                  />
                ))}
            </PropertyPickerSection>
          )}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
