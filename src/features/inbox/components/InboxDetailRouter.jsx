import React from 'react';
import { WorkItemDetailContainer } from '../../work-items/components/WorkItemDetailContainer';
import { Button } from '../../../design-system';
import { FileText, FolderKanban, Lock, ExternalLink, X } from 'lucide-react';

/**
 * InboxDetailRouter Component (UI-04A / UI-04B)
 *
 * Capability-aware contextual routing:
 * 1. work_item -> Canonical WorkItemDetailContainer (reuses WRK-005 directly)
 * 2. document -> Canonical document preview & link
 * 3. project -> Project briefing summary & link
 * 4. initiative -> Initiative context (not project overview)
 * 5. access_request -> Safe authorization context
 * 6. redacted -> Safe access revoked tombstone
 *
 * Focus & State Preservation:
 * - Closing restores focus to originating stream row
 * - Preserves stream position and filters
 */

export function InboxDetailRouter({
  selectedEvent,
  canonicalWorkItem,
  onClose,
  onUpdateWorkItem,
  onNavigateToSource,
  onArchive,
  onSnooze,
  onMarkRead
}) {
  if (!selectedEvent) {
    return (
      <div
        role="region"
        aria-label="No notification selected"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          color: 'var(--text-muted)',
          padding: 'var(--space-6)',
          textAlign: 'center'
        }}
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Select a notification to inspect details.
        </p>
      </div>
    );
  }

  // 1. Permission Revoked / Redacted Tombstone
  if (selectedEvent.isRedacted) {
    return (
      <div
        role="region"
        aria-label="Inaccessible notification details"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          padding: 'var(--space-6)',
          textAlign: 'center',
          gap: 'var(--space-3)'
        }}
      >
        <Lock size={24} color="var(--text-muted)" />
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
          This item is no longer accessible
        </h4>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: '320px' }}>
          Your permissions for this resource have changed or the resource was removed.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" size="xs" onClick={() => onArchive?.(selectedEvent)}>
            Archive notification
          </Button>
          <Button variant="ghost" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  // 2. Canonical WorkItem Routing (Reuses WRK-005 directly)
  if (selectedEvent.sourceEntityType === 'work_item' && canonicalWorkItem) {
    return (
      <div
        role="region"
        aria-label={`Work item details: ${canonicalWorkItem.identifier}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <WorkItemDetailContainer
          item={canonicalWorkItem}
          onUpdateItem={onUpdateWorkItem}
          onClose={onClose}
          isExpanded={false}
        />
      </div>
    );
  }

  // 3. Document Context Routing
  if (selectedEvent.sourceEntityType === 'document') {
    const { title, summary, bodySnippet } = selectedEvent.renderPayload || {};
    return (
      <div
        role="region"
        aria-label={`Document notification: ${title}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 'var(--space-4)',
          overflowY: 'auto',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--primary-base)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-muted)' }}>
              Document Notification
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            {title || 'Living Document'}
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {summary}
          </p>
        </div>

        {bodySnippet && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-raised)',
              borderLeft: '3px solid var(--primary-base)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              lineHeight: 1.5
            }}
          >
            "{bodySnippet}"
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Button
            variant="primary"
            size="sm"
            icon={ExternalLink}
            onClick={() => onNavigateToSource?.({ scope: 'docs', docId: selectedEvent.sourceEntityId })}
          >
            Open Document
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onArchive?.(selectedEvent)}>
            Archive
          </Button>
        </div>
      </div>
    );
  }

  // 4. Project or Initiative Context Routing
  if (selectedEvent.sourceEntityType === 'project' || selectedEvent.sourceEntityType === 'initiative') {
    const isInit = selectedEvent.sourceEntityType === 'initiative';
    const { title, summary, bodySnippet } = selectedEvent.renderPayload || {};

    return (
      <div
        role="region"
        aria-label={`${isInit ? 'Initiative' : 'Project'} notification: ${title}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 'var(--space-4)',
          overflowY: 'auto',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={16} color="var(--primary-base)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-muted)' }}>
              {isInit ? 'Initiative Update' : 'Project Update'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            {title || (isInit ? 'Initiative' : 'Project')}
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {summary}
          </p>
        </div>

        {bodySnippet && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              lineHeight: 1.5
            }}
          >
            {bodySnippet}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Button
            variant="primary"
            size="sm"
            icon={ExternalLink}
            onClick={() =>
              onNavigateToSource?.(
                isInit
                  ? { scope: 'initiatives', initiativeId: selectedEvent.sourceEntityId }
                  : { scope: 'projects', projectId: selectedEvent.sourceEntityId, tab: 'overview' }
              )
            }
          >
            View {isInit ? 'Initiative' : 'Project'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onArchive?.(selectedEvent)}>
            Archive
          </Button>
        </div>
      </div>
    );
  }

  // 5. Generic Safe Fallback Surface
  return (
    <div
      role="region"
      aria-label="Notification context"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 'var(--space-4)',
        gap: 'var(--space-3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
          {selectedEvent.renderPayload?.title || 'Notification Details'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
        {selectedEvent.renderPayload?.summary}
      </p>

      {selectedEvent.renderPayload?.bodySnippet && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)'
          }}
        >
          {selectedEvent.renderPayload.bodySnippet}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <Button variant="secondary" size="xs" onClick={() => onArchive?.(selectedEvent)}>
          Archive
        </Button>
      </div>
    </div>
  );
}
