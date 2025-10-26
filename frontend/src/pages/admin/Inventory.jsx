import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import AddInventory from "../../components/Modals/Admin/AddInventory";
import MaintenanceModal from "../../components/Modals/Admin/MaintenanceModal";
import {
  Plus,
  Box,
  Calendar,
  AlertCircle,
  Wrench,
  AlertTriangle,
  Clock,
  History,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedItemForMaintenance, setSelectedItemForMaintenance] =
    useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState(null);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

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
      const {
        _id,
        name,
        price,
        quantity,
        image,
        condition,
        status,
        maintenanceIntervalDays,
        notes,
      } = editingItem;
      await axios.put(
        `http://localhost:5000/api/inventory/${_id}`,
        {
          name,
          price,
          quantity,
          image,
          condition,
          status,
          maintenanceIntervalDays,
          notes,
        },
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

  // Maintenance handlers
  const openMaintenanceModal = (item) => {
    setSelectedItemForMaintenance(item);
    setShowMaintenanceModal(true);
  };

  const closeMaintenanceModal = () => {
    setSelectedItemForMaintenance(null);
    setShowMaintenanceModal(false);
  };

  const handleMaintenanceSuccess = () => {
    fetchInventory();
  };

  // View maintenance history
  const viewMaintenanceHistory = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/inventory/${item._id}/maintenance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMaintenanceHistory({
        item,
        history: response.data.maintenanceHistory || [],
      });
      setShowMaintenanceHistory(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const closeMaintenanceHistory = () => {
    setMaintenanceHistory(null);
    setShowMaintenanceHistory(false);
  };

  // Helper functions for status badges
  const getConditionColor = (condition) => {
    const colors = {
      excellent: "bg-green-600/90 text-green-100 border-green-500/50",
      good: "bg-blue-600/90 text-blue-100 border-blue-500/50",
      fair: "bg-yellow-600/90 text-yellow-100 border-yellow-500/50",
      poor: "bg-orange-600/90 text-orange-100 border-orange-500/50",
      "needs-repair": "bg-red-600/90 text-red-100 border-red-500/50",
    };
    return (
      colors[condition] || "bg-gray-600/90 text-gray-100 border-gray-500/50"
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-600/90 text-green-100 border-green-500/50",
      "in-use": "bg-blue-600/90 text-blue-100 border-blue-500/50",
      "under-maintenance":
        "bg-yellow-600/90 text-yellow-100 border-yellow-500/50",
      "needs-repair": "bg-red-600/90 text-red-100 border-red-500/50",
      retired: "bg-gray-600/90 text-gray-100 border-gray-500/50",
    };
    return colors[status] || "bg-gray-600/90 text-gray-100 border-gray-500/50";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isMaintenanceDue = (item) => {
    if (!item.nextMaintenanceDate) return false;
    return new Date() >= new Date(item.nextMaintenanceDate);
  };

  const isMaintenanceOverdue = (item) => {
    if (!item.nextMaintenanceDate) return false;
    const daysOverdue = Math.floor(
      (new Date() - new Date(item.nextMaintenanceDate)) / (1000 * 60 * 60 * 24)
    );
    return daysOverdue > 7;
  };

  const toggleActionMenu = (itemId) => {
    setActionMenuOpen(actionMenuOpen === itemId ? null : itemId);
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

          {/* Maintenance Alerts */}
          {inventory.filter((item) => isMaintenanceDue(item)).length > 0 && (
            <div className="mb-6 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-200">
                    Maintenance Alerts
                  </h3>
                  <p className="text-sm text-yellow-300/80">
                    {inventory.filter((item) => isMaintenanceDue(item)).length}{" "}
                    item(s) require maintenance attention
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Condition
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Maintenance
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                          <p className="text-sm">Loading inventory...</p>
                        </div>
                      </td>
                    </tr>
                  ) : inventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <Box className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <div className="text-base font-medium mb-1">
                          No inventory items found
                        </div>
                        <div className="text-sm text-gray-500">
                          Click "Add Inventory" to create your first item
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr
                        key={item._id}
                        className={`hover:bg-gray-700/30 transition-colors ${
                          isMaintenanceOverdue(item)
                            ? "bg-red-900/10"
                            : isMaintenanceDue(item)
                            ? "bg-yellow-900/10"
                            : ""
                        }`}
                      >
                        {/* Item Column - Image + Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-12 w-12 rounded-lg object-cover border border-gray-600 flex-shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
                                <Box className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-white text-sm">
                                {item.name}
                              </div>
                              {item.notes && (
                                <div className="text-xs text-gray-400 truncate mt-0.5">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-green-400 font-medium">
                            ₱{Number(item.price).toLocaleString()}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {Number(item.quantity ?? 0).toLocaleString()}
                          </div>
                        </td>

                        {/* Condition */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getConditionColor(
                              item.condition
                            )}`}
                          >
                            {item.condition
                              ? item.condition
                                  .split("-")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")
                              : "N/A"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status
                              ? item.status
                                  .split("-")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")
                              : "N/A"}
                          </span>
                        </td>

                        {/* Maintenance */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {isMaintenanceOverdue(item) ? (
                              <div className="flex items-center gap-1 text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  Overdue
                                </span>
                              </div>
                            ) : isMaintenanceDue(item) ? (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  Due Now
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs">
                                  {formatDate(item.nextMaintenanceDate)}
                                </span>
                              </div>
                            )}
                            {item.lastMaintenanceDate && (
                              <span className="text-xs text-gray-500">
                                {formatDate(item.lastMaintenanceDate)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openMaintenanceModal(item)}
                              className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                              title="Log Maintenance"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => viewMaintenanceHistory(item)}
                              className="p-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                              title="History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeEdit}
            ></div>
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl text-white m-4">
              <h3 className="text-lg font-semibold mb-4">Edit Inventory</h3>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Condition
                    </label>
                    <select
                      value={editingItem.condition || "excellent"}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          condition: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="needs-repair">Needs Repair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      value={editingItem.status || "available"}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                    >
                      <option value="available">Available</option>
                      <option value="in-use">In Use</option>
                      <option value="under-maintenance">
                        Under Maintenance
                      </option>
                      <option value="needs-repair">Needs Repair</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Maintenance Interval (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.maintenanceIntervalDays ?? 90}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        maintenanceIntervalDays: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editingItem.notes || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
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
        <MaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={closeMaintenanceModal}
          onSuccess={handleMaintenanceSuccess}
          item={selectedItemForMaintenance}
        />
        {showMaintenanceHistory && maintenanceHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeMaintenanceHistory}
            ></div>
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-4xl m-4 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Maintenance History - {maintenanceHistory.item.name}
                </h3>
                <button
                  onClick={closeMaintenanceHistory}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              {maintenanceHistory.history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p>No maintenance history available</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {maintenanceHistory.history
                    .slice()
                    .reverse()
                    .map((record, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-600/90 text-purple-100 border border-purple-500/50">
                              {record.type
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </span>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(record.date)}
                            </p>
                          </div>
                          {record.cost > 0 && (
                            <span className="text-green-400 font-medium">
                              ₱{Number(record.cost).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-2">
                          {record.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>By: {record.performedBy}</span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={closeMaintenanceHistory}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                >
                  Close
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
