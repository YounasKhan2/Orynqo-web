import React from 'react';
import {
  List,
  Kanban,
  Calendar,
  FileText,
  Activity,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  Search
} from 'lucide-react';
import { SegmentedControl } from '../composites/SegmentedControl';
import { Button } from '../primitives/Button';
import { FilterBuilder } from '../composites/FilterBuilder';

/**
 * ActionStrip Component
 * Context breadcrumbs, projection tabs, search, filters, density switch, and "+ New Item" action
 */
export function ActionStrip({
  breadcrumbs = ['Core Platform', 'Sprint 42'],
  activeView,
  onSelectView,
  density,
  onToggleDensity,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenCreateModal,
  totalItemsCount = 0
}) {
  const viewTabs = [
    { id: 'data-grid', label: 'Table', icon: List },
    { id: 'kanban', label: 'Board', icon: Kanban },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'living-spec', label: 'Living Spec', icon: FileText },
    { id: 'workload', label: 'Capacity', icon: Activity }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        userSelect: 'none'
      }}
    >
      {/* Top Bar: Breadcrumbs & Primary Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--header-height)',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        {/* Breadcrumb Hierarchy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
              <span
                style={{
                  color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: idx === breadcrumbs.length - 1 ? 'var(--font-semibold)' : 'var(--font-regular)'
                }}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
          <span
            className="font-mono"
            style={{
              fontSize: 'var(--text-2xs)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-raised)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              marginLeft: '4px'
            }}
          >
            {totalItemsCount} items
          </span>
        </div>

        {/* Right Action: Density Switcher & Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Density Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
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

          {/* "+ New Item" Button */}
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

      {/* Bottom Sub-Bar: View Tabs, Search, and Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--action-strip-height)',
          padding: '0 var(--space-4)',
          backgroundColor: 'var(--bg-surface-subtle)',
          gap: 'var(--space-3)'
        }}
      >
        {/* Left: View Tabs */}
        <SegmentedControl
          options={viewTabs}
          value={activeView}
          onChange={onSelectView}
          size="sm"
        />

        {/* Right: Search Input & Compound Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Quick Search */}
          <div style={{ position: 'relative', width: '180px' }}>
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

          {/* Compound Filters */}
          <FilterBuilder
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
          />
        </div>
      </div>
    </div>
  );
}
