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
            <div className="text-sm sm:text-base text-gray-300 mb-4">{error}</div>
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
      <div className="bg-[#30343c] h-screen w-full text-white flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  User Management
                </h1>
                <p className="text-sm sm:text-base text-gray-300 mt-1">
                  Manage all users in the system ({users.length} total users)
                </p>
              </div>
              <button className="px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center justify-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap">
                <Users className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 min-w-0">
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

              {/* Role Filter */}
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm sm:text-base flex-1 sm:flex-initial"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="artist">Artist</option>
                  <option value="client">Client</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm sm:text-base flex-1 sm:flex-initial"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="overflow-auto flex-1">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-700 border-b border-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Contact
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Joined
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-400"
                      >
                        <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-600" />
                        <div className="text-base sm:text-lg font-medium">
                          No users found
                        </div>
                        <div className="text-xs sm:text-sm">
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
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              {user.profilePhoto ? (
                                <img
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                  src={user.profilePhoto}
                                  alt={user.fullName}
                                />
                              ) : (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-medium text-gray-300">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-medium text-white truncate">
                                {user.fullName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400 truncate">
                                @{user.username}
                              </div>
                              {/* Show email on mobile when contact column is hidden */}
                              <div className="text-xs text-gray-400 truncate sm:hidden mt-1">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs sm:text-sm text-white">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center text-xs sm:text-sm text-gray-400">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{user.phoneNumber}</span>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center text-xs sm:text-sm text-gray-400">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{user.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{user.role}</span>
                            <span className="sm:hidden">{user.role.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? "bg-green-900/50 text-green-300 border border-green-700"
                                : "bg-red-900/50 text-red-300 border border-red-700"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Active</span>
                                <span className="sm:hidden">A</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Inactive</span>
                                <span className="sm:hidden">I</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell text-xs sm:text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button className="text-blue-400 hover:text-blue-300 p-1 transition-colors" aria-label="View">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button className="text-green-400 hover:text-green-300 p-1 transition-colors" aria-label="Edit">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button className="text-red-400 hover:text-red-300 p-1 transition-colors" aria-label="Delete">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

          {/* Results Summary */}
          {filteredUsers.length > 0 && (
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400 text-center flex-shrink-0">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OwnerUser;
