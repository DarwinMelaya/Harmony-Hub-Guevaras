const RefundProcessingModal = ({
  isOpen,
  onClose,
  selectedBooking,
  refundProof,
  refundProofPreview,
  onRefundProofChange,
  onProcess,
  isProcessing,
  error,
}) => {
  if (!isOpen || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Process Refund</h2>
        <p className="text-gray-300 mb-4">
          {selectedBooking.paymentMethod === "gcash"
            ? "Please upload proof of refund for GCash payment."
            : "Mark this refund as processed for cash payment."}
        </p>
        {error && (
          <div className="mb-4 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700">
            {error}
          </div>
        )}
        {selectedBooking.paymentMethod === "gcash" && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              Refund Proof <span className="text-red-400">*</span>
            </label>
            {refundProofPreview && (
              <div className="mb-3">
                <img
                  src={refundProofPreview}
                  alt="Refund proof preview"
                  className="w-full h-48 object-contain rounded-lg border border-gray-600"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onRefundProofChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-gray-400 text-xs mt-2">
              Upload a screenshot or image of the refund transaction
            </p>
          </div>
        )}
        <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-300 text-sm">
            <strong>Refund Amount:</strong> ₱
            {Number(selectedBooking.refundAmount).toLocaleString()}
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProcess}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {isProcessing
              ? "Processing..."
              : selectedBooking.paymentMethod === "gcash"
              ? "Upload & Process"
              : "Mark as Refunded"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundProcessingModal;

