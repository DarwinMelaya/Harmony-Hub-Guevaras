import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingCart } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

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

const CalendarHome = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/bookings/calendar`);
        setAllBookings(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const allSchedulesByDate = {};
  allBookings.forEach((booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const dateKey = bookingDate.toDateString();
    if (!allSchedulesByDate[dateKey]) {
      allSchedulesByDate[dateKey] = [];
    }
    allSchedulesByDate[dateKey].push(booking);
  });

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

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getDatesInMonth = (year, month) => {
    const dates = [];
    const date = new Date(year, month, 1);
    const firstDay = date.getDay();

    for (let dayStart = 0; dayStart < firstDay; dayStart++) {
      dates.push(null);
    }

    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

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

  const handleDateClick = (date) => {
    if (!date) return;

    const dateKey = date.toDateString();
    const bookingsOnDate = allSchedulesByDate[dateKey] || [];
    if (bookingsOnDate.length > 0) {
      setSelectedDate({ date, bookings: bookingsOnDate });
      setShowModal(true);
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
    <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 backdrop-blur text-left">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-indigo-400 uppercase text-xs tracking-widest">
            Availability Snapshot
          </p>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-400" />
            All Bookings Calendar
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMonthChange(false)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <p className="text-lg font-semibold text-gray-100">
            {monthNames[currentMonth]} {currentYear}
          </p>
          <button
            onClick={() => handleMonthChange(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border border-gray-800 font-semibold rounded-t-lg overflow-hidden bg-gray-800">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-gray-300 py-2 border-r last:border-r-0 border-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-t-0 border-gray-800 rounded-b-lg bg-gray-900">
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
              className={`border border-gray-800 p-2 min-h-[110px] hover:bg-gray-800/60 cursor-pointer relative ${
                isToday ? "bg-indigo-900/20" : ""
              }`}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-right mb-1">
                <span
                  className={`text-sm ${
                    isToday
                      ? "bg-indigo-600 text-white px-2 py-1 rounded-full"
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

              {allDayBookings.length > 0 && (
                <div className="space-y-1 overflow-y-auto max-h-[80px] hide-scrollbar">
                  {allDayBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className={`${getStatusColor(
                        booking.status
                      )} rounded p-1.5 text-xs hover:opacity-80 transition-all`}
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

              {allDayBookings.length === 0 && (
                <p className="text-[10px] text-gray-600 italic text-center mt-6">
                  No bookings
                </p>
              )}
            </div>
          );
        })}
      </div>

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

      {showModal && selectedDate && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-indigo-400 text-sm uppercase tracking-wide">
                  All Bookings
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedDate.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedDate.bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex flex-wrap justify-between gap-4 mb-3">
                    <div>
                      <p className="text-white text-lg font-semibold">
                        {formatTime(booking.bookingTime)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Duration: {booking.duration || 1} hour(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`${getStatusColor(
                          booking.status
                        )} px-3 py-1 rounded-full text-xs uppercase`}
                      >
                        {booking.status}
                      </span>
                      <p className="text-green-400 font-semibold text-lg">
                        ₱{Number(booking.totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {booking.items && booking.items.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                        Booked Items
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {booking.items.map((item, idx) => (
                          <span
                            key={`${booking._id}-${idx}`}
                            className="bg-gray-900 text-gray-200 px-2 py-1 rounded text-xs"
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarHome;
