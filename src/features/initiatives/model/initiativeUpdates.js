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
    healthSnapshot: health,
    horizonSnapshot: horizonSnapshot ? { ...horizonSnapshot } : null,
    highlights: Array.isArray(highlights) ? highlights : [],
    blockers: Array.isArray(blockers) ? blockers : [],
    version,
    publishedAt,
    correctedAt,
    supersededById: input.supersededById || null,
    supersedesId: input.supersedesId || null,
    previousVersions: Array.isArray(input.previousVersions) ? input.previousVersions : []
  };
}

/**
 * Creates a versioned correction of an existing published update.
 * Invariant: Preserves historical V1/prior versions in previousVersions array without silent overwrite.
 *
 * @param {Object} originalUpdate - The published update to correct
 * @param {Object} corrections - Corrections payload (narrative, health, highlights, blockers, etc.)
 * @param {string} actorId - Correcting user
 * @returns {Object} Corrected update entity with previous versions preserved
 */
export function correctInitiativeUpdate(originalUpdate, corrections = {}, actorId = 'usr-current') {
  if (!originalUpdate) throw new Error('Original update is required for correction');

  const priorSnapshot = {
    narrative: originalUpdate.narrative,
    health: originalUpdate.health,
    horizonSnapshot: originalUpdate.horizonSnapshot,
    highlights: originalUpdate.highlights,
    blockers: originalUpdate.blockers,
    version: originalUpdate.version || 1,
    archivedAt: new Date().toISOString()
  };

  const newVersion = (originalUpdate.version || 1) + 1;
  const newHealth = corrections.health !== undefined ? corrections.health : originalUpdate.health;

  return {
    ...originalUpdate,
    narrative: corrections.narrative !== undefined ? corrections.narrative.trim() : originalUpdate.narrative,
    health: newHealth,
    highlights: corrections.highlights !== undefined ? corrections.highlights : originalUpdate.highlights,
    blockers: corrections.blockers !== undefined ? corrections.blockers : originalUpdate.blockers,
    version: newVersion,
    correctedAt: new Date().toISOString(),
    correctedBy: actorId,
    previousVersions: [...(originalUpdate.previousVersions || []), priorSnapshot]
  };
}

/**
 * Creates a new update that explicitly supersedes a prior update, preserving both in history.
 *
 * @param {Object} priorUpdate - Prior update being superseded
 * @param {Object} newUpdatePayload - Payload for the superseding update
 * @returns {{ prior: Object, superseding: Object }}
 */
export function createSupersedingUpdate(priorUpdate, newUpdatePayload) {
  const superseding = createInitiativeUpdateModel({
    ...newUpdatePayload,
    initiativeId: priorUpdate.initiativeId,
    supersedesId: priorUpdate.id
  });

  const updatedPrior = {
    ...priorUpdate,
    supersededById: superseding.id
  };

  return {
    prior: updatedPrior,
    superseding
  };
}
