import { useState, useEffect } from "react";
import { X, DollarSign, Save, AlertCircle } from "lucide-react";

const EditBookingFee = ({ isOpen, onClose, onSuccess, currentFee }) => {
  const [bookingFee, setBookingFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && currentFee !== undefined) {
      setBookingFee(currentFee.toString());
      setError(null);
    }
  }, [isOpen, currentFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingFee || bookingFee.trim() === "") {
      setError("Booking fee is required");
      return;
    }

    const fee = parseFloat(bookingFee);
    if (isNaN(fee) || fee < 0) {
      setError("Booking fee must be a valid positive number");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/users/profile/booking-fee",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ booking_fee: fee }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update booking fee");
      }

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
        onClose();
      } else {
        throw new Error(data.message || "Failed to update booking fee");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error updating booking fee:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setBookingFee("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Edit Booking Fee
              </h2>
              <p className="text-sm text-gray-400">
                Update your performance fee
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Current Fee Display */}
            <div className="bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
              <div className="text-sm text-gray-400 mb-1">
                Current Booking Fee
              </div>
              <div className="text-lg font-semibold text-white">
                ₱{currentFee ? currentFee.toLocaleString() : "0"}
              </div>
            </div>

            {/* New Fee Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Booking Fee (PHP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">₱</span>
                </div>
                <input
                  type="number"
                  value={bookingFee}
                  onChange={(e) => setBookingFee(e.target.value)}
                  placeholder="Enter new booking fee"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the amount in Philippine Peso (PHP)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 backdrop-blur-sm text-red-100 px-3 py-2 rounded-lg border border-red-700/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !bookingFee || parseFloat(bookingFee) < 0}
                className="flex-1 px-4 py-3 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Fee
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingFee;
