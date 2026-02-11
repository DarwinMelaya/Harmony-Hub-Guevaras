import { memo } from "react";

const DeleteConfirmModal = memo(({ 
  isOpen, 
  deleting, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      ></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm text-white">
        <h3 className="text-lg font-semibold mb-2">Delete Inventory</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded border border-red-500 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;

