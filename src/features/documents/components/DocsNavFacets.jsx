import React from 'react';
import { Clock, Star, User, FileText, BookOpen, Layers } from 'lucide-react';
import { DOC_FACETS } from '../model';

export const FACET_DEFINITIONS = [
  { id: DOC_FACETS.RECENT, label: 'Recent', icon: Clock },
  { id: DOC_FACETS.PINNED, label: 'Favorites / Pinned', icon: Star },
  { id: DOC_FACETS.AUTHORED, label: 'Created by Me', icon: User },
  { id: DOC_FACETS.ALL, label: 'All Documents', icon: FileText }
];

export const PRESET_DEFINITIONS = [
  { id: DOC_FACETS.SPECS, label: 'Living Specs', icon: BookOpen },
  { id: DOC_FACETS.RUNBOOKS, label: 'Team Runbooks', icon: Layers }
];

/**
 * DocsNavFacets Component
 *
 * Left navigation panel for Docs Hub filtering.
 */
export function DocsNavFacets({
  activeFacet = DOC_FACETS.RECENT,
  onSelectFacet,
  totalCount = 0
}) {
  return (
    <div
      role="navigation"
      aria-label="Document facets"
      data-testid="docs-nav-facets"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '180px',
        flexShrink: 0
      }}
    >
      {/* Core Facets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted, #8b949e)', textTransform: 'uppercase', padding: '4px 8px' }}>
          Facets
        </div>
        {FACET_DEFINITIONS.map((facet) => {
          const Icon = facet.icon;
          const isActive = activeFacet === facet.id;
          return (
            <button
              key={facet.id}
              type="button"
              data-testid={`facet-${facet.id}`}
              onClick={() => onSelectFacet?.(facet.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(88, 166, 255, 0.12)' : 'transparent',
                color: isActive ? 'var(--primary-base, #58a6ff)' : 'var(--text-secondary, #8b949e)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Icon size={14} />
              <span>{facet.label}</span>
            </button>
          );
        })}
      </div>

      {/* Semantic Saved Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted, #8b949e)', textTransform: 'uppercase', padding: '4px 8px' }}>
          Query Presets
        </div>
        {PRESET_DEFINITIONS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activeFacet === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              data-testid={`facet-${preset.id}`}
              onClick={() => onSelectFacet?.(preset.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(88, 166, 255, 0.12)' : 'transparent',
                color: isActive ? 'var(--primary-base, #58a6ff)' : 'var(--text-secondary, #8b949e)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Icon size={14} />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
