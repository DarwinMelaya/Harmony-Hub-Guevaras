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

const AdminCalendar = ({
  monthNow,
  yearNow,
  schedules,
  onDateClick,
  onScheduleClick,
  onMonthChange,
  selectedVenue,
  isLightText = false,
}) => {
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes}${ampm}`;
  };

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

  return (
    <>
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => onMonthChange(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <h1 className={`text-lg ${isLightText ? "text-white" : "text-white"}`}>
          {monthNames[monthNow]} {yearNow}
        </h1>
        <button
          onClick={() => onMonthChange(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>
      <div className="flex items-center justify-between border border-gray-700 font-bold rounded-t-md overflow-hidden bg-gray-700">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="border-r w-full max-md:truncate text-gray-300 text-center border-l bg-gray-700 border-gray-700"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 h-[80%] bg-gray-800 border border-t-0 border-gray-700 rounded-b-md">
        {getDatesInMonth(yearNow, monthNow).map((date, index) => (
          <div
            key={index}
            className={`border border-gray-700 p-1 h-[150px] hover:bg-gray-700/50 cursor-pointer relative min-w-[40px] md:min-w-0 text-white ${
              isLightText ? "" : ""
            }`}
            onClick={() => onDateClick(date)}
          >
            <h1 className="text-end text-sm md:text-base text-gray-300">
              {date ? date.getDate() : null}
            </h1>
            {date && schedules[date.toDateString()] && (
              <div className="text-start text-xs mt-1 overflow-y-auto max-h-[120px] hide-scrollbar pr-1">
                {schedules[date.toDateString()]
                  .filter(
                    (schedule) =>
                      !selectedVenue || schedule.venue_id === selectedVenue
                  )
                  .map((schedule, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => onScheduleClick(e, schedule)}
                      className={`${getStatusColor(
                        schedule.status
                      )} mb-2 rounded-lg p-1.5 md:p-2 hover:opacity-80 cursor-pointer transition-all text-[10px] md:text-xs`}
                    >
                      <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/80 flex-shrink-0"></span>
                        <span className="font-semibold truncate">
                          {schedule.venues?.name || "Booking"}
                        </span>
                        <span className="text-xs bg-white/20 px-1 rounded text-white/90 font-medium">
                          {schedule.status}
                        </span>
                      </div>
                      <div className="pl-3 md:pl-4 space-y-0.5">
                        <div className="truncate">
                          <span className="font-medium">Event:</span>{" "}
                          {schedule.event_name}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">User:</span>{" "}
                          {schedule.users?.name || schedule.user_name || "N/A"}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">Dept:</span>{" "}
                          {schedule.department}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">Time:</span>{" "}
                          {formatTime(schedule.start_time)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminCalendar;
