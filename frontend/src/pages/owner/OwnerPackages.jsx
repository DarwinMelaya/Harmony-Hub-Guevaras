import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import AddPackage from "../../components/Modals/Admin/AddPackage";
import { Plus, Gift, Calendar, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OwnerPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New state for modal
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const openEdit = (pkg) => {
    setEditingPackage({ ...pkg });
  };

  const closeEdit = () => setEditingPackage(null);

  const saveEdit = async () => {
    if (!editingPackage?._id) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const { _id, name, description, price, image, isAvailable } =
        editingPackage;
      await axios.put(
        `http://localhost:5000/api/packages/${_id}`,
        { name, description, price, image, isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeEdit();
      fetchPackages();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id) => setConfirmDeleteId(id);

  const cancelDelete = () => setConfirmDeleteId(null);

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/packages/${confirmDeleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConfirmDeleteId(null);
      fetchPackages();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeleting(false);
    }
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-3">
                            <button
                              onClick={() => openEdit(pkg)}
                              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs border border-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => requestDelete(pkg._id)}
                              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs border border-red-500"
                            >
                              Delete
                            </button>
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

        {/* Edit Package Modal */}
        {editingPackage && (
          <Dialog
            open={!!editingPackage}
            onOpenChange={(open) => !open && closeEdit()}
          >
            <DialogContent className="max-w-lg bg-gray-900 text-white border border-gray-700">
              <DialogHeader>
                <DialogTitle>Edit Package</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingPackage.name || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingPackage.description || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPackage.price ?? ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Image
                  </label>
                  {editingPackage.image && (
                    <div className="mb-2">
                      <img
                        src={editingPackage.image}
                        alt="preview"
                        className="h-20 w-20 object-cover rounded border border-gray-700"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const toBase64 = (f) =>
                        new Promise((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result);
                          reader.onerror = reject;
                          reader.readAsDataURL(f);
                        });
                      try {
                        const base64 = await toBase64(file);
                        setEditingPackage({ ...editingPackage, image: base64 });
                      } catch (_) {
                        setError("Failed to read image file");
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="pkg-available"
                    type="checkbox"
                    checked={editingPackage.isAvailable !== false}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="pkg-available"
                    className="text-sm text-gray-300"
                  >
                    Available
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded border border-blue-500 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirm Delete Modal */}
        <Dialog
          open={!!confirmDeleteId}
          onOpenChange={(open) => !open && cancelDelete()}
        >
          <DialogContent className="max-w-sm bg-gray-900 text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle>Delete Package</DialogTitle>
            </DialogHeader>
            <div className="text-gray-300 mb-4">
              Are you sure you want to delete this package? This action cannot
              be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded border border-red-500 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Items Modal */}
        <Dialog open={showItemsModal} onOpenChange={setShowItemsModal}>
          <DialogContent className="max-w-2xl bg-gray-900 text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle>{selectedPackage?.name} – Items</DialogTitle>
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
                      ₱{item.inventoryItem?.price?.toLocaleString() || 0}
                    </div>
                  </div>
                  <span className="text-gray-300">x{item.quantity}</span>
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

export default OwnerPackages;
