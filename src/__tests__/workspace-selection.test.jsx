import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../app/providers/WorkspaceContext';

function wrapper({ children }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}

describe('WorkspaceContext - Canonical Selection & Mutation Protection', () => {
  it('selects an item canonically WITHOUT mutating it', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    const targetItem = result.current.items[1];
    const originalItemSnapshot = { ...targetItem };

    act(() => {
      result.current.selectItem(targetItem.id);
    });

    expect(result.current.selectedItemId).toBe(targetItem.id);
    expect(result.current.selectedItem.id).toBe(targetItem.id);

    // CRITICAL: Item must NOT be mutated merely by selecting it
    const itemAfterSelect = result.current.items.find((i) => i.id === targetItem.id);
    expect(itemAfterSelect).toEqual(originalItemSnapshot);
  });

  it('updates an item when explicit updates are provided', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });
    const targetItem = result.current.items[0];

    act(() => {
      result.current.updateItem(targetItem.id, { title: 'Updated Title', status: 'done' });
    });

    const updated = result.current.items.find((i) => i.id === targetItem.id);
    expect(updated.title).toBe('Updated Title');
    expect(updated.status).toBe('done');
  });

  it('creates an item and automatically selects it', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    const newItem = {
      id: 'test-new-item-1',
      identifier: 'OR-999',
      title: 'New Architecture Task',
      teamId: 'team-core',
      status: 'todo',
      priority: 'high',
      assigneeId: 'usr-1'
    };

    act(() => {
      result.current.createItem(newItem);
    });

    expect(result.current.items[0].id).toBe('test-new-item-1');
    expect(result.current.selectedItemId).toBe('test-new-item-1');
  });

  it('deletes an item and clears selectedItemId if selected', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });
    const targetId = result.current.items[0].id;

    act(() => {
      result.current.selectItem(targetId);
      result.current.deleteItem(targetId);
    });

    expect(result.current.items.some((i) => i.id === targetId)).toBe(false);
    expect(result.current.selectedItemId).toBeNull();
  });

  it('handles multi-selection, bulk status change, and clearSelection', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });
    const ids = [result.current.items[0].id, result.current.items[1].id];

    act(() => {
      result.current.selectAll(ids);
    });
    expect(result.current.multiSelectedIds).toEqual(ids);

    act(() => {
      result.current.bulkUpdateStatus('in_progress');
    });

    const item0 = result.current.items.find((i) => i.id === ids[0]);
    const item1 = result.current.items.find((i) => i.id === ids[1]);
    expect(item0.status).toBe('in_progress');
    expect(item1.status).toBe('in_progress');
    // Bulk action clears multi-selection
    expect(result.current.multiSelectedIds).toEqual([]);
  });
});
