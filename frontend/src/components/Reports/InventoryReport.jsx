import { formatCurrency } from "./utils";

const InventoryReport = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Items</h3>
          <p className="text-3xl font-bold">{data.statistics.totalItems}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Quantity</h3>
          <p className="text-3xl font-bold">{data.statistics.totalQuantity}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Value</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(data.statistics.totalValue)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">
            Items Needing Maintenance
          </h3>
          <p className="text-3xl font-bold text-yellow-400">
            {data.maintenance.itemsNeedingMaintenance?.length || 0}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">All Inventory Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Condition</th>
              </tr>
            </thead>
            <tbody>
              {data.inventory.map((item) => (
                <tr key={item._id} className="border-b border-gray-700">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{formatCurrency(item.price)}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 capitalize">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 capitalize">
                      {item.condition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;

