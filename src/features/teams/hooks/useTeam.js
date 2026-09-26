import { useMemo } from 'react';
import { TEAMS } from '../../../data/mockData';
import { resolveTeamCapabilities, getTeamPermissions } from '../model/teamCapabilities';

/**
 * useTeam Hook (TEM-001)
 *
 * Provides team metadata, resolved capabilities, and user permission bundle.
 * Supports teamOverride (for test/demo harnesses) and supplied users collection.
 *
 * @param {string} teamId
 * @param {Object|null} [currentUser=null]
 * @param {Object|null} [teamOverride=null]
 * @param {Array<Object>} [users=[]]
 * @returns {{ team: Object|null, capabilities: Object, permissions: Object, members: Array<Object>, lead: Object|null }}
 */
export function useTeam(teamId, currentUser = null, teamOverride = null, users = []) {
  const team = useMemo(() => {
    if (teamOverride) return teamOverride;
    return (TEAMS || []).find((t) => t.id === teamId) || null;
  }, [teamId, teamOverride]);

  const capabilities = useMemo(() => {
    return resolveTeamCapabilities(team);
  }, [team]);

  const permissions = useMemo(() => {
    return getTeamPermissions(currentUser, team);
  }, [currentUser, team]);

  const members = useMemo(() => {
    if (!team) return [];
    return (users || []).filter((u) => {
      if (u.teamId === team.id) return true;
      if (Array.isArray(u.teamIds) && u.teamIds.includes(team.id)) return true;
      if (Array.isArray(team.members) && team.members.includes(u.id)) return true;
      return false;
    });
  }, [team, users]);

  const lead = useMemo(() => {
    if (!team) return null;
    return (users || []).find((u) => u.id === team.leadId) || members[0] || null;
  }, [team, users, members]);

  return {
    team,
    capabilities,
    permissions,
    members,
    lead
  };
}
