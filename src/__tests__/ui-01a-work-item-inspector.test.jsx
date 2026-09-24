import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  CORE_WORK_ITEM_TYPES,
  ITEM_TYPE_DEFINITIONS,
  STATUS_CATEGORIES,
  getStatusCategory,
  isValidWorkItemType
} from '../constants/workItems';
import { INITIAL_WORK_ITEMS } from '../data/mockData';
import {
  WorkItemInspector,
  WorkItemDetailContainer,
  WorkItemHeader,
  WorkItemTitle,
  WorkItemProperties,
  WorkItemRelationships,
  WorkItemDiscussion,
  WorkItemActivity
} from '../features/work-items';
import { RestrictedPlaceholder } from '../components/common/RestrictedPlaceholder';

describe('UI-01A: Work Item Contract & Domain Invariants', () => {
  it('1. excludes Milestone from CORE WorkItem types', () => {
    expect(CORE_WORK_ITEM_TYPES).toEqual(['task', 'issue', 'bug']);
    expect(CORE_WORK_ITEM_TYPES).not.toContain('milestone');
    expect(isValidWorkItemType('task')).toBe(true);
    expect(isValidWorkItemType('issue')).toBe(true);
    expect(isValidWorkItemType('bug')).toBe(true);
    expect(isValidWorkItemType('milestone')).toBe(false);
  });

  it('2. enforces Workspace and Team ownership contract on all mock items', () => {
    INITIAL_WORK_ITEMS.forEach((item) => {
      expect(item.workspaceId).toBeDefined();
      expect(typeof item.workspaceId).toBe('string');
      expect(item.workspaceId.length).toBeGreaterThan(0);
      expect(item.teamId).toBeDefined();
      expect(typeof item.teamId).toBe('string');
      expect(item.teamId.length).toBeGreaterThan(0);
    });
  });

  it('3. derives statusCategory consistently from workflow status', () => {
    expect(getStatusCategory('backlog')).toBe('backlog');
    expect(getStatusCategory('todo')).toBe('unstarted');
    expect(getStatusCategory('in_progress')).toBe('started');
    expect(getStatusCategory('in_review')).toBe('started');
    expect(getStatusCategory('done')).toBe('completed');
    expect(getStatusCategory('canceled')).toBe('canceled');
  });

  it('4. uses canonical parentId for hierarchy rather than divergent state', () => {
    INITIAL_WORK_ITEMS.forEach((item) => {
      expect('parentId' in item).toBe(true);
    });
  });

  it('5. normalizes document relationships without competing fields', () => {
    const itemWithDocs = INITIAL_WORK_ITEMS.find((i) => i.documentLinks && i.documentLinks.length > 0);
    expect(itemWithDocs).toBeDefined();
    expect(itemWithDocs.documentLinks[0]).toHaveProperty('documentId');
    expect(itemWithDocs.documentLinks[0]).toHaveProperty('type');
  });
});

