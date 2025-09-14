import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Music,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
} from "lucide-react";

const ArtistBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch artist bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/bookings/artist-bookings",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.clientInfo?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.clientInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format currency (Peso)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: AlertCircle,
        text: "Pending",
        className: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
      },
      confirmed: {
        icon: CheckCircle,
        text: "Confirmed",
        className: "bg-green-900/50 text-green-300 border-green-700",
      },
      cancelled: {
        icon: XCircle,
        text: "Cancelled",
        className: "bg-red-900/50 text-red-300 border-red-700",
      },
      completed: {
        icon: CheckCircle,
        text: "Completed",
        className: "bg-blue-900/50 text-blue-300 border-blue-700",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
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
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              My Bookings
            </h1>
            <p className="text-gray-300 mt-1">
              View all your upcoming and past bookings ({bookings.length} total)
            </p>
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
                    placeholder="Search by client name, email, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <div className="text-lg font-medium text-gray-400">
                  No bookings found
                </div>
                <div className="text-sm text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You don't have any bookings yet"}
                </div>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-lg font-semibold text-white">
                            {formatDate(booking.bookingDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {formatTime(booking.bookingTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-white">
                            {booking.duration} hour{booking.duration > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-white">
                            {booking.clientInfo?.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">
                            {booking.clientInfo?.email}
                          </span>
                        </div>
                        {booking.clientInfo?.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 text-sm">
                              {booking.clientInfo.phoneNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Artist Item Details */}
                      {booking.artistItem && (
                        <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Music className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-white">
                              Your Performance
                            </span>
                          </div>
                          <div className="text-sm text-gray-300">
                            <div>Name: {booking.artistItem.name}</div>
                            <div>Price: {formatCurrency(booking.artistItem.price)}</div>
                            <div>Quantity: {booking.artistItem.quantity}</div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-400 mb-1">Notes:</div>
                          <div className="text-sm text-gray-300 bg-gray-700 p-2 rounded">
                            {booking.notes}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      {booking.contactInfo && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-400 mb-1">Event Details:</div>
                          <div className="text-sm text-gray-300">
                            {booking.contactInfo.address && (
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-3 h-3" />
                                {booking.contactInfo.address}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status and Amount */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-400">Total Amount</div>
                      </div>
                      {getStatusBadge(booking.status)}
                      <div className="text-xs text-gray-500">
                        Booked on {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredBookings.length > 0 && (
            <div className="mt-6 text-sm text-gray-400 text-center">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          )}

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
      </div>
    </Layout>
  );
};

export default ArtistBooking;
