import { useState, useEffect } from "react";
import { Plus, AlertCircle, ImagePlus, X } from "lucide-react";
import axios from "axios";

const AddInventory = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
    category: "",
    images: [],
    condition: "excellent",
    status: "available",
    maintenanceIntervalDays: "90",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const MAX_IMAGES = 5;

  // Fetch units and categories when modal opens
  useEffect(() => {
    const fetchOptions = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingOptions(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [unitsRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/units", { headers }),
          axios.get("http://localhost:5000/api/categories", { headers }),
        ]);

        setUnits(unitsRes.data.data || unitsRes.data.units || []);
        setCategories(categoriesRes.data.data || categoriesRes.data.categories || []);
      } catch (err) {
        console.error("Error fetching options:", err);
        setError("Failed to load units and categories");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen]);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_IMAGES - formData.images.length;
    const filesToProcess = files.slice(0, availableSlots);

    try {
      const base64Images = await Promise.all(
        filesToProcess.map((file) => readFileAsBase64(file))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));
    } catch (readErr) {
      console.error("Failed to read image file:", readErr);
      setError("Failed to read one of the selected images.");
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      updated.splice(index, 1);
      return { ...prev, images: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        price: formData.price,
        quantity: formData.quantity,
        images: formData.images,
        condition: formData.condition,
        status: formData.status,
        maintenanceIntervalDays: formData.maintenanceIntervalDays,
        notes: formData.notes,
      };

      // Only include unit and category if they're selected
      if (formData.unit) payload.unit = formData.unit;
      if (formData.category) payload.category = formData.category;

      const response = await axios.post(
        "http://localhost:5000/api/inventory",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormData({
        name: "",
        price: "",
        quantity: "",
        unit: "",
        category: "",
        images: [],
        condition: "excellent",
        status: "available",
        maintenanceIntervalDays: "90",
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
      name: "",
      price: "",
      quantity: "",
      unit: "",
      category: "",
      images: [],
      condition: "excellent",
      status: "available",
      maintenanceIntervalDays: "90",
      notes: "",
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl mx-4 my-8 border border-gray-700/50 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          Add New Inventory
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Enter inventory name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (₱)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
                disabled={loadingOptions}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
                disabled={loadingOptions}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Images
              </label>
              <span className="text-xs text-gray-400">
                {formData.images.length}/{MAX_IMAGES}
              </span>
            </div>
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-700/80 border border-dashed border-gray-500 rounded-lg text-sm text-gray-300 cursor-pointer hover:border-blue-500 hover:text-blue-300 transition-colors">
              <ImagePlus className="w-4 h-4" />
              <span>Add Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
                disabled={formData.images.length >= MAX_IMAGES}
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Upload up to {MAX_IMAGES} images. The first image will be the
              primary display photo.
            </p>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {formData.images.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="relative group rounded-lg overflow-hidden border border-gray-600"
                  >
                    <img
                      src={img}
                      alt={`Inventory preview ${idx + 1}`}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 text-white transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-blue-600/80 px-2 py-0.5 rounded-full text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="needs-repair">Needs Repair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="under-maintenance">Under Maintenance</option>
                <option value="needs-repair">Needs Repair</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maintenance Interval (days)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.maintenanceIntervalDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maintenanceIntervalDays: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="90"
            />
            <p className="text-xs text-gray-400 mt-1">
              How often maintenance should be performed (default: 90 days)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Additional notes or specifications..."
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
              className="flex-1 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30"
            >
              {loading ? "Adding..." : "Add Inventory"}
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

export default AddInventory;
