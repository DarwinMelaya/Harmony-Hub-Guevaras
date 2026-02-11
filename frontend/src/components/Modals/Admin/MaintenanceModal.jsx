import { useState } from "react";
import { Wrench, AlertCircle, X } from "lucide-react";
import axios from "axios";

const MaintenanceModal = ({ isOpen, onClose, onSuccess, item }) => {
  const [formData, setFormData] = useState({
    type: "routine",
    description: "",
    performedBy: "",
    cost: "",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/inventory/${item._id}/maintenance`,
        {
          type: formData.type,
          description: formData.description,
          performedBy: formData.performedBy,
          cost: formData.cost || 0,
          notes: formData.notes,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormData({
        type: "routine",
        description: "",
        performedBy: "",
        cost: "",
        notes: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: "routine",
      description: "",
      performedBy: "",
      cost: "",
      notes: "",
    });
    setError(null);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl mx-4 my-8 border border-gray-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-green-400" />
            Log Maintenance - {item.name}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maintenance Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all duration-200"
            >
              <option value="routine">Routine Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="cleaning">Cleaning</option>
              <option value="calibration">Calibration</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Describe the maintenance performed..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Performed By *
            </label>
            <input
              type="text"
              required
              value={formData.performedBy}
              onChange={(e) =>
                setFormData({ ...formData, performedBy: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Enter technician name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cost (₱)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="2"
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Any additional notes or observations..."
            />
          </div>
          {error && (
            <div className="bg-red-900/50 backdrop-blur-sm text-red-100 px-3 py-2 rounded-lg border border-red-700/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-green-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Logging..."
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  Log Maintenance
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500/30"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
