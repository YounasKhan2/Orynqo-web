import { useMemo } from 'react';
import { USERS } from '../../../data/mockData';

/**
 * useTeamMembersQuery Hook (TEM-007)
 *
 * Provides squad roster, lead, and capacity rollups.
 *
 * @param {string} teamId
 * @param {Array<Object>} workItems
 * @param {string|null} activeCycleId
 * @returns {{ members: Array<Object>, lead: Object|null, totalMembers: number }}
 */
export function useTeamMembersQuery(teamId, workItems = [], activeCycleId = null) {
  return useMemo(() => {
    const rawMembers = (USERS || []).filter((u) => u.teamId === teamId);

    const members = rawMembers.map((member) => {
      // Active assigned items
      const assignedItems = (workItems || []).filter(
        (it) => it.assigneeId === member.id && it.status !== 'done' && it.status !== 'canceled'
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

    const lead = members.find((m) => m.role?.toLowerCase?.().includes('manager') || m.role?.toLowerCase?.().includes('lead')) || members[0] || null;

    return {
      members,
      lead,
      totalMembers: members.length
    };
  }, [teamId, workItems, activeCycleId]);
}
