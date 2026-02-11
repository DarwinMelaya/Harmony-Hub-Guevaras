import { formatCurrency } from "./utils";

const PackagesReport = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Packages</h3>
          <p className="text-3xl font-bold">{data.statistics.totalPackages}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Available</h3>
          <p className="text-3xl font-bold text-green-400">
            {data.statistics.availablePackages}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Unavailable</h3>
          <p className="text-3xl font-bold text-red-400">
            {data.statistics.unavailablePackages}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Average Price</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(data.statistics.averagePrice)}
          </p>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">All Packages</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Items Count</th>
              </tr>
            </thead>
            <tbody>
              {data.packages.map((pkg) => (
                <tr key={pkg._id} className="border-b border-gray-700">
                  <td className="p-2">{pkg.name}</td>
                  <td className="p-2">{formatCurrency(pkg.price)}</td>
                  <td className="p-2">
                    {pkg.isAvailable ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="p-2">{pkg.items?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackagesReport;

