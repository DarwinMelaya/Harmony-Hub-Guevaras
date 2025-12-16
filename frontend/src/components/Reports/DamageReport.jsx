import { formatCurrency } from "./utils";

const DamageReport = ({ data }) => {
  if (!data) return null;

  const { statistics, damagedItems, byCondition, damageFromBookings = [] } =
    data;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Damaged Items</h3>
          <p className="text-3xl font-bold">
            {statistics.totalItems ?? damagedItems.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Quantity</h3>
          <p className="text-3xl font-bold">
            {statistics.totalQuantity ?? 0}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Value</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(statistics.totalValue ?? 0)}
          </p>
        </div>
      </div>

      {/* By Condition */}
      {byCondition && byCondition.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">By Condition</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {byCondition.map((item) => (
              <div key={item._id || "unknown"} className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1 capitalize">
                  {item._id || "Unknown"}
                </p>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-gray-500 text-sm">
                  Qty: {item.totalQuantity}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Damaged Items Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Damaged / For Repair Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Condition</th>
                <th className="text-left p-2">Last Maintenance</th>
                <th className="text-left p-2">Next Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {damagedItems.map((item) => (
                <tr key={item._id} className="border-b border-gray-700">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">
                    {item.category?.name || "—"}
                  </td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{formatCurrency(item.price)}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 capitalize">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-300 capitalize">
                      {item.condition}
                    </span>
                  </td>
                  <td className="p-2 text-xs text-gray-300">
                    {item.lastMaintenanceDate
                      ? new Date(item.lastMaintenanceDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-2 text-xs text-gray-300">
                    {item.nextMaintenanceDate
                      ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {damagedItems.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-gray-400 text-sm"
                  >
                    No damaged or repair-needed items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Damage Recorded on Customer Return */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Damage Reported on Return (Completed Bookings)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Booking Date</th>
                <th className="text-left p-2">Client</th>
                <th className="text-left p-2">Issue Type</th>
                <th className="text-left p-2">Affected Items</th>
                <th className="text-left p-2">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {damageFromBookings.map((b) => (
                <tr key={b._id} className="border-b border-gray-700">
                  <td className="p-2 text-sm text-gray-300">
                    {b.bookingDate
                      ? new Date(b.bookingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 text-sm text-gray-200">
                    {b.user?.fullName || "N/A"}
                  </td>
                  <td className="p-2 text-sm capitalize">
                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                      {b.issueType || "damaged"}
                    </span>
                  </td>
                  <td className="p-2 text-sm text-gray-200">
                    {Array.isArray(b.affectedItems) && b.affectedItems.length > 0
                      ? b.affectedItems.join(", ")
                      : "—"}
                  </td>
                  <td className="p-2 text-sm">
                    {formatCurrency(b.totalAmount)}
                  </td>
                </tr>
              ))}
              {damageFromBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-gray-400 text-sm"
                  >
                    No damage has been recorded on returned bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DamageReport;


