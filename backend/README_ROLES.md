# Role-Based Access Control System

This document describes the role-based access control (RBAC) system implemented in the Harmony Hub backend.

## Roles

The system supports five user roles:

### 1. Owner

- **Level**: 5 (Highest)
- **Permissions**: Full system access with highest privileges
- **Can manage**: All users, roles, and system settings (including other owners)
- **Default permissions**:
  - `manage_users` - Create, update, delete users
  - `manage_roles` - Assign and change user roles
  - `view_all_users` - View all user data
  - `deactivate_users` - Activate/deactivate user accounts
  - `view_statistics` - Access system statistics
  - `manage_content` - Manage all content
  - `manage_system` - System-wide settings

### 2. Admin

- **Level**: 4
- **Permissions**: Full system access
- **Can manage**: All users, roles, and system settings (except other owners)
- **Default permissions**:
  - `manage_users` - Create, update, delete users
  - `manage_roles` - Assign and change user roles
  - `view_all_users` - View all user data
  - `deactivate_users` - Activate/deactivate user accounts
  - `view_statistics` - Access system statistics
  - `manage_content` - Manage all content
  - `manage_system` - System-wide settings

### 3. Staff

- **Level**: 3
- **Permissions**: Limited administrative access
- **Can manage**: Artists and clients
- **Default permissions**:
  - `view_users` - View user information
  - `manage_content` - Manage content
  - `view_statistics` - Access statistics
  - `manage_artists` - Manage artist accounts

### 4. Artist

- **Level**: 2
- **Permissions**: Content creation and management
- **Can manage**: Own content and profile
- **Default permissions**:
  - `manage_own_content` - Create and manage own content
  - `view_own_profile` - View own profile
  - `update_own_profile` - Update own profile

### 5. Client

- **Level**: 1 (Lowest)
- **Permissions**: Basic user access
- **Can manage**: Own profile only
- **Default permissions**:
  - `view_own_profile` - View own profile
  - `update_own_profile` - Update own profile
  - `view_public_content` - View public content

## API Endpoints

### Public Endpoints

- `POST /api/users/register` - Register new user (defaults to 'client' role)
- `POST /api/users/login` - User login

### Protected Endpoints (All authenticated users)

- `GET /api/users/profile` - Get own profile
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/account` - Delete own account

### Owner/Admin-Only Endpoints

- `GET /api/users/all` - Get all users
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/:userId/role` - Update user role
- `PUT /api/users/:userId/toggle-status` - Activate/deactivate user

### Staff/Admin Endpoints

- `GET /api/users/by-role/:role` - Get users by role

## Middleware

### Authentication Middleware

- `authenticateToken` - Verifies JWT token and adds user to request
- `optionalAuth` - Optional authentication (doesn't fail if no token)

### Authorization Middleware

- `authorizeOwner` - Owner only access
- `authorizeAdmin` - Admin only access
- `authorizeOwnerOrAdmin` - Owner or admin access
- `authorizeStaffOrAdmin` - Staff or admin access
- `authorizeArtist` - Artist only access
- `authorizeRoles(...roles)` - Custom role authorization

## User Model Methods

The User model includes helper methods for role checking:

```javascript
// Check specific role
user.hasRole("owner");
user.hasRole("admin");

// Check multiple roles
user.hasAnyRole(["owner", "admin", "staff"]);

// Role-specific checks
user.isOwner();
user.isAdmin();
user.isOwnerOrAdmin();
user.isStaffOrAdmin();
user.isArtist();
user.isClient();
```

## Setup Instructions

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Create admin user**:

   ```bash
   npm run create-admin
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Default Admin Credentials

After running the create-admin script:

- **Email**: admin@harmonyhub.com
- **Password**: admin123

**Important**: Change the admin password after first login!

## Role Management

### Creating Users with Specific Roles

Only admins can assign admin or staff roles during registration. Regular registration defaults to 'client' role.

### Role Hierarchy

- Admins can manage all roles
- Staff can manage artists and clients
- Artists and clients can only manage their own profiles

### Security Features

- Users cannot deactivate their own accounts
- Role changes are logged
- Inactive users cannot log in
- JWT tokens include user role information

## Usage Examples

### Frontend Role Checking

```javascript
// Check if user is owner
if (user.role === "owner") {
  // Show owner features
}

// Check if user is admin
if (user.role === "admin") {
  // Show admin features
}

// Check multiple roles
if (["owner", "admin"].includes(user.role)) {
  // Show owner/admin features
}

// Check staff roles
if (["admin", "staff"].includes(user.role)) {
  // Show staff features
}
```

### API Authorization

```javascript
// Protect owner routes
router.get("/owner-only", authenticateToken, authorizeOwner, ownerController);

// Protect admin routes
router.get("/admin-only", authenticateToken, authorizeAdmin, adminController);

// Protect owner/admin routes
router.get(
  "/owner-admin",
  authenticateToken,
  authorizeOwnerOrAdmin,
  ownerAdminController
);

// Protect staff routes
router.get(
  "/staff-only",
  authenticateToken,
  authorizeStaffOrAdmin,
  staffController
);
```

## Database Schema

The User model includes these role-related fields:

- `role` - User role (enum: 'owner', 'admin', 'client', 'staff', 'artist')
- `permissions` - Array of specific permissions
- `isActive` - Account status (boolean)

## Security Considerations

1. **Role Validation**: All role assignments are validated against allowed values
2. **Permission Checking**: Use middleware to check permissions before allowing access
3. **Token Security**: JWT tokens include user role for authorization
4. **Account Status**: Inactive accounts cannot authenticate
5. **Self-Protection**: Users cannot deactivate their own accounts
