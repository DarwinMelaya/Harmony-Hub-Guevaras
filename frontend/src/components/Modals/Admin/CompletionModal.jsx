import { X, CheckCircle, AlertTriangle } from "lucide-react";

const CompletionModal = ({
  isOpen,
  onClose,
  selectedBooking,
  onCompletionSubmit,
  completionStep,
  setCompletionStep,
  issueType,
  setIssueType,
  selectedItems,
  setSelectedItems,
}) => {
  const toggleItemSelection = (itemName) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSubmit = () => {
    if (completionStep === "confirm") {
      onCompletionSubmit();
    } else if (completionStep === "details") {
      const issueData = {
        issueType,
        affectedItems: selectedItems,
      };
      onCompletionSubmit(issueData);
    }
  };

  if (!isOpen || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-700/50">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Complete Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {completionStep === "confirm" && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Booking Completion
                </h3>
                <p className="text-gray-300">
                  Are there no issues with the booked items?
                </p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Booking Summary
                </h4>
                <div className="space-y-2">
                  {selectedBooking.items.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-300">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-white font-medium">
                          ₱{Number(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Show package items if this is a package */}
                      {item.type === "package" &&
                        item.itemId &&
                        item.itemId.items && (
                          <div className="ml-4 space-y-1">
                            {item.itemId.items.map((packageItem, pIndex) => (
                              <div
                                key={pIndex}
                                className="flex justify-between items-center py-1 text-sm"
                              >
                                <span className="text-gray-400">
                                  •{" "}
                                  {packageItem.inventoryItem?.name ||
                                    "Unknown Item"}{" "}
                                  x{packageItem.quantity}
                                </span>
                                <span className="text-gray-400">
                                  ₱
                                  {Number(
                                    packageItem.inventoryItem?.price *
                                      packageItem.quantity || 0
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setCompletionStep("details")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issues
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  No Issues
                </button>
              </div>
            </div>
          )}

          {completionStep === "details" && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Report Issues
                </h3>
                <p className="text-gray-300">
                  Please specify the type of issue and select affected items
                </p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Issue Type
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="issueType"
                      value="lost"
                      checked={issueType === "lost"}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="mr-3 text-red-600"
                    />
                    <span className="text-white">Lost Items</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="issueType"
                      value="damaged"
                      checked={issueType === "damaged"}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="mr-3 text-red-600"
                    />
                    <span className="text-white">Damaged Items</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Affected Items
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedBooking.items.map((item, i) => (
                    <div key={i} className="space-y-2">
                      {/* Main item */}
                      <label className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.name)}
                          onChange={() => toggleItemSelection(item.name)}
                          className="text-red-600"
                        />
                        <div className="flex-1">
                          <span className="text-white font-medium">
                            {item.name}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="text-green-400 font-medium">
                          ₱{Number(item.price * item.quantity).toLocaleString()}
                        </span>
                      </label>

                      {/* Package items if this is a package */}
                      {item.type === "package" &&
                        item.itemId &&
                        item.itemId.items && (
                          <div className="ml-6 space-y-1">
                            <p className="text-gray-400 text-xs font-medium mb-1">
                              Package Contents:
                            </p>
                            {item.itemId.items.map((packageItem, pIndex) => {
                              const packageItemName = `${item.name} - ${
                                packageItem.inventoryItem?.name ||
                                "Unknown Item"
                              }`;
                              return (
                                <label
                                  key={pIndex}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded cursor-pointer bg-gray-600/50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.includes(
                                      packageItemName
                                    )}
                                    onChange={() =>
                                      toggleItemSelection(packageItemName)
                                    }
                                    className="text-red-600"
                                  />
                                  <div className="flex-1">
                                    <span className="text-gray-300 text-sm">
                                      {packageItem.inventoryItem?.name ||
                                        "Unknown Item"}
                                    </span>
                                    <span className="text-gray-400 text-xs ml-2">
                                      x{packageItem.quantity}
                                    </span>
                                  </div>
                                  <span className="text-green-400 text-sm font-medium">
                                    ₱
                                    {Number(
                                      packageItem.inventoryItem?.price *
                                        packageItem.quantity || 0
                                    ).toLocaleString()}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!issueType || selectedItems.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Submit Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
