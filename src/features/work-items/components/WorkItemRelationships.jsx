import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Link2 } from 'lucide-react';
import { EntityReference, RestrictedPlaceholder } from '../../../components';

/**
 * WorkItemRelationships Component
 * Renders dependency edges (blocks, blocked_by, relates_to) with zero-leakage privacy safeguards
 */
export function WorkItemRelationships({
  relations = [],
  onNavigateToItem,
  className = ''
}) {
  if (!relations || relations.length === 0) return null;

  const blocksRelations = relations.filter((r) => r.type === 'blocks');
  const blockedByRelations = relations.filter((r) => r.type === 'blocked_by');
  const otherRelations = relations.filter((r) => r.type !== 'blocks' && r.type !== 'blocked_by');

  const renderRelationItem = (rel, idx) => {
    if (rel.isRestricted) {
      return <RestrictedPlaceholder key={`restr-${idx}`} style={{ margin: '2px 0' }} />;
    }

    return (
      <div
        key={rel.targetKey || idx}
        onClick={() => rel.targetKey && onNavigateToItem?.(rel.targetKey)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          fontSize: 'var(--text-xs)',
          cursor: rel.targetKey ? 'pointer' : 'default',
          transition: 'background-color var(--duration-fast)'
        }}
      >
        <EntityReference identifier={rel.targetKey} />
        {rel.targetTitle && (
          <span
            style={{
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {rel.targetTitle}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`work-item-relationships ${className}`} style={{ width: '100%' }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 'var(--font-bold)',
          color: 'var(--text-subtle)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '6px'
        }}
      >
        Relationships & Dependencies
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Blocks */}
        {blocksRelations.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--status-in-progress)', marginBottom: '3px' }}>
              <ArrowUpRight size={12} />
              <span style={{ fontWeight: 'var(--font-medium)' }}>Blocks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {blocksRelations.map(renderRelationItem)}
            </div>
          </div>
        )}

        {/* Blocked By */}
        {blockedByRelations.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--status-todo)', marginBottom: '3px' }}>
              <ArrowDownLeft size={12} />
              <span style={{ fontWeight: 'var(--font-medium)' }}>Blocked by</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {blockedByRelations.map(renderRelationItem)}
            </div>
          </div>
        )}

        {/* Other / Relates To */}
        {otherRelations.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
              <Link2 size={12} />
              <span style={{ fontWeight: 'var(--font-medium)' }}>Related</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {otherRelations.map(renderRelationItem)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
