import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";

const OwnerUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
        <div className="bg-[#30343c] h-screen w-full text-white flex items-center justify-center overflow-hidden">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-[#30343c] h-screen w-full text-white flex items-center justify-center overflow-hidden px-4">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-lg sm:text-xl mb-2">Error</div>
            <div className="text-sm sm:text-base text-gray-300 mb-4">
              {error}
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base transition-colors"
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
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
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
                              <span className="truncate max-w-[150px] lg:max-w-[200px] xl:max-w-none">
                                {user.email}
                              </span>
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                <Phone className="w-3 h-3 mr-1.5 text-gray-500 shrink-0" />
                                <span className="truncate max-w-[120px] lg:max-w-[150px]">
                                  {user.phoneNumber}
                                </span>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center text-xs text-gray-400 mt-0.5 hidden xl:flex">
                                <MapPin className="w-3 h-3 mr-1.5 text-gray-500 shrink-0" />
                                <span className="truncate max-w-[150px]">
                                  {user.location}
                                </span>
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
                            <span className="hidden lg:inline">
                              {user.role}
                            </span>
                            <span className="lg:hidden">
                              {user.role.charAt(0).toUpperCase()}
                            </span>
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
                                <span className="hidden lg:inline">
                                  Inactive
                                </span>
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
      </div>
    </Layout>
  );
};

export default OwnerUser;
