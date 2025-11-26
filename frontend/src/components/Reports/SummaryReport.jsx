import { ShoppingCart, User, DollarSign, Package } from "lucide-react";
import { formatCurrency, formatDate } from "./utils";

const SummaryReport = ({ data }) => {
  if (!data) return null;

  // Compute total revenue excluding cancelled bookings
  const totalRevenueExcludingCancelled =
    data.bookings?.byStatus?.reduce((sum, item) => {
      if (!item || item._id === "cancelled") return sum;
      return sum + (item.totalRevenue || 0);
    }, 0) ?? data.revenue.totalRevenue;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Total Bookings</h3>
            <ShoppingCart className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold">{data.summary.totalBookings}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Total Users</h3>
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{data.summary.totalUsers}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(totalRevenueExcludingCancelled)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Inventory Items</h3>
            <Package className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold">{data.summary.totalInventory}</p>
        </div>
      </div>

      {/* Bookings by Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Bookings by Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.bookings.byStatus.map((item) => (
            <div key={item._id} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1 capitalize">
                {item._id}
              </p>
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-gray-500 text-sm">
                {formatCurrency(item.totalRevenue)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Users by Role */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Users by Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {data.users.byRole.map((item) => (
            <div key={item._id} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1 capitalize">
                {item._id}
              </p>
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-gray-500 text-sm">
                {item.active} active, {item.inactive} inactive
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.recent.map((booking) => (
                <tr key={booking._id} className="border-b border-gray-700">
                  <td className="p-2">{booking.user?.fullName || "N/A"}</td>
                  <td className="p-2">{formatCurrency(booking.totalAmount)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;
