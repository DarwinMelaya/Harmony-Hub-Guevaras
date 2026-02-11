import { useState, useEffect, useMemo, useCallback, memo } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import AddInventory from "../../components/Modals/Admin/AddInventory";
import MaintenanceModal from "../../components/Modals/Admin/MaintenanceModal";
import EditInventoryModal from "../../components/Modals/Admin/EditInventoryModal";
import MaintenanceHistoryModal from "../../components/Modals/Admin/MaintenanceHistoryModal";
import DeleteConfirmModal from "../../components/Modals/Admin/DeleteConfirmModal";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Helper functions moved outside component for better performance
const getConditionColor = (condition) => {
  const colors = {
    excellent: "bg-green-600/90 text-green-100 border-green-500/50",
    good: "bg-blue-600/90 text-blue-100 border-blue-500/50",
    fair: "bg-yellow-600/90 text-yellow-100 border-yellow-500/50",
    poor: "bg-orange-600/90 text-orange-100 border-orange-500/50",
    "needs-repair": "bg-red-600/90 text-red-100 border-red-500/50",
  };
  return colors[condition] || "bg-gray-600/90 text-gray-100 border-gray-500/50";
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

const capitalizeStatus = (status) => {
  if (!status) return "N/A";
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getPrimaryImage = (item) => {
  if (!item) return null;
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }
  return item.image || null;
};

const getImageCount = (item) => {
  if (!item) return 0;
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images.length;
  }
  return item.image ? 1 : 0;
};

