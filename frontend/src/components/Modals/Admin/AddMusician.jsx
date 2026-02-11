import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";

const AddMusician = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    genre: "",
    booking_fee: "",
    isActive: true,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: "artist",
          genre: formData.genre,
          booking_fee: parseFloat(formData.booking_fee),
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add musician");
      }

      // Reset form and close modal
      setFormData({ 
        name: "", 
        email: "",
        username: "",
        password: "",
        genre: "", 
        booking_fee: "", 
        isActive: true 
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Error adding musician:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      name: "", 
      email: "",
      username: "",
      password: "",
      genre: "", 
      booking_fee: "", 
      isActive: true 
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700/50 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          Add New Musician
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genre
            </label>
            <input
              type="text"
              required
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="e.g., Rock, Jazz, Pop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Booking Fee ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.booking_fee}
              onChange={(e) =>
                setFormData({ ...formData, booking_fee: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.isActive ? "available" : "not-available"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "available",
                })
              }
              className="w-full px-3 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
            >
              <option value="available">Available</option>
              <option value="not-available">Not Available</option>
            </select>
          </div>

          {/* Error Display */}
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
              {loading ? "Adding..." : "Add Musician"}
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

export default AddMusician;
