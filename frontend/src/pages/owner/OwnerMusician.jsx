import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AddMusician from "../../components/Modals/Admin/AddMusician";
import EditMusician from "../../components/Modals/Admin/EditMusician";
import AdminSignatureModal from "../../components/Modals/Admin/AdminSignatureModal";
import {
  Music,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  Mic,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Clock,
  X,
} from "lucide-react";
import axios from "axios";

const OwnerMusician = () => {
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [musicianBookings, setMusicianBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showAdminSignModal, setShowAdminSignModal] = useState(false);
  const [signingBooking, setSigningBooking] = useState(null);
  const [downloadingAgreement, setDownloadingAgreement] = useState(null);

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

  // Delete musician
  const deleteMusician = async (id) => {
    if (!window.confirm("Are you sure you want to delete this musician?")) {
      return;
    }

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
        throw new Error("Failed to delete musician");
      }

      fetchMusicians();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting musician:", err);
    }
  };

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

  // Open edit modal
  const openEditModal = (musician) => {
    setSelectedMusician(musician);
    setShowEditModal(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchMusicians();
  };

  // Fetch bookings for a specific musician
  const fetchMusicianBookings = async (musicianId) => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem("token");

      // Fetch all bookings and filter by artist
      const response = await axios.get(
        "http://localhost:5000/api/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Filter bookings where this musician is involved
        const musicianIdStr = musicianId.toString();
        const bookings = response.data.data.filter((booking) =>
          booking.items.some(
            (item) =>
              item.type === "bandArtist" &&
              (item.itemId?.toString() === musicianIdStr ||
                item.itemId?._id?.toString() === musicianIdStr)
          )
        );
        setMusicianBookings(bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      console.error("Error fetching musician bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Open bookings modal for a musician
  const openBookingsModal = async (musician) => {
    setSelectedMusician(musician);
    setShowBookingsModal(true);
    await fetchMusicianBookings(musician._id);
  };

  // Handle admin sign
  const handleAdminSign = async (signatureData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${signingBooking._id}/agreement/admin-sign`,
        signatureData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update the booking in the list
        setMusicianBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === signingBooking._id ? response.data.data : booking
          )
        );

        setShowAdminSignModal(false);
        setSigningBooking(null);
      }
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to sign agreement"
      );
    }
  };

  // Download agreement
  const handleDownloadAgreement = async (bookingId) => {
    try {
      setDownloadingAgreement(bookingId);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/bookings/${bookingId}/agreement/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-agreement-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to download agreement"
      );
    } finally {
      setDownloadingAgreement(null);
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
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Musician
              </button>
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
                            <button
                              onClick={() => openBookingsModal(musician)}
                              className="text-purple-400 hover:text-purple-300 p-1 transition-colors"
                              title="View Bookings"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(musician)}
                              className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMusician(musician._id)}
                              className="text-red-400 hover:text-red-300 p-1 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
          {filteredMusicians.length > 0 && (
            <div className="mt-4 text-sm text-gray-400 text-center">
              Showing {filteredMusicians.length} of {musicians.length} musicians
            </div>
          )}
        </div>

        {/* Modal Components */}
        <AddMusician
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleModalSuccess}
        />

        <EditMusician
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMusician(null);
          }}
          onSuccess={handleModalSuccess}
          musician={selectedMusician}
        />

        {/* Bookings Modal */}
        {showBookingsModal && selectedMusician && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-700/50">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
                <div className="flex items-center space-x-3">
                  <Music className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Bookings for {selectedMusician.fullName}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedMusician.genre} • {formatCurrency(selectedMusician.booking_fee)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedMusician(null);
                    setMusicianBookings([]);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                  </div>
                ) : musicianBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <div className="text-lg font-medium">No bookings found</div>
                    <div className="text-sm">
                      This musician has no bookings yet
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {musicianBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-gray-700/50 rounded-lg p-5 border border-gray-600 hover:border-gray-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-bold">
                                Booking #{booking._id.slice(-6)}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "confirmed"
                                    ? "bg-green-900/50 text-green-300 border border-green-700"
                                    : booking.status === "pending"
                                    ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                                    : booking.status === "completed"
                                    ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                                    : "bg-red-900/50 text-red-300 border border-red-700"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Client:</p>
                                <p className="text-white">
                                  {booking.user?.fullName || booking.user?.username}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Booking Date:</p>
                                <p className="text-white flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(booking.bookingDate)} at {booking.bookingTime}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Total Amount:</p>
                                <p className="text-green-400 font-bold">
                                  {formatCurrency(booking.totalAmount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Created:</p>
                                <p className="text-white flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatDate(booking.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Agreement Section */}
                        {booking.agreement && booking.agreement.signature && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-medium">
                                  Client has signed the agreement
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {booking.agreement.adminSignature ? (
                                  <>
                                    <button
                                      onClick={() => handleDownloadAgreement(booking._id)}
                                      disabled={downloadingAgreement === booking._id}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center space-x-2 transition-colors"
                                    >
                                      {downloadingAgreement === booking._id ? (
                                        <>
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                          <span>Downloading...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Download className="w-4 h-4" />
                                          <span>Download</span>
                                        </>
                                      )}
                                    </button>
                                    <div className="text-sm text-gray-400">
                                      Signed by: {booking.agreement.adminSignerName}
                                    </div>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSigningBooking(booking);
                                      setShowAdminSignModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center space-x-2 transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>Sign Contract</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Signature Modal */}
        <AdminSignatureModal
          isOpen={showAdminSignModal}
          onClose={() => {
            setShowAdminSignModal(false);
            setSigningBooking(null);
          }}
          booking={signingBooking}
          onSign={handleAdminSign}
        />

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

export default OwnerMusician;
