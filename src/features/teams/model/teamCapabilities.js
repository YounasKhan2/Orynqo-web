/**
 * Team Capabilities & Modular Feature Flags Model (UI-05A / UI-05B)
 *
 * Implements capability resolution and invariants:
 * - cyclesEnabled: governs CYC-001, CYC-002, and Cycle picker visibility
 * - triageEnabled: governs TEM-006 (POST-CORE, recognized but deferred)
 * - estimatesEnabled: governs estimation controls and story points display
 * - workloadEnabled: governs capacity/workload projections
 *
 * Invariant: Disabling a capability does not destroy historical associations.
 */

export const DEFAULT_TEAM_CAPABILITIES = {
  cyclesEnabled: true,
  triageEnabled: false,
  estimatesEnabled: true,
  workloadEnabled: false
};

/**
 * Resolves a team's capabilities with safe defaults.
 *
 * @param {Object} team
 * @returns {Object} Normalized capabilities
 */
export function resolveTeamCapabilities(team) {
  if (!team) return DEFAULT_TEAM_CAPABILITIES;

  const caps = team.capabilities || {};
  return {
    cyclesEnabled: caps.cycles !== undefined ? Boolean(caps.cycles) : (caps.cyclesEnabled !== undefined ? Boolean(caps.cyclesEnabled) : true),
    triageEnabled: caps.triage !== undefined ? Boolean(caps.triage) : (caps.triageEnabled !== undefined ? Boolean(caps.triageEnabled) : false),
    estimatesEnabled: caps.estimates !== undefined ? Boolean(caps.estimates) : (caps.estimatesEnabled !== undefined ? Boolean(caps.estimatesEnabled) : true),
    workloadEnabled: caps.workload !== undefined ? Boolean(caps.workload) : (caps.workloadEnabled !== undefined ? Boolean(caps.workloadEnabled) : false)
  };
}

/**
 * Semantic Permission Checks (UI-05A Section 18)
 *
 * Enforces permissions without hardcoded role string lock-in:
 * - team:view
 * - team:create_work
 * - team:manage_settings
 * - team:manage_roster
 * - team:manage_cycles
 * - team:plan_work
 * - team:manage_triage
 */
export function getTeamPermissions(user, team) {
  // If no user or team, viewer defaults
  if (!user || !team) {
    return {
      canView: false,
      canCreateWork: false,
      canManageSettings: false,
      canManageRoster: false,
      canManageCycles: false,
      canPlanWork: false,
      canManageTriage: false
    };
  }

  const isOwnerOrAdmin = user.role === 'Owner' || user.role === 'Admin' || user.role?.toLowerCase?.().includes('admin');
  const isTeamLead = team.leadId === user.id || team.leadUserId === user.id;
  const isMember = user.teamId === team.id || (team.memberIds || []).includes(user.id);

  return {
    canView: true, // Visible in workspace
    canCreateWork: isOwnerOrAdmin || isTeamLead || isMember,
    canManageSettings: isOwnerOrAdmin || isTeamLead,
    canManageRoster: isOwnerOrAdmin || isTeamLead,
    canManageCycles: isOwnerOrAdmin || isTeamLead,
    canPlanWork: isOwnerOrAdmin || isTeamLead || isMember,
    canManageTriage: isOwnerOrAdmin || isTeamLead || isMember
  };
}

/**
 * Checks semantic permission given a role or role name.
 *
 * @param {string} permission
 * @param {'viewer'|'member'|'lead'|'admin'} role
 * @returns {boolean}
 */
export function checkTeamPermission(permission, role = 'member') {
  const normalizedRole = role.toLowerCase();
  const isLeadOrAdmin = normalizedRole === 'lead' || normalizedRole === 'admin' || normalizedRole === 'owner';
  const isMember = normalizedRole === 'member' || isLeadOrAdmin;

  switch (permission) {
    case 'team:view':
      return true;
    case 'team:create_work':
    case 'team:plan_work':
    case 'team:manage_triage':
      return isMember;
    case 'team:manage_cycles':
    case 'team:manage_roster':
    case 'team:manage_settings':
      return isLeadOrAdmin;
    default:
      return false;
  }
}
