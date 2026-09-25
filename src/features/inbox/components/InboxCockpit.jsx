import React, { useState, useRef, useCallback, useEffect } from 'react';
import { InboxToolbar } from './InboxToolbar';
import { InboxStream } from './InboxStream';
import { InboxDetailRouter } from './InboxDetailRouter';
import { InboxBulkBar } from './InboxBulkBar';
import { SnoozePopover } from './SnoozePopover';
import { useInboxKeyboard } from '../hooks/useInboxKeyboard';

/**
 * InboxCockpit Component (UI-04A / UI-04B)
 *
 * Master cockpit layout container for PER-001: Personal Triage Inbox:
 * - Wide mode: Split-pane (Stream ~400px left | Contextual Detail right)
 * - Compact mode: Full stream with overlay drawer
 * - Zero-mouse keyboard triage engine
 * - Seamless integration with canonical WorkItem mutation path and WorkItemInspector
 */

export function InboxCockpit({
  tab = 'focus',
  query,
  mutations,
  preferences,
  canonicalWorkItems = [],
  onUpdateWorkItem,
  onNavigateToSource,
  isKeyboardActive = true,
  onResetFilters
}) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
  const [snoozeTargetEvent, setSnoozeTargetEvent] = useState(null);
  const [pendingQueue, setPendingQueue] = useState([]);

  const streamRef = useRef(null);

  const { items = [], totalFilteredCount = 0 } = query || {};

  // Auto-select first item if none selected and stream has items
  useEffect(() => {
    if (!selectedItemId && items.length > 0) {
      const first = items[0];
      setSelectedItemId(first.isBundle ? first.latestEvent?.id : first.id);
    }
  }, [items, selectedItemId]);

  // Resolve currently active selected event record
  const selectedEvent = React.useMemo(() => {
    if (!selectedItemId) return null;
    for (const item of items) {
      if (item.isBundle) {
        if (item.id === selectedItemId || item.latestEvent?.id === selectedItemId) {
          return item.latestEvent;
        }
        const matchedChild = item.events?.find((c) => c.id === selectedItemId);
        if (matchedChild) return matchedChild;
      } else if (item.id === selectedItemId) {
        return item;
      }
    }
    return null;
  }, [items, selectedItemId]);

  // Resolve canonical work item if source is work_item
  const canonicalWorkItem = React.useMemo(() => {
    if (!selectedEvent || selectedEvent.sourceEntityType !== 'work_item') return null;
    return canonicalWorkItems.find((w) => w.id === selectedEvent.sourceEntityId) || null;
  }, [selectedEvent, canonicalWorkItems]);

  const selectedIndex = items.findIndex((it) => {
    if (it.isBundle) {
      return it.id === selectedItemId || it.latestEvent?.id === selectedItemId;
    }
    return it.id === selectedItemId;
  });

  // Action Handlers
  const handleSelectItem = useCallback((item) => {
    const id = item.isBundle ? item.latestEvent?.id : item.id;
    setSelectedItemId(id);
    // Mark as read automatically when opened/selected
    if (item && !item.readAt) {
      const idsToMark = item.isBundle ? item.childIds : [item.id];
      mutations?.markAsRead?.(idsToMark);
    }
  }, [mutations]);

  const handleSelectChildItem = useCallback((child) => {
    setSelectedItemId(child.id);
    if (!child.readAt) {
      mutations?.markAsRead?.([child.id]);
    }
  }, [mutations]);

  const handleArchiveItem = useCallback((item) => {
    if (!item) return;
    const ids = item.isBundle ? item.childIds : [item.id];
    mutations?.archiveEvents?.(ids);
  }, [mutations]);

  const handleToggleRead = useCallback((item) => {
    if (!item) return;
    if (item.isBundle) {
      const anyUnread = item.unreadCount > 0;
      if (anyUnread) {
        mutations?.markAsRead?.(item.childIds);
      } else {
        mutations?.markAsUnread?.(item.childIds);
      }
    } else {
      if (item.readAt) {
        mutations?.markAsUnread?.([item.id]);
      } else {
        mutations?.markAsRead?.([item.id]);
      }
    }
  }, [mutations]);

  const handleOpenSnooze = useCallback((item) => {
    if (!item) return;
    setSnoozeTargetEvent(item);
    setIsSnoozeOpen(true);
  }, []);

  const handleApplySnooze = useCallback((untilIso) => {
    if (!snoozeTargetEvent) return;
    const ids = snoozeTargetEvent.isBundle
      ? snoozeTargetEvent.childIds
      : [snoozeTargetEvent.id];
    mutations?.snoozeEvents?.(ids, untilIso);
    setIsSnoozeOpen(false);
    setSnoozeTargetEvent(null);
  }, [snoozeTargetEvent, mutations]);

  const handleCloseDetail = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  // Keyboard navigation
  useInboxKeyboard({
    isActive: isKeyboardActive && !isSnoozeOpen,
    items,
    selectedIndex: selectedIndex >= 0 ? selectedIndex : 0,
    onSelectIndex: (idx) => {
      const target = items[idx];
      if (target) {
        setSelectedItemId(target.isBundle ? target.latestEvent?.id : target.id);
      }
    },
    onOpenItem: handleSelectItem,
    onArchiveItem: handleArchiveItem,
    onToggleRead: handleToggleRead,
    onOpenSnooze: handleOpenSnooze,
    onCloseDetail: handleCloseDetail
  });

  return (
    <div
      role="region"
      aria-label="Personal Triage Inbox"
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Left Pane: Dense Inbox Stream (~400px default) */}
      <div
        ref={streamRef}
        style={{
          width: selectedEvent ? '420px' : '100%',
          minWidth: '360px',
          maxWidth: selectedEvent ? '480px' : '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: selectedEvent ? '1px solid var(--border-default)' : 'none',
          backgroundColor: 'var(--bg-canvas)',
          transition: 'width var(--duration-fast) ease',
          zIndex: 10
        }}
      >
        {/* Stream Subheader Toolbar */}
        <InboxToolbar
          isUnreadOnly={preferences?.isUnreadOnly}
          onToggleUnreadOnly={() => preferences?.setIsUnreadOnly?.(!preferences.isUnreadOnly)}
          importanceFilter={preferences?.importanceFilter}
          onSetImportanceFilter={preferences?.setImportanceFilter}
          responseRequiredOnly={preferences?.responseRequiredOnly}
          onToggleResponseRequiredOnly={() =>
            preferences?.setResponseRequiredOnly?.(!preferences.responseRequiredOnly)
          }
          onArchiveAllRead={() => mutations?.archiveAllRead?.()}
          onResetFilters={onResetFilters}
          isFiltered={Boolean(preferences?.isUnreadOnly || preferences?.responseRequiredOnly)}
          itemCount={totalFilteredCount}
        />

        {/* Triage Stream */}
        <InboxStream
          items={items}
          tab={tab}
          selectedId={selectedItemId}
          pendingCount={pendingQueue.length}
          onFlushPending={() => setPendingQueue([])}
          onSelectItem={handleSelectItem}
          onSelectChildItem={handleSelectChildItem}
          onMarkRead={handleToggleRead}
          onArchive={handleArchiveItem}
          onSnooze={handleOpenSnooze}
          isFiltered={Boolean(preferences?.isUnreadOnly || preferences?.responseRequiredOnly)}
          onResetFilters={onResetFilters}
        />
      </div>

      {/* Right Pane: Contextual Detail Canvas (Split-Pane Inspection) */}
      {selectedEvent && (
        <div
          style={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <InboxDetailRouter
            selectedEvent={selectedEvent}
            canonicalWorkItem={canonicalWorkItem}
            onClose={handleCloseDetail}
            onUpdateWorkItem={onUpdateWorkItem}
            onNavigateToSource={onNavigateToSource}
            onArchive={handleArchiveItem}
            onSnooze={handleOpenSnooze}
            onMarkRead={handleToggleRead}
          />
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <InboxBulkBar
        selectedIds={multiSelectedIds}
        onClearSelection={() => setMultiSelectedIds([])}
        onBulkMarkRead={(ids) => mutations?.markAsRead?.(ids)}
        onBulkMarkUnread={(ids) => mutations?.markAsUnread?.(ids)}
        onBulkArchive={(ids) => mutations?.archiveEvents?.(ids)}
        onBulkSnooze={(ids) => {
          setSnoozeTargetEvent({ id: 'bulk', childIds: ids, isBundle: true });
          setIsSnoozeOpen(true);
        }}
      />

      {/* Snooze Presets Popover */}
      <SnoozePopover
        isOpen={isSnoozeOpen}
        onClose={() => {
          setIsSnoozeOpen(false);
          setSnoozeTargetEvent(null);
        }}
        onSnooze={handleApplySnooze}
      />
    </div>
  );
}
