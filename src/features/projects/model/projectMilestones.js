/**
 * Project Milestones Model & Invariants (UI-07A / UI-07B)
 *
 * Implements:
 * - Project-owned sequential delivery gates
 * - WorkItem cardinality: Zero or One milestone per WorkItem
 * - Non-destructive archive semantics: preserves historical WorkItem associations
 * - Completion semantics: does not mutate WorkItem status; requires explicit disposition
 */

import { MILESTONE_STATUS } from './projectModel';
export { MILESTONE_STATUS };

/**
 * Creates a Project-owned Milestone.
 *
 * @param {Object} input
 * @returns {Object} Canonical milestone
 */
export function createMilestoneModel(input = {}) {
  const {
    id,
    projectId,
    name = '',
    description = '',
    targetDate = null,
    status = MILESTONE_STATUS.OPEN,
    sortOrder = 0,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = input;

  if (!projectId) {
    throw new Error('Milestone must belong to an owning project.');
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Milestone name is required.');
  }

  return {
    id: id || `mls-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId,
    name: name.trim(),
    description: (description || '').trim(),
    targetDate: targetDate || null,
    status,
    sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    createdAt,
    updatedAt
  };
}

/**
 * Associates a WorkItem with a Milestone.
 * Enforces Invariants:
 * 1. Milestone must belong to the WorkItem's associated project.
 * 2. 0..1 Milestone per WorkItem.
 *
 * @param {Object} workItem
 * @param {Object|null} milestone
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMilestoneAssociation(workItem, milestone) {
  if (!workItem) {
    return { valid: false, error: 'WorkItem is required.' };
  }

  if (!milestone) {
    // Dissociating milestone is always valid
    return { valid: true };
  }

  if (!workItem.projectId) {
    return { valid: false, error: 'Cannot assign milestone to WorkItem without an associated project.' };
  }

  if (milestone.status === MILESTONE_STATUS.ARCHIVED || milestone.status === 'archived') {
    return {
      valid: false,
      error: 'Cannot assign an archived milestone to a WorkItem.'
    };
  }

  if (milestone.projectId !== workItem.projectId) {
    return {
      valid: false,
      error: `Milestone belongs to Project "${milestone.projectId}", but WorkItem is associated with Project "${workItem.projectId}". Milestone must belong to the WorkItem's owning project.`
    };
  }

  return { valid: true };
}

/**
 * Calculates milestone progress over associated canonical WorkItems.
 *
 * @param {string} milestoneId
 * @param {Array<Object>} workItems
 * @param {Function} [isAccessible]
 * @returns {{ completed: number, total: number, percent: number, label: string }}
 */
export function calculateMilestoneProgress(milestoneId, workItems = [], isAccessible = () => true) {
  if (!milestoneId || !Array.isArray(workItems)) {
    return { completed: 0, total: 0, percent: 0, label: '0 items' };
  }

  const items = workItems.filter(
    (it) => it.milestoneId === milestoneId && isAccessible(it, 'work_item') && it.status !== 'cancelled'
  );

  if (items.length === 0) {
    return { completed: 0, total: 0, percent: 0, label: '0 items' };
  }

  const completed = items.filter((it) => it.status === 'done' || it.status === 'completed').length;
  const total = items.length;
  const percent = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    label: `${completed} / ${total}`
  };
}
