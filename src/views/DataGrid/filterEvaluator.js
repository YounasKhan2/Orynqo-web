/**
 * Filter Evaluator & Algebra for Universal Data Grid
 * Governed by: UI-01B Section 14 (Filter Expression & Forward-Compatible Algebra)
 */

/**
 * Evaluates a single atomic condition against a WorkItem
 */
export function evaluateCondition(item, condition) {
  if (!condition || !condition.field) return true;

  const { field, operator, value } = condition;
  const itemValue = item[field];

  switch (operator) {
    case 'eq':
      return itemValue === value;

    case 'neq':
      return itemValue !== value;

    case 'in':
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      return false;

    case 'nin':
      if (Array.isArray(value)) {
        return !value.includes(itemValue);
      }
      return true;

    case 'contains':
      if (typeof itemValue === 'string' && typeof value === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      return false;

    case 'gt':
      return Number(itemValue) > Number(value);

    case 'lt':
      return Number(itemValue) < Number(value);

    default:
      return true;
  }
}

/**
 * Recursively evaluates a FilterGroup (AND / OR tree) against a WorkItem
 */
export function evaluateFilterGroup(item, filterGroup) {
  if (!filterGroup || !filterGroup.conditions || filterGroup.conditions.length === 0) {
    return true;
  }

  const { operator = 'AND', conditions } = filterGroup;

  if (operator === 'AND') {
    return conditions.every((cond) => {
      if (cond.conditions) {
        return evaluateFilterGroup(item, cond);
      }
      return evaluateCondition(item, cond);
    });
  } else if (operator === 'OR') {
    return conditions.some((cond) => {
      if (cond.conditions) {
        return evaluateFilterGroup(item, cond);
      }
      return evaluateCondition(item, cond);
    });
  }

  return true;
}

/**
 * Builds a forward-compatible FilterGroup from flat query parameters
 */
export function buildFilterGroupFromParams({
  searchQuery = '',
  status = 'all',
  priority = 'all',
  assignee = 'all',
  project = 'all'
} = {}) {
  const conditions = [];

  if (searchQuery.trim()) {
    const q = searchQuery.trim();
    // Search OR branch across identifier, title, description
    conditions.push({
      operator: 'OR',
      conditions: [
        { field: 'identifier', operator: 'contains', value: q },
        { field: 'title', operator: 'contains', value: q },
        { field: 'description', operator: 'contains', value: q }
      ]
    });
  }

  if (status && status !== 'all') {
    conditions.push({ field: 'status', operator: 'eq', value: status });
  }

  if (priority && priority !== 'all') {
    conditions.push({ field: 'priority', operator: 'eq', value: priority });
  }

  if (assignee && assignee !== 'all') {
    conditions.push({ field: 'assigneeId', operator: 'eq', value: assignee });
  }

  if (project && project !== 'all') {
    conditions.push({ field: 'projectId', operator: 'eq', value: project });
  }

  return {
    operator: 'AND',
    conditions
  };
}
