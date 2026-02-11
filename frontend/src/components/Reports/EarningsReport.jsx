import { formatCurrency } from "./utils";

const EarningsReport = ({ data }) => {
  if (!data) return null;

  // Compute total earnings excluding cancelled bookings
  const totalEarningsExcludingCancelled =
    data.byStatus?.reduce((sum, item) => {
      if (!item || item._id === "cancelled") return sum;
      return sum + (item.totalEarnings || 0);
    }, 0) ?? data.statistics.totalEarnings;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(totalEarningsExcludingCancelled)}
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

      {/* Earnings by Payment Method */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Earnings by Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.byPaymentMethod.map((item) => (
            <div key={item._id} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1 capitalize">{item._id}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(item.totalEarnings)}
              </p>
              <p className="text-gray-500 text-sm">
                {item.bookingCount} bookings
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings by Period */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Earnings by{" "}
          {data.filterBy === "day"
            ? "Day"
            : data.filterBy === "month"
            ? "Month"
            : "Year"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">
                  {data.filterBy === "day"
                    ? "Day"
                    : data.filterBy === "month"
                    ? "Month"
                    : "Year"}
                </th>
                <th className="text-left p-2">Earnings</th>
                <th className="text-left p-2">Bookings</th>
                <th className="text-left p-2">Downpayment</th>
                <th className="text-left p-2">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.byPeriod.map((item, index) => {
                let periodName = "";
                if (data.filterBy === "day") {
                  periodName = new Date(
                    item._id.year,
                    item._id.month - 1,
                    item._id.day
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                } else if (data.filterBy === "month") {
                  periodName = new Date(
                    item._id.year,
                    item._id.month - 1
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });
                } else {
                  periodName = item._id.year.toString();
                }

                return (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">{periodName}</td>
                    <td className="p-2">
                      {formatCurrency(item.totalEarnings)}
                    </td>
                    <td className="p-2">{item.bookingCount}</td>
                    <td className="p-2">
                      {formatCurrency(item.totalDownpayment)}
                    </td>
                    <td className="p-2">
                      {formatCurrency(item.totalRemainingBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EarningsReport;

