// Role constants
const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  STAFF: "staff",
  ARTIST: "artist",
};

// Role hierarchy (higher roles have more permissions)
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.STAFF]: 3,
  [ROLES.ARTIST]: 2,
  [ROLES.CLIENT]: 1,
};

// Permissions for each role
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "manage_users",
    "manage_roles",
    "view_all_users",
    "deactivate_users",
    "view_statistics",
    "manage_content",
    "manage_system",
  ],
  [ROLES.STAFF]: [
    "view_users",
    "manage_content",
    "view_statistics",
    "manage_artists",
  ],
  [ROLES.ARTIST]: [
    "manage_own_content",
    "view_own_profile",
    "update_own_profile",
  ],
  [ROLES.CLIENT]: [
    "view_own_profile",
    "update_own_profile",
    "view_public_content",
  ],
};

// Helper functions
const hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.includes(permission) || false;
};

const hasRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

const canManageRole = (userRole, targetRole) => {
  // Only admins can manage other admins
  if (targetRole === ROLES.ADMIN) {
    return userRole === ROLES.ADMIN;
  }

  // Staff can manage artists and clients
  if (userRole === ROLES.STAFF) {
    return [ROLES.ARTIST, ROLES.CLIENT].includes(targetRole);
  }

  // Admins can manage all roles
  return userRole === ROLES.ADMIN;
};

const getValidRoles = () => {
  return Object.values(ROLES);
};

const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.ADMIN]: "Administrator",
    [ROLES.STAFF]: "Staff Member",
    [ROLES.ARTIST]: "Artist",
    [ROLES.CLIENT]: "Client",
  };
  return displayNames[role] || role;
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  hasPermission,
  hasRole,
  canManageRole,
  getValidRoles,
  getRoleDisplayName,
};
