const RemainingBalanceModal = ({
  isOpen,
  onClose,
  selectedBooking,
  balanceAmount,
  onBalanceAmountChange,
  onSubmit,
}) => {
  if (!isOpen || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Collect Remaining Balance
        </h2>
        <div className="mb-6">
          <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 mb-4">
            <p className="text-orange-300 text-sm mb-2">
              This booking has a remaining balance that must be collected before
              marking as completed.
            </p>
            <p className="text-white font-bold text-lg">
              Remaining Balance: ₱
              {Number(selectedBooking.remainingBalance).toLocaleString()}
            </p>
          </div>

          <label className="block text-gray-300 mb-2">
            Enter Collected Amount <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={balanceAmount}
            onChange={(e) => onBalanceAmountChange(e.target.value)}
            placeholder="Enter exact amount collected"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-400 text-sm mt-2">
            Please enter the exact remaining balance amount to confirm
            collection.
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
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Confirm Collection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemainingBalanceModal;

