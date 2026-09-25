import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../constants/workItems';
import { USERS, PROJECTS } from '../../data/mockData';

/**
 * DataGridToolbar Component
 * Compact 36px projection toolbar for Search, Filter, Sort, Group, Columns, and Density
 */
export function DataGridToolbar({
  searchQuery = '',
  onSearchChange,
  sortConfig = { field: 'identifier', direction: 'asc' },
  onSortChange,
  groupBy = 'none',
  onGroupByChange,
  density = 'compact',
  onToggleDensity,
  totalCount = 0,
  selectedCount = 0,
  isColumnManagerOpen = false,
  onToggleColumnManager,
  filters = { status: 'all', priority: 'all', assignee: 'all', project: 'all' },
  onFilterChange,
  onResetFilters
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'sort' | 'group' | 'filter' | null
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openDropdown]);

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignee !== 'all' ||
    (filters.project && filters.project !== 'all');

  const sortFields = [
    { id: 'identifier', label: 'ID' },
    { id: 'title', label: 'Title' },
    { id: 'priority', label: 'Priority' },
    { id: 'status', label: 'Status' },
    { id: 'estimate', label: 'Estimate' },
    { id: 'dueDate', label: 'Due Date' }
  ];

  const groupOptions = [
    { id: 'none', label: 'No Grouping' },
    { id: 'status', label: 'Status' },
    { id: 'priority', label: 'Priority' },
    { id: 'due_date', label: 'Due Date' },
    { id: 'team', label: 'Team' },
    { id: 'assignee', label: 'Assignee' },
    { id: 'project', label: 'Project' },
    { id: 'cycle', label: 'Cycle' }
  ];

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Grid operations toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '36px',
        padding: '0 12px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: 'var(--text-xs)',
        gap: '8px',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {/* Left controls: Search, Filter, Sort, Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '200px',
            height: '24px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '0 6px'
          }}
        >
          <Search size={12} style={{ color: 'var(--text-muted)', marginRight: '6px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search work items..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)',
              padding: 0
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Filter Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'filter' ? null : 'filter'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 8px',
              backgroundColor: hasActiveFilters ? 'var(--primary-subtle)' : 'transparent',
              border: `1px solid ${hasActiveFilters ? 'var(--primary-base)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-xs)',
              color: hasActiveFilters ? 'var(--primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)'
            }}
          >
            <Filter size={11} />
            <span>Filter</span>
            {hasActiveFilters && (
              <span
                style={{
                  backgroundColor: 'var(--primary-base)',
                  color: '#fff',
                  fontSize: '9px',
                  borderRadius: '8px',
                  padding: '0 4px',
                  lineHeight: '12px'
                }}
              >
                active
              </span>
            )}
            <ChevronDown size={10} />
          </button>

          {openDropdown === 'filter' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 100,
                width: '260px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>Filters</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-text)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange?.('status', e.target.value)}
                  style={{
                    height: '22px',
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0 4px'
                  }}
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_DEFINITIONS).map(([key, def]) => (
                    <option key={key} value={key}>{def.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => onFilterChange?.('priority', e.target.value)}
                  style={{
                    height: '22px',
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0 4px'
                  }}
                >
                  <option value="all">All Priorities</option>
                  {Object.entries(PRIORITY_DEFINITIONS).map(([key, def]) => (
                    <option key={key} value={key}>{def.label}</option>
                  ))}
                </select>
              </div>

              {/* Assignee Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assignee</label>
                <select
                  value={filters.assignee}
                  onChange={(e) => onFilterChange?.('assignee', e.target.value)}
                  style={{
                    height: '22px',
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0 4px'
                  }}
                >
                  <option value="all">All Assignees</option>
                  {USERS.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'sort' ? null : 'sort'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)'
            }}
          >
            <ArrowUpDown size={11} />
            <span>Sort: {sortFields.find((f) => f.id === sortConfig.field)?.label || 'ID'}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          </button>

          {openDropdown === 'sort' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 100,
                width: '180px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '4px 0'
              }}
            >
              <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Sort By
              </div>
              {sortFields.map((field) => {
                const isActive = sortConfig.field === field.id;
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        onSortChange?.({
                          field: field.id,
                          direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        });
                      } else {
                        onSortChange?.({ field: field.id, direction: 'asc' });
                      }
                      setOpenDropdown(null);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 10px',
                      background: isActive ? 'var(--bg-surface-selected)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--primary-text)' : 'var(--text-primary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{field.label}</span>
                    {isActive && (
                      <span style={{ fontSize: '10px' }}>
                        {sortConfig.direction === 'asc' ? 'Asc ↑' : 'Desc ↓'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Group Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'group' ? null : 'group'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 8px',
              backgroundColor: groupBy !== 'none' ? 'var(--primary-subtle)' : 'transparent',
              border: `1px solid ${groupBy !== 'none' ? 'var(--primary-base)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-xs)',
              color: groupBy !== 'none' ? 'var(--primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)'
            }}
          >
            <Layers size={11} />
            <span>Group: {groupOptions.find((g) => g.id === groupBy)?.label || 'None'}</span>
          </button>

          {openDropdown === 'group' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 100,
                width: '160px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '4px 0'
              }}
            >
              {groupOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onGroupByChange?.(opt.id);
                    setOpenDropdown(null);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 10px',
                    background: groupBy === opt.id ? 'var(--bg-surface-selected)' : 'transparent',
                    border: 'none',
                    color: groupBy === opt.id ? 'var(--primary-text)' : 'var(--text-primary)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{opt.label}</span>
                  {groupBy === opt.id && <Check size={11} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right controls: Columns popover, Density toggle, Result count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Columns Manager Button */}
        <button
          type="button"
          onClick={onToggleColumnManager}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            height: '24px',
            padding: '0 8px',
            backgroundColor: isColumnManagerOpen ? 'var(--bg-surface-hover)' : 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--text-xs)'
          }}
          title="Manage visible columns"
        >
          <SlidersHorizontal size={11} />
          <span>Columns</span>
        </button>

        {/* Density Toggle (28px Compact vs 34px Comfortable) */}
        <button
          type="button"
          onClick={onToggleDensity}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '24px',
            padding: '0 8px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--text-xs)'
          }}
          title={`Switch density (currently ${density})`}
        >
          <span>{density === 'compact' ? '28px' : '34px'}</span>
        </button>

        {/* Item Counter */}
        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          <span>{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
          {selectedCount > 0 && (
            <span style={{ color: 'var(--primary-text)', marginLeft: '4px' }}>
              • {selectedCount} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
