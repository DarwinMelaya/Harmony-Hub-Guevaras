import InventoryCard from "../../../User/Dashboard/InventoryCard";
import PackagesCard from "../../../User/Dashboard/PackagesCard";
import ArtistCard from "../../../User/Dashboard/ArtistCard";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AddItemModal = ({
  isOpen,
  onClose,
  selectedBooking,
  addItemTab,
  onTabChange,
  inventoryOptions,
  packageOptions,
  artistOptions,
  loadingAddOptions,
  onAddItem,
  isSaving,
}) => {
  if (!isOpen || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add Item to Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Add additional inventory, package, or band/artist to this booking
          based on the customer&apos;s request. You can quickly pick from
          existing items below.
        </p>
        <div className="grid grid-cols-1 gap-6">
          {/* Browse existing items using the same cards as customer view */}
          <div>
            <div className="flex gap-2 mb-3">
              {["inventory", "package", "bandArtist"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    addItemTab === tab
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {tab === "inventory"
                    ? "Inventory"
                    : tab === "package"
                    ? "Packages"
                    : "Band / Artists"}
                </button>
              ))}
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 max-h-96 overflow-y-auto space-y-3">
              {loadingAddOptions ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : addItemTab === "inventory" ? (
                inventoryOptions.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No inventory items found. Adjust filters in the inventory
                    section if needed.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inventoryOptions.map((item) => (
                      <InventoryCard
                        key={item._id}
                        item={item}
                        onAdd={(inv) => onAddItem(inv, "inventory")}
                      />
                    ))}
                  </div>
                )
              ) : addItemTab === "package" ? (
                packageOptions.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No packages found. Create packages in the packages section
                    first.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {packageOptions.map((pkg) => (
                      <PackagesCard
                        key={pkg._id}
                        pkg={pkg}
                        onAdd={(p) => onAddItem(p, "package")}
                      />
                    ))}
                  </div>
                )
              ) : artistOptions.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No artists found. Make sure artists are registered and active.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {artistOptions.map((artist) => (
                    <ArtistCard
                      key={artist._id}
                      artist={artist}
                      bookingDate={formatDate(selectedBooking.bookingDate)}
                      artistAvailability={{}}
                      checkingAvailability={false}
                      onAdd={(a) => onAddItem(a, "bandArtist")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;

