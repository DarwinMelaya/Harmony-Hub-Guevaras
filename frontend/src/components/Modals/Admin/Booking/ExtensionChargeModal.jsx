const ExtensionChargeModal = ({
  isOpen,
  onClose,
  extensionForm,
  onFieldChange,
  onSubmit,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add Extension Charge</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Record additional hours rendered and charge the appropriate amount.
          Leave the amount blank to automatically compute from hours × rate.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Additional Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={extensionForm.hours}
                onChange={(e) => onFieldChange("hours", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Rate per Hour (₱)
              </label>
              <input
                type="number"
                min="0"
                value={extensionForm.rate}
                onChange={(e) => onFieldChange("rate", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Total Amount (₱)
            </label>
            <input
              type="number"
              min="0"
              value={extensionForm.amount}
              onChange={(e) => onFieldChange("amount", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Auto-compute if left blank"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Payment Method
            </label>
            <select
              value={extensionForm.paymentMethod}
              onChange={(e) => onFieldChange("paymentMethod", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Notes</label>
            <textarea
              rows="3"
              value={extensionForm.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Add optional details about the extension..."
            ></textarea>
          </div>
          {extensionForm.hours && extensionForm.rate && (
            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg text-blue-200 text-sm">
              Estimated amount based on hours × rate: ₱
              {(
                Number(extensionForm.hours || 0) *
                Number(extensionForm.rate || 0)
              ).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {isSaving ? "Saving..." : "Add Charge"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionChargeModal;

