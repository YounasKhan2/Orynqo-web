import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { STATUS_DEFINITIONS } from '../../../constants/workItems';
import { TEAMS } from '../../../data/mockData';

function formatDate(value) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function WorkBucketSection({
  id,
  title,
  items = [],
  collapsed = false,
  onToggle,
  onOpenItem,
  action
}) {
  return (
    <section
      aria-labelledby={`my-work-${id}`}
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-surface)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          minHeight: '32px',
          padding: '0 var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-subtle)'
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 0,
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            cursor: 'pointer',
            padding: 0
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          <span id={`my-work-${id}`}>{title}</span>
          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>({items.length})</span>
        </button>
        {action}
      </div>

      {!collapsed && (
        <div role="grid" aria-rowcount={items.length} style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => {
            const team = TEAMS.find((candidate) => candidate.id === item.teamId);
            const status = STATUS_DEFINITIONS[item.status];
            return (
              <button
                key={item.id}
                type="button"
                role="row"
                onClick={() => onOpenItem?.(item)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px minmax(220px, 1fr) 120px 120px 150px',
                  alignItems: 'center',
                  minHeight: '30px',
                  padding: '0 var(--space-3)',
                  border: 0,
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <span role="gridcell" className="font-mono" style={{ color: 'var(--text-muted)' }}>{item.identifier}</span>
                <span role="gridcell" className="truncate">{item.title}</span>
                <span role="gridcell">{status?.label || item.status}</span>
                <span role="gridcell">{formatDate(item.dueDate)}</span>
                <span role="gridcell" className="truncate" style={{ color: 'var(--text-secondary)' }}>{team?.name || item.teamId}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
