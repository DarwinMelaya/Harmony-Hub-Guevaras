import AdminCalendar from "../../../Admin/Dashboard/AdminCalendar";

const BookingCalendarModal = ({
  isOpen,
  onClose,
  bookings,
  calendarMonth,
  calendarYear,
  onMonthChange,
  onScheduleClick,
}) => {
  if (!isOpen) return null;

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
      status: booking.status, // Add status for color coding
      venues: { name: "Booking" },
    });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Bookings Calendar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        {/* Color Legend */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded"></div>
              <span className="text-gray-300">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-300">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-gray-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-gray-300">Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span className="text-gray-300">Refunded</span>
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-auto">
          <AdminCalendar
            monthNow={calendarMonth}
            yearNow={calendarYear}
            schedules={schedulesByDate}
            onDateClick={() => {}}
            onScheduleClick={onScheduleClick}
            onMonthChange={onMonthChange}
            selectedVenue={null}
            isLightText
          />
        </div>
      </div>
    </div>
  );
};

export default BookingCalendarModal;

