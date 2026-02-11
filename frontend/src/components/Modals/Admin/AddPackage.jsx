import { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import axios from "axios";

const AddPackage = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    items: [],
    image: "",
  });
  const [inventory, setInventory] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch available inventory for selection
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(res.data.data || res.data.inventory || []);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };
    if (isOpen) fetchInventory();
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { inventoryItem: "", quantity: 1 }],
    }));
  };

  const removeItemRow = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/packages", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData({
        name: "",
        description: "",
        price: "",
        items: [],
        image: "",
      });
      setImagePreview(null);
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
      description: "",
      price: "",
      items: [],
      image: "",
    });
    setImagePreview(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-6">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 w-full max-w-lg mx-4 border border-gray-700/50 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
          <Plus className="w-5 h-5 text-blue-400" />
          Add New Package
        </h2>
        <div className="overflow-y-auto -mr-2 pr-2 hide-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Package Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white"
                placeholder="Enter package name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white"
                placeholder="Enter package description"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (₱)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white"
                placeholder="0.00"
              />
            </div>

            {/* Items Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Items in Package
              </label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 mb-2">
                  <select
                    required
                    value={item.inventoryItem}
                    onChange={(e) =>
                      handleItemChange(index, "inventoryItem", e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white"
                  >
                    <option value="">Select Item</option>
                    {inventory.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.name} (₱{inv.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="w-24 px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="px-2 bg-red-600/80 rounded-lg text-white hover:bg-red-700/90"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItemRow}
                className="mt-2 px-3 py-1 bg-blue-600/80 rounded-lg text-white hover:bg-blue-700/90"
              >
                + Add Item
              </button>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Package Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-24 rounded border border-gray-600"
                />
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/50 text-red-100 px-3 py-2 rounded-lg border border-red-700/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 pb-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Package"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-600/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPackage;
