import React, { useState, useRef } from 'react';
import { Calendar, XCircle, Clock } from 'lucide-react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerList,
  PropertyPickerOption,
  PropertyPickerSection
} from '../../../components/property-picker';

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return formatDate(d);
}

/**
 * DatePicker Domain Adapter
 * Reusable date interaction offering instant relative shortcuts and ISO date selection.
 */
export function DatePicker({
  value = null, // 'YYYY-MM-DD' | null
  label = 'Due Date',
  onSelect,
  isReadOnly = false,
  size = 'default',
  align = 'start',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleSelectDate = (dateVal) => {
    onSelect?.(dateVal);
    setIsOpen(false);
  };

  const todayStr = getRelativeDate(0);
  const tomorrowStr = getRelativeDate(1);
  const nextWeekStr = getRelativeDate(7);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label={label}
        valueLabel={value || `No ${label}`}
        icon={Calendar}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Change ${label}`}
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        width={200}
        align={align}
        title={label}
      >
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleSelectDate(e.target.value || null)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '4px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <PropertyPickerList label="Date shortcuts">
          <PropertyPickerSection title="Shortcuts">
            <PropertyPickerOption
              label="Today"
              description={todayStr}
              icon={Clock}
              isSelected={value === todayStr}
              onClick={() => handleSelectDate(todayStr)}
            />
            <PropertyPickerOption
              label="Tomorrow"
              description={tomorrowStr}
              icon={Clock}
              isSelected={value === tomorrowStr}
              onClick={() => handleSelectDate(tomorrowStr)}
            />
            <PropertyPickerOption
              label="Next Week"
              description={nextWeekStr}
              icon={Calendar}
              isSelected={value === nextWeekStr}
              onClick={() => handleSelectDate(nextWeekStr)}
            />
          </PropertyPickerSection>

          {value && (
            <PropertyPickerSection title="Actions">
              <PropertyPickerOption
                label="Clear Date"
                icon={XCircle}
                onClick={() => handleSelectDate(null)}
              />
            </PropertyPickerSection>
          )}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
