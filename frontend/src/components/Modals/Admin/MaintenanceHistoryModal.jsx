import { memo } from "react";
import { History } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const capitalizeStatus = (status) => {
  if (!status) return "N/A";
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const MaintenanceHistoryModal = memo(({ 
  maintenanceHistory, 
  onClose 
}) => {
  if (!maintenanceHistory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-4xl m-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Maintenance History - {maintenanceHistory.item.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        {maintenanceHistory.history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No maintenance history available</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {maintenanceHistory.history
              .slice()
              .reverse()
              .map((record, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-600/90 text-purple-100 border border-purple-500/50">
                        {capitalizeStatus(record.type)}
                      </span>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(record.date)}
                      </p>
                    </div>
                    {record.cost > 0 && (
                      <span className="text-green-400 font-medium">
                        ₱{Number(record.cost).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">
                    {record.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>By: {record.performedBy}</span>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      {record.notes}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

MaintenanceHistoryModal.displayName = 'MaintenanceHistoryModal';

export default MaintenanceHistoryModal;

