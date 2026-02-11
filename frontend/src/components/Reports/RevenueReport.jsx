import { formatCurrency } from "./utils";

const RevenueReport = ({ data }) => {
  if (!data) return null;

  // Compute total revenue excluding cancelled bookings
  const totalRevenueExcludingCancelled =
    data.byStatus?.reduce((sum, item) => {
      if (!item || item._id === "cancelled") return sum;
      return sum + (item.totalRevenue || 0);
    }, 0) ?? data.statistics.totalRevenue;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(totalRevenueExcludingCancelled)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Downpayment</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(data.statistics.totalDownpayment)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Remaining Balance</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {formatCurrency(data.statistics.totalRemainingBalance)}
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

      {/* Revenue by Payment Method */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Revenue by Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.byPaymentMethod.map((item) => (
            <div key={item._id} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1 capitalize">{item._id}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(item.totalRevenue)}
              </p>
              <p className="text-gray-500 text-sm">
                {item.bookingCount} bookings
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Revenue by Month</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Month</th>
                <th className="text-left p-2">Revenue</th>
                <th className="text-left p-2">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {data.byMonth.map((item) => (
                <tr
                  key={`${item._id.year}-${item._id.month}`}
                  className="border-b border-gray-700"
                >
                  <td className="p-2">
                    {new Date(
                      item._id.year,
                      item._id.month - 1
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-2">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                  <td className="p-2">{item.bookingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;

