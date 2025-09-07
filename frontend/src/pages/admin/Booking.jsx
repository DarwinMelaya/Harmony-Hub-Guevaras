import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Package,
  Music,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import AdminCalendar from "../../components/Admin/Dashboard/AdminCalendar";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url =
        statusFilter === "all"
          ? "http://localhost:5000/api/bookings"
          : `http://localhost:5000/api/bookings?status=${statusFilter}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // Map bookings to schedules by date string for the calendar component
  const schedulesByDate = bookings.reduce((acc, booking) => {
    const date = new Date(booking.bookingDate);
    const dateKey = date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    // Compose schedule object expected by AdminCalendar
    acc[dateKey].push({
      id: booking._id,
      event_name: booking.items?.map((i) => i.name).join(", ") || "Booking",
      department: booking.user?.fullName || booking.user?.username || "User",
      start_time: booking.bookingTime,
      completed: booking.status === "completed",
      venues: { name: "Booking" },
    });
    return acc;
  }, {});

  const handleMonthChange = (forward) => {
    let month = calendarMonth + (forward ? 1 : -1);
    let year = calendarYear;
    if (month > 11) {
      month = 0;
      year += 1;
    } else if (month < 0) {
      month = 11;
      year -= 1;
    }
    setCalendarMonth(month);
    setCalendarYear(year);
  };

  const handleDateClick = () => {};
  const handleScheduleClick = (e, schedule) => {
    e.stopPropagation();
    const booking = bookings.find((b) => b._id === schedule.id);
    if (booking) {
      setSelectedBooking(booking);
      setShowDetailsModal(true);
      setShowCalendar(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(bookingId);
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );

        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "inventory":
        return <ShoppingCart className="w-4 h-4" />;
      case "package":
        return <Package className="w-4 h-4" />;
      case "bandArtist":
        return <Music className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
              <p className="text-gray-400">
                Manage all customer bookings and reservations
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCalendar(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={fetchBookings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || statusFilter !== "all"
                    ? "No bookings match your search criteria"
                    : "No bookings found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {booking.user?.fullName ||
                                  booking.user?.username}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {booking.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {booking.items.slice(0, 2).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm"
                              >
                                {getItemIcon(item.type)}
                                <span className="text-gray-300">
                                  {item.name} x{item.quantity}
                                </span>
                              </div>
                            ))}
                            {booking.items.length > 2 && (
                              <p className="text-gray-500 text-xs">
                                +{booking.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              {formatDate(booking.bookingDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">
                              {formatTime(booking.bookingTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-bold text-lg">
                            ₱{Number(booking.totalAmount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">
                              {booking.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailsModal(true);
                              }}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "confirmed"
                                    )
                                  }
                                  disabled={updatingStatus === booking._id}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-2 rounded transition-colors"
                                  title="Confirm Booking"
                                >
                                  {updatingStatus === booking._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "cancelled"
                                    )
                                  }
                                  disabled={updatingStatus === booking._id}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-2 rounded transition-colors"
                                  title="Cancel Booking"
                                >
                                  {updatingStatus === booking._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}

                            {booking.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking._id, "completed")
                                }
                                disabled={updatingStatus === booking._id}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded transition-colors"
                                title="Mark as Completed"
                              >
                                {updatingStatus === booking._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Customer Information
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white font-medium">
                        {selectedBooking.user?.fullName ||
                          selectedBooking.user?.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">
                        {selectedBooking.user?.email}
                      </p>
                    </div>
                    {selectedBooking.contactInfo?.phone && (
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white">
                          {selectedBooking.contactInfo.phone}
                        </p>
                      </div>
                    )}
                    {selectedBooking.contactInfo?.address && (
                      <div>
                        <p className="text-gray-400 text-sm">Address</p>
                        <p className="text-white">
                          {selectedBooking.contactInfo.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Booking Information
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">
                        {formatDate(selectedBooking.bookingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-white">
                        {formatTime(selectedBooking.bookingTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white">
                        {selectedBooking.duration} hours
                      </p>
                    </div>
                  </div>
                  {selectedBooking.notes && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm">Notes</p>
                      <p className="text-white">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Payment Information
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Payment Method</p>
                      <p className="text-white font-medium capitalize">
                        {selectedBooking.paymentMethod === "gcash"
                          ? "GCash"
                          : "Cash"}
                      </p>
                    </div>
                    {selectedBooking.paymentReference && (
                      <div>
                        <p className="text-gray-400 text-sm">
                          Reference Number
                        </p>
                        <p className="text-white font-mono">
                          {selectedBooking.paymentReference}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedBooking.paymentImage && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">
                        Payment Screenshot
                      </p>
                      <img
                        src={selectedBooking.paymentImage}
                        alt="Payment screenshot"
                        className="w-48 h-48 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Booked Items
                </h3>
                <div className="space-y-3">
                  {selectedBooking.items.map((item, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getItemIcon(item.type)}
                          <div>
                            <p className="text-white font-medium">
                              {item.name}
                            </p>
                            <p className="text-gray-400 text-sm capitalize">
                              {item.type === "bandArtist"
                                ? "Band Artist"
                                : item.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            x{item.quantity}
                          </p>
                          <p className="text-green-400 font-bold">
                            ₱
                            {Number(
                              item.price * item.quantity
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">
                      Total Amount:
                    </span>
                    <span className="text-green-400 font-bold text-xl">
                      ₱{Number(selectedBooking.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                >
                  Close
                </button>
                {selectedBooking.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking._id, "confirmed");
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking._id, "cancelled");
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {selectedBooking.status === "confirmed" && (
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking._id, "completed");
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                Bookings Calendar
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <AdminCalendar
                monthNow={calendarMonth}
                yearNow={calendarYear}
                schedules={schedulesByDate}
                onDateClick={handleDateClick}
                onScheduleClick={handleScheduleClick}
                onMonthChange={handleMonthChange}
                selectedVenue={null}
                isLightText
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Booking;
