/**
 * Universal High-Density Data Grid Column Registry
 * Governed by: UI-01B specification (docs/08-ui-01b-high-density-data-grid-contract.md)
 *
 * Invariants:
 * - Uses canonical WorkItem accessors (documentLinks, relations, parentId)
 * - Never introduces legacy or competing properties (specDocId, blockedBy, blocks, documentLink)
 * - Pinned default: 'select' and 'identifier'
 */

export const COLUMN_DEFINITIONS = [
  {
    id: 'select',
    label: '',
    width: 32,
    minWidth: 32,
    pinned: true,
    sortable: false,
    resizable: false,
    defaultVisible: true,
    alignment: 'center'
  },
  {
    id: 'identifier',
    label: 'ID',
    accessor: 'identifier',
    width: 85,
    minWidth: 70,
    pinned: true,
    sortable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'left',
    type: 'mono'
  },
  {
    id: 'type',
    label: 'Type',
    accessor: 'type',
    width: 36,
    minWidth: 32,
    sortable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'center'
  },
  {
    id: 'priority',
    label: 'Priority',
    accessor: 'priority',
    width: 80,
    minWidth: 70,
    sortable: true,
    editable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'center'
  },
  {
    id: 'title',
    label: 'Title',
    accessor: 'title',
    width: 280,
    minWidth: 180,
    sortable: true,
    editable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'left',
    flex: 1
  },
  {
    id: 'status',
    label: 'Status',
    accessor: 'status',
    width: 115,
    minWidth: 90,
    sortable: true,
    editable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'left'
  },
  {
    id: 'estimate',
    label: 'Est',
    accessor: 'estimate',
    width: 55,
    minWidth: 45,
    sortable: true,
    editable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'right',
    type: 'mono'
  },
  {
    id: 'assignee',
    label: 'Assignee',
    accessor: 'assigneeId',
    width: 130,
    minWidth: 100,
    sortable: true,
    editable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'left'
  },
  {
    id: 'project',
    label: 'Project',
    accessor: 'projectId',
    width: 110,
    minWidth: 80,
    sortable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'left'
  },
  {
    id: 'cycle',
    label: 'Cycle',
    accessor: 'cycleId',
    width: 90,
    minWidth: 70,
    sortable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'left'
  },
  {
    id: 'dueDate',
    label: 'Due',
    accessor: 'dueDate',
    width: 80,
    minWidth: 70,
    sortable: true,
    editable: true,
    resizable: true,
    defaultVisible: true,
    alignment: 'right',
    type: 'mono'
  },
  {
    id: 'relations',
    label: 'Relations',
    accessor: 'relations',
    width: 80,
    minWidth: 60,
    sortable: false,
    resizable: true,
    defaultVisible: true,
    alignment: 'left'
  },
  {
    id: 'documentLinks',
    label: 'Spec',
    accessor: 'documentLinks',
    width: 60,
    minWidth: 50,
    sortable: false,
    resizable: true,
    defaultVisible: true,
    alignment: 'center'
  },
  {
    id: 'createdAt',
    label: 'Created',
    accessor: 'createdAt',
    width: 85,
    minWidth: 70,
    sortable: true,
    resizable: true,
    defaultVisible: false,
    alignment: 'right',
    type: 'mono'
  },
  {
    id: 'updatedAt',
    label: 'Updated',
    accessor: 'updatedAt',
    width: 85,
    minWidth: 70,
    sortable: true,
    resizable: true,
    defaultVisible: false,
    alignment: 'right',
    type: 'mono'
  }
];

export const DEFAULT_COLUMN_ORDER = COLUMN_DEFINITIONS.map((c) => c.id);

export function getDefaultColumnWidths() {
  return COLUMN_DEFINITIONS.reduce((acc, col) => {
    acc[col.id] = col.width;
    return acc;
  }, {});
}

export function getDefaultColumnVisibility() {
  return COLUMN_DEFINITIONS.reduce((acc, col) => {
    acc[col.id] = col.defaultVisible;
    return acc;
  }, {});
}

export function getColumnDefinition(columnId) {
  return COLUMN_DEFINITIONS.find((c) => c.id === columnId) || null;
}
