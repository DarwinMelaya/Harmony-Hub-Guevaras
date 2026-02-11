import { useState, useEffect } from "react";
import axios from "axios";
import { Music, Package, ShoppingCart, Check, X } from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UserCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [allBookings, setAllBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [viewMode, setViewMode] = useState("allBookings"); // allBookings, artists, equipment, packages
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allBookingsRes, artistsRes, inventoryRes, packagesRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/bookings/calendar`), // Public endpoint
          axios.get(`${API_BASE_URL}/users/artists/public`),
          axios.get(`${API_BASE_URL}/inventory/public`),
          axios.get(`${API_BASE_URL}/packages/public`),
        ]);

      setAllBookings(allBookingsRes.data?.data || []);
      setArtists(artistsRes.data?.data || []);
      setInventory(inventoryRes.data?.inventory || []);
      setPackages(packagesRes.data?.packages || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format all bookings by date (from all users)
  const allSchedulesByDate = {};
  allBookings.forEach((booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const dateKey = bookingDate.toDateString();
    if (!allSchedulesByDate[dateKey]) {
      allSchedulesByDate[dateKey] = [];
    }
    allSchedulesByDate[dateKey].push(booking);
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600 text-white";
      case "confirmed":
        return "bg-blue-600 text-white";
      case "completed":
        return "bg-green-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Get dates in month
  const getDatesInMonth = (year, month) => {
    const dates = [];
    const date = new Date(year, month, 1);
    const firstDay = date.getDay();

    // Add empty cells for days before the month starts
    for (let dayStart = 0; dayStart < firstDay; dayStart++) {
      dates.push(null);
    }

    // Add all days in the month
    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  // Handle month navigation
  const handleMonthChange = (isNext) => {
    if (isNext) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  // Check if artist is available on a specific date
  const checkArtistAvailability = async (artistId, date) => {
    if (!date) return true;
    try {
      // Format date using local timezone to avoid timezone shift issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const response = await axios.get(
        `${API_BASE_URL}/bookings/check-availability?artistId=${artistId}&bookingDate=${dateStr}`
      );
      return response.data?.available || false;
    } catch (err) {
      console.error("Error checking artist availability:", err);
      return false;
    }
  };

  // Get availability info for a specific date
  const getDateAvailability = async (date) => {
    if (!date) return null;

    const availableArtists = [];
    const unavailableArtists = [];

    for (const artist of artists) {
      const isAvailable = await checkArtistAvailability(artist._id, date);
      if (isAvailable && artist.isAvailable !== false) {
        availableArtists.push(artist);
      } else {
        unavailableArtists.push(artist);
      }
    }

    return {
      date,
      artists: { available: availableArtists, unavailable: unavailableArtists },
      inventory: inventory.filter((item) => item.quantity > 0),
      packages: packages.filter((pkg) => pkg.isAvailable !== false),
    };
  };

  // Handle date click
  const handleDateClick = async (date) => {
    if (!date) return;

    if (viewMode === "allBookings") {
      const dateKey = date.toDateString();
      const bookingsOnDate = allSchedulesByDate[dateKey] || [];
      if (bookingsOnDate.length > 0) {
        // Show a modal with all bookings on this date
        setSelectedDate({ date, bookings: bookingsOnDate });
        setShowAvailabilityModal(true);
      }
    } else {
      // Show availability for the date
      setSelectedDate(date);
      setShowAvailabilityModal(true);

      // If viewing artists, fetch real-time availability
      if (viewMode === "artists") {
        setCheckingAvailability(true);
        try {
          const availabilityData = await getDateAvailability(date);
          setSelectedDate({ date, availabilityData });
        } catch (error) {
          console.error("Error checking availability:", error);
          setSelectedDate({ date, availabilityData: null });
        } finally {
          setCheckingAvailability(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 text-red-300 px-4 py-3 rounded-lg border border-red-700">
        Error loading calendar: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {/* View Mode Switcher */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode("allBookings")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === "allBookings"
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          All Bookings
        </button>
        <button
          onClick={() => setViewMode("artists")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === "artists"
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <Music className="w-4 h-4" />
          Artists Availability
        </button>
        <button
          onClick={() => setViewMode("equipment")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === "equipment"
              ? "bg-orange-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Equipment Availability
        </button>
        <button
          onClick={() => setViewMode("packages")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === "packages"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <Package className="w-4 h-4" />
          Packages Availability
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => handleMonthChange(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={() => handleMonthChange(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border border-gray-700 font-bold rounded-t-md overflow-hidden bg-gray-700">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-gray-300 py-2 border-r last:border-r-0 border-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border border-t-0 border-gray-700 rounded-b-md bg-gray-800">
        {getDatesInMonth(currentYear, currentMonth).map((date, index) => {
          const isToday =
            date &&
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          const dateKey = date ? date.toDateString() : null;
          const allDayBookings = dateKey
            ? allSchedulesByDate[dateKey] || []
            : [];
          const hasConfirmed = allDayBookings.some(
            (b) => b.status === "confirmed"
          );

          return (
            <div
              key={index}
              className={`border border-gray-700 p-2 min-h-[120px] hover:bg-gray-700/50 cursor-pointer relative ${
                isToday ? "bg-blue-900/20" : ""
              }`}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-right mb-1">
                <span
                  className={`text-sm ${
                    isToday
                      ? "bg-blue-600 text-white px-2 py-1 rounded-full"
                      : "text-gray-300"
                  }`}
                >
                  {date ? date.getDate() : ""}
                </span>
              </div>

              {hasConfirmed && (
                <div className="absolute top-1 left-1">
                  <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Reserved
                  </span>
                </div>
              )}

              {/* Display content based on view mode */}
              {/* Show all bookings from all users */}
              {viewMode === "allBookings" && allDayBookings.length > 0 && (
                <div className="space-y-1 overflow-y-auto max-h-[90px] hide-scrollbar">
                  {allDayBookings.map((booking, idx) => (
                    <div
                      key={idx}
                      className={`${getStatusColor(
                        booking.status
                      )} rounded p-1.5 text-xs hover:opacity-80 transition-all cursor-pointer`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                        <span className="font-semibold truncate">
                          {formatTime(booking.bookingTime)}
                        </span>
                      </div>
                      <div className="truncate text-xs opacity-90">
                        {booking.itemsCount || 0} item(s)
                      </div>
                      <div className="truncate text-xs font-medium">
                        ₱{Number(booking.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show availability indicators for other modes */}
              {viewMode === "artists" && date && (
                <div className="mt-2 text-xs text-center">
                  <div className="text-purple-400 font-semibold">
                    Click to view
                  </div>
                  <div className="text-gray-400">artist availability</div>
                </div>
              )}

              {viewMode === "equipment" && date && (
                <div className="mt-2 text-xs text-center">
                  <div className="text-orange-400 font-semibold">
                    {inventory.filter((i) => i.quantity > 0).length} items
                  </div>
                  <div className="text-gray-400">available</div>
                </div>
              )}

              {viewMode === "packages" && date && (
                <div className="mt-2 text-xs text-center">
                  <div className="text-green-400 font-semibold">
                    {packages.filter((p) => p.isAvailable !== false).length}{" "}
                    packages
                  </div>
                  <div className="text-gray-400">available</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && selectedDate && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAvailabilityModal(false)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">
                {viewMode === "allBookings" ? "Bookings" : "Availability"} for{" "}
                {(selectedDate.date || selectedDate).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* All Bookings View */}
            {viewMode === "allBookings" && selectedDate.bookings && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  All Bookings ({selectedDate.bookings.length})
                </h4>
                <p className="text-gray-400 text-sm">
                  Showing all confirmed and pending bookings for this date. Use
                  this to check availability before making your booking.
                </p>

                <div className="space-y-3">
                  {selectedDate.bookings.map((booking, idx) => (
                    <div
                      key={booking._id || idx}
                      className="bg-gray-900 rounded-lg p-4 border border-indigo-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-lg">
                              {formatTime(booking.bookingTime)}
                            </span>
                            <span
                              className={`${getStatusColor(
                                booking.status
                              )} px-2 py-0.5 rounded text-xs`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Duration: {booking.duration || 1} hour(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold text-lg">
                            ₱{Number(booking.totalAmount || 0).toLocaleString()}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {booking.itemsCount} item(s)
                          </p>
                        </div>
                      </div>

                      {/* Items List */}
                      {booking.items && booking.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-xs mb-2">
                            Booked Items:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {booking.items.map((item, itemIdx) => (
                              <span
                                key={itemIdx}
                                className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs"
                              >
                                {item.name || item.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedDate.bookings.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No bookings found for this date
                  </p>
                )}
              </div>
            )}

            {/* Artists Availability */}
            {viewMode === "artists" && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Artists & Musicians
                </h4>

                {/* Loading State */}
                {checkingAvailability && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    <span className="ml-3 text-gray-400">
                      Checking availability...
                    </span>
                  </div>
                )}

                {/* Available Artists */}
                {!checkingAvailability &&
                  selectedDate.availabilityData?.artists?.available?.length >
                    0 && (
                    <div className="space-y-2">
                      <h5 className="text-green-400 font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Available Artists (
                        {selectedDate.availabilityData.artists.available.length}
                        )
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedDate.availabilityData.artists.available.map(
                          (artist) => (
                            <div
                              key={artist._id}
                              className="bg-gray-900 rounded-lg p-4 border border-green-700"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="text-white font-medium">
                                    {artist.fullName}
                                  </h5>
                                  <p className="text-gray-400 text-sm">
                                    {artist.genre}
                                  </p>
                                </div>
                                <div className="text-xs">
                                  <span className="flex items-center gap-1 text-green-400">
                                    <Check className="w-4 h-4" />
                                    Available
                                  </span>
                                </div>
                              </div>
                              <div className="text-green-400 font-semibold">
                                ₱
                                {Number(
                                  artist.booking_fee || 0
                                ).toLocaleString()}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Unavailable Artists */}
                {!checkingAvailability &&
                  selectedDate.availabilityData?.artists?.unavailable?.length >
                    0 && (
                    <div className="space-y-2">
                      <h5 className="text-red-400 font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Unavailable Artists (
                        {
                          selectedDate.availabilityData.artists.unavailable
                            .length
                        }
                        )
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedDate.availabilityData.artists.unavailable.map(
                          (artist) => (
                            <div
                              key={artist._id}
                              className="bg-gray-900 rounded-lg p-4 border border-red-700 opacity-60"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="text-white font-medium">
                                    {artist.fullName}
                                  </h5>
                                  <p className="text-gray-400 text-sm">
                                    {artist.genre}
                                  </p>
                                </div>
                                <div className="text-xs">
                                  <span className="flex items-center gap-1 text-red-400">
                                    <X className="w-4 h-4" />
                                    Booked
                                  </span>
                                </div>
                              </div>
                              <div className="text-gray-500 font-semibold">
                                ₱
                                {Number(
                                  artist.booking_fee || 0
                                ).toLocaleString()}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {!checkingAvailability && artists.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No artists available
                  </p>
                )}

                {!checkingAvailability &&
                  selectedDate.availabilityData &&
                  selectedDate.availabilityData.artists?.available?.length ===
                    0 &&
                  selectedDate.availabilityData.artists?.unavailable?.length ===
                    0 && (
                    <p className="text-gray-400 text-center py-8">
                      No artists found
                    </p>
                  )}
              </div>
            )}

            {/* Equipment Availability */}
            {viewMode === "equipment" && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Lights/Sound Equipment
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inventory.map((item) => (
                    <div
                      key={item._id}
                      className={`bg-gray-900 rounded-lg p-4 border ${
                        item.quantity > 0
                          ? "border-green-700"
                          : "border-red-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="text-white font-medium">
                            {item.name}
                          </h5>
                          <p className="text-gray-400 text-xs line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs font-semibold ${
                            item.quantity > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.quantity > 0
                            ? `${item.quantity} in stock`
                            : "Out of stock"}
                        </span>
                        <span className="text-green-400 font-semibold">
                          ₱{Number(item.price || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {inventory.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No equipment available
                  </p>
                )}
              </div>
            )}

            {/* Packages Availability */}
            {viewMode === "packages" && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Band Services & Packages
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className={`bg-gray-900 rounded-lg p-4 border ${
                        pkg.isAvailable !== false
                          ? "border-green-700"
                          : "border-red-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{pkg.name}</h5>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <div className="text-xs ml-2">
                          {pkg.isAvailable !== false ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <Check className="w-4 h-4" />
                              Available
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <X className="w-4 h-4" />
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-green-400 font-semibold text-lg">
                        ₱{Number(pkg.price || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {packages.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No packages available
                  </p>
                )}
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {viewMode === "allBookings" && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span className="text-gray-300">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-300">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-300">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-300">Cancelled</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCalendar;
