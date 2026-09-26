/**
 * Project Updates Model & History Semantics (UI-07A / UI-07B)
 *
 * Implements:
 * - Immutable historical narrative snapshots
 * - Side-effect boundary: Publishing an update updates Project health, but does NOT mutate target date.
 * - Snapshots target date at publication time without overwriting authoritative schedule.
 */

import { PROJECT_HEALTH } from './projectModel';

/**
 * Creates an immutable Project Update snapshot.
 *
 * @param {Object} input
 * @returns {Object} Canonical project update
 */
export function createProjectUpdateModel(input = {}) {
  const {
    id,
    projectId,
    authorId = 'usr-1',
    narrative = '',
    health = PROJECT_HEALTH.ON_TRACK,
    targetDateSnapshot = null,
    highlights = [],
    blockers = [],
    createdAt = new Date().toISOString()
  } = input;

  if (!projectId) {
    throw new Error('Project Update must belong to an owning project.');
  }

  if (!narrative || typeof narrative !== 'string' || narrative.trim().length === 0) {
    throw new Error('Project Update narrative is required.');
  }

  return {
    id: id || `upd-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId,
    authorId,
    narrative: narrative.trim(),
    health,
    targetDateSnapshot: targetDateSnapshot || null,
    highlights: Array.isArray(highlights) ? highlights : [],
    blockers: Array.isArray(blockers) ? blockers : [],
    createdAt
  };
}
