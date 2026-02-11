import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  X,
} from "lucide-react";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/users/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Change user role
  const changeUserRole = async (userId, role) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user role");
      }

      const data = await response.json();

      // Update the user in the local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: data.data.role } : user
        )
      );

      // Close modal and reset state
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");

      // Show success message
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error updating user role:", err);
    }
  };

  // Open role change modal
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  // Check if current user can change user roles (only admins)
  const canChangeUserRoles = () => {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === "admin";
  };

  // Handle role change
  const handleRoleChange = () => {
    if (selectedUser && newRole && newRole !== selectedUser.role) {
      changeUserRole(selectedUser._id, newRole);
    }
  };

  // Open view modal
  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      // Remove user from local state
      setUsers(users.filter((user) => user._id !== userToDelete._id));

      // Close modal and reset state
      setShowDeleteModal(false);
      setUserToDelete(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error deleting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
      case "admin":
        return "bg-red-900/50 text-red-300 border-red-700";
      case "staff":
        return "bg-blue-900/50 text-blue-300 border-blue-700";
      case "artist":
        return "bg-purple-900/50 text-purple-300 border-purple-700";
      case "client":
        return "bg-green-900/50 text-green-300 border-green-700";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-[#30343c] min-h-screen w-full text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-[#30343c] min-h-screen w-full text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-2">Error</div>
            <div className="text-gray-300">{error}</div>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-4 sm:p-6 lg:p-4 xl:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  User Management
                </h1>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">
                  Manage all users in the system ({users.length} total users)
                </p>
              </div>
              <button 
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center justify-center gap-2 transition-colors cursor-pointer relative z-10"
                onClick={() => {
                  // Add user functionality here
                  console.log("Add user clicked");
                }}
              >
                <Users className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm sm:text-base"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="artist">Artist</option>
                  <option value="client">Client</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-2 lg:px-3 xl:px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                      Joined
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <div className="text-lg font-medium">
                          No users found
                        </div>
                        <div className="text-sm">
                          Try adjusting your search or filters
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-2 lg:px-3 xl:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 lg:h-9 lg:w-9">
                              {user.profilePhoto ? (
                                <img
                                  className="h-8 w-8 lg:h-9 lg:w-9 rounded-full object-cover"
                                  src={user.profilePhoto}
                                  alt={user.fullName}
                                />
                              ) : (
                                <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gray-600 flex items-center justify-center">
                                  <span className="text-xs lg:text-sm font-medium text-gray-300">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-2 lg:ml-3 min-w-0">
                              <div className="text-xs lg:text-sm font-medium text-white truncate max-w-[120px] lg:max-w-[150px] xl:max-w-none">
                                {user.fullName}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-[120px] lg:max-w-[150px] xl:max-w-none">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 lg:px-3 xl:px-4 py-3">
                          <div className="min-w-0">
                            <div className="flex items-center text-xs lg:text-sm text-white">
                              <Mail className="w-3 h-3 lg:w-3.5 lg:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[150px] lg:max-w-[200px] xl:max-w-none">{user.email}</span>
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                <Phone className="w-3 h-3 mr-1.5 text-gray-500 shrink-0" />
                                <span className="truncate max-w-[120px] lg:max-w-[150px]">{user.phoneNumber}</span>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center text-xs text-gray-400 mt-0.5 hidden xl:flex">
                                <MapPin className="w-3 h-3 mr-1.5 text-gray-500 shrink-0" />
                                <span className="truncate max-w-[150px]">{user.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 lg:px-3 xl:px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            <span className="hidden lg:inline">{user.role}</span>
                            <span className="lg:hidden">{user.role.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-2 lg:px-3 xl:px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? "bg-green-900/50 text-green-300 border border-green-700"
                                : "bg-red-900/50 text-red-300 border border-red-700"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                <span className="hidden lg:inline">Active</span>
                                <span className="lg:hidden">A</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                <span className="hidden lg:inline">Inactive</span>
                                <span className="lg:hidden">I</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-2 lg:px-3 xl:px-4 py-3 whitespace-nowrap text-xs lg:text-sm text-gray-400 hidden xl:table-cell">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 mr-1.5 text-gray-500 shrink-0" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-2 lg:px-3 xl:px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1 lg:space-x-1.5">
                            {canChangeUserRoles() && (
                              <button
                                onClick={() => openRoleModal(user)}
                                className="text-purple-400 hover:text-purple-300 p-1 transition-colors"
                                title="Change Role"
                              >
                                <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openViewModal(user)}
                              className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              className="text-green-400 hover:text-green-300 p-1 transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="text-red-400 hover:text-red-300 p-1 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <div className="text-lg font-medium text-gray-400 mb-2">
                  No users found
                </div>
                <div className="text-sm text-gray-500">
                  Try adjusting your search or filters
                </div>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {user.profilePhoto ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={user.profilePhoto}
                            alt={user.fullName}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-base font-medium text-gray-300">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-white truncate">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {canChangeUserRoles() && (
                        <button
                          onClick={() => openRoleModal(user)}
                          className="text-purple-400 hover:text-purple-300 p-1.5 transition-colors"
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openViewModal(user)}
                        className="text-blue-400 hover:text-blue-300 p-1.5 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-400 hover:text-green-300 p-1.5 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-400 hover:text-red-300 p-1.5 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-white">
                        <Mail className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Phone className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                          {user.phoneNumber}
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-center text-sm text-gray-400 pt-2 border-t border-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 text-sm text-gray-400 text-center">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Change User Role
                </h3>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setNewRole("");
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                  Change role for{" "}
                  <span className="font-medium text-white">
                    {selectedUser.fullName}
                  </span>
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Current role:{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="client">Client</option>
                  <option value="artist">Artist</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                {!canChangeUserRoles() && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only admins can change user roles
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setNewRole("");
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={newRole === selectedUser.role}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View User Details Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  User Details
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Photo and Basic Info */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
                  <div className="flex-shrink-0">
                    {selectedUser.profilePhoto ? (
                      <img
                        src={selectedUser.profilePhoto}
                        alt={selectedUser.fullName}
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-600"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-600">
                        <span className="text-2xl font-medium text-gray-300">
                          {selectedUser.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">
                      {selectedUser.fullName}
                    </h4>
                    <p className="text-gray-400 mb-2">@{selectedUser.username}</p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          selectedUser.role
                        )}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {selectedUser.role}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.isActive
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {selectedUser.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Contact Information
                  </h5>
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center text-white">
                      <Mail className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                      <span className="break-all">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phoneNumber && (
                      <div className="flex items-center text-white">
                        <Phone className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                        <span>{selectedUser.phoneNumber}</span>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="flex items-center text-white">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                        <span>{selectedUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Account Information
                  </h5>
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Account Status</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.isActive
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Email Verified</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.isVerified
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                        }`}
                      >
                        {selectedUser.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Joined Date</span>
                      <span className="text-white">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    {selectedUser.updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Last Updated</span>
                        <span className="text-white">
                          {formatDate(selectedUser.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Artist-specific fields */}
                {selectedUser.role === "artist" && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Artist Information
                    </h5>
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                      {selectedUser.genre && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Genre</span>
                          <span className="text-white">{selectedUser.genre}</span>
                        </div>
                      )}
                      {selectedUser.booking_fee !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Booking Fee</span>
                          <span className="text-green-400 font-semibold">
                            ₱{Number(selectedUser.booking_fee).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Availability</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedUser.isAvailable
                              ? "bg-green-900/50 text-green-300 border border-green-700"
                              : "bg-red-900/50 text-red-300 border border-red-700"
                          }`}
                        >
                          {selectedUser.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Delete User
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close modal"
                  disabled={isDeleting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-white">
                    {userToDelete.fullName}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-300">
                    <strong>Warning:</strong> This will permanently delete the user account and all associated data.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700 flex items-center gap-2 z-50 shadow-lg">
            <Shield className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-sm sm:text-base">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-100 transition-colors shrink-0"
              aria-label="Close error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default User;
