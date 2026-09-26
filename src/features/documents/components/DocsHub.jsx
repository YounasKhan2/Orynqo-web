import React, { useState, useRef } from 'react';
import { Search, Plus, Filter, FileText } from 'lucide-react';
import { DocsNavFacets } from './DocsNavFacets';
import { DocsListStream } from './DocsListStream';
import { useDocumentsQuery, useDocsKeyboard } from '../hooks';
import { DOC_FACETS } from '../model';

/**
 * DocsHub Component (DOC-001)
 *
 * Dense, scalable knowledge discovery hub.
 * Consumes supplied canonical documents through query boundaries.
 */
export function DocsHub({
  documents = [],
  teams = [],
  projects = [],
  currentUserId = 'usr-1',
  favoriteDocIds = [],
  favorites = [],
  contextPinnedDocIds = [],
  pinnedDocIds = [],
  onToggleFavorite,
  onSelectDocument,
  onCreateDocument,
  isKeyboardActive = true
}) {
  const effectiveFavorites = favoriteDocIds.length > 0 ? favoriteDocIds : favorites;
  const effectivePins = contextPinnedDocIds.length > 0 ? contextPinnedDocIds : pinnedDocIds;
  const [activeFacet, setActiveFacet] = useState(DOC_FACETS.RECENT);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('active');

  const searchInputRef = useRef(null);

  // Keyboard shortcut registration
  useDocsKeyboard({
    isActive: isKeyboardActive,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onCreateDocument
  });

  const { documents: filteredDocs, documentTree, totalCount } = useDocumentsQuery({
    documents,
    facet: activeFacet,
    searchQuery,
    teamId: selectedTeamId || null,
    projectId: selectedProjectId || null,
    lifecycle: lifecycleFilter,
    currentUserId,
    favoriteDocIds: effectiveFavorites,
    contextPinnedDocIds: effectivePins
  });

  const isFiltered = Boolean(
    searchQuery ||
    selectedTeamId ||
    selectedProjectId ||
    activeFacet !== DOC_FACETS.RECENT ||
    lifecycleFilter !== 'active'
  );

  return (
    <div
      role="region"
      aria-label="Docs Hub"
      data-testid="docs-hub"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas, #0d1117)',
        padding: '20px 24px',
        overflow: 'hidden',
        gap: '16px'
      }}
    >
      {/* Top Header: Title, Search, Context Filters, Create CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary-base, #58a6ff)" />
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #c9d1d9)', margin: 0 }}>
            Docs & Knowledge
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-default, #30363d)',
              borderRadius: '4px',
              padding: '4px 8px',
              width: '220px'
            }}
          >
            <Search size={13} color="var(--text-muted, #8b949e)" />
            <input
              ref={searchInputRef}
              type="text"
              data-testid="docs-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs... (/)"
              aria-label="Search documents"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary, #c9d1d9)',
                fontSize: '12px',
                width: '100%'
              }}
            />
          </div>

          {/* Team Filter */}
          <select
            data-testid="docs-team-filter"
            aria-label="Filter by team"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-default, #30363d)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              color: 'var(--text-primary, #c9d1d9)',
              outline: 'none'
            }}
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            data-testid="docs-project-filter"
            aria-label="Filter by project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-default, #30363d)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              color: 'var(--text-primary, #c9d1d9)',
              outline: 'none'
            }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Lifecycle Filter */}
          <select
            data-testid="docs-lifecycle-filter"
            aria-label="Filter by lifecycle"
            value={lifecycleFilter}
            onChange={(e) => setLifecycleFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-default, #30363d)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              color: 'var(--text-primary, #c9d1d9)',
              outline: 'none'
            }}
          >
            <option value="active">Active Docs</option>
            <option value="archived">Archived Docs</option>
          </select>

          {/* New Document Button */}
          <button
            type="button"
            data-testid="new-document-btn"
            aria-label="New Document"
            onClick={() => {
              onCreateDocument?.({
                teamIds: selectedTeamId ? [selectedTeamId] : [],
                projectIds: selectedProjectId ? [selectedProjectId] : []
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-base, #58a6ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New Doc</span>
          </button>
        </div>
      </div>

      {/* Main Hub Body: Facets + Document Stream */}
      <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
        <DocsNavFacets
          activeFacet={activeFacet}
          onSelectFacet={setActiveFacet}
          totalCount={totalCount}
        />
        <DocsListStream
          documents={filteredDocs}
          documentTree={documentTree}
          favoriteDocIds={favoriteDocIds}
          onToggleFavorite={onToggleFavorite}
          onSelectDocument={onSelectDocument}
          onCreateDocument={onCreateDocument}
          isFiltered={isFiltered}
        />
      </div>
    </div>
  );
}
