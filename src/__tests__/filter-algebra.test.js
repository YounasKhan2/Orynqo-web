import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWorkItemsFilter } from '../hooks/useWorkItemsFilter';
import { CURRENT_USER } from '../data/mockData';

describe('useWorkItemsFilter - Filter Algebra', () => {
  const sampleItems = [
    {
      id: 'item-1',
      identifier: 'OR-1',
      title: 'Fix auth session expiration',
      description: 'JWT token refreshToken issues',
      teamId: 'team-core',
      status: 'in_progress',
      priority: 'urgent',
      assigneeId: CURRENT_USER.id,
      projectId: 'proj-1'
    },
    {
      id: 'item-2',
      identifier: 'OR-2',
      title: 'Implement Dark Mode tokens',
      description: 'Add CSS variables for slate colors',
      teamId: 'team-core',
      status: 'todo',
      priority: 'low',
      assigneeId: 'usr-2',
      projectId: 'proj-1'
    },
    {
      id: 'item-3',
      identifier: 'OR-3',
      title: 'Growth funnel telemetry',
      description: 'Segment event tracking',
      teamId: 'team-growth',
      status: 'done',
      priority: 'medium',
      assigneeId: CURRENT_USER.id,
      projectId: 'proj-2'
    }
  ];

  it('filters items by teamId in standard views', () => {
    const { result } = renderHook(() =>
      useWorkItemsFilter({
        items: sampleItems,
        activeTeamId: 'team-core',
        activeView: 'data-grid',
        filters: { status: 'all', priority: 'all', assignee: 'all', project: 'all' }
      })
    );

    expect(result.current.length).toBe(2);
    expect(result.current.every((i) => i.teamId === 'team-core')).toBe(true);
  });

  it('filters by status and priority compounds', () => {
    const { result } = renderHook(() =>
      useWorkItemsFilter({
        items: sampleItems,
        activeTeamId: 'team-core',
        activeView: 'data-grid',
        filters: { status: 'todo', priority: 'low', assignee: 'all', project: 'all' }
      })
    );

    expect(result.current.length).toBe(1);
    expect(result.current[0].id).toBe('item-2');
  });

  it('searches across identifier and title', () => {
    const { result } = renderHook(() =>
      useWorkItemsFilter({
        items: sampleItems,
        activeTeamId: 'team-core',
        activeView: 'data-grid',
        searchQuery: 'auth',
        filters: { status: 'all', priority: 'all', assignee: 'all', project: 'all' }
      })
    );

    expect(result.current.length).toBe(1);
    expect(result.current[0].identifier).toBe('OR-1');
  });

  it('isolates current user items across teams in my-issues view', () => {
    const { result } = renderHook(() =>
      useWorkItemsFilter({
        items: sampleItems,
        activeTeamId: 'team-core',
        activeView: 'my-issues',
        filters: { status: 'all', priority: 'all', assignee: 'all', project: 'all' }
      })
    );

    expect(result.current.length).toBe(2);
    expect(result.current.every((i) => i.assigneeId === CURRENT_USER.id)).toBe(true);
  });
});
