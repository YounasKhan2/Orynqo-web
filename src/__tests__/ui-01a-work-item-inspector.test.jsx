import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {
  CORE_WORK_ITEM_TYPES,
  ITEM_TYPE_DEFINITIONS,
  STATUS_CATEGORIES,
  getStatusCategory,
  isValidWorkItemType,
  normalizeWorkItemType
} from '../constants/workItems';
import { INITIAL_WORK_ITEMS } from '../data/mockData';
import {
  WorkItemInspector,
  WorkItemDetailContainer,
  WorkItemHeader,
  WorkItemTitle,
  WorkItemProperties,
  WorkItemRelationships,
  WorkItemSubItems,
  WorkItemDiscussion,
  WorkItemActivity
} from '../features/work-items';
import { RestrictedPlaceholder } from '../components/common/RestrictedPlaceholder';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

describe('UI-01A: Work Item Contract & Domain Invariants', () => {
  it('1. excludes Milestone and restricts canonical types strictly to CORE (Task, Issue, Bug)', () => {
    expect(CORE_WORK_ITEM_TYPES).toEqual(['task', 'issue', 'bug']);
    expect(CORE_WORK_ITEM_TYPES).not.toContain('milestone');
    expect(isValidWorkItemType('task')).toBe(true);
    expect(isValidWorkItemType('issue')).toBe(true);
    expect(isValidWorkItemType('bug')).toBe(true);
    expect(isValidWorkItemType('milestone')).toBe(false);

    // Canonical ITEM_TYPE_DEFINITIONS must not contain legacy aliases as canonical keys
    expect(Object.keys(ITEM_TYPE_DEFINITIONS)).toEqual(['task', 'issue', 'bug']);
    expect('feature' in ITEM_TYPE_DEFINITIONS).toBe(false);
    expect('chore' in ITEM_TYPE_DEFINITIONS).toBe(false);

    // Isolated normalizer helper safely translates legacy payloads
    expect(normalizeWorkItemType('feature')).toBe('issue');
    expect(normalizeWorkItemType('chore')).toBe('task');
  });

  it('2. enforces Workspace and Team ownership contract on all mock items', () => {
    INITIAL_WORK_ITEMS.forEach((item) => {
      expect(item.workspaceId).toBe('wks-core');
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

  it('4. strictly enforces single-source-of-truth model without legacy duplicate fields in mockData', () => {
    INITIAL_WORK_ITEMS.forEach((item) => {
      // Must have canonical hierarchy parentId
      expect('parentId' in item).toBe(true);
      // Legacy duplicate fields must be completely removed
      expect('specDocId' in item).toBe(false);
      expect('subtasks' in item).toBe(false);
      expect('blockedBy' in item).toBe(false);
      expect('blocks' in item).toBe(false);
      // Canonical collections must exist
      expect(Array.isArray(item.relations)).toBe(true);
      expect(Array.isArray(item.documentLinks)).toBe(true);
    });

    // Sub-items exist as first-class items linked via parentId
    const subItems = INITIAL_WORK_ITEMS.filter((i) => i.parentId !== null);
    expect(subItems.length).toBeGreaterThan(0);
    subItems.forEach((sub) => {
      expect(sub.parentId).toBeDefined();
      expect(CORE_WORK_ITEM_TYPES).toContain(sub.type);
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
    parentId: null,
    relations: [
      { type: 'blocks', targetKey: 'ENG-1044', targetTitle: 'Storage engine' },
      { type: 'relates_to', isRestricted: true }
    ],
    documentLinks: [
      { documentId: 'doc-1', type: 'source_spec', title: 'PRD: Offline Sync' }
    ]
  };

  const sampleSubItems = [
    { id: 'sub-1', title: 'DFS adjacency validator', status: 'done', parentId: 'test-101' },
    { id: 'sub-2', title: 'Fuzz tests', status: 'todo', parentId: 'test-101' }
  ];

  it('6. renders canonical WorkItem attributes in Inspector', () => {
    render(
      <WorkItemInspector
        isOpen={true}
        item={sampleItem}
        subItems={sampleSubItems}
        onClose={vi.fn()}
        onUpdateItem={vi.fn()}
      />
    );

    expect(screen.getByText('ENG-1041')).toBeTruthy();
    expect(screen.getByText('Task')).toBeTruthy();
    expect(screen.getByDisplayValue('Implement Tarjan cycle detection algorithm')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Urgent')).toBeTruthy();
    expect(screen.getByText('DFS adjacency validator')).toBeTruthy();
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

  it('8. opens property selector trigger on click and updates status without cycling', () => {
    const handleUpdate = vi.fn();
    render(
      <WorkItemProperties
        item={sampleItem}
        onUpdateItem={handleUpdate}
      />
    );

    // Trigger button for status
    const statusTrigger = screen.getByLabelText('Change status');
    fireEvent.click(statusTrigger);

    // Status option list is now open
    const doneOption = screen.getByRole('option', { name: /Done/i });
    expect(doneOption).toBeTruthy();

    // Select Done option
    fireEvent.click(doneOption);

    // Updates directly to selected status without cycling
    expect(handleUpdate).toHaveBeenCalledWith({ status: 'done' });
  });

  it('8b. opens priority selector trigger on click and updates priority without cycling', () => {
    const handleUpdate = vi.fn();
    render(
      <WorkItemProperties
        item={sampleItem}
        onUpdateItem={handleUpdate}
      />
    );

    // Trigger button for priority
    const priorityTrigger = screen.getByLabelText('Change priority');
    fireEvent.click(priorityTrigger);

    // Select High option
    const highOption = screen.getByRole('option', { name: /High/i });
    expect(highOption).toBeTruthy();
    fireEvent.click(highOption);

    // Updates directly to selected priority without cycling
    expect(handleUpdate).toHaveBeenCalledWith({ priority: 'high' });
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

  // Integration test component to test genuine keyboard scope suppression
  function KeyboardIntegrationHarness({ onOpenCreate, onToggleInspector }) {
    useKeyboardShortcuts({
      isOverlayActive: false,
      onOpenCreateModal: onOpenCreate,
      onToggleInspector: onToggleInspector
    });

    return (
      <div>
        <WorkItemTitle title="Editable Title" onUpdateTitle={vi.fn()} />
        <button type="button">Non-editable target</button>
      </div>
    );
  }

  it('10. proves that typing in editable control genuinely suppresses global shortcuts', () => {
    const handleOpenCreate = vi.fn();
    const handleToggleInspector = vi.fn();

    render(
      <KeyboardIntegrationHarness
        onOpenCreate={handleOpenCreate}
        onToggleInspector={handleToggleInspector}
      />
    );

    const textarea = screen.getByDisplayValue('Editable Title');
    act(() => {
      textarea.focus();
    });

    // 1. Dispatch global shortcut keys ('c' and 'i') inside the editable control scope
    fireEvent.keyDown(textarea, { key: 'c' });
    fireEvent.keyDown(textarea, { key: 'i' });

    // Assert global shortcut listeners were genuinely SUPPRESSED
    expect(handleOpenCreate).not.toHaveBeenCalled();
    expect(handleToggleInspector).not.toHaveBeenCalled();

    // 2. Now dispatch shortcut keys in global scope outside of the editable control
    act(() => {
      textarea.blur();
    });
    fireEvent.keyDown(window, { key: 'c' });
    expect(handleOpenCreate).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'i' });
    expect(handleToggleInspector).toHaveBeenCalledTimes(1);
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
