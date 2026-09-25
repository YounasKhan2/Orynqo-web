import React, { useState, useRef, useMemo } from 'react';
import { User, UserX } from 'lucide-react';
import {
  PropertyTrigger,
  PropertyPicker,
  PropertyPickerSearch,
  PropertyPickerList,
  PropertyPickerOption
} from '../../../components/property-picker';
import { UserAvatar } from '../../../components/avatars/UserAvatar';
import { USERS } from '../../../data/mockData';

/**
 * AssigneePicker Domain Adapter
 * Searchable user picker with Unassigned anchor, avatars, and zero-leakage security.
 */
export function AssigneePicker({
  value = null, // userId | null
  onSelect,
  isReadOnly = false,
  isRestricted = false,
  size = 'default',
  align = 'start',
  className = '',
  customUsers = null,
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
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef(null);

  const memberList = customUsers || USERS;
  const currentAssignee = useMemo(
    () => memberList.find((u) => u.id === value),
    [memberList, value]
  );

  // Filter members (zero-leakage: exclude restricted members completely from candidate search)
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return memberList.filter((u) => {
      if (u.isRestricted || u.restricted) return false; // Zero-leakage invariant
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    });
  }, [memberList, searchQuery]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <PropertyTrigger
        ref={triggerRef}
        label="Assignee"
        valueLabel={currentAssignee ? currentAssignee.name : 'Unassigned'}
        icon={currentAssignee ? null : User}
        badge={
          currentAssignee ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserAvatar user={currentAssignee} size="xs" />
              <span style={{ fontSize: '11px' }}>{currentAssignee.name}</span>
            </div>
          ) : null
        }
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        isRestricted={isRestricted}
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change assignee"
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
        title="Assignee"
      >
        <PropertyPickerSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter members..."
        />

        <PropertyPickerList
          label="Select assignee"
          isEmpty={filteredUsers.length === 0 && searchQuery !== ''}
          emptyMessage="No members match search"
        >
          {/* Unassigned option */}
          <PropertyPickerOption
            label="Unassigned"
            icon={UserX}
            isSelected={value === null}
            onClick={() => {
              onSelect?.(null);
              setIsOpen(false);
              setSearchQuery('');
            }}
          />

          {/* Accessible member candidates */}
          {filteredUsers.map((u) => {
            const isSelected = value === u.id;
            return (
              <PropertyPickerOption
                key={u.id}
                label={u.name}
                description={u.role || u.email}
                avatar={<UserAvatar user={u} size="xs" />}
                isSelected={isSelected}
                onClick={() => {
                  onSelect?.(u.id);
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
