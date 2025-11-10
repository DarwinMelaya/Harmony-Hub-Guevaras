import { useState } from "react";
import { ShoppingCart, Package, Music, X, Plus, Minus } from "lucide-react";

const CartModal = ({
  showCart,
  setShowCart,
  cart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  clearCart,
  setShowBookingModal,
}) => {
  return (
    <>
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700/50">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">My Selections</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">
                    Your selection is empty
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                          {item.type === "inventory" && (
                            <ShoppingCart className="w-6 h-6 text-gray-300" />
                          )}
                          {item.type === "package" && (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                          {item.type === "bandArtist" && (
                            <Music className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {item.type === "inventory" && item.category && (
                              <span className="inline-block px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                {item.category.name}
                              </span>
                            )}
                            <p className="text-gray-400 text-sm">
                              {item.type === "bandArtist" &&
                                item.genre &&
                                `Genre: ${item.genre}`}
                              {item.type === "package" && "Service Package"}
                              {item.type === "inventory" &&
                                "Musical Instrument"}
                            </p>
                          </div>
                          <p className="text-blue-400 font-bold mt-1">
                            ₱{Number(item.price).toLocaleString()}
                            {item.type === "inventory" && item.unit && (
                              <span className="text-gray-400 text-xs ml-1">
                                / {item.unit.symbol}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.type,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.type === "package" ||
                              item.type === "bandArtist"
                            }
                            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-medium w-8 text-center">
                            {item.type === "package" ||
                            item.type === "bandArtist"
                              ? 1
                              : item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.type,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.type === "package" ||
                              item.type === "bandArtist"
                            }
                            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.type)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-green-400">
                    ₱{Number(getCartTotal()).toLocaleString()}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowBookingModal(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-medium transition-colors"
                  >
                    Proceed to Book
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CartModal;
