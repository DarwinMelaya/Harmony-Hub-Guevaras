import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Guitar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getCategoryStyles = (categoryName) => {
  const base = {
    cardBg: "bg-gray-800",
    border: "border-gray-700",
    accentBar:
      "from-blue-500/80 via-purple-500/80 to-pink-500/80",
    pillBg: "bg-purple-600/20",
    pillBorder: "border-purple-500/30",
    pillText: "text-purple-200",
    icon: null,
  };

  if (!categoryName) return base;

  const name = categoryName.toLowerCase();

  // Highlight guitars with a warm, music-shop style
  if (name.includes("guitar")) {
    return {
      ...base,
      accentBar:
        "from-amber-500/90 via-orange-500/90 to-red-500/90",
      pillBg: "bg-amber-500/15",
      pillBorder: "border-amber-300/60",
      pillText: "text-amber-100",
      icon: Guitar,
    };
  }

  // Subtle variations for other common music categories (extend as needed)
  if (name.includes("drum")) {
    return {
      ...base,
      accentBar:
        "from-red-500/80 via-rose-500/80 to-orange-500/80",
      pillBg: "bg-red-500/10",
      pillBorder: "border-red-400/40",
      pillText: "text-red-100",
    };
  }

  if (name.includes("keyboard") || name.includes("piano")) {
    return {
      ...base,
      accentBar:
        "from-sky-500/80 via-cyan-500/80 to-emerald-500/80",
      pillBg: "bg-sky-500/10",
      pillBorder: "border-sky-400/40",
      pillText: "text-sky-100",
    };
  }

  return base;
};

const InventoryCard = ({
  item,
  onAdd,
  availableQuantity,
  isBlockedByPackage = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const categoryName = item.category?.name;
  const categoryStyles = getCategoryStyles(categoryName);
  const CategoryIcon = categoryStyles.icon;
  const imageSources =
    item.images?.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];
  const activeImage =
    imageSources.length > 0 ? imageSources[currentImageIndex] : null;
  const displayQuantity =
    availableQuantity !== undefined
      ? availableQuantity
      : item.quantity ?? 0;
  const isOutOfStock = displayQuantity <= 0;
  const isDisabled = isOutOfStock || isAdding || isBlockedByPackage;

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item._id, imageSources.length]);

  useEffect(() => {
    if (showViewModal) {
      setModalImageIndex(0);
    }
  }, [showViewModal]);

  const showPrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageSources.length - 1 : prev - 1
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageSources.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddSelection = async () => {
    if (isDisabled) return;
    setIsAdding(true);
    try {
      await onAdd(item, `${item._id}-img-inv`);
    } finally {
      setIsAdding(false);
    }
  };

  const showPrevModalImage = () => {
    setModalImageIndex((prev) =>
      prev === 0 ? imageSources.length - 1 : prev - 1
    );
  };

  const showNextModalImage = () => {
    setModalImageIndex((prev) =>
      prev === imageSources.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all duration-200 group flex flex-col hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 ${categoryStyles.cardBg} ${categoryStyles.border}`}
    >
      {categoryName && (
        <div className="bg-gradient-to-r text-white px-3 py-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase shadow-inner">
          <div className={`flex items-center gap-2 bg-black/20 px-2 py-1 rounded-full`}>
            {CategoryIcon && (
              <CategoryIcon className="w-4 h-4 drop-shadow-sm" />
            )}
            <span className="drop-shadow-sm">{categoryName}</span>
          </div>
        </div>
      )}
      <div className="relative">
        {activeImage ? (
          <img
            src={activeImage}
            alt={item.name}
            id={`${item._id}-img-inv`}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-700 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-500" />
          </div>
        )}
        {imageSources.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevImage}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
              {currentImageIndex + 1}/{imageSources.length}
            </div>
          </>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full">
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors min-h-[2.5rem]">
          {item.name}
        </h3>
        {item.category && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border ${categoryStyles.pillBg} ${categoryStyles.pillBorder} ${categoryStyles.pillText}`}
            >
              {CategoryIcon && (
                <CategoryIcon className="w-3 h-3 opacity-90" />
              )}
              {categoryName}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 font-bold text-lg">
            ₱{Number(item.price).toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm">
            {displayQuantity} {item.unit ? item.unit.symbol : "left"}
          </span>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddSelection}
            disabled={isDisabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            {isOutOfStock
              ? "Out of Stock"
              : isBlockedByPackage
              ? "In Selected Package"
              : isAdding
              ? "Adding..."
              : "Add to Selection"}
          </button>
          <button
            onClick={() => setShowViewModal(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
            aria-label="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl bg-gray-900 text-white border border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {item.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Gallery */}
            {imageSources.length > 0 && (
              <div className="relative">
                <div className="w-full h-64 sm:h-80 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={imageSources[modalImageIndex]}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {imageSources.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrevModalImage}
                      className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextModalImage}
                      className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                      {modalImageIndex + 1} / {imageSources.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Price</div>
                <div className="text-2xl font-bold text-green-400">
                  ₱{Number(item.price).toLocaleString()}
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Available Quantity</div>
                <div className="text-2xl font-bold text-white">
                  {displayQuantity} {item.unit ? item.unit.symbol : ""}
                </div>
                {isOutOfStock && (
                  <div className="text-sm text-red-400 mt-1">Out of Stock</div>
                )}
              </div>
            </div>

            {/* Category */}
            {item.category && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Category</div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full border ${categoryStyles.pillBg} ${categoryStyles.pillBorder} ${categoryStyles.pillText}`}
                >
                  {CategoryIcon && (
                    <CategoryIcon className="w-4 h-4 opacity-90" />
                  )}
                  {categoryName}
                </span>
              </div>
            )}

            {/* Description/Notes */}
            {item.notes && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Description</div>
                <div className="text-white text-sm whitespace-pre-wrap">
                  {item.notes}
                </div>
              </div>
            )}

            {/* Unit Info */}
            {item.unit && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Unit</div>
                <div className="text-white">
                  {item.unit.name} ({item.unit.symbol})
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={async () => {
                  setShowViewModal(false);
                  if (!isOutOfStock && onAdd) {
                    await handleAddSelection();
                  }
                }}
                disabled={isOutOfStock || isAdding}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg text-base font-medium transition-colors"
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : isAdding
                  ? "Adding..."
                  : "Add to Selection"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryCard;
