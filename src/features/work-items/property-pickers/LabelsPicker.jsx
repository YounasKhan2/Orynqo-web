import React, { useState, useRef, useMemo } from 'react';
import { Tag } from 'lucide-react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerSearch,
  PropertyPickerList,
  PropertyPickerOption
} from '../../../components/property-picker';

const DEFAULT_LABELS = [
  'algorithms',
  'backend',
  'core-sync',
  'security',
  'auth',
  'soc2',
  'ui',
  'data-grid',
  'performance',
  'mobile',
  'api'
];

/**
 * LabelsPicker Domain Adapter
 * Multi-select label tagger supporting search, tag toggling, chip display, and dynamic creation.
 */
export function LabelsPicker({
  value = [], // string[]
  selectedLabels,
  onSelect, // (nextLabels: string[]) => void | Promise<void>
  isReadOnly = false,
  size = 'default',
  align = 'start',
  className = '',
  availableLabels = DEFAULT_LABELS,
  isOpen: controlledIsOpen,
  defaultOpen = false
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val) => setInternalIsOpen(val);
  const [searchQuery, setSearchQuery] = useState('');
  const [mutationError, setMutationError] = useState(null);
  const [allLabels, setAllLabels] = useState(availableLabels);
  const triggerRef = useRef(null);

  const rawValue = selectedLabels !== undefined ? selectedLabels : value;
  const activeLabels = useMemo(() => (Array.isArray(rawValue) ? rawValue : []), [rawValue]);

  const filteredLabels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allLabels;
    return allLabels.filter((l) => l.toLowerCase().includes(q));
  }, [allLabels, searchQuery]);

  const canCreate =
    searchQuery.trim().length > 0 &&
    !allLabels.some((l) => l.toLowerCase() === searchQuery.toLowerCase().trim());

  const handleToggleLabel = async (label) => {
    setMutationError(null);
    const exists = activeLabels.includes(label);
    const next = exists
      ? activeLabels.filter((l) => l !== label)
      : [...activeLabels, label];

    try {
      const res = onSelect?.(next);
      if (res && typeof res.then === 'function') {
        await res;
      }
    } catch (err) {
      setMutationError(`Failed to update label '${label}'`);
      // Revert is handled because state was not committed externally
    }
  };

  const handleCreateLabel = async () => {
    const newTag = searchQuery.trim().toLowerCase();
    if (!newTag) return;
    if (!allLabels.includes(newTag)) {
      setAllLabels((prev) => [...prev, newTag]);
    }
    setSearchQuery('');
    await handleToggleLabel(newTag);
  };

  const triggerLabel =
    activeLabels.length === 0
      ? '+ Label'
      : activeLabels.length === 1
      ? activeLabels[0]
      : `${activeLabels[0]} +${activeLabels.length - 1}`;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Labels"
        valueLabel={triggerLabel}
        icon={Tag}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change labels"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery('');
          setMutationError(null);
        }}
        triggerRef={triggerRef}
        width={220}
        align={align}
        title="Labels"
      >
        <PropertyPickerSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter or create label..."
        />

        <PropertyPickerList
          label="Select labels"
          isError={!!mutationError}
          errorMessage={mutationError}
          onRetry={() => setMutationError(null)}
          isEmpty={filteredLabels.length === 0 && !canCreate}
          emptyMessage="No matching labels"
          emptyActionLabel={canCreate ? `Create "${searchQuery.trim()}"` : null}
          onEmptyAction={handleCreateLabel}
        >
          {canCreate && (
            <PropertyPickerOption
              label={`Create "${searchQuery.trim()}"`}
              icon={Tag}
              onClick={handleCreateLabel}
            />
          )}

          {filteredLabels.map((l) => {
            const isSelected = activeLabels.includes(l);
            return (
              <PropertyPickerOption
                key={l}
                label={l}
                icon={Tag}
                isSelected={isSelected}
                onClick={() => handleToggleLabel(l)}
              />
            );
          })}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
