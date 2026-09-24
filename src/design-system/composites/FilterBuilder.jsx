import React, { useState } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../tokens';
import { USERS, PROJECTS } from '../../data/mockData';

/**
 * FilterBuilder Component
 * High-density compound filter bar with active query pills
 */
export function FilterBuilder({
  filters,
  onFilterChange,
  onResetFilters
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignee !== 'all' ||
    filters.project !== 'all';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Status Filter Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => toggleDropdown('status')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 7px',
              fontSize: 'var(--text-xs)',
              color: filters.status !== 'all' ? 'var(--primary-text)' : 'var(--text-secondary)',
              backgroundColor: filters.status !== 'all' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${filters.status !== 'all' ? 'var(--primary-base)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <span>Status: {filters.status === 'all' ? 'All' : STATUS_DEFINITIONS[filters.status]?.label}</span>
            <ChevronDown size={11} />
          </button>

          {openDropdown === 'status' && (
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: 0,
                zIndex: 100,
                minWidth: '150px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-popover)',
                padding: '4px'
              }}
            >
              <div
                onClick={() => { onFilterChange('status', 'all'); setOpenDropdown(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: filters.status === 'all' ? 'var(--bg-surface-hover)' : 'transparent'
                }}
              >
                <span>All Statuses</span>
                {filters.status === 'all' && <Check size={12} color="var(--primary-base)" />}
              </div>
              {Object.values(STATUS_DEFINITIONS).map((st) => (
                <div
                  key={st.id}
                  onClick={() => { onFilterChange('status', st.id); setOpenDropdown(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    fontSize: 'var(--text-xs)',
                    color: st.color,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: filters.status === st.id ? 'var(--bg-surface-hover)' : 'transparent'
                  }}
                >
                  <span>{st.label}</span>
                  {filters.status === st.id && <Check size={12} color="var(--primary-base)" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => toggleDropdown('priority')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 7px',
              fontSize: 'var(--text-xs)',
              color: filters.priority !== 'all' ? 'var(--primary-text)' : 'var(--text-secondary)',
              backgroundColor: filters.priority !== 'all' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${filters.priority !== 'all' ? 'var(--primary-base)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <span>Priority: {filters.priority === 'all' ? 'All' : PRIORITY_DEFINITIONS[filters.priority]?.label}</span>
            <ChevronDown size={11} />
          </button>

          {openDropdown === 'priority' && (
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: 0,
                zIndex: 100,
                minWidth: '150px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-popover)',
                padding: '4px'
              }}
            >
              <div
                onClick={() => { onFilterChange('priority', 'all'); setOpenDropdown(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: filters.priority === 'all' ? 'var(--bg-surface-hover)' : 'transparent'
                }}
              >
                <span>All Priorities</span>
                {filters.priority === 'all' && <Check size={12} color="var(--primary-base)" />}
              </div>
              {Object.values(PRIORITY_DEFINITIONS).map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => { onFilterChange('priority', pr.id); setOpenDropdown(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    fontSize: 'var(--text-xs)',
                    color: pr.color,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: filters.priority === pr.id ? 'var(--bg-surface-hover)' : 'transparent'
                  }}
                >
                  <span>{pr.label}</span>
                  {filters.priority === pr.id && <Check size={12} color="var(--primary-base)" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignee Filter Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => toggleDropdown('assignee')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 7px',
              fontSize: 'var(--text-xs)',
              color: filters.assignee !== 'all' ? 'var(--primary-text)' : 'var(--text-secondary)',
              backgroundColor: filters.assignee !== 'all' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${filters.assignee !== 'all' ? 'var(--primary-base)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <span>Assignee: {filters.assignee === 'all' ? 'All' : USERS.find(u => u.id === filters.assignee)?.name || 'User'}</span>
            <ChevronDown size={11} />
          </button>

          {openDropdown === 'assignee' && (
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: 0,
                zIndex: 100,
                minWidth: '170px',
                backgroundColor: 'var(--bg-modal)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-popover)',
                padding: '4px'
              }}
            >
              <div
                onClick={() => { onFilterChange('assignee', 'all'); setOpenDropdown(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                <span>Everyone</span>
                {filters.assignee === 'all' && <Check size={12} color="var(--primary-base)" />}
              </div>
              {USERS.map((usr) => (
                <div
                  key={usr.id}
                  onClick={() => { onFilterChange('assignee', usr.id); setOpenDropdown(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <span className="truncate">{usr.name}</span>
                  {filters.assignee === usr.id && <Check size={12} color="var(--primary-base)" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              height: '24px',
              padding: '0 6px',
              fontSize: 'var(--text-2xs)',
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
