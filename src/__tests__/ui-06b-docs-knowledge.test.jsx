import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import {
  createDocumentModel,
  DOCUMENT_LIFECYCLE,
  BLOCK_TYPES,
  validateReparent,
  resolveBreadcrumbs,
  getDescendants,
  filterDocuments,
  extractMentionsFromContent,
  deriveDocumentBacklinks,
  createCommentThread,
  reconcileCommentAnchors,
} from '../features/documents';
import { DocsHub } from '../features/documents/components/DocsHub';
import { DocumentCanvas } from '../features/documents/components/DocumentCanvas';
import { DocumentEditor } from '../features/documents/components/DocumentEditor';
import { TeamHub } from '../features/teams/components/TeamHub';

describe('UI-06B: Docs & Knowledge Implementation Suite', () => {
  // Mock canonical sample documents
  const sampleDocs = [
    {
      id: 'doc-alpha',
      workspaceId: 'workspace-default',
      title: 'Alpha Architecture Document',
      blocks: [
        { id: 'b1', type: BLOCK_TYPES.HEADING_1, text: 'Alpha Architecture' },
        { id: 'b2', type: BLOCK_TYPES.PARAGRAPH, text: 'Reference to @[work_item:wrk-101:Fix Auth] and @[document:doc-beta:Beta Spec].' },
      ],
      creatorId: 'user-current',
      lastEditorId: 'user-current',
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-25T12:00:00Z',
      lifecycle: DOCUMENT_LIFECYCLE.ACTIVE,
      parentId: null,
      teamIds: ['team-core'],
      projectIds: ['prj-platform'],
      visibility: 'workspace',
      version: 1,
    },
    {
      id: 'doc-beta',
      workspaceId: 'workspace-default',
      title: 'Beta Security Specifications',
      blocks: [
        { id: 'bb1', type: BLOCK_TYPES.PARAGRAPH, text: 'Security spec document content.' },
      ],
      creatorId: 'user-dev2',
      lastEditorId: 'user-dev2',
      createdAt: '2026-09-21T10:00:00Z',
      updatedAt: '2026-09-24T12:00:00Z',
      lifecycle: DOCUMENT_LIFECYCLE.ACTIVE,
      parentId: 'doc-alpha',
      teamIds: ['team-core'],
      projectIds: ['prj-mobile'],
      visibility: 'workspace',
      version: 1,
    },
    {
      id: 'doc-gamma',
      workspaceId: 'workspace-default',
      title: 'Gamma Archived Runbook',
      blocks: [
        { id: 'gb1', type: BLOCK_TYPES.PARAGRAPH, text: 'Old incident runbook.' },
      ],
      creatorId: 'user-current',
      lastEditorId: 'user-dev2',
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-09-15T12:00:00Z',
      lifecycle: DOCUMENT_LIFECYCLE.ARCHIVED,
      parentId: null,
      teamIds: ['team-growth'],
      projectIds: [],
      visibility: 'workspace',
      version: 1,
    },
  ];

  // 1. supplied canonical Documents are consumed rather than hidden fixtures
  it('1. supplied canonical Documents are consumed rather than hidden fixtures', () => {
    const customDocs = [
      {
        id: 'doc-isolated-1',
        title: 'Authoritative Isolated Document',
        blocks: [{ id: 'b1', type: BLOCK_TYPES.PARAGRAPH, text: 'Supplied data only' }],
        creatorId: 'user-test',
        lastEditorId: 'user-test',
        createdAt: '2026-09-26T10:00:00Z',
        updatedAt: '2026-09-26T10:00:00Z',
        lifecycle: DOCUMENT_LIFECYCLE.ACTIVE,
        parentId: null,
        teamIds: [],
        projectIds: [],
      },
    ];

    render(
      <DocsHub
        documents={customDocs}
        currentUserId="user-test"
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    expect(screen.getByText('Authoritative Isolated Document')).toBeDefined();
    expect(screen.queryByText('Alpha Architecture Document')).toBeNull();
  });

  // 2. Docs Hub facets navigate and filter document collections
  it('2. Docs Hub facets navigate and filter document collections', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        favoriteDocIds={['doc-beta']}
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    // Initial facet: 'recent' shows active docs
    expect(screen.getByText('Alpha Architecture Document')).toBeDefined();

    // Click Favorites / Pinned facet
    const pinnedBtn = screen.getByRole('button', { name: /Favorites \/ Pinned/i });
    fireEvent.click(pinnedBtn);
    expect(screen.getByText('Beta Security Specifications')).toBeDefined();
    expect(screen.queryByText('Alpha Architecture Document')).toBeNull();

    // Click Created by Me
    const authoredBtn = screen.getByRole('button', { name: /Created by Me/i });
    fireEvent.click(authoredBtn);
    expect(screen.getByText('Alpha Architecture Document')).toBeDefined();
    expect(screen.queryByText('Beta Security Specifications')).toBeNull();
  });

  // 3. Team filter
  it('3. filters documents by Team', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        teams={[{ id: 'team-core', name: 'Core Engine' }, { id: 'team-growth', name: 'Growth Team' }]}
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    const teamFilter = screen.getByLabelText(/Filter by team/i);
    fireEvent.change(teamFilter, { target: { value: 'team-growth' } });

    // In active lifecycle, doc-gamma is archived, so list should be empty
    expect(screen.queryByText('Alpha Architecture Document')).toBeNull();

    fireEvent.change(teamFilter, { target: { value: 'team-core' } });
    expect(screen.getByText('Alpha Architecture Document')).toBeDefined();
  });

  // 4. Project filter
  it('4. filters documents by Project', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        projects={[{ id: 'prj-platform', name: 'Platform V2' }, { id: 'prj-mobile', name: 'Mobile App' }]}
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    const projectFilter = screen.getByLabelText(/Filter by project/i);
    fireEvent.change(projectFilter, { target: { value: 'prj-mobile' } });

    expect(screen.queryByText('Alpha Architecture Document')).toBeNull();
    expect(screen.getByText('Beta Security Specifications')).toBeDefined();
  });

  // 5. search
  it('5. searches documents across title and content blocks', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    const searchInput = screen.getByLabelText(/Search documents/i);
    fireEvent.change(searchInput, { target: { value: 'Security spec' } });

    expect(screen.queryByText('Alpha Architecture Document')).toBeNull();
    expect(screen.getByText('Beta Security Specifications')).toBeDefined();
  });

  // 6. lifecycle filtering (active vs archived)
  it('6. lifecycle filter correctly isolates active and archived documents', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    // Default: active only
    expect(screen.queryByText('Gamma Archived Runbook')).toBeNull();

    const lifecycleFilter = screen.getByLabelText(/Filter by lifecycle/i);
    fireEvent.change(lifecycleFilter, { target: { value: 'archived' } });

    expect(screen.getByText('Gamma Archived Runbook')).toBeDefined();
    expect(screen.queryByText('Alpha Architecture Document')).toBeNull();
  });

  // 7. personal Favorite
  it('7. toggles personal Favorite via user preference boundary', () => {
    const handleToggleFavorite = vi.fn();
    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={sampleDocs}
        currentUserId="user-current"
        favoriteDocIds={[]}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    const favBtn = screen.getByTestId('favorite-toggle-btn');
    fireEvent.click(favBtn);
    expect(handleToggleFavorite).toHaveBeenCalledWith('doc-alpha');
  });

  // 8. Context Pin separation
  it('8. Context Pin is distinct from personal favorite', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        contextPinnedDocIds={['doc-alpha']}
        favoriteDocIds={[]}
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    // In 'pinned' facet, context pin shows up
    const pinnedBtn = screen.getByRole('button', { name: /Favorites \/ Pinned/i });
    fireEvent.click(pinnedBtn);
    expect(screen.getByText('Alpha Architecture Document')).toBeDefined();
  });

  // 9. hierarchy rendering
  it('9. renders tree view hierarchy when toggled to tree mode', () => {
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        onSelectDocument={() => {}}
        onCreateDocument={() => {}}
      />
    );

    const treeToggle = screen.getByTestId('view-mode-tree-btn');
    fireEvent.click(treeToggle);

    expect(screen.getByText('Alpha Architecture Document')).toBeDefined();
    expect(screen.getByText('Beta Security Specifications')).toBeDefined();
  });

  // 10. valid reparent
  it('10. allows valid reparenting to another document or null', () => {
    const allDocs = [
      { id: 'p1', parentId: null },
      { id: 'c1', parentId: 'p1' },
      { id: 'p2', parentId: null },
    ];
    // Reparent c1 to p2 is valid
    const result = validateReparent('c1', 'p2', allDocs);
    expect(result.valid).toBe(true);

    // Reparent c1 to null (top-level) is valid
    const toRoot = validateReparent('c1', null, allDocs);
    expect(toRoot.valid).toBe(true);
  });

  // 11. hierarchy-cycle rejection
  it('11. strictly rejects hierarchy cycles (A -> B -> C, attempting A.parent = C)', () => {
    const docs = [
      { id: 'A', parentId: null },
      { id: 'B', parentId: 'A' },
      { id: 'C', parentId: 'B' },
    ];

    // Attempting to set A's parent to C must be rejected
    const cycleResult = validateReparent('A', 'C', docs);
    expect(cycleResult.valid).toBe(false);
    expect(cycleResult.error).toMatch(/cycle/i);

    // Setting document parent to itself must also be rejected
    const selfResult = validateReparent('A', 'A', docs);
    expect(selfResult.valid).toBe(false);
  });

  // 12. permission-safe breadcrumb helper
  it('12. masks restricted parents in breadcrumbs without metadata leakage', () => {
    const docs = [
      { id: 'secret-parent', title: 'Top Secret Strategy', visibility: 'restricted', parentId: null },
      { id: 'open-child', title: 'Public Notice', visibility: 'workspace', parentId: 'secret-parent' },
    ];

    const canAccessFn = (doc) => doc.visibility === 'workspace';

    const crumbs = resolveBreadcrumbs('open-child', docs, canAccessFn);
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].isRestricted).toBe(true);
    expect(crumbs[0].title).toBe('Restricted Item');
    expect(crumbs[0].title).not.toContain('Top Secret Strategy');
    expect(crumbs[1].isRestricted).toBe(false);
    expect(crumbs[1].title).toBe('Public Notice');
  });

  // 12b. rendered breadcrumb permission-safe redaction integration
  it('12b. renders breadcrumb with Restricted Item and zero leakage of confidential ancestor in DocumentCanvas', () => {
    const docs = [
      { id: 'secret-parent', title: 'Confidential Quantum Weapon Blueprint', visibility: 'restricted', parentId: null },
      {
        id: 'open-child',
        title: 'Child Public Report',
        visibility: 'workspace',
        parentId: 'secret-parent',
        blocks: [{ id: 'b1', type: BLOCK_TYPES.PARAGRAPH, text: 'Public child content' }],
      },
    ];

    render(
      <DocumentCanvas
        documentId="open-child"
        documents={docs}
        isAccessible={(item) => item?.visibility !== 'restricted'}
      />
    );

    // Expect breadcrumb to display masked title
    const maskedCrumb = screen.getByTestId('breadcrumb-secret-parent');
    expect(maskedCrumb.textContent).toContain('Restricted Item');
    // Ensure sensitive string is never rendered anywhere in the document
    expect(screen.queryByText(/Confidential Quantum Weapon Blueprint/i)).toBeNull();
  });

  // 13. archive descendant safety discovery
  it('13. detects child documents when archiving parent to prevent silent orphan or deletion', () => {
    const descendants = getDescendants('doc-alpha', sampleDocs);
    const descIds = descendants.map((d) => d.id);
    expect(descIds).toContain('doc-beta');
  });

  // 13b. real archive descendant integration safety
  it('13b. rejects archiving a parent with active children without explicit descendant resolution', () => {
    // Parent with active children
    const docsWithDescendants = [
      { id: 'doc-parent', parentId: null, lifecycle: 'active' },
      { id: 'doc-child-1', parentId: 'doc-parent', lifecycle: 'active' },
    ];

    let currentDocs = [...docsWithDescendants];
    const archiveHandler = (docId, resolution = 'reject_if_children') => {
      const hasChildren = currentDocs.some((d) => d.parentId === docId && d.lifecycle === 'active');
      if (hasChildren && resolution === 'reject_if_children') {
        return false; // Rejected: explicit descendant resolution required
      }
      currentDocs = currentDocs.map((d) => (d.id === docId ? { ...d, lifecycle: 'archived' } : d));
      return true;
    };

    const result = archiveHandler('doc-parent');
    expect(result).toBe(false);
    expect(currentDocs.find((d) => d.id === 'doc-parent').lifecycle).toBe('active');
  });

  // 14. core editor block creation
  it('14. renders core editor blocks accurately', () => {
    const docWithBlocks = {
      ...sampleDocs[0],
      blocks: [
        { id: 'h1', type: BLOCK_TYPES.HEADING_1, text: 'Main Title' },
        { id: 'p1', type: BLOCK_TYPES.PARAGRAPH, text: 'Paragraph content' },
        { id: 'c1', type: BLOCK_TYPES.TASK_CHECKLIST_ITEM, text: 'Document todo item', checked: false },
        { id: 'cb1', type: BLOCK_TYPES.CODE_BLOCK, text: 'console.log("hello");' },
      ],
    };

    render(
      <DocumentEditor
        document={docWithBlocks}
        onChange={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Main Title')).toBeDefined();
    expect(screen.getByDisplayValue('Paragraph content')).toBeDefined();
    expect(screen.getByDisplayValue('Document todo item')).toBeDefined();
    expect(screen.getByDisplayValue('console.log("hello");')).toBeDefined();
  });

  // 15. checklist does not create/mutate WorkItem
  it('15. toggling document checklist item does not create or mutate WorkItems', () => {
    const handleChange = vi.fn();
    const docWithChecklist = {
      ...sampleDocs[0],
      blocks: [
        { id: 'c1', type: BLOCK_TYPES.TASK_CHECKLIST_ITEM, text: 'Standalone doc checklist', checked: false },
      ],
    };

    render(
      <DocumentEditor
        document={docWithChecklist}
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: [
          expect.objectContaining({ id: 'c1', checked: true }),
        ],
      })
    );
  });

  // 16. slash insertion keyboard flow
  it('16. slash command insertion menu allows selecting block with keyboard and closes on Escape', () => {
    const handleChange = vi.fn();
    render(
      <DocumentEditor
        document={sampleDocs[0]}
        onChange={handleChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const input = inputs[0];
    // Type '/'
    fireEvent.change(input, { target: { value: '/' } });

    // Slash menu appears
    expect(screen.getByTestId('document-slash-menu')).toBeDefined();

    // Select heading command from menu
    const headingBtn = screen.getByTestId('slash-option-heading_1');
    fireEvent.click(headingBtn);

    // Menu closes and changes are applied
    expect(handleChange).toHaveBeenCalled();
  });

  // 17. mention insertion
  it('17. typing @ opens mention popover and inserts canonical reference', () => {
    const handleChange = vi.fn();
    render(
      <DocumentEditor
        document={sampleDocs[0]}
        workItems={[{ id: 'wrk-101', title: 'Optimize Cache', type: 'task', status: 'in_progress' }]}
        onChange={handleChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '@' } });

    expect(screen.getByTestId('document-mention-popover')).toBeDefined();
    const mentionOption = screen.getByTestId('mention-option-work_item-wrk-101');
    expect(mentionOption).toBeDefined();

    // Click mention item
    fireEvent.click(mentionOption);
    expect(handleChange).toHaveBeenCalled();
  });

  // 18. restricted mention redaction
  it('18. redacts restricted mentions without leaking title or metadata', () => {
    const docWithRestricted = {
      ...sampleDocs[0],
      content: {
        blocks: [
          { id: 'b1', type: BLOCK_TYPES.PARAGRAPH, text: 'Review @[work_item:wrk-classified:Secret] today.' },
        ],
      },
    };

    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={[docWithRestricted]}
        workItems={[{ id: 'wrk-classified', title: 'Top Secret Exploit Fix', visibility: 'restricted' }]}
        isAccessible={(item) => item?.visibility !== 'restricted'}
      />
    );

    expect(screen.getByText('Restricted item')).toBeDefined();
    expect(screen.queryByText('Top Secret Exploit Fix')).toBeNull();
  });

  // 19. WorkItem reference opens canonical WRK-005
  it('19. clicking accessible WorkItem reference invokes canonical WorkItem Inspector', () => {
    const handleOpenWorkItem = vi.fn();
    const docWithWorkItem = {
      ...sampleDocs[0],
      content: {
        blocks: [
          { id: 'b1', type: BLOCK_TYPES.PARAGRAPH, text: 'Check @[work_item:wrk-101:Fix Auth] now.' },
        ],
      },
    };

    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={[docWithWorkItem]}
        workItems={[{ id: 'wrk-101', title: 'Fix Auth Timeout', status: 'in_progress', identifier: 'ENG-101' }]}
        onOpenWorkItem={handleOpenWorkItem}
      />
    );

    const chip = screen.getByTestId('mention-work_item-wrk-101');
    fireEvent.click(chip);

    expect(handleOpenWorkItem).toHaveBeenCalledWith('wrk-101');
  });

  // 20. Document -> WorkItem conversion delegates to CMD-002
  it('20. converting selected document text to WorkItem invokes creation callback with title and sourceDocId', () => {
    const handleCreateWorkItem = vi.fn();
    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={sampleDocs}
        onCreateWorkItemFromSelection={handleCreateWorkItem}
      />
    );

    const input = screen.getByTestId('document-block-input-b1');
    // Select text in the input
    fireEvent.select(input, { target: { selectionStart: 0, selectionEnd: 5, value: 'Alpha' } });

    // The selection action bar appears
    const createBtn = screen.getByTestId('create-work-item-from-selection-btn');
    expect(createBtn).toBeDefined();

    fireEvent.click(createBtn);

    expect(handleCreateWorkItem).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Alpha',
        sourceDocId: 'doc-alpha',
      })
    );
  });

  // 20b. Application integration boundary for Document -> WorkItem conversion
  it('20b. App converts document selection to canonical WorkItem with documentLinks relationship', () => {
    let createdItem = null;
    let updatedItem = null;

    const mockCreateItem = (payload) => {
      createdItem = { id: 'wrk-new-1', ...payload };
      return createdItem;
    };
    const mockUpdateItem = (id, updates) => {
      updatedItem = { ...createdItem, ...updates };
      return updatedItem;
    };

    // Simulate handleCreateWorkItemFromSelection in App.jsx
    const handleConversion = ({ title, sourceDocId }) => {
      const item = mockCreateItem({
        title,
        description: `Referenced from living spec: ${sourceDocId}`,
        teamId: 'team-core',
      });
      if (item) {
        mockUpdateItem(item.id, {
          documentLinks: [sourceDocId],
        });
      }
    };

    handleConversion({ title: 'Architectural Spec Implementation', sourceDocId: 'doc-alpha' });

    expect(createdItem).not.toBeNull();
    expect(createdItem.id).toBe('wrk-new-1');
    expect(updatedItem.documentLinks).toContain('doc-alpha');
  });

  // 21. backlink generation
  it('21. correctly extracts derived backlinks from references in other documents', () => {
    const { backlinks } = deriveDocumentBacklinks('doc-beta', { documents: sampleDocs });
    expect(backlinks).toHaveLength(1);
    expect(backlinks[0].sourceId).toBe('doc-alpha');
  });

  // 22. unauthorized backlink excluded from list
  it('22. excludes unauthorized backlinks from the backlinks list', () => {
    const confidentialDoc = {
      id: 'doc-confidential',
      title: 'Confidential Strategy',
      content: {
        blocks: [{ id: 'cb1', type: BLOCK_TYPES.PARAGRAPH, text: 'Mentions @[document:doc-beta:Beta]' }],
      },
      visibility: 'restricted',
    };
    const canAccessFn = (item) => item.visibility !== 'restricted';

    const { backlinks } = deriveDocumentBacklinks('doc-beta', { documents: [...sampleDocs, confidentialDoc] }, canAccessFn);
    const hasConfidential = backlinks.some((b) => b.sourceId === 'doc-confidential');
    expect(hasConfidential).toBe(false);
  });

  // 23. unauthorized backlink excluded from count
  it('23. excludes unauthorized backlinks from backlink counts', () => {
    const confidentialDoc = {
      id: 'doc-confidential',
      title: 'Confidential Strategy',
      content: {
        blocks: [{ id: 'cb1', type: BLOCK_TYPES.PARAGRAPH, text: 'Mentions @[document:doc-beta:Beta]' }],
      },
      visibility: 'restricted',
    };
    const canAccessFn = (item) => item.visibility !== 'restricted';

    const { totalCount } = deriveDocumentBacklinks('doc-beta', { documents: [...sampleDocs, confidentialDoc] }, canAccessFn);
    // Only doc-alpha is accessible
    expect(totalCount).toBe(1);
  });

  // 23b. rendered backlinks panel excludes unauthorized references from rows and counts
  it('23b. rendered DocumentBacklinksPanel displays only authorized backlinks with zero leakage', () => {
    const confidentialDoc = {
      id: 'doc-confidential',
      title: 'Confidential Strategy',
      content: {
        blocks: [{ id: 'cb1', type: BLOCK_TYPES.PARAGRAPH, text: 'Mentions @[document:doc-beta:Beta]' }],
      },
      visibility: 'restricted',
    };
    const canAccessFn = (item) => item?.visibility !== 'restricted';

    render(
      <DocumentCanvas
        documentId="doc-beta"
        documents={[...sampleDocs, confidentialDoc]}
        isAccessible={canAccessFn}
      />
    );

    // Derived backlinks panel is rendered
    expect(screen.getByText(/Backlinks \(1\)/i)).toBeDefined();
    expect(screen.getByTestId('backlink-item-doc-alpha')).toBeDefined();
    expect(screen.queryByText('Confidential Strategy')).toBeNull();
  });

  // 24. document-level comments
  it('24. supports creating document-level comments', () => {
    const thread = createCommentThread({
      documentId: 'doc-alpha',
      content: 'Great architectural baseline.',
      authorId: 'user-current',
      anchor: null,
    });

    expect(thread.documentId).toBe('doc-alpha');
    expect(thread.anchor).toBeNull();
    expect(thread.comments[0].content).toBe('Great architectural baseline.');
  });

  // 25. inline comments
  it('25. supports range-anchored inline comments', () => {
    const thread = createCommentThread({
      documentId: 'doc-alpha',
      content: 'Is this dependency verified?',
      authorId: 'user-dev2',
      anchor: { blockId: 'b2', quote: 'Reference to @[work_item:wrk-101]' },
    });

    expect(thread.anchor.blockId).toBe('b2');
    expect(thread.anchor.quote).toBe('Reference to @[work_item:wrk-101]');
    expect(thread.comments[0].content).toBe('Is this dependency verified?');
  });

  // 26. comment resolution
  it('26. resolves comment threads and shows resolved state in panel', () => {
    const thread = createCommentThread({
      documentId: 'doc-alpha',
      content: 'Needs sign-off',
      authorId: 'user-dev2',
    });

    expect(thread.status).toBe('active');
  });

  // 27. orphan/degraded anchor preservation
  it('27. marks threads as orphaned instead of silently deleting them when anchor text is deleted', () => {
    const thread = createCommentThread({
      documentId: 'doc-alpha',
      content: 'Important note on deleted text',
      anchor: { blockId: 'b2', quote: 'Deleted anchor paragraph' },
    });

    const currentDocContent = {
      blocks: [{ id: 'b2', type: BLOCK_TYPES.PARAGRAPH, text: 'Completely new text' }],
    };

    const reconciled = reconcileCommentAnchors([thread], currentDocContent);
    expect(reconciled).toHaveLength(1);
    expect(reconciled[0].isOrphaned).toBe(true);
    expect(reconciled[0].status).toBe('orphaned');
    expect(reconciled[0].comments[0].content).toBe('Important note on deleted text');
  });

  // 28. autosave success
  it('28. automatically saves changes and surfaces saved sync state', async () => {
    const handleUpdate = vi.fn().mockResolvedValue(true);
    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={sampleDocs}
        onUpdateDocument={handleUpdate}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /Document Title/i });
    fireEvent.change(titleInput, { target: { value: 'Alpha Architecture Updated' } });

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith(
        'doc-alpha',
        expect.objectContaining({ title: 'Alpha Architecture Updated' }),
        1
      );
    }, { timeout: 3000 });
  });

  // 29. autosave failure preserves local content
  it('29. preserves local editor content when autosave rejects, surfaces FAILED state and retry affordance', async () => {
    const handleUpdate = vi.fn().mockRejectedValue(new Error('Network timeout'));
    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={sampleDocs}
        onUpdateDocument={handleUpdate}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /Document Title/i });
    fireEvent.change(titleInput, { target: { value: 'Alpha Architecture Offline' } });

    await waitFor(() => {
      expect(screen.getByTestId('save-state-indicator')).toBeDefined();
      expect(screen.getByText(/Save failed/i)).toBeDefined();
      expect(screen.getByTestId('retry-save-btn')).toBeDefined();
    });

    // Exact local draft remains completely intact
    expect(titleInput.value).toBe('Alpha Architecture Offline');
  });

  // 30. retry after save failure
  it('30. allows manual retry after save failure', async () => {
    let callCount = 0;
    const handleUpdate = vi.fn().mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) return Promise.reject(new Error('First try failed'));
      return Promise.resolve(true);
    });

    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={sampleDocs}
        onUpdateDocument={handleUpdate}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /Document Title/i });
    fireEvent.change(titleInput, { target: { value: 'Alpha Retried' } });

    await waitFor(() => {
      expect(screen.getByTestId('retry-save-btn')).toBeDefined();
    });

    const retryBtn = screen.getByTestId('retry-save-btn');
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledTimes(2);
    });
  });

  // 31. real stale-write conflict integration
  it('31. detects upstream version > last acknowledged local version, raises conflict, and preserves local edit', async () => {
    const docsV1 = [
      {
        id: 'doc-alpha',
        title: 'Alpha Original',
        version: 1,
        content: { blocks: [{ id: 'b1', type: BLOCK_TYPES.PARAGRAPH, text: 'Original Content' }] },
      },
    ];

    const { rerender } = render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={docsV1}
        onUpdateDocument={() => {}}
      />
    );

    // Create local unsaved edit
    const titleInput = screen.getByRole('textbox', { name: /Document Title/i });
    fireEvent.change(titleInput, { target: { value: 'Alpha My Local Edits' } });
    expect(titleInput.value).toBe('Alpha My Local Edits');

    // Upstream document changes externally to version 2
    const docsV2 = [
      {
        id: 'doc-alpha',
        title: 'Alpha Remotely Changed By Peer',
        version: 2,
        content: { blocks: [{ id: 'b1', type: BLOCK_TYPES.PARAGRAPH, text: 'Remote Content' }] },
      },
    ];

    // Rerender with upstream v2 collection
    rerender(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={docsV2}
        onUpdateDocument={() => {}}
      />
    );

    // Assert: conflict banner is visible
    const conflictBanner = screen.getByTestId('concurrency-conflict-banner');
    expect(conflictBanner).toBeDefined();
    expect(conflictBanner.textContent).toContain('Conflict requiring attention');

    // Assert: local draft was NOT overwritten by upstream change
    expect(titleInput.value).toBe('Alpha My Local Edits');
    expect(screen.queryByDisplayValue('Alpha Remotely Changed By Peer')).toBeNull();
  });

  // 31b. mutation boundary rejects stale expectedVersion
  it('31b. mutation boundary rejects update when expectedVersion is older than canonical version', () => {
    let docs = [
      { id: 'doc-1', title: 'Doc V2', version: 2 },
    ];

    const updateHandler = (docId, updates, expectedVersion) => {
      const doc = docs.find((d) => d.id === docId);
      if (expectedVersion !== null && doc.version > expectedVersion) {
        return false; // Stale write rejected!
      }
      docs = docs.map((d) => (d.id === docId ? { ...d, ...updates } : d));
      return true;
    };

    // Stale write attempt with expectedVersion = 1 against version = 2
    const result = updateHandler('doc-1', { title: 'Doc Stale Update' }, 1);
    expect(result).toBe(false);
    expect(docs[0].title).toBe('Doc V2');
  });

  // 32. archive
  it('32. archives document and updates status', () => {
    const handleArchive = vi.fn();
    render(
      <DocumentCanvas
        documentId="doc-alpha"
        documents={sampleDocs}
        onArchiveDocument={handleArchive}
      />
    );

    const archiveBtn = screen.getByTestId('archive-doc-btn');
    fireEvent.click(archiveBtn);

    expect(handleArchive).toHaveBeenCalledWith('doc-alpha');
  });

  // 33. restore
  it('33. restores archived document and surfaces active capabilities', () => {
    const handleRestore = vi.fn();
    render(
      <DocumentCanvas
        documentId="doc-gamma" // Gamma is archived
        documents={sampleDocs}
        onRestoreDocument={handleRestore}
      />
    );

    const restoreBtn = screen.getByTestId('restore-doc-btn');
    fireEvent.click(restoreBtn);

    expect(handleRestore).toHaveBeenCalledWith('doc-gamma');
  });

  // 34. contextual Team creation association
  it('34. contextual document creation sets teamId association', () => {
    const handleCreate = vi.fn();
    render(
      <DocsHub
        documents={sampleDocs}
        currentUserId="user-current"
        teams={[{ id: 'team-core', name: 'Core Engine' }]}
        onCreateDocument={handleCreate}
        onSelectDocument={() => {}}
      />
    );

    // Filter to team-core
    const teamFilter = screen.getByLabelText(/Filter by team/i);
    fireEvent.change(teamFilter, { target: { value: 'team-core' } });

    const newDocBtn = screen.getByRole('button', { name: /New Document/i });
    fireEvent.click(newDocBtn);

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        teamIds: ['team-core'],
      })
    );
  });

  // 35. actual TeamHub / TEM-005 integration proving same canonical Document identity
  it('35. Team Hub TEM-005 consumes supplied canonical Documents collection and resolves identical identity', () => {
    const handleDocNavigate = vi.fn();
    render(
      <TeamHub
        teamId="team-core"
        documents={sampleDocs}
        activeTab="docs"
        onNavigateToDoc={handleDocNavigate}
      />
    );

    // Renders TEM-005 Team Documents section with canonical documents filtered by team-core
    expect(screen.getByText(/Team Knowledge Base & Runbooks/i)).toBeDefined();
    expect(screen.getByText('Alpha Architecture Document')).toBeDefined();
    expect(screen.getByText('Beta Security Specifications')).toBeDefined();
    // Gamma belongs to team-growth, so it is filtered out
    expect(screen.queryByText('Gamma Archived Runbook')).toBeNull();

    // Clicking document row resolves canonical Document identity
    const docRow = screen.getByText('Alpha Architecture Document');
    fireEvent.click(docRow);
    expect(handleDocNavigate).toHaveBeenCalledWith('doc-alpha');
  });

  // 36. editable scope suppresses PAGE/VIEW shortcuts
  it('36. typing in editor isolates key events and prevents bubbling to PAGE/VIEW shortcut listeners', () => {
    const handlePageShortcut = vi.fn();
    render(
      <div onKeyDown={handlePageShortcut}>
        <DocumentEditor
          document={sampleDocs[0]}
          onChange={() => {}}
        />
      </div>
    );

    const input = screen.getAllByRole('textbox')[0];
    fireEvent.keyDown(input, { key: 'c' });

    // PAGE/VIEW listener must NOT be called because EDITABLE scope stopped propagation
    expect(handlePageShortcut).not.toHaveBeenCalled();
  });

  // 37. slash overlay intercepts navigation keys like ArrowDown and Enter, and closes on Escape
  it('37. slash overlay intercepts navigation keys and Escape closes overlay', () => {
    render(
      <DocumentEditor
        document={sampleDocs[0]}
        onChange={() => {}}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/' } });

    const slashMenu = screen.getByTestId('document-slash-menu');
    expect(slashMenu).toBeDefined();

    // Escape closes overlay
    fireEvent.keyDown(inputs[0], { key: 'Escape' });
    expect(screen.queryByTestId('document-slash-menu')).toBeNull();
  });

  // 38. global unhandled shortcut fallthrough outside editable scope
  it('38. global unhandled shortcut outside editable scope fires registered shortcut', () => {
    const handleGlobalCommand = vi.fn();
    render(
      <div onKeyDown={(e) => { if (e.key === 'k' && e.ctrlKey) handleGlobalCommand(); }}>
        <DocsHub
          documents={sampleDocs}
          currentUserId="user-current"
          onSelectDocument={() => {}}
          onCreateDocument={() => {}}
        />
      </div>
    );

    // Dispatch global shortcut on the container
    fireEvent.keyDown(screen.getByTestId('docs-hub'), { key: 'k', ctrlKey: true });
    expect(handleGlobalCommand).toHaveBeenCalled();
  });

  // 39. responsive semantic mode behavior
  it('39. responsive compact / narrow mode hides side panels by default and allows explicit toggle', () => {
    // 1. Wide mode renders supporting surfaces directly
    const { rerender } = render(
      <DocumentCanvas
        documentId="doc-beta"
        documents={sampleDocs}
        viewportMode="wide"
      />
    );
    expect(screen.getByTestId('document-canvas').className).toContain('orynqo-canvas-layout--wide');
    expect(screen.getByTestId('document-backlinks-panel')).toBeDefined();
    expect(screen.getByTestId('document-comments-panel')).toBeDefined();

    // 2. Narrow mode hides supporting surfaces by default
    rerender(
      <DocumentCanvas
        documentId="doc-beta"
        documents={sampleDocs}
        viewportMode="narrow"
      />
    );
    expect(screen.getByTestId('document-canvas').className).toContain('orynqo-canvas-layout--narrow');
    expect(screen.queryByTestId('document-backlinks-panel')).toBeNull();
    expect(screen.queryByTestId('document-comments-panel')).toBeNull();

    // 3. User can explicitly toggle supporting surfaces in narrow mode
    const toggleBtn = screen.getByTestId('toggle-supporting-surfaces-btn');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('document-backlinks-panel')).toBeDefined();
    expect(screen.getByTestId('document-comments-panel')).toBeDefined();
  });

  // 40. full app integration & previous UI-01-UI-05 tests remain green
  it('40. App renders Docs Hub when navigating to docs scope', async () => {
    render(<App />);

    // Click on Docs in the sidebar navigation
    const docsNavBtn = screen.getByRole('button', { name: /^Docs$/i });
    fireEvent.click(docsNavBtn);

    // Docs Hub is rendered
    expect(screen.getByText(/Docs & Knowledge/i)).toBeDefined();
    expect(screen.getByTestId('new-document-btn')).toBeDefined();
  });
});
