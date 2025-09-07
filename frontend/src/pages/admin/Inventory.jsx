import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import AddInventory from "../../components/Modals/Admin/AddInventory";
import { Plus, Box, Calendar, AlertCircle } from "lucide-react";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInventory(response.data.data || response.data.inventory || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle modal success
  const handleModalSuccess = () => {
    fetchInventory();
  };

  // Edit handlers
  const openEdit = (item) => {
    setEditingItem({ ...item });
  };

  const closeEdit = () => {
    setEditingItem(null);
  };

  const saveEdit = async () => {
    if (!editingItem?._id) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const { _id, name, price, quantity, image } = editingItem;
      await axios.put(
        `http://localhost:5000/api/inventory/${_id}`,
        { name, price, quantity, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeEdit();
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const deleteItem = async (id) => {
    if (!id) return;
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/inventory/${confirmDeleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConfirmDeleteId(null);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Box className="w-6 h-6 text-blue-400" />
                  Inventory Management
                </h1>
                <p className="text-gray-300 mt-1">
                  Manage all inventory items ({inventory.length} total)
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Inventory
              </button>
            </div>
          </div>

          {/* Inventory Table */}
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
                      Quantity
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
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                      </td>
                    </tr>
                  ) : inventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <Box className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <div className="text-lg font-medium">
                          No inventory items found
                        </div>
                        <div className="text-sm">
                          Try adding a new inventory item
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded border border-gray-600"
                            />
                          ) : (
                            <span className="text-gray-500">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-400 mr-1">₱</span>
                          {Number(item.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-400 mr-1"></span>
                          {Number(item.quantity ?? 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
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
                              onClick={() => openEdit(item)}
                              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs border border-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteItem(item._id)}
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
          {inventory.length > 0 && !loading && (
            <div className="mt-4 text-sm text-gray-400 text-center">
              Showing {inventory.length} inventory item
              {inventory.length > 1 ? "s" : ""}
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
        <AddInventory
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleModalSuccess}
        />
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeEdit}
            ></div>
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md text-white">
              <h3 className="text-lg font-semibold mb-4">Edit Inventory</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editingItem.quantity ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Image
                  </label>
                  {editingItem.image && (
                    <div className="mb-2">
                      <img
                        src={editingItem.image}
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
                        setEditingItem({ ...editingItem, image: base64 });
                      } catch (err) {
                        setError("Failed to read image file");
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
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
            </div>
          </div>
        )}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={cancelDelete}
            ></div>
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm text-white">
              <h3 className="text-lg font-semibold mb-2">Delete Inventory</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
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
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;
