const CancellationModal = ({
  isOpen,
  onClose,
  selectedBooking,
  cancellationReason,
  onCancellationReasonChange,
  onConfirm,
  isCancelling,
  error,
}) => {
  if (!isOpen || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Cancel Booking</h2>
        <p className="text-gray-300 mb-4">
          Please provide a reason for cancelling this booking.
        </p>
        {selectedBooking.paymentMethod === "gcash" && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> A refund of ₱
              {Number(
                selectedBooking.downpaymentAmount ||
                  selectedBooking.totalAmount ||
                  0
              ).toLocaleString()}{" "}
              will be processed for this cancellation.
            </p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">
            Cancellation Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => onCancellationReasonChange(e.target.value)}
            placeholder="Please provide a reason for cancelling this booking..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows="4"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;

