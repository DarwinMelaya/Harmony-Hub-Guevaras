import { memo } from "react";

const EditInventoryModal = memo(({ 
  editingItem, 
  saving, 
  onClose, 
  onSave, 
  onChange,
  onImageChange,
  error 
}) => {
  if (!editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl text-white m-4">
        <h3 className="text-lg font-semibold mb-4">Edit Inventory</h3>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editingItem.name || ""}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={editingItem.price ?? ""}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={editingItem.quantity ?? ""}
              onChange={(e) => onChange({ quantity: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Condition
              </label>
              <select
                value={editingItem.condition || "excellent"}
                onChange={(e) => onChange({ condition: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="needs-repair">Needs Repair</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Status
              </label>
              <select
                value={editingItem.status || "available"}
                onChange={(e) => onChange({ status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="under-maintenance">
                  Under Maintenance
                </option>
                <option value="needs-repair">Needs Repair</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Maintenance Interval (days)
            </label>
            <input
              type="number"
              min="1"
              value={editingItem.maintenanceIntervalDays ?? 90}
              onChange={(e) => onChange({ maintenanceIntervalDays: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Notes
            </label>
            <textarea
              value={editingItem.notes || ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Image
            </label>
            {editingItem.image && (
              <div className="mb-2">
                <img
                  src={editingItem.image}
                  alt="preview"
                  className="h-20 w-20 object-cover rounded border border-gray-700"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded border border-blue-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
});

EditInventoryModal.displayName = 'EditInventoryModal';

export default EditInventoryModal;

