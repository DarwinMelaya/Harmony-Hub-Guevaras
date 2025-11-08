import { formatCurrency, formatDate } from "./utils";

const BookingsReport = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold">{data.statistics.totalBookings}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(data.statistics.totalRevenue)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">
            Average Booking Value
          </h3>
          <p className="text-3xl font-bold">
            {formatCurrency(data.statistics.averageBookingValue)}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">All Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Booking Date</th>
                <th className="text-left p-2">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-gray-700">
                  <td className="p-2">{booking.user?.fullName || "N/A"}</td>
                  <td className="p-2">
                    {formatCurrency(booking.totalAmount)}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        booking.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "confirmed"
                          ? "bg-blue-500/20 text-blue-400"
                          : booking.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-2">{formatDate(booking.bookingDate)}</td>
                  <td className="p-2 capitalize">{booking.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsReport;

