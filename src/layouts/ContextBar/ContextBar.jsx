import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../design-system';
import { FilterBuilder } from '../../components/filters/FilterBuilder';
import { ContextBreadcrumbs } from './ContextBreadcrumbs';
import { ResourceNavBar } from './ResourceNavBar';
import { ProjectionSwitcher } from '../../components/navigation/Projections/ProjectionSwitcher';

/**
 * ContextBar Layout Component
 * Coordinates Identity, Breadcrumbs, Resource Tabs, Projection Controls, Density, and Quick Create.
 */
export function ContextBar({
  crumbs = [],
  onNavigate,
  density = 'compact',
  onToggleDensity,
  onOpenCreateModal,
  totalItemsCount = 0,
  // Tier 2: Resource Navigation & Projections
  tabs = [],
  activeTab = 'work',
  onSelectTab,
  showResourceNav = true,
  // Projection controls
  showProjections = true,
  activeProjection = 'data-grid',
  onSelectProjection,
  // Search & Filters
  searchQuery = '',
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters
}) {
  return (
    <header
      aria-label="Resource context"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        userSelect: 'none'
      }}
    >
      {/* Tier 1: Identity, Breadcrumbs & Primary Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--header-height)',
          padding: '0 var(--space-4)',
          borderBottom: showResourceNav ? '1px solid var(--border-subtle)' : 'none'
        }}
      >
        {/* Breadcrumb Trail & Total Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <ContextBreadcrumbs crumbs={crumbs} onNavigate={onNavigate} />
          {totalItemsCount !== undefined && totalItemsCount > 0 && (
            <span
              className="font-mono"
              style={{
                fontSize: 'var(--text-2xs)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-surface-raised)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                flexShrink: 0
              }}
            >
              {totalItemsCount} items
            </span>
          )}
        </div>

        {/* Right Controls: Density Switcher & "+ New Item" CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          {onToggleDensity && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--text-2xs)',
                color: 'var(--text-muted)'
              }}
            >
              <span>Density:</span>
              <button
                type="button"
                onClick={onToggleDensity}
                style={{
                  height: '22px',
                  padding: '0 6px',
                  fontSize: 'var(--text-2xs)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {density === 'compact' ? '28px Compact' : '34px Default'}
              </button>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            shortcut="C"
            onClick={onOpenCreateModal}
          >
            New Item
          </Button>
        </div>
      </div>

      {/* Tier 2: Contextual Resource Tabs & Projection Strip */}
      {showResourceNav && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 'var(--resource-nav-height)',
            padding: '0 var(--space-4)',
            backgroundColor: 'var(--bg-surface-subtle)',
            gap: 'var(--space-3)'
          }}
        >
          {/* Left: Reusable Resource Tabs */}
          <ResourceNavBar
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={onSelectTab}
          />

          {/* Right: Projection Switcher & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {showProjections && onSelectProjection && (
              <ProjectionSwitcher
                activeProjection={activeProjection}
                onSelectProjection={onSelectProjection}
                size="sm"
              />
            )}

            {/* Quick in-view search */}
            {onSearchChange && (
              <div style={{ position: 'relative', width: '160px' }}>
                <Search
                  size={12}
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter items..."
                  style={{
                    width: '100%',
                    height: '24px',
                    paddingLeft: '24px',
                    paddingRight: '6px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {/* Compound Filters */}
            {filters && onFilterChange && (
              <FilterBuilder
                filters={filters}
                onFilterChange={onFilterChange}
                onResetFilters={onResetFilters}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
}
