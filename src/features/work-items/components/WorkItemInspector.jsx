import React, { useState, useEffect } from 'react';
import { Drawer } from '../../../design-system';
import { WorkItemDetailContainer } from './WorkItemDetailContainer';

/**
 * WorkItemInspector Component (WRK-005)
 * Master Inspector Drawer for canonical WorkItems
 * Preserves active view context, supports focus restoration, and maximizes on demand
 */
export function WorkItemInspector({
  item,
  isOpen,
  onClose,
  onUpdateItem,
  onOpenSpec,
  returnFocusRef,
  isReadOnly = false,
  isLoading = false,
  isRestricted = false,
  isDocked = true,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Restore focus to triggering row or button when inspector closes
  const handleClose = () => {
    onClose?.();
    if (returnFocusRef && returnFocusRef.current) {
      setTimeout(() => {
        returnFocusRef.current?.focus();
      }, 50);
    }
  };

  if (!isOpen) return null;

  const currentWidth = isExpanded ? '720px' : '440px';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      width={currentWidth}
      side="right"
      isDocked={isDocked}
      className={`work-item-inspector-drawer ${className}`}
      style={{
        transition: 'width var(--duration-normal) ease-in-out'
      }}
    >
      <WorkItemDetailContainer
        item={item}
        onUpdateItem={onUpdateItem}
        onOpenSpec={onOpenSpec}
        onClose={handleClose}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        isReadOnly={isReadOnly}
        isLoading={isLoading}
        isRestricted={isRestricted}
      />
    </Drawer>
  );
}
