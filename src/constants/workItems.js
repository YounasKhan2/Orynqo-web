// Domain Constants for Work Items, Statuses, Priorities & Global Shortcuts

export const STATUS_DEFINITIONS = {
  backlog: {
    id: 'backlog',
    label: 'Backlog',
    color: 'var(--status-backlog)',
    category: 'backlog',
    icon: 'CircleDashed'
  },
  todo: {
    id: 'todo',
    label: 'Todo',
    color: 'var(--status-todo)',
    category: 'unstarted',
    icon: 'Circle'
  },
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    color: 'var(--status-in-progress)',
    bg: 'var(--status-in-progress-bg)',
    category: 'started',
    icon: 'Clock'
  },
  in_review: {
    id: 'in_review',
    label: 'In Review',
    color: 'var(--status-review)',
    bg: 'var(--status-review-bg)',
    category: 'started',
    icon: 'GitPullRequest'
  },
  done: {
    id: 'done',
    label: 'Done',
    color: 'var(--status-done)',
    bg: 'var(--status-done-bg)',
    category: 'completed',
    icon: 'CheckCircle2'
  },
  canceled: {
    id: 'canceled',
    label: 'Canceled',
    color: 'var(--status-canceled)',
    category: 'canceled',
    icon: 'XCircle'
  }
};

export const PRIORITY_DEFINITIONS = {
  urgent: {
    id: 'urgent',
    value: 4,
    label: 'Urgent',
    color: 'var(--priority-urgent)',
    bg: 'var(--priority-urgent-bg)',
    icon: 'AlertCircle'
  },
  high: {
    id: 'high',
    value: 3,
    label: 'High',
    color: 'var(--priority-high)',
    bg: 'var(--priority-high-bg)',
    icon: 'SignalHigh'
  },
  medium: {
    id: 'medium',
    value: 2,
    label: 'Medium',
    color: 'var(--priority-medium)',
    bg: 'var(--priority-medium-bg)',
    icon: 'SignalMedium'
  },
  low: {
    id: 'low',
    value: 1,
    label: 'Low',
    color: 'var(--priority-low)',
    bg: 'var(--priority-low-bg)',
    icon: 'SignalLow'
  },
  none: {
    id: 'none',
    value: 0,
    label: 'No priority',
    color: 'var(--text-subtle)',
    icon: 'Minus'
  }
};

export const CORE_WORK_ITEM_TYPES = ['task', 'issue', 'bug'];

export const STATUS_CATEGORIES = {
  backlog: { id: 'backlog', label: 'Backlog' },
  unstarted: { id: 'unstarted', label: 'Unstarted' },
  started: { id: 'started', label: 'Started' },
  completed: { id: 'completed', label: 'Completed' },
  canceled: { id: 'canceled', label: 'Canceled' }
};

export const getStatusCategory = (statusId) => {
  return STATUS_DEFINITIONS[statusId]?.category || 'backlog';
};

export const isValidWorkItemType = (type) => {
  return CORE_WORK_ITEM_TYPES.includes(type);
};

export const ITEM_TYPE_DEFINITIONS = {
  task: { id: 'task', label: 'Task', color: '#3b82f6', icon: 'CheckSquare' },
  issue: { id: 'issue', label: 'Issue', color: '#8b5cf6', icon: 'AlertCircle' },
  bug: { id: 'bug', label: 'Bug', color: '#ef4444', icon: 'Bug' }
};

/**
 * Isolated normalizer for legacy external payloads.
 * Strictly translates non-canonical types (e.g. 'feature', 'chore') to canonical CORE types.
 */
export const normalizeWorkItemType = (type) => {
  if (type === 'feature') return 'issue';
  if (type === 'chore') return 'task';
  if (CORE_WORK_ITEM_TYPES.includes(type)) return type;
  return 'task';
};


export const SHORTCUTS = {
  search: { key: 'k', meta: true, label: '⌘K', description: 'Command Palette' },
  create: { key: 'c', label: 'C', description: 'Create work item' },
  inbox: { chord: 'g i', label: 'G then I', description: 'Go to Inbox' },
  myIssues: { chord: 'g m', label: 'G then M', description: 'Go to My Issues' },
  toggleSidebar: { key: '[', meta: true, label: '⌘[', description: 'Toggle Sidebar' },
  toggleInspector: { key: 'i', label: 'I', description: 'Toggle Inspector' },
  status: { key: 's', label: 'S', description: 'Change status' },
  priority: { key: 'p', label: 'P', description: 'Change priority' },
  assign: { key: 'a', label: 'A', description: 'Assign item' },
  selectRow: { key: 'x', label: 'X', description: 'Select row' },
  navDown: { key: 'j', label: 'J / ↓', description: 'Move down' },
  navUp: { key: 'k', label: 'K / ↑', description: 'Move up' },
  openItem: { key: 'Enter', label: '↵', description: 'Open item inspector' }
};
