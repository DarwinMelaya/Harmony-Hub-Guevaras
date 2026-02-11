// Role constants
const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  CLIENT: "client",
  STAFF: "staff",
  ARTIST: "artist",
};

// Role hierarchy (higher roles have more permissions)
const ROLE_HIERARCHY = {
  [ROLES.OWNER]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.STAFF]: 5, // Staff now has same level as owner
  [ROLES.ARTIST]: 2,
  [ROLES.CLIENT]: 1,
};

// Permissions for each role
const PERMISSIONS = {
  [ROLES.OWNER]: [
    "manage_users",
    "manage_roles",
    "view_all_users",
    "deactivate_users",
    "view_statistics",
    "manage_content",
    "manage_system",
  ],
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
    "manage_users",
    "manage_roles",
    "view_all_users",
    "deactivate_users",
    "view_statistics",
    "manage_content",
    "manage_system",
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
  // Only owners, admins, and staff can manage other admins
  if (targetRole === ROLES.ADMIN) {
    return [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF].includes(userRole);
  }

  // Only owners and staff can manage other owners
  if (targetRole === ROLES.OWNER) {
    return [ROLES.OWNER, ROLES.STAFF].includes(userRole);
  }

  // Staff can manage all roles (same as owner)
  if (userRole === ROLES.STAFF) {
    return true;
  }

  // Owners and admins can manage all roles
  return [ROLES.OWNER, ROLES.ADMIN].includes(userRole);
};

const getValidRoles = () => {
  return Object.values(ROLES);
};

const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.OWNER]: "Owner",
    [ROLES.ADMIN]: "Administrator",
    [ROLES.STAFF]: "Staff Member",
    [ROLES.ARTIST]: "Artist",
    [ROLES.CLIENT]: "Client",
  };
  return displayNames[role] || role;
};

// Middleware to require specific roles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
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
  requireRole,
};
