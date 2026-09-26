import { useMemo } from 'react';

/**
 * useTeamProjectsQuery Hook (TEM-004)
 *
 * Queries canonical workspace projects where the current team participates:
 * - Lead Team: Primary delivery accountability (teamId === currentTeam.id)
 * - Participating Team: Contributing to multi-team project (teamIds.includes(currentTeam.id))
 *
 * @param {Object|string} options - Configuration object { teamId, projects, workItems } or teamId
 * @param {Array<Object>} [legacyWorkItems] - Canonical workItems if first arg is teamId
 * @param {Array<Object>} [legacyProjects] - Canonical projects if first arg is teamId
 * @returns {{ ledProjects: Array<Object>, participatingProjects: Array<Object>, allProjects: Array<Object>, totalCount: number }}
 */
export function useTeamProjectsQuery(options, legacyWorkItems = [], legacyProjects = []) {
  const { teamId, workItems, projects } = useMemo(() => {
    if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
      return {
        teamId: options.teamId,
        workItems: options.workItems || [],
        projects: options.projects || []
      };
    }
    return {
      teamId: options,
      workItems: legacyWorkItems || [],
      projects: legacyProjects || []
    };
  }, [options, legacyWorkItems, legacyProjects]);

  return useMemo(() => {
    const ledProjects = [];
    const participatingProjects = [];

    (projects || []).forEach((proj) => {
      const isLead = proj.teamId === teamId || proj.leadTeamId === teamId;
      const isPart =
        ((proj.teamIds || []).includes(teamId) || (proj.teams || []).includes(teamId)) &&
        !isLead;

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
  }, [teamId, workItems, projects]);
}
