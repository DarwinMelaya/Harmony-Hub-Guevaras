import { Package, Heart, Star } from "lucide-react";

const PackagesCard = ({ pkg, onAdd }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 group flex flex-col">
      <div className="relative">
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.name}
            id={`${pkg._id}-img-pkg`}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-700 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-500" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full">
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>
        {!pkg.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
              Unavailable
            </span>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-white mb-2 text-lg group-hover:text-green-400 transition-colors min-h-[1.75rem]">
          {pkg.name}
        </h3>
        {pkg.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {pkg.description}
          </p>
        )}

        {pkg.items && pkg.items.length > 0 && (
          <div className="mb-4">
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Includes:
            </h4>
            <div className="space-y-1">
              {pkg.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-300"
                >
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                  {item.inventoryItem?.name} (x{item.quantity})
                </div>
              ))}
              {pkg.items.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{pkg.items.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-green-400 font-bold text-xl">
            ₱{Number(pkg.price).toLocaleString()}
          </span>
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm">4.8</span>
          </div>
        </div>

        <button
          onClick={() => onAdd(pkg, `${pkg._id}-img-pkg`)}
          disabled={!pkg.isAvailable}
          className="mt-auto w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors"
        >
          {pkg.isAvailable ? "Add to Selection" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default PackagesCard;
