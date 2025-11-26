import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Music,
} from "lucide-react";
import { provinces, cities, barangays } from "select-philippines-address";
import { useState, useEffect } from "react";

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
  artistAvailability,
  checkArtistAvailability,
  userName,
  userEmail,
}) => {
  const [provinceData, setProvince] = useState([]);
  const [cityData, setCity] = useState([]);
  const [barangayData, setBarangay] = useState([]);

  const [provinceAddr, setProvinceAddr] = useState("Marinduque");
  const [cityAddr, setCityAddr] = useState("");
  const [barangayAddr, setBarangayAddr] = useState("");

  const [showPolicyReminder, setShowPolicyReminder] = useState(false);
  const [setupDateError, setSetupDateError] = useState("");

  useEffect(() => {
    provinces("17").then((response) => {
      setProvince(response);
      const marinduque = response.find((p) => p.province_name === "Marinduque");
      if (marinduque) {
        cities(marinduque.province_code).then((cityList) => setCity(cityList));
        handleBookingDataChange("contactInfo.province", "Marinduque");
      }
    });
  }, []);

  // Auto-fill email when modal opens and userEmail is available
  useEffect(() => {
    if (showBookingModal && userEmail && !bookingData.contactInfo.email) {
      handleBookingDataChange("contactInfo.email", userEmail);
    }
  }, [showBookingModal, userEmail]);

  // Validate setup date and time
  const validateSetupDateTime = () => {
    if (!bookingData.setupDate || !bookingData.bookingDate) {
      setSetupDateError("");
      return true;
    }

    const setupDate = new Date(bookingData.setupDate);
    const bookingDate = new Date(bookingData.bookingDate);

    if (setupDate > bookingDate) {
      setSetupDateError(
        "⚠️ Setup date must be before or equal to the booking date"
      );
      return false;
    }

    // If same date, check times
    if (setupDate.getTime() === bookingDate.getTime()) {
      if (
        bookingData.setupTime &&
        bookingData.bookingTime &&
        bookingData.setupTime >= bookingData.bookingTime
      ) {
        setSetupDateError("⚠️ Setup time must be before the booking time");
        return false;
      }
    }

    setSetupDateError("");
    return true;
  };

  // Validate whenever relevant fields change
  useEffect(() => {
    validateSetupDateTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bookingData.setupDate,
    bookingData.setupTime,
    bookingData.bookingDate,
    bookingData.bookingTime,
  ]);

  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    const cityName = e.target.selectedOptions[0].text;
    setCityAddr(cityName);
    barangays(cityCode).then((response) => setBarangay(response));
    handleBookingDataChange("contactInfo.city", cityName);
  };

  const handleBarangayChange = (e) => {
    const barangayName = e.target.selectedOptions[0].text;
    setBarangayAddr(barangayName);
    handleBookingDataChange("contactInfo.barangay", barangayName);

    handleBookingDataChange(
      "contactInfo.address",
      `${barangayName}, ${cityAddr}, ${provinceAddr}`
    );
  };
  return (
    <>
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700/50">
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
              onSubmit={(e) => {
                e.preventDefault();

                // Check if policy is accepted before submitting
                if (!bookingData.policyAccepted) {
                  setShowPolicyReminder(true);
                  return;
                }

                // Validate setup date and time
                if (!validateSetupDateTime()) {
                  return;
                }

                setShowPolicyReminder(false);

                // Directly submit booking (no contract/signature yet)
                handleBookingSubmit(e);
              }}
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
                      className="flex justify-between items-start py-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-300">
                            {item.name} x
                            {item.type === "package" ||
                            item.type === "bandArtist"
                              ? 1
                              : item.quantity}
                            {item.type === "inventory" && item.unit && (
                              <span className="text-gray-500 text-xs ml-1">
                                {item.unit.symbol}
                              </span>
                            )}
                          </span>
                          {item.type === "inventory" && item.category && (
                            <span className="inline-block px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                              {item.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-white font-medium ml-2">
                        ₱
                        {Number(
                          item.price *
                            (item.type === "package" ||
                            item.type === "bandArtist"
                              ? 1
                              : item.quantity)
                        ).toLocaleString()}
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

              {/* Artist Availability Warning */}
              {cart.some((item) => item.type === "bandArtist") &&
                bookingData.bookingDate && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Music className="w-5 h-5 mr-2 text-purple-400" />
                      Artist Availability Check
                    </h3>
                    <div className="space-y-2">
                      {cart
                        .filter((item) => item.type === "bandArtist")
                        .map((artist) => {
                          const isAvailable =
                            artistAvailability[
                              `${artist.id}-${bookingData.bookingDate}`
                            ] !== false;
                          return (
                            <div
                              key={`${artist.id}-availability`}
                              className={`p-3 rounded-lg border ${
                                isAvailable
                                  ? "bg-green-900/20 border-green-700 text-green-300"
                                  : "bg-red-900/20 border-red-700 text-red-300"
                              }`}
                            >
                              <div className="flex items-center">
                                {isAvailable ? (
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                                )}
                                <span className="font-medium">
                                  {artist.name}
                                </span>
                                <span className="ml-2 text-sm">
                                  {isAvailable
                                    ? `is available on ${bookingData.bookingDate}`
                                    : `is not available on ${bookingData.bookingDate}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

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
                      onChange={async (e) => {
                        const newDate = e.target.value;
                        await handleBookingDataChange("bookingDate", newDate);
                        // Check availability for artists in cart when date changes
                        if (newDate) {
                          const artistPromises = cart
                            .filter((item) => item.type === "bandArtist")
                            .map((artist) =>
                              checkArtistAvailability(artist.id, newDate)
                            );
                          await Promise.all(artistPromises);
                        }
                      }}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    ⏰ Advance Setup (Date & Time)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Setup Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.setupDate}
                        onChange={(e) =>
                          handleBookingDataChange("setupDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        max={bookingData.bookingDate || undefined}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          setupDateError ? "border-red-500" : "border-gray-600"
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Setup Time
                      </label>
                      <input
                        type="time"
                        value={bookingData.setupTime}
                        onChange={(e) =>
                          handleBookingDataChange("setupTime", e.target.value)
                        }
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          setupDateError ? "border-red-500" : "border-gray-600"
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                    </div>
                  </div>
                  {setupDateError && (
                    <div className="p-3 bg-red-900/20 border border-red-700 text-red-300 rounded-lg text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                      {setupDateError}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    💡 Specify when our team should arrive for equipment setup.
                    This should be before your booking date and time.
                  </p>
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

                {/* Payment Reminder */}
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Payment & Approval Timeline
                  </h4>
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 space-y-3 text-sm text-gray-300">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">①</span>
                      <p>
                        Submit your booking details and sign the contract so we
                        can review your request.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">②</span>
                      <p>
                        An admin or the owner will confirm the schedule. You will
                        receive an update once your booking status becomes{" "}
                        <span className="text-blue-300 font-semibold">
                          confirmed
                        </span>
                        .
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">③</span>
                      <p>
                        After confirmation, you can choose your preferred payment
                        method (Cash or GCash) inside{" "}
                        <span className="text-white font-semibold">
                          My Bookings
                        </span>{" "}
                        and upload proof if needed.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">④</span>
                      <p>
                        Once payment details are submitted, the admin will sign
                        the contract to finalize your reservation.
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded text-xs text-yellow-200">
                      ⚖️ Cancellation Policy: Only 20% of the total payment is
                      refundable when a confirmed booking is cancelled.
                    </div>
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
                        Phone Number <span className="text-red-400">*</span>
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
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email <span className="text-red-400">*</span>
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
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Province
                        </label>
                        <input
                          type="text"
                          value="Marinduque"
                          readOnly
                          className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 cursor-not-allowed"
                        />
                      </div>

                      {/* City */}
                      <select
                        onChange={handleCityChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        disabled={!cityData.length}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select City
                        </option>
                        {cityData.map((item) => (
                          <option key={item.city_code} value={item.city_code}>
                            {item.city_name}
                          </option>
                        ))}
                      </select>

                      {/* Barangay */}
                      <select
                        onChange={handleBarangayChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        disabled={!barangayData.length}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select Barangay
                        </option>
                        {barangayData.map((item) => (
                          <option key={item.brgy_code} value={item.brgy_code}>
                            {item.brgy_name}
                          </option>
                        ))}
                      </select>

                      {/* Display selected full address */}
                      <div className="text-gray-400 text-sm mt-2">
                        {barangayAddr && (
                          <>
                            <span className="font-medium text-white">
                              Full Address:
                            </span>{" "}
                            {barangayAddr}, {cityAddr}, {provinceAddr}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Agreement */}
              <div className="mb-6 bg-gray-700 p-4 rounded-lg">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={bookingData.policyAccepted || false}
                    onChange={(e) =>
                      handleBookingDataChange(
                        "policyAccepted",
                        e.target.checked
                      )
                    }
                    className="mt-1"
                  />
                  <span className="text-gray-300 text-sm leading-relaxed">
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      onClick={() => window.open("/policy", "_blank")}
                      className="text-blue-400 hover:underline"
                    >
                      Policy / Contract
                    </button>{" "}
                    before proceeding with the booking.
                  </span>
                </label>

                {/* Policy reminder message */}
                {showPolicyReminder && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 text-red-400 rounded-lg text-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                    Please read and agree to the Policy / Contract before
                    confirming your booking.
                  </div>
                )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-md w-full p-6 border border-gray-700/50">
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
