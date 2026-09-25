import { resolveTeamStatusIncompatibility, EXTENDED_STATUS_DEFINITIONS } from './teamWorkflows';
import { CYCLES, TEAMS, PROJECTS } from '../../../data/mockData';

/**
 * Resolves the valid execution teams for a Project.
 * Canonical representation is project.teamIds (array of team IDs).
 * Legacy fallback normalizes singular project.teamId to an array.
 */
export function getProjectTeamIds(project) {
  if (!project) return [];
  if (Array.isArray(project.teamIds) && project.teamIds.length > 0) {
    return project.teamIds;
  }
  if (project.teamId) {
    return [project.teamId];
  }
  return [];
}

/**
 * Evaluates cascading consequences when an existing WorkItem changes its execution team.
 *
 * Rules:
 * 1. Status: If current status is not available in target team, flag consequence and propose replacement.
 * 2. Cycle: Cycles are strictly Team-owned. If current cycle does not belong to target team, must be cleared to null (Backlog).
 * 3. Project: If item is assigned to a project that does not include target team, flag context warning.
 *
 * @returns {object} { hasConsequences, consequences: Array<{ property, current, proposed, reason }>, proposedPatch }
 */
export function checkTeamChangeConsequences(item, targetTeamId) {
  if (!item || !targetTeamId || item.teamId === targetTeamId) {
    return { hasConsequences: false, consequences: [], proposedPatch: { teamId: targetTeamId } };
  }

  const consequences = [];
  const proposedPatch = { teamId: targetTeamId };

  const currentTeam = TEAMS.find((t) => t.id === item.teamId);
  const targetTeam = TEAMS.find((t) => t.id === targetTeamId);

  // 1. Evaluate Status Compatibility
  const statusCheck = resolveTeamStatusIncompatibility(item.status, targetTeamId);
  let statusChange = null;
  if (!statusCheck.isCompatible) {
    statusChange = {
      property: 'Status',
      current: item.status,
      currentLabel: EXTENDED_STATUS_DEFINITIONS[item.status]?.label || item.status,
      proposed: statusCheck.resolvedStatus,
      proposedLabel: EXTENDED_STATUS_DEFINITIONS[statusCheck.resolvedStatus]?.label || statusCheck.resolvedStatus,
      reason: statusCheck.reason
    };
    consequences.push(statusChange);
    proposedPatch.status = statusCheck.resolvedStatus;
  }

  // 2. Evaluate Cycle Validity (Cycles are strictly team-owned)
  let cycleChange = null;
  if (item.cycleId) {
    const cycle = CYCLES.find((c) => c.id === item.cycleId);
    if (!cycle || cycle.teamId !== targetTeamId) {
      cycleChange = {
        property: 'Cycle',
        current: item.cycleId,
        currentLabel: cycle ? cycle.name : item.cycleId,
        proposed: null,
        proposedLabel: 'Backlog / None',
        reason: cycle
          ? `Cycle '${cycle.name}' belongs strictly to ${currentTeam?.name || 'previous team'}.`
          : `Cycle '${item.cycleId}' does not belong to target team.`
      };
      consequences.push(cycleChange);
      proposedPatch.cycleId = null;
    }
  }

  // 3. Evaluate Project Context with Multi-Team Support
  let projectChange = null;
  if (item.projectId) {
    const project = PROJECTS.find((p) => p.id === item.projectId);
    if (project) {
      const validProjectTeamIds = getProjectTeamIds(project);
      if (validProjectTeamIds.length > 0 && !validProjectTeamIds.includes(targetTeamId)) {
        projectChange = {
          property: 'Project',
          current: project.id,
          currentLabel: project.name,
          proposed: project.id,
          proposedLabel: project.name,
          reason: `Project '${project.name}' is only affiliated with ${validProjectTeamIds.map((tId) => TEAMS.find((t) => t.id === tId)?.name || tId).join(', ')}.`
        };
        consequences.push(projectChange);
      }
    }
  }

  return {
    hasConsequences: consequences.length > 0,
    consequences,
    statusChange,
    cycleChange,
    projectChange,
    proposedPatch,
    targetTeamName: targetTeam?.name || targetTeamId
  };
}
