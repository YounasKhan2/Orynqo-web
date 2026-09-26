import React, { useState } from 'react';
import { DocumentRow } from './DocumentRow';
import { DocumentEmptyState } from './DocumentEmptyState';
import { List, GitFork } from 'lucide-react';

/**
 * DocsListStream Component
 *
 * Renders the dense document stream or structural tree view.
 */
export function DocsListStream({
  documents = [],
  documentTree = [],
  favoriteDocIds = [],
  onToggleFavorite,
  onSelectDocument,
  onCreateDocument,
  isFiltered = false
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'tree'
  const favSet = new Set(favoriteDocIds);

  if (documents.length === 0) {
    return (
      <DocumentEmptyState
        isSearch={isFiltered}
        title={isFiltered ? 'No matching documents' : 'No documents found'}
        description={isFiltered ? 'Try clearing your search query or adjusting your filters.' : 'Create a canonical document to begin capturing specifications and runbooks.'}
        onCreateDocument={onCreateDocument}
      />
    );
  }

  // Recursive tree renderer
  const renderTreeNode = (node, depth = 0) => {
    return (
      <React.Fragment key={node.id}>
        <DocumentRow
          document={node}
          isFavorite={favSet.has(node.id)}
          onToggleFavorite={onToggleFavorite}
          onSelectDocument={onSelectDocument}
          nestingLevel={depth}
        />
        {Array.isArray(node.children) && node.children.map((child) => renderTreeNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div
      role="table"
      aria-label="Documents stream"
      data-testid="docs-list-stream"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'var(--bg-surface, #161b22)',
        border: '1px solid var(--border-default, #30363d)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      {/* Header bar with view mode toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-default, #30363d)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          fontSize: '11px',
          color: 'var(--text-muted, #8b949e)',
          fontWeight: 600
        }}
      >
        <span>DOCUMENT ({documents.length})</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            data-testid="view-mode-list-btn"
            aria-label="List view"
            onClick={() => setViewMode('list')}
            style={{
              background: 'none',
              border: 'none',
              color: viewMode === 'list' ? 'var(--primary-base, #58a6ff)' : 'var(--text-muted, #8b949e)',
              cursor: 'pointer',
              padding: '2px 4px'
            }}
          >
            <List size={14} />
          </button>
          <button
            type="button"
            data-testid="view-mode-tree-btn"
            aria-label="Tree view"
            onClick={() => setViewMode('tree')}
            style={{
              background: 'none',
              border: 'none',
              color: viewMode === 'tree' ? 'var(--primary-base, #58a6ff)' : 'var(--text-muted, #8b949e)',
              cursor: 'pointer',
              padding: '2px 4px'
            }}
          >
            <GitFork size={14} />
          </button>
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {viewMode === 'tree'
          ? documentTree.map((rootNode) => renderTreeNode(rootNode, 0))
          : documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                isFavorite={favSet.has(doc.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectDocument={onSelectDocument}
                nestingLevel={0}
              />
            ))}
      </div>
    </div>
  );
}
