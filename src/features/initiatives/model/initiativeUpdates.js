/**
 * Canonical Initiative Updates Model & Versioned Snapshots (UI-08A / UI-08B)
 *
 * Implements historical, versioned Initiative narrative updates.
 * - Snapshots health, temporal horizon, highlights, and blockers.
 * - Synchronizes canonical Initiative health on publish.
 * - Never silently overwrites or mutates Initiative horizon.
 * - Preserves prior published history through versioned correction or superseding update.
 */

import { INITIATIVE_HEALTH } from './initiativeModel';

/**
 * Creates an immutable canonical Initiative Update entity.
 *
 * @param {Object} input - Update creation parameters
 * @returns {Object} Canonical Initiative Update representation
 */
export function createInitiativeUpdateModel(input = {}) {
  const {
    id,
    initiativeId,
    authorId,
    narrative = '',
    health = INITIATIVE_HEALTH.ON_TRACK,
    horizonSnapshot = null,
    highlights = [],
    blockers = [],
    version = 1,
    publishedAt = new Date().toISOString(),
    correctedAt = null
  } = input;

  if (!initiativeId) {
    throw new Error('Initiative Update requires an authoritative initiativeId.');
  }

  if (!narrative || !narrative.trim()) {
    throw new Error('Initiative Update requires non-empty narrative context.');
  }

  // Explicit health declaration check
  const validHealth = Object.values(INITIATIVE_HEALTH);
  if (!validHealth.includes(health)) {
    throw new Error(`Invalid Initiative Update health assessment: ${health}`);
  }

  return {
    id: id || `init-upd-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    initiativeId,
    authorId: authorId || 'usr-current',
    narrative: narrative.trim(),
    health,
    horizonSnapshot: horizonSnapshot ? { ...horizonSnapshot } : null,
    highlights: Array.isArray(highlights) ? highlights : [],
    blockers: Array.isArray(blockers) ? blockers : [],
    version,
    publishedAt,
    correctedAt
  };
}
