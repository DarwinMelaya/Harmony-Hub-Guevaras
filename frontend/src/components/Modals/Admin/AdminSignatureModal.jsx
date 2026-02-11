import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, FileText, CheckCircle, AlertTriangle, Edit } from "lucide-react";

const AdminSignatureModal = ({ isOpen, onClose, booking, onSign }) => {
  const [signature, setSignature] = useState(null);
  const [signerName, setSignerName] = useState("");
  const [showError, setShowError] = useState("");
  const [signing, setSigning] = useState(false);
  const sigCanvas = useRef(null);

  // Technical staff state
  const [technicalStaff, setTechnicalStaff] = useState({
    count: booking?.technicalStaff?.count || 6,
    drivers: booking?.technicalStaff?.drivers || 2,
    totalCrew: booking?.technicalStaff?.totalCrew || 8,
    vehicles: booking?.technicalStaff?.vehicles || 1,
  });

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignature(null);
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      setShowError("Please provide your signature before continuing");
      return;
    }
    setSignature(sigCanvas.current.toDataURL());
    setShowError("");
  };

  const handleSign = async () => {
    if (!signerName.trim()) {
      setShowError("Please enter the signer's name");
      return;
    }

    if (!signature) {
      setShowError("Please provide your signature");
      return;
    }

    setSigning(true);
    setShowError("");

    try {
      await onSign({
        adminSignature: signature,
        adminSignerName: signerName,
        technicalStaff,
      });
      onClose();
    } catch (error) {
      setShowError(error.message || "Failed to sign agreement");
    } finally {
      setSigning(false);
    }
  };

  const handleTechnicalStaffChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setTechnicalStaff((prev) => {
      const updated = { ...prev, [field]: numValue };
      // Auto-calculate totalCrew if count or drivers changed
      if (field === "count" || field === "drivers") {
        updated.totalCrew = updated.count + updated.drivers;
      }
      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-3xl w-full max-h-[95vh] overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              Admin Sign Agreement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Booking Summary */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <h3 className="text-white font-bold mb-3">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Client:</p>
                <p className="text-white font-medium">
                  {booking?.user?.fullName || booking?.user?.username}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Booking Date:</p>
                <p className="text-white">
                  {new Date(booking?.bookingDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Total Amount:</p>
                <p className="text-green-400 font-bold">
                  ₱{Number(booking?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Status:</p>
                <p className="text-white capitalize">{booking?.status}</p>
              </div>
            </div>
          </div>

          {/* Client Signature Status */}
          {booking?.agreement?.signature && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">
                  Client has signed the agreement
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                Signed by: {booking.agreement.clientName || "Client"}
              </p>
              <p className="text-gray-400 text-xs">
                On:{" "}
                {new Date(booking.agreement.agreedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Technical Staff Configuration */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <div className="flex items-center mb-4">
              <Edit className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-white font-bold">
                Technical Staff & Transport Vehicle
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Technical Staff Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={technicalStaff.count}
                  onChange={(e) =>
                    handleTechnicalStaffChange("count", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Drivers
                </label>
                <input
                  type="number"
                  min="0"
                  value={technicalStaff.drivers}
                  onChange={(e) =>
                    handleTechnicalStaffChange("drivers", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Total Crew (Auto-calculated)
                </label>
                <input
                  type="number"
                  value={technicalStaff.totalCrew}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Transport Vehicles
                </label>
                <input
                  type="number"
                  min="0"
                  value={technicalStaff.vehicles}
                  onChange={(e) =>
                    handleTechnicalStaffChange("vehicles", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Signer Name */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Signer Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name (e.g., AMAYA SANTOS)"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              This name will appear on the signed agreement
            </p>
          </div>

          {/* Signature Section */}
          <div className="bg-gray-700/50 rounded-lg p-5 border border-gray-600">
            <h4 className="text-white font-bold mb-4 text-center bg-gray-600 py-2 rounded">
              ADMIN/PROPRIETOR SIGNATURE
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              By signing below, you confirm that you have reviewed and approved
              this booking agreement:
            </p>

            {!signature ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg border-2 border-gray-600 overflow-hidden">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: "w-full h-48 cursor-crosshair",
                    }}
                    backgroundColor="white"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Signature
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white rounded-lg border-2 border-green-600 p-4">
                  <img
                    src={signature}
                    alt="Signature"
                    className="w-full h-32 object-contain"
                  />
                </div>
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Signature captured successfully</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSignature(null);
                    sigCanvas.current.clear();
                  }}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Change Signature
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {showError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700 text-red-300 rounded-lg text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {showError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={signing}
              className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSign}
              disabled={signing || !signature || !signerName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {signing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Sign Agreement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignatureModal;

