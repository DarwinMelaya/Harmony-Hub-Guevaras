const ExtensionPaymentModal = ({
  isOpen,
  onClose,
  selectedExtension,
  extensionPaymentProof,
  onProofChange,
  onConfirm,
  isProcessing,
  error,
}) => {
  if (!isOpen || !selectedExtension) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Mark Extension as Paid
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
        {error && (
          <div className="mb-4 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700">
            {error}
          </div>
        )}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-white font-semibold text-lg">
            ₱
            {Number(selectedExtension.extension.amount || 0).toLocaleString()}
          </p>
          <p className="text-gray-300 text-sm">
            {selectedExtension.extension.description || "Extension charge"}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Payment Method:{" "}
            <span className="capitalize">
              {selectedExtension.extension.paymentMethod || "cash"}
            </span>
          </p>
        </div>
        {selectedExtension.extension.paymentMethod === "gcash" && (
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">
              Upload Payment Proof <span className="text-red-400">*</span>
            </label>
            {extensionPaymentProof && (
              <div className="mb-2">
                <img
                  src={extensionPaymentProof}
                  alt="Payment proof"
                  className="w-full h-48 object-contain rounded border border-gray-600"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onProofChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <p className="text-gray-400 text-xs mt-1">
              Required for GCash payments.
            </p>
          </div>
        )}
        {selectedExtension.extension.paymentMethod === "cash" && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
            Confirm that cash has been collected for this extension charge. You
            may optionally upload proof if needed.
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {isProcessing ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPaymentModal;

