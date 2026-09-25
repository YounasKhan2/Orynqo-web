import React, { useState, useRef, useCallback, useEffect } from 'react';
import { InboxToolbar } from './InboxToolbar';
import { InboxStream } from './InboxStream';
import { InboxDetailRouter } from './InboxDetailRouter';
import { InboxBulkBar } from './InboxBulkBar';
import { SnoozePopover } from './SnoozePopover';
import { useInboxKeyboard } from '../hooks/useInboxKeyboard';
import { INBOX_LAYOUT } from '../../../design-system/tokens';

/**
 * InboxCockpit Component (UI-04A / UI-04B)
 *
 * Master cockpit layout container for PER-001: Personal Triage Inbox:
 * - Wide mode: Split-pane (Stream ~420px left | Contextual Detail right)
 * - Compact mode (< 900px): Full stream with contextual overlay drawer
 * - Zero-mouse keyboard triage engine adhering to explicit scope invariants
 * - Seamless integration with canonical WorkItem mutation path and WorkItemInspector
 * - Focus restoration to originating stream row upon detail dismissal
 * - Real-time triage stability pending queue buffer adapter
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
  onResetFilters,
  onEnqueuePendingRef
}) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
  const [snoozeTargetEvent, setSnoozeTargetEvent] = useState(null);
  const [pendingQueue, setPendingQueue] = useState([]);

  // Responsive mode detection
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = viewportWidth < INBOX_LAYOUT.compactBreakpoint;

  const streamRef = useRef(null);
  const lastSelectedRowIdRef = useRef(null);

  const { items = [], totalFilteredCount = 0, rawEvents = [] } = query || {};

  // Auto-select first item if none selected and stream has items (in desktop split view)
  useEffect(() => {
    if (!selectedItemId && items.length > 0 && !isCompact) {
      const first = items[0];
      const targetId = first.isBundle ? first.latestEvent?.id : first.id;
      setSelectedItemId(targetId);
      lastSelectedRowIdRef.current = targetId;
    }
  }, [items, selectedItemId, isCompact]);

  // Expose a technology-neutral queue adapter if ref provided
  useEffect(() => {
    if (onEnqueuePendingRef) {
      onEnqueuePendingRef.current = (newEvents) => {
        const eventsToAdd = Array.isArray(newEvents) ? newEvents : [newEvents];
        setPendingQueue((prev) => [...prev, ...eventsToAdd]);
      };
    }
  }, [onEnqueuePendingRef]);

  // Clear multi-selection on tab switch
  useEffect(() => {
    setMultiSelectedIds([]);
  }, [tab]);

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
    lastSelectedRowIdRef.current = id;
    // Mark as read automatically when opened/selected
    if (item && !item.readAt) {
      const idsToMark = item.isBundle ? item.childIds : [item.id];
      mutations?.markAsRead?.(idsToMark);
    }
  }, [mutations]);

  const handleSelectChildItem = useCallback((child) => {
    setSelectedItemId(child.id);
    lastSelectedRowIdRef.current = child.id;
    if (!child.readAt) {
      mutations?.markAsRead?.([child.id]);
    }
  }, [mutations]);

  const handleArchiveItem = useCallback((item) => {
    if (!item) return;
    const ids = item.isBundle ? item.childIds : [item.id];
    mutations?.archiveEvents?.(ids);
    setMultiSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
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
    setMultiSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }, [snoozeTargetEvent, mutations]);

  // Bulk Selection Handlers
  const handleToggleCheck = useCallback((target) => {
    if (!target) return;
    if (target.isBundle) {
      const childIds = target.childIds || [];
      setMultiSelectedIds((prev) => {
        const allSelected = childIds.every((id) => prev.includes(id));
        if (allSelected) {
          return prev.filter((id) => !childIds.includes(id));
        } else {
          return Array.from(new Set([...prev, ...childIds]));
        }
      });
    } else {
      setMultiSelectedIds((prev) =>
        prev.includes(target.id) ? prev.filter((id) => id !== target.id) : [...prev, target.id]
      );
    }
  }, []);

  // Focus Restoration upon closing detail
  const handleCloseDetail = useCallback(() => {
    const targetRowId = lastSelectedRowIdRef.current;
    setSelectedItemId(null);

    // Predictably restore focus to originating row element or stream container
    requestAnimationFrame(() => {
      if (streamRef.current) {
        let elToFocus = targetRowId
          ? streamRef.current.querySelector(`[data-notification-id="${targetRowId}"]`)
          : null;

        if (!elToFocus) {
          // If originating row was removed/archived, focus nearest surviving row
          elToFocus = streamRef.current.querySelector('[role="article"]');
        }

        if (elToFocus && typeof elToFocus.focus === 'function') {
          elToFocus.focus();
        } else if (typeof streamRef.current.focus === 'function') {
          streamRef.current.focus();
        }
      }
    });
  }, []);

  // Flush pending notifications into active view
  const handleFlushPending = useCallback(() => {
    if (pendingQueue.length === 0) return;
    // Ingest events through mutation boundary or external callback
    if (mutations?.ingestNewEvents) {
      mutations.ingestNewEvents(pendingQueue);
    }
    setPendingQueue([]);
  }, [pendingQueue, mutations]);

  // Keyboard navigation
  useInboxKeyboard({
    isActive: isKeyboardActive && !isSnoozeOpen,
    items,
    selectedIndex: selectedIndex >= 0 ? selectedIndex : 0,
    onSelectIndex: (idx) => {
      const target = items[idx];
      if (target) {
        const id = target.isBundle ? target.latestEvent?.id : target.id;
        setSelectedItemId(id);
        lastSelectedRowIdRef.current = id;
      }
    },
    onOpenItem: handleSelectItem,
    onArchiveItem: handleArchiveItem,
    onToggleRead: handleToggleRead,
    onOpenSnooze: handleOpenSnooze,
    onCloseDetail: handleCloseDetail
  });

  // Scoped archive all read handler
  const handleArchiveAllRead = useCallback(() => {
    // Collect active read IDs directly from query's filtered unarchived rawEvents
    const activeReadIds = (rawEvents || [])
      .filter((e) => Boolean(e.readAt) && !e.archivedAt && (!e.snoozedUntil || new Date(e.snoozedUntil).getTime() <= Date.now()))
      .map((e) => e.id);
    mutations?.archiveAllRead?.(activeReadIds);
    setMultiSelectedIds([]);
  }, [rawEvents, mutations]);

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
      {/* Left Pane: Dense Inbox Stream */}
      <div
        ref={streamRef}
        tabIndex={-1}
        style={{
          width: isCompact ? '100%' : selectedEvent ? INBOX_LAYOUT.streamDefaultWidth : '100%',
          minWidth: isCompact ? '100%' : INBOX_LAYOUT.streamMinWidth,
          maxWidth: isCompact ? '100%' : selectedEvent ? INBOX_LAYOUT.streamMaxWidth : '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: !isCompact && selectedEvent ? '1px solid var(--border-default)' : 'none',
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
          onArchiveAllRead={handleArchiveAllRead}
          onResetFilters={onResetFilters}
          isFiltered={Boolean(preferences?.isUnreadOnly || preferences?.responseRequiredOnly)}
          itemCount={totalFilteredCount}
        />

        {/* Triage Stream */}
        <InboxStream
          items={items}
          tab={tab}
          selectedId={selectedItemId}
          multiSelectedIds={multiSelectedIds}
          onToggleCheck={handleToggleCheck}
          pendingCount={pendingQueue.length}
          onFlushPending={handleFlushPending}
          onSelectItem={handleSelectItem}
          onSelectChildItem={handleSelectChildItem}
          onMarkRead={handleToggleRead}
          onArchive={handleArchiveItem}
          onSnooze={handleOpenSnooze}
          isFiltered={Boolean(preferences?.isUnreadOnly || preferences?.responseRequiredOnly)}
          onResetFilters={onResetFilters}
        />
      </div>

      {/* Right Pane / Compact Drawer: Contextual Detail Canvas */}
      {selectedEvent && (
        <div
          data-keyboard-scope={isCompact ? 'OVERLAY' : undefined}
          style={{
            flex: isCompact ? undefined : 1,
            position: isCompact ? 'absolute' : 'relative',
            top: 0,
            right: 0,
            width: isCompact ? '100%' : undefined,
            height: '100%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: isCompact ? 'var(--shadow-drawer)' : 'none',
            zIndex: isCompact ? 40 : 20
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
        onBulkMarkRead={(ids) => {
          mutations?.markAsRead?.(ids);
          setMultiSelectedIds([]);
        }}
        onBulkMarkUnread={(ids) => {
          mutations?.markAsUnread?.(ids);
          setMultiSelectedIds([]);
        }}
        onBulkArchive={(ids) => {
          mutations?.archiveEvents?.(ids);
          setMultiSelectedIds([]);
        }}
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

