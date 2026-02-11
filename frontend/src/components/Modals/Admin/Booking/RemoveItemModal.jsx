const RemoveItemModal = ({
  isOpen,
  onClose,
  itemToRemove,
  onConfirm,
  isRemoving,
}) => {
  if (!isOpen || !itemToRemove) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">
          Remove Item from Booking
        </h2>
        <p className="text-gray-300 mb-4">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-white">{itemToRemove.name}</span>{" "}
          from this booking?
        </p>
        <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 mb-4 text-sm text-gray-300">
          <p>
            <span className="font-semibold">Quantity:</span> {itemToRemove.quantity}
          </p>
          <p>
            <span className="font-semibold">Subtotal:</span> ₱
            {Number(
              (itemToRemove.price || 0) * (itemToRemove.quantity || 0)
            ).toLocaleString()}
          </p>
        </div>
        <p className="text-yellow-300 text-xs mb-6">
          This will update the booking total and remaining balance accordingly
          and restore inventory/package availability for this item.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRemoving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {isRemoving ? "Removing..." : "Remove Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveItemModal;