// Memoized table row component
const InventoryRow = memo(
  ({ item, onEdit, onMaintenance, onViewHistory, onDelete }) => {
    const primaryImage = getPrimaryImage(item);
    const totalImages = getImageCount(item);

    return (
      <tr
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
            <div className="relative flex-shrink-0">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover border border-gray-600"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
                  <Box className="w-6 h-6 text-gray-500" />
                </div>
              )}
              {totalImages > 1 && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-black/80 text-[10px] px-1.5 py-0.5 text-white border border-gray-600">
                  +{totalImages - 1}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white text-sm">{item.name}</div>
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
            {item.unit && (
              <span className="text-xs text-gray-400 ml-1">
                {item.unit.symbol}
              </span>
            )}
          </div>
        </td>

        {/* Category */}
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="text-sm text-gray-400">
            {item.category ? item.category.name : '-'}
          </div>
        </td>

        {/* Condition */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getConditionColor(
              item.condition
            )}`}
          >
            {capitalizeStatus(item.condition)}
          </span>
        </td>

        {/* Status */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
              item.status
            )}`}
          >
            {capitalizeStatus(item.status)}
          </span>
        </td>

        {/* Maintenance */}
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex flex-col gap-1">
            {isMaintenanceOverdue(item) ? (
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Overdue</span>
              </div>
            ) : isMaintenanceDue(item) ? (
              <div className="flex items-center gap-1 text-yellow-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">Due Now</span>
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
              onClick={() => onEdit(item)}
              className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMaintenance(item)}
              className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
              title="Log Maintenance"
            >
              <Wrench className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewHistory(item)}
              className="p-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              title="History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

InventoryRow.displayName = "InventoryRow";

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
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    fetchUnitsAndCategories();
  }, []);

  // Fetch units and categories
  const fetchUnitsAndCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [unitsRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/units", { headers }),
        axios.get("http://localhost:5000/api/categories", { headers }),
      ]);

      setUnits(unitsRes.data.data || unitsRes.data.units || []);
      setCategories(categoriesRes.data.data || categoriesRes.data.categories || []);
    } catch (err) {
      console.error("Error fetching units and categories:", err);
    }
  };

  // Handle modal success with useCallback
  const handleModalSuccess = useCallback(() => {
    fetchInventory();
  }, []);

  // Edit handlers with useCallback
  const openEdit = useCallback((item) => {
    const normalizedImages =
      item.images?.length > 0
        ? [...item.images]
        : item.image
        ? [item.image]
        : [];
    setEditingItem({ ...item, images: normalizedImages });
  }, []);

  const closeEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  const handleEditChange = useCallback((updates) => {
    setEditingItem((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleImageChange = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const toBase64 = (f) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
    try {
      const base64Images = await Promise.all(files.map((file) => toBase64(file)));
      setEditingItem((prev) => {
        if (!prev) return prev;
        const existingImages = Array.isArray(prev.images) ? prev.images : [];
        return { ...prev, images: [...existingImages, ...base64Images] };
      });
    } catch (err) {
      setError("Failed to read image file(s)");
    } finally {
      e.target.value = "";
    }
  }, []);

  const removeEditingImage = useCallback((index) => {
    setEditingItem((prev) => {
      if (!prev) return prev;
      const existingImages = Array.isArray(prev.images) ? [...prev.images] : [];
      existingImages.splice(index, 1);
      return { ...prev, images: existingImages };
    });
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingItem?._id) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const {
        _id,
        name,
        price,
        quantity,
        unit,
        category,
        condition,
        status,
        maintenanceIntervalDays,
        notes,
        images: editImages,
      } = editingItem;
      
      const payload = {
        name,
        price,
        quantity,
        condition,
        status,
        maintenanceIntervalDays,
        notes,
      };

      if (Array.isArray(editImages)) {
        payload.images = editImages;
      }

      // Only include unit and category if they're set
      if (unit) {
        payload.unit = typeof unit === 'object' ? unit._id : unit;
      }
      if (category) {
        payload.category = typeof category === 'object' ? category._id : category;
      }

      await axios.put(
        `http://localhost:5000/api/inventory/${_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeEdit();
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }, [editingItem, closeEdit]);

  // Delete handler with useCallback
  const deleteItem = useCallback((id) => {
    if (!id) return;
    setConfirmDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
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
  }, [confirmDeleteId]);

  const cancelDelete = useCallback(() => setConfirmDeleteId(null), []);

  // Maintenance handlers with useCallback
  const openMaintenanceModal = useCallback((item) => {
    setSelectedItemForMaintenance(item);
    setShowMaintenanceModal(true);
  }, []);

  const closeMaintenanceModal = useCallback(() => {
    setSelectedItemForMaintenance(null);
    setShowMaintenanceModal(false);
  }, []);

  const handleMaintenanceSuccess = useCallback(() => {
    fetchInventory();
  }, []);

  // View maintenance history with useCallback
  const viewMaintenanceHistory = useCallback(async (item) => {
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
  }, []);

  const closeMaintenanceHistory = useCallback(() => {
    setMaintenanceHistory(null);
    setShowMaintenanceHistory(false);
  }, []);

  // Memoize computed values for better performance
  const maintenanceDueCount = useMemo(() => {
    return inventory.filter((item) => isMaintenanceDue(item)).length;
  }, [inventory]);

  // Pagination calculations
  const paginationData = useMemo(() => {
    const totalItems = inventory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = inventory.slice(startIndex, endIndex);

    return {
      currentItems,
      totalPages,
      totalItems,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
    };
  }, [inventory, currentPage, itemsPerPage]);

  // Reset to first page when inventory changes
  useEffect(() => {
    setCurrentPage(1);
  }, [inventory.length]);

  // Pagination handlers
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationData.totalPages);
  }, [paginationData.totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(paginationData.totalPages, prev + 1));
  }, [paginationData.totalPages]);

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

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
          {maintenanceDueCount > 0 && (
            <div className="mb-6 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-200">
                    Maintenance Alerts
                  </h3>
                  <p className="text-sm text-yellow-300/80">
                    {maintenanceDueCount} item(s) require maintenance attention
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
                      Category
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
                        colSpan="8"
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
                        colSpan="8"
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
                    paginationData.currentItems.map((item) => (
                      <InventoryRow
                        key={item._id}
                        item={item}
                        onEdit={openEdit}
                        onMaintenance={openMaintenanceModal}
                        onViewHistory={viewMaintenanceHistory}
                        onDelete={deleteItem}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {inventory.length > 0 && !loading && (
            <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Results info */}
                <div className="text-sm text-gray-400">
                  Showing {paginationData.startIndex + 1} to{" "}
                  {paginationData.endIndex} of {paginationData.totalItems} items
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  {/* First page */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {(() => {
                      const pages = [];
                      const totalPages = paginationData.totalPages;
                      const maxVisiblePages = 5;

                      let startPage = Math.max(
                        1,
                        currentPage - Math.floor(maxVisiblePages / 2)
                      );
                      let endPage = Math.min(
                        totalPages,
                        startPage + maxVisiblePages - 1
                      );

                      // Adjust start if we're near the end
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }

                      // Add first page and ellipsis if needed
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => goToPage(1)}
                            className="px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span
                              key="ellipsis-start"
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                      }

                      // Add visible page numbers
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                              currentPage === i
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-gray-700 hover:bg-gray-600 text-white"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Add ellipsis and last page if needed
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span
                              key="ellipsis-end"
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => goToPage(totalPages)}
                            className="px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === paginationData.totalPages}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === paginationData.totalPages}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

        <EditInventoryModal
          editingItem={editingItem}
          saving={saving}
          onClose={closeEdit}
          onSave={saveEdit}
          onChange={handleEditChange}
          onImageChange={handleImageChange}
          onImageRemove={removeEditingImage}
          error={error}
          units={units}
          categories={categories}
        />

        <DeleteConfirmModal
          isOpen={!!confirmDeleteId}
          deleting={deleting}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

        <MaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={closeMaintenanceModal}
          onSuccess={handleMaintenanceSuccess}
          item={selectedItemForMaintenance}
        />

        <MaintenanceHistoryModal
          maintenanceHistory={
            showMaintenanceHistory ? maintenanceHistory : null
          }
          onClose={closeMaintenanceHistory}
        />
      </div>
    </Layout>
  );
};

export default Inventory;
