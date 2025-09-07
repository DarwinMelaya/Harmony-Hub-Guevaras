import { X, Calendar, Clock, CheckCircle } from "lucide-react";

const BookingModal = ({
  showBookingModal,
  setShowBookingModal,
  cart,
  getCartTotal,
  bookingData,
  handleBookingDataChange,
  handleBookingSubmit,
  bookingLoading,
  bookingSuccess,
  setBookingSuccess,
}) => {
  return (
    <>
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Complete Your Booking
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleBookingSubmit}
              className="p-6 overflow-y-auto max-h-[70vh]"
            >
              {/* Cart Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Booking Summary
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-gray-300">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-white font-medium">
                        ₱{Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-green-400 font-bold text-lg">
                        ₱{Number(getCartTotal()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Booking Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.bookingDate}
                      onChange={(e) =>
                        handleBookingDataChange("bookingDate", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Booking Time
                    </label>
                    <input
                      type="time"
                      value={bookingData.bookingTime}
                      onChange={(e) =>
                        handleBookingDataChange("bookingTime", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={bookingData.duration}
                    onChange={(e) =>
                      handleBookingDataChange(
                        "duration",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) =>
                      handleBookingDataChange("notes", e.target.value)
                    }
                    rows="3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                {/* Payment Method */}
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Payment Method
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Payment Method
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={bookingData.paymentMethod === "cash"}
                            onChange={(e) =>
                              handleBookingDataChange(
                                "paymentMethod",
                                e.target.value
                              )
                            }
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-white">Cash</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="gcash"
                            checked={bookingData.paymentMethod === "gcash"}
                            onChange={(e) =>
                              handleBookingDataChange(
                                "paymentMethod",
                                e.target.value
                              )
                            }
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-white">GCash</span>
                        </label>
                      </div>
                    </div>

                    {bookingData.paymentMethod === "gcash" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Payment Reference Number
                          </label>
                          <input
                            type="text"
                            value={bookingData.paymentReference}
                            onChange={(e) =>
                              handleBookingDataChange(
                                "paymentReference",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter GCash reference number (e.g., GCASH123456789)"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Payment Screenshot
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  handleBookingDataChange(
                                    "paymentImage",
                                    event.target.result
                                  );
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          {bookingData.paymentImage && (
                            <div className="mt-2">
                              <img
                                src={bookingData.paymentImage}
                                alt="Payment screenshot"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={bookingData.contactInfo.phone}
                        onChange={(e) =>
                          handleBookingDataChange(
                            "contactInfo.phone",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={bookingData.contactInfo.email}
                        onChange={(e) =>
                          handleBookingDataChange(
                            "contactInfo.email",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      value={bookingData.contactInfo.address}
                      onChange={(e) =>
                        handleBookingDataChange(
                          "contactInfo.address",
                          e.target.value
                        )
                      }
                      rows="2"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Event location or delivery address..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Booking Successful!
              </h2>
              <p className="text-gray-300 mb-6">
                Your booking has been submitted successfully. We will contact
                you soon to confirm the details.
              </p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingModal;
