import { resolveTeamStatusIncompatibility, EXTENDED_STATUS_DEFINITIONS } from './teamWorkflows';
import { CYCLES, TEAMS, PROJECTS } from '../../../data/mockData';

/**
 * Evaluates cascading consequences when an existing WorkItem changes its execution team.
 *
 * Rules:
 * 1. Status: If current status is not available in target team, flag consequence and propose replacement.
 * 2. Cycle: Cycles are strictly Team-owned. If current cycle does not belong to target team, must be cleared to null (Backlog).
 * 3. Project: If item is assigned to a project that belongs exclusively to another team, flag context warning.
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

  // 3. Evaluate Project Context
  let projectChange = null;
  if (item.projectId) {
    const project = PROJECTS.find((p) => p.id === item.projectId);
    if (project && project.teamId && project.teamId !== targetTeamId) {
      projectChange = {
        property: 'Project',
        current: project.id,
        currentLabel: project.name,
        proposed: project.id,
        proposedLabel: project.name,
        reason: `Project is primarily affiliated with ${currentTeam?.name || 'previous team'}.`
      };
      consequences.push(projectChange);
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
