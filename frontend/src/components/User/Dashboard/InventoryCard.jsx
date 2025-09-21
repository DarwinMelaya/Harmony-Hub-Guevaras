import { ShoppingCart, Heart, Eye } from "lucide-react";

const InventoryCard = ({ item, onAdd }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group flex flex-col">
      <div className="relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            id={`${item._id}-img-inv`}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-700 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-500" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full">
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>
        {item.quantity === 0 && (
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 font-bold text-lg">
            ₱{Number(item.price).toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm">{item.quantity} left</span>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onAdd(item, `${item._id}-img-inv`)}
            disabled={item.quantity === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