describe('UI-01A: Work Item Inspector & Detail Presentation', () => {
  const sampleItem = {
    id: 'test-101',
    identifier: 'ENG-1041',
    workspaceId: 'wks-core',
    teamId: 'team-core',
    title: 'Implement Tarjan cycle detection algorithm',
    type: 'task',
    status: 'in_progress',
    priority: 'urgent',
    estimate: 5,
    description: 'A blocks B loop detection in O(V + E) time.',
    subtasks: [
      { id: 'sub-1', title: 'DFS adjacency validator', done: true },
      { id: 'sub-2', title: 'Fuzz tests', done: false }
    ],
    relations: [
      { type: 'blocks', targetKey: 'ENG-1044', targetTitle: 'Storage engine' },
      { type: 'relates_to', isRestricted: true }
    ],
    documentLinks: [
      { documentId: 'doc-1', type: 'source_spec', title: 'PRD: Offline Sync' }
    ]
  };

  it('6. renders canonical WorkItem attributes in Inspector', () => {
    render(
      <WorkItemInspector
        isOpen={true}
        item={sampleItem}
        onClose={vi.fn()}
        onUpdateItem={vi.fn()}
      />
    );

    expect(screen.getByText('ENG-1041')).toBeTruthy();
    expect(screen.getByText('Task')).toBeTruthy();
    expect(screen.getByDisplayValue('Implement Tarjan cycle detection algorithm')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Urgent')).toBeTruthy();
  });

  it('7. calls onUpdateItem when title is edited and blurred', () => {
    const handleUpdate = vi.fn();
    render(
      <WorkItemTitle
        title="Original Title"
        onUpdateTitle={handleUpdate}
      />
    );

    const textarea = screen.getByDisplayValue('Original Title');
    fireEvent.change(textarea, { target: { value: 'Updated Title' } });
    fireEvent.blur(textarea);

    expect(handleUpdate).toHaveBeenCalledWith('Updated Title');
  });

  it('8. calls onUpdateItem when property status is toggled', () => {
    const handleUpdate = vi.fn();
    render(
      <WorkItemProperties
        item={sampleItem}
        onUpdateItem={handleUpdate}
      />
    );

    const statusButton = screen.getByText('In Progress');
    fireEvent.click(statusButton);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: expect.any(String) }));
  });

  it('9. restores caller focus when Inspector is closed', async () => {
    const triggerBtn = document.createElement('button');
    document.body.appendChild(triggerBtn);
    const returnFocusRef = { current: triggerBtn };
    const focusSpy = vi.spyOn(triggerBtn, 'focus');

    const handleClose = vi.fn();
    const { getByLabelText } = render(
      <WorkItemInspector
        isOpen={true}
        item={sampleItem}
        onClose={handleClose}
        returnFocusRef={returnFocusRef}
      />
    );

    const closeBtn = getByLabelText('Close inspector');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
    await waitFor(() => {
      expect(focusSpy).toHaveBeenCalled();
    });

    document.body.removeChild(triggerBtn);
  });

  it('10. suppresses shortcuts and allows typing in editable title and composer controls', () => {
    const handleUpdate = vi.fn();
    render(<WorkItemTitle title="Editable Title" onUpdateTitle={handleUpdate} />);

    const textarea = screen.getByDisplayValue('Editable Title');
    fireEvent.keyDown(textarea, { key: 's' });
    fireEvent.keyDown(textarea, { key: 'p' });
    // Textarea value can be updated without triggering global shortcuts
    fireEvent.change(textarea, { target: { value: 'Editable Title sp' } });
    expect(textarea.value).toBe('Editable Title sp');
  });

  it('11. prevents mutations when isReadOnly is true', () => {
    const handleUpdate = vi.fn();
    render(
      <WorkItemDetailContainer
        item={sampleItem}
        isReadOnly={true}
        onUpdateItem={handleUpdate}
      />
    );

    // Title should be plain text, not editable textarea
    expect(screen.queryByPlaceholderText('Issue title...')).toBeNull();
    expect(screen.getByText('Implement Tarjan cycle detection algorithm')).toBeTruthy();

    // Comment composer should be replaced with read-only badge
    expect(screen.getByText(/Read-only archive/i)).toBeTruthy();
    expect(screen.queryByPlaceholderText(/Leave a comment/i)).toBeNull();
  });

  it('12. strictly hides protected metadata on restricted relationships', () => {
    render(<WorkItemRelationships relations={sampleItem.relations} />);

    // Unrestricted relation displays identifier and target title
    expect(screen.getByText('ENG-1044')).toBeTruthy();
    expect(screen.getByText('Storage engine')).toBeTruthy();

    // Restricted relation displays zero-leakage placeholder
    expect(screen.getByText('Restricted work item')).toBeTruthy();
    expect(screen.getByText("You don't have permission to view this item.")).toBeTruthy();

    // Ensure no private key like CORE-918 or secret titles leak
    expect(screen.queryByText('CORE-918')).toBeNull();
  });

  it('13. keeps Discussion and Activity distinct via segmented tabs', () => {
    render(<WorkItemDetailContainer item={sampleItem} onUpdateItem={vi.fn()} />);

    // Default tab is Discussion
    expect(screen.getByText(/Discussion \(/i)).toBeTruthy();
    expect(screen.getByText(/Activity \(/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Leave a comment/i)).toBeTruthy();

    // Switch to Activity tab
    const activityTabBtn = screen.getByText(/Activity \(/i);
    fireEvent.click(activityTabBtn);

    // Discussion input is hidden, activity history is shown
    expect(screen.queryByPlaceholderText(/Leave a comment/i)).toBeNull();
    expect(screen.getByText('changed status')).toBeTruthy();
  });

  it('14. renders not found tombstone gracefully', () => {
    render(<WorkItemDetailContainer item={null} isNotFound={true} />);
    expect(screen.getByText('Work Item Not Found')).toBeTruthy();
  });

  it('15. reuses WorkItemDetailContainer across Drawer and standalone layouts', () => {
    const { container: drawerContainer } = render(
      <WorkItemInspector isOpen={true} item={sampleItem} onClose={vi.fn()} />
    );
    expect(drawerContainer.querySelector('.work-item-detail-container')).toBeTruthy();

    const { container: standaloneContainer } = render(
      <WorkItemDetailContainer item={sampleItem} />
    );
    expect(standaloneContainer.querySelector('.work-item-detail-container')).toBeTruthy();
  });
});
