import React from 'react';
import { Button } from '../../../design-system';

export function EmptyWorkState({ filtered = false, onResetFilters, onBrowseTeams }) {
  return (
    <div
      role="status"
      style={{
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        color: 'var(--text-secondary)'
      }}
    >
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
        {filtered ? 'No work matches the active filters.' : 'No active work assigned to you.'}
      </div>
      <Button size="sm" variant="secondary" onClick={filtered ? onResetFilters : onBrowseTeams}>
        {filtered ? 'Reset Filters' : 'Browse Teams'}
      </Button>
    </div>
  );
}
