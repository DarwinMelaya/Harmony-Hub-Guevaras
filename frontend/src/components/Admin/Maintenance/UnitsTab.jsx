import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PackageOpen,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const UnitsTab = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch units from backend
  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/units", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch units");
      }

      setUnits(data.units || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching units:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Handle add unit
  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.symbol.trim()) {
      setError("Name and symbol are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add unit");
      }

      setUnits([data.unit, ...units]);
      setShowAddModal(false);
      setFormData({ name: "", symbol: "" });
    } catch (err) {
      setError(err.message);
      console.error("Error adding unit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit unit
  const handleEditUnit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.symbol.trim()) {
      setError("Name and symbol are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/units/${selectedUnit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update unit");
      }

      setUnits(
        units.map((unit) => (unit._id === selectedUnit._id ? data.unit : unit))
      );
      setShowEditModal(false);
      setSelectedUnit(null);
      setFormData({ name: "", symbol: "" });
    } catch (err) {
      setError(err.message);
      console.error("Error updating unit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete unit
  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/units/${unitToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete unit");
      }

      setUnits(units.filter((unit) => unit._id !== unitToDelete._id));
      setShowDeleteModal(false);
      setUnitToDelete(null);
    } catch (err) {
      setError(err.message);
      console.error("Error deleting unit:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (unit) => {
    setUnitToDelete(unit);
    setShowDeleteModal(true);
  };

  // Open edit modal
  const openEditModal = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
    });
    setShowEditModal(true);
    setError(null);
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({ name: "", symbol: "" });
    setShowAddModal(true);
    setError(null);
  };

  // Filter units based on search term
  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Unit Button */}
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Units Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {searchTerm ? "No units found" : "No units yet"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Add your first unit to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 border-b border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Unit Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {filteredUnits.map((unit) => (
                  <tr
                    key={unit._id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {unit.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {unit.symbol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(unit.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(unit)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit unit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(unit)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Units Count */}
      {!loading && filteredUnits.length > 0 && (
        <div className="text-sm text-gray-400">
          Showing {filteredUnits.length} of {units.length} unit
          {units.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Add New Unit</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: "", symbol: "" });
                  setError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddUnit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Kilograms, Pieces, Meters"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  placeholder="e.g., kg, pcs, m"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: "", symbol: "" });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Unit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {showEditModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Edit Unit</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUnit(null);
                  setFormData({ name: "", symbol: "" });
                  setError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditUnit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Kilograms, Pieces, Meters"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  placeholder="e.g., kg, pcs, m"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUnit(null);
                    setFormData({ name: "", symbol: "" });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Unit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && unitToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Delete Unit</h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUnitToDelete(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={deleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete the unit{" "}
                <span className="font-semibold text-white">
                  {unitToDelete.name}
                </span>{" "}
                ({unitToDelete.symbol})?
              </p>
              <p className="text-sm text-gray-400">
                This action cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUnitToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUnit}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Unit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsTab;
