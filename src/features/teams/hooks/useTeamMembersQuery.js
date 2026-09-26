import { useMemo } from 'react';
import { isWorkItemCompleted, isWorkItemCanceled } from '../model/backlogClassifier';

/**
 * useTeamMembersQuery Hook (TEM-007)
 *
 * Provides squad roster, lead, and capacity rollups.
 * Checks multi-team membership (u.teamId === teamId || u.teamIds?.includes(teamId) || team?.members?.includes(u.id)).
 *
 * @param {Object|string} options - Configuration object { teamId, users, workItems, activeCycleId, team } or teamId
 * @param {Array<Object>} [legacyWorkItems=[]] - WorkItems if first arg is teamId
 * @param {string|null} [legacyActiveCycleId=null] - Active cycle ID if first arg is teamId
 * @param {Array<Object>} [legacyUsers=[]] - Users if first arg is teamId
 * @returns {{ members: Array<Object>, lead: Object|null, totalMembers: number }}
 */
export function useTeamMembersQuery(options, legacyWorkItems = [], legacyActiveCycleId = null, legacyUsers = []) {
  const { teamId, users, workItems, activeCycleId, team } = useMemo(() => {
    if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
      return {
        teamId: options.teamId,
        users: options.users || [],
        workItems: options.workItems || [],
        activeCycleId: options.activeCycleId || null,
        team: options.team || null
      };
    }
    return {
      teamId: options,
      users: legacyUsers || [],
      workItems: legacyWorkItems || [],
      activeCycleId: legacyActiveCycleId || null,
      team: null
    };
  }, [options, legacyWorkItems, legacyActiveCycleId, legacyUsers]);

  return useMemo(() => {
    const rawMembers = (users || []).filter((u) => {
      if (u.teamId === teamId) return true;
      if (Array.isArray(u.teamIds) && u.teamIds.includes(teamId)) return true;
      if (team && Array.isArray(team.members) && team.members.includes(u.id)) return true;
      return false;
    });

    const members = rawMembers.map((member) => {
      // Active assigned items
      const assignedItems = (workItems || []).filter(
        (it) => it.assigneeId === member.id && !isWorkItemCompleted(it) && !isWorkItemCanceled(it)
      );

      // Active cycle assigned items
      const cycleItems = activeCycleId
        ? assignedItems.filter((it) => it.cycleId === activeCycleId)
        : [];

      const cyclePoints = cycleItems.reduce((acc, it) => acc + (Number(it.estimate) || 0), 0);

      return {
        ...member,
        activeWorkCount: assignedItems.length,
        cycleWorkCount: cycleItems.length,
        cyclePoints
      };
    });

    const lead = members.find((m) => m.id === team?.leadId) ||
      members.find((m) => m.role?.toLowerCase?.().includes('manager') || m.role?.toLowerCase?.().includes('lead')) ||
      members[0] ||
      null;

    return {
      members,
      lead,
      totalMembers: members.length
    };
  }, [teamId, users, workItems, activeCycleId, team]);
}
