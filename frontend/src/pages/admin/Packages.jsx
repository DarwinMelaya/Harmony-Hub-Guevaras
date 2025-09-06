import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import AddPackage from "../../components/Modals/Admin/AddPackage";
import {
  Plus,
  Gift,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New state for modal
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);

  // Fetch packages from backend
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPackages(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Handle modal success
  const handleModalSuccess = () => {
    fetchPackages();
  };

  // Open items modal
  const openItemsModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowItemsModal(true);
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Gift className="w-6 h-6 text-pink-400" />
                  Package Management
                </h1>
                <p className="text-gray-300 mt-1">
                  Manage all packages ({packages.length} total)
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Package
              </button>
            </div>
          </div>

          {/* Package Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
                      </td>
                    </tr>
                  ) : packages.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <Gift className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <div className="text-lg font-medium">
                          No packages found
                        </div>
                        <div className="text-sm">Try adding a new package</div>
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr
                        key={pkg._id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pkg.image ? (
                            <img
                              src={pkg.image}
                              alt={pkg.name}
                              className="h-12 w-12 object-cover rounded border border-gray-600"
                            />
                          ) : (
                            <span className="text-gray-500">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {pkg.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-400 mr-1">₱</span>
                          {Number(pkg.price).toLocaleString()}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 cursor-pointer hover:underline"
                          onClick={() => openItemsModal(pkg)}
                        >
                          {pkg.items?.length || 0} item
                          {pkg.items?.length > 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {pkg.createdAt
                              ? new Date(pkg.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "-"}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Summary */}
          {packages.length > 0 && !loading && (
            <div className="mt-4 text-sm text-gray-400 text-center">
              Showing {packages.length} package
              {packages.length > 1 ? "s" : ""}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700 flex items-center gap-2 z-50">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Add Package Modal */}
        <AddPackage
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleModalSuccess}
        />

        {/* Items Modal */}
        <Dialog open={showItemsModal} onOpenChange={setShowItemsModal}>
          <DialogContent className="max-w-2xl bg-gray-900 text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle>
                {selectedPackage?.name} – Items
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedPackage?.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg border border-gray-700"
                >
                  {item.inventoryItem?.image ? (
                    <img
                      src={item.inventoryItem.image}
                      alt={item.inventoryItem.name}
                      className="h-12 w-12 object-cover rounded border border-gray-600"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-700 text-gray-400 rounded">
                      No Img
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {item.inventoryItem?.name || "Unknown Item"}
                    </div>
                    <div className="text-sm text-gray-400">
                      ₱
                      {item.inventoryItem?.price?.toLocaleString() || 0}
                    </div>
                  </div>
                  <span className="text-gray-300">
                    x{item.quantity}
                  </span>
                </div>
              ))}
              {selectedPackage?.items?.length === 0 && (
                <p className="text-gray-400">No items in this package.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Packages;
