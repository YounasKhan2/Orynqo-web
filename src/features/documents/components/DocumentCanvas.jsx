import React, { useState, useEffect } from 'react';
import { DocumentHeader } from './DocumentHeader';
import { DocumentEditor } from './DocumentEditor';
import { DocumentBacklinksPanel } from './DocumentBacklinksPanel';
import { DocumentCommentsPanel } from './DocumentCommentsPanel';
import { useDocument, useDocumentBacklinks, useDocumentComments } from '../hooks';
import { AlertCircle, PlusCircle } from 'lucide-react';

/**
 * DocumentCanvas Component (DOC-002)
 *
 * Top-level canonical writing surface:
 * - Header with breadcrumbs, ambient autosave, favorite, archive
 * - Structured block editor
 * - Selection action toolbar (Convert to WorkItem via CMD-002)
 * - Derived backlinks panel with zero-leakage security
 * - Discussion panel with resilient comment anchor preservation
 */
export function DocumentCanvas({
  documentId,
  documents = [],
  workItems = [],
  users = [],
  projects = [],
  teams = [],
  comments = [],
  currentUserId = 'usr-1',
  favoriteDocIds = [],
  onToggleFavorite,
  onUpdateDocument,
  onArchiveDocument,
  onRestoreDocument,
  onBackToHub,
  onOpenWorkItem,
  onOpenDocument,
  onCreateWorkItemFromSelection,
  isAccessible = () => true,
  viewportMode = 'wide' // 'wide' | 'compact' | 'narrow'
}) {
  const [showSupportingSurfaces, setShowSupportingSurfaces] = useState(viewportMode !== 'narrow');
  const isNarrow = viewportMode === 'narrow';

  useEffect(() => {
    setShowSupportingSurfaces(viewportMode !== 'narrow');
  }, [viewportMode]);
  const {
    document,
    draftTitle,
    draftContent,
    saveState,
    saveError,
    isConflict,
    breadcrumbs,
    updateTitle,
    updateContent,
    retrySave
  } = useDocument({
    documentId,
    documents,
    onUpdateDocument,
    isAccessible
  });

  const { backlinks, totalCount: backlinksCount } = useDocumentBacklinks({
    documentId,
    documents,
    workItems,
    comments,
    isAccessible
  });

  const {
    threads,
    unresolvedCount,
    addThread,
    addReply,
    toggleResolve
  } = useDocumentComments({
    documentId,
    initialThreads: comments.filter((c) => c.documentId === documentId),
    documentContent: draftContent,
    currentUserId
  });

  const [selectedText, setSelectedText] = useState(null);

  if (!document) {
    return (
      <div
        role="region"
        aria-label="Document not found"
        data-testid="doc-not-found"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted, #8b949e)',
          gap: '8px'
        }}
      >
        <p>Document not found or access restricted.</p>
        <button
          type="button"
          onClick={onBackToHub}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-base, #58a6ff)',
            cursor: 'pointer'
          }}
        >
          Return to Docs Hub
        </button>
      </div>
    );
  }

  const isFavorite = favoriteDocIds.includes(documentId);

  return (
    <div
      role="main"
      aria-label="Document Canvas"
      data-testid="document-canvas"
      className={`orynqo-canvas-layout--${viewportMode}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas, #0d1117)',
        overflowY: 'auto',
        padding: isNarrow ? '12px 16px' : '24px 32px'
      }}
    >
      <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <DocumentHeader
          document={document}
          breadcrumbs={breadcrumbs}
          title={draftTitle}
          onTitleChange={updateTitle}
          saveState={saveState}
          saveError={saveError}
          onRetrySave={retrySave}
          isFavorite={isFavorite}
          onToggleFavorite={() => onToggleFavorite?.(documentId)}
          onArchive={() => onArchiveDocument?.(documentId)}
          onRestore={() => onRestoreDocument?.(documentId)}
          onBackToHub={onBackToHub}
        />

        {/* Concurrency Conflict Banner */}
        {isConflict && (
          <div
            role="alert"
            data-testid="concurrency-conflict-banner"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--priority-high, #f59e0b)',
              borderRadius: '4px',
              color: 'var(--priority-high, #f59e0b)',
              fontSize: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} />
              <span>Conflict requiring attention. Your local changes are preserved.</span>
            </div>
            <button
              type="button"
              data-testid="conflict-retry-btn"
              onClick={retrySave}
              style={{
                background: 'var(--priority-high, #f59e0b)',
                color: '#000',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry / Recheck
            </button>
          </div>
        )}

        {/* Floating action for text selection: Convert to WorkItem via CMD-002 */}
        {selectedText && (
          <div
            data-testid="selection-action-bar"
            style={{
              position: 'sticky',
              top: '8px',
              zIndex: 30,
              alignSelf: 'center',
              backgroundColor: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-default, #30363d)',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.3))',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #8b949e)' }}>
              Selected: "{selectedText.text.slice(0, 30)}..."
            </span>
            <button
              type="button"
              data-testid="create-work-item-from-selection-btn"
              onClick={() => {
                onCreateWorkItemFromSelection?.({
                  title: selectedText.text,
                  sourceDocId: document.id
                });
                setSelectedText(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--primary-base, #58a6ff)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={12} />
              <span>Create WorkItem</span>
            </button>
          </div>
        )}

        {/* Editor */}
        <DocumentEditor
          content={draftContent}
          onChange={updateContent}
          onOpenWorkItem={onOpenWorkItem}
          onOpenDocument={onOpenDocument}
          workItems={workItems}
          documents={documents}
          users={users}
          projects={projects}
          teams={teams}
          isAccessible={isAccessible}
          onSelectionChange={setSelectedText}
        />

        {/* Responsive toggle in narrow mode */}
        {isNarrow && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              data-testid="toggle-supporting-surfaces-btn"
              onClick={() => setShowSupportingSurfaces((prev) => !prev)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: 'var(--bg-surface, #161b22)',
                border: '1px solid var(--border-default, #30363d)',
                borderRadius: '4px',
                color: 'var(--text-secondary, #8b949e)',
                cursor: 'pointer'
              }}
            >
              {showSupportingSurfaces ? 'Hide Details & Discussion' : 'Show Details & Discussion'}
            </button>
          </div>
        )}

        {/* Derived Backlinks Panel with Zero-Leakage Filtering */}
        {showSupportingSurfaces && (
          <DocumentBacklinksPanel
            backlinks={backlinks}
            totalCount={backlinksCount}
            onOpenWorkItem={onOpenWorkItem}
            onOpenDocument={onOpenDocument}
          />
        )}

        {/* Discussion & Comments */}
        {showSupportingSurfaces && (
          <DocumentCommentsPanel
            threads={threads}
            unresolvedCount={unresolvedCount}
            onAddThread={addThread}
            onAddReply={addReply}
            onToggleResolve={toggleResolve}
            users={users}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}
