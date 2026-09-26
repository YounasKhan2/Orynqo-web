import { useMemo } from 'react';
import { PROJECTS } from '../../../data/mockData';

/**
 * useTeamProjectsQuery Hook (TEM-004)
 *
 * Queries canonical workspace projects where the current team participates:
 * - Lead Team: Primary delivery accountability (teamId === currentTeam.id)
 * - Participating Team: Contributing to multi-team project (teamIds.includes(currentTeam.id))
 *
 * @param {string} teamId
 * @param {Array<Object>} workItems
 * @returns {{ ledProjects: Array<Object>, participatingProjects: Array<Object>, allProjects: Array<Object> }}
 */
export function useTeamProjectsQuery(teamId, workItems = []) {
  return useMemo(() => {
    const ledProjects = [];
    const participatingProjects = [];

    (PROJECTS || []).forEach((proj) => {
      const isLead = proj.teamId === teamId;
      const isPart = (proj.teamIds || []).includes(teamId) && !isLead;

      if (isLead || isPart) {
        // Count work items owned by this team within this project
        const teamItemCount = (workItems || []).filter(
          (it) => it.projectId === proj.id && it.teamId === teamId
        ).length;

        const enriched = {
          ...proj,
          isLead,
          teamItemCount
        };

        if (isLead) {
          ledProjects.push(enriched);
        } else {
          participatingProjects.push(enriched);
        }
      }
    });

    return {
      ledProjects,
      participatingProjects,
      allProjects: [...ledProjects, ...participatingProjects],
      totalCount: ledProjects.length + participatingProjects.length
    };
  }, [teamId, workItems]);
}
