import React, { useState, useRef, useMemo } from 'react';
import { Briefcase, XCircle } from 'lucide-react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerSearch,
  PropertyPickerList,
  PropertyPickerOption
} from '../../../components/property-picker';
import { PROJECTS } from '../../../data/mockData';

/**
 * ProjectPicker Domain Adapter
 * Workspace resource selector with multi-team awareness, search, and zero-leakage security.
 */
export function ProjectPicker({
  value = null, // projectId | null
  onSelect,
  isReadOnly = false,
  isRestricted = false,
  size = 'default',
  align = 'start',
  className = '',
  projects = PROJECTS
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef(null);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === value),
    [projects, value]
  );

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => {
      if (p.isRestricted || p.restricted) return false; // Zero-leakage invariant
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.key && p.key.toLowerCase().includes(q))
      );
    });
  }, [projects, searchQuery]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Project"
        valueLabel={currentProject ? currentProject.name : 'No Project'}
        icon={Briefcase}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        isRestricted={isRestricted}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change project"
      />

      <PropertyPicker
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
        triggerRef={triggerRef}
        width={220}
        align={align}
        title="Project"
      >
        <PropertyPickerSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter projects..."
        />

        <PropertyPickerList
          label="Select project"
          isEmpty={filteredProjects.length === 0 && searchQuery !== ''}
          emptyMessage="No matching projects"
        >
          {/* No Project option */}
          <PropertyPickerOption
            label="No Project"
            icon={XCircle}
            isSelected={value === null}
            onClick={() => {
              onSelect?.(null);
              setIsOpen(false);
              setSearchQuery('');
            }}
          />

          {filteredProjects.map((p) => {
            const isSelected = value === p.id;
            return (
              <PropertyPickerOption
                key={p.id}
                label={p.name}
                description={p.key}
                icon={Briefcase}
                isSelected={isSelected}
                onClick={() => {
                  onSelect?.(p.id);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
              />
            );
          })}
        </PropertyPickerList>
      </PropertyPicker>
    </div>
  );
}
