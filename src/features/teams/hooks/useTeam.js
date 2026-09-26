import { useMemo } from 'react';
import { TEAMS, USERS } from '../../../data/mockData';
import { resolveTeamCapabilities, getTeamPermissions } from '../model/teamCapabilities';

/**
 * useTeam Hook (TEM-001)
 *
 * Provides team metadata, resolved capabilities, and user permission bundle.
 *
 * @param {string} teamId
 * @param {Object} currentUser
 * @returns {{ team: Object, capabilities: Object, permissions: Object, members: Array<Object>, lead: Object|null }}
 */
export function useTeam(teamId, currentUser = null) {
  const team = useMemo(() => {
    return TEAMS.find((t) => t.id === teamId) || TEAMS[0];
  }, [teamId]);

  const capabilities = useMemo(() => {
    return resolveTeamCapabilities(team);
  }, [team]);

  const permissions = useMemo(() => {
    return getTeamPermissions(currentUser, team);
  }, [currentUser, team]);

  const members = useMemo(() => {
    return USERS.filter((u) => u.teamId === team?.id);
  }, [team?.id]);

  const lead = useMemo(() => {
    return USERS.find((u) => u.id === team?.leadId) || members[0] || null;
  }, [team?.leadId, members]);

  return {
    team,
    capabilities,
    permissions,
    members,
    lead
  };
}
