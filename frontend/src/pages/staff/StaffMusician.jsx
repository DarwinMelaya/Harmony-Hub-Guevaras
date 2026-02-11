import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import {
  Music,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mic,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const StaffMusician = () => {
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch musicians from backend
  const fetchMusicians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/users/artists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch musicians");
      }

      const data = await response.json();
      setMusicians(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching musicians:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicians();
  }, []);

  // Toggle musician status
  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/${id}/toggle-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle musician status");
      }

      fetchMusicians();
    } catch (err) {
      setError(err.message);
      console.error("Error toggling musician status:", err);
    }
  };

  // Filter musicians based on search and filters
  const filteredMusicians = musicians.filter((musician) => {
    const matchesSearch =
      musician.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      musician.genre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre =
      genreFilter === "all" || musician.genre === genreFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && musician.isActive) ||
      (statusFilter === "not-available" && !musician.isActive);

    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Get unique genres for filter
  const uniqueGenres = [...new Set(musicians.map((m) => m.genre))];

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency (Peso)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
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

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Music className="w-6 h-6 text-blue-400" />
                  Musician Management
                </h1>
                <p className="text-gray-300 mt-1">
                  Manage all musicians and bands ({musicians.length} total)
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="all">All Genres</option>
                  {uniqueGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="not-available">Not Available</option>
                </select>
              </div>
            </div>
          </div>

          {/* Musicians Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Musician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Booking Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredMusicians.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <Music className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <div className="text-lg font-medium">
                          No musicians found
                        </div>
                        <div className="text-sm">
                          Try adjusting your search or filters
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMusicians.map((musician) => (
                      <tr
                        key={musician._id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {musician.fullName}
                              </div>
                              <div className="text-sm text-gray-400">
                                Artist
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
                            <Mic className="w-3 h-3 mr-1" />
                            {musician.genre}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-white">
                            <span className="text-green-400 mr-1">₱</span>
                            {formatCurrency(musician.booking_fee)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatus(musician._id)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              musician.isActive
                                ? "bg-green-900/50 text-green-300 border border-green-700 hover:bg-green-800/50"
                                : "bg-red-900/50 text-red-300 border border-red-700 hover:bg-red-800/50"
                            }`}
                          >
                            {musician.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Not Available
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {formatDate(musician.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">View Only</span>
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
          {filteredMusicians.length > 0 && (
            <div className="mt-4 text-sm text-gray-400 text-center">
              Showing {filteredMusicians.length} of {musicians.length} musicians
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700 flex items-center gap-2 z-50">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-100"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffMusician;
