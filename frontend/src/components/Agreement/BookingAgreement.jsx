import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, FileText, CheckCircle, AlertTriangle } from "lucide-react";

const BookingAgreement = ({
  isOpen,
  onClose,
  onAgree,
  bookingData,
  cart,
  totalAmount,
  userName,
  userEmail,
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [signature, setSignature] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const sigCanvas = useRef(null);

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignature(null);
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      setShowError(true);
      return;
    }
    setSignature(sigCanvas.current.toDataURL());
    setShowError(false);
  };

  const handleAgree = () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    if (!signature) {
      alert("Please provide your signature");
      return;
    }

    // Pass signature and agreement data to parent
    onAgree({
      signature,
      agreedAt: new Date().toISOString(),
      agreedToTerms: true,
      ipAddress: "N/A", // You can implement IP tracking if needed
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              Booking Agreement & Terms
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Agreement Header */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              HARMONY HUB GUEVARA
            </h3>
            <h4 className="text-lg font-semibold text-blue-300 mb-2 text-center">
              CLIENT BOOKING AGREEMENT
            </h4>
            <p className="text-gray-300 text-sm text-center">
              This agreement is entered on{" "}
              <span className="text-white font-medium">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>

          {/* Party Information */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <h4 className="text-white font-semibold mb-3">PARTIES:</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Service Provider:</p>
                  <p className="text-white font-medium">
                    Harmony Hub Guevara
                  </p>
                  <p className="text-gray-300 text-xs">
                    (hereinafter referred to as "Provider")
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Client:</p>
                  <p className="text-white font-medium">{userName}</p>
                  <p className="text-gray-300 text-xs">{userEmail}</p>
                  <p className="text-gray-300 text-xs">
                    (hereinafter referred to as "Client")
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <h4 className="text-white font-semibold mb-3">
              I. BOOKING DETAILS
            </h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Booking Date:</p>
                  <p className="text-white">
                    {new Date(bookingData.bookingDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Event Time:</p>
                  <p className="text-white">{bookingData.bookingTime}</p>
                </div>
                <div>
                  <p className="text-gray-400">Setup Date:</p>
                  <p className="text-white">
                    {new Date(bookingData.setupDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Setup Time:</p>
                  <p className="text-white">{bookingData.setupTime}</p>
                </div>
                <div>
                  <p className="text-gray-400">Duration:</p>
                  <p className="text-white">{bookingData.duration} hour(s)</p>
                </div>
                <div>
                  <p className="text-gray-400">Venue Address:</p>
                  <p className="text-white">
                    {bookingData.contactInfo?.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Items Booked */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-gray-400 mb-2">Services/Items Booked:</p>
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-800/50 p-3 rounded"
                    >
                      <span className="text-white">
                        {item.name} x
                        {item.type === "package" || item.type === "bandArtist"
                          ? 1
                          : item.quantity}
                      </span>
                      <span className="text-green-400 font-medium">
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
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-gray-400 mb-2">Payment Details:</p>
                <div className="bg-gray-800/50 p-3 rounded space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Amount:</span>
                    <span className="text-white font-bold">
                      ₱{Number(totalAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payment Method:</span>
                    <span className="text-white capitalize">
                      {bookingData.paymentMethod === "gcash"
                        ? "GCash"
                        : "Cash"}
                    </span>
                  </div>
                  {bookingData.paymentMethod === "gcash" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Payment Type:</span>
                        <span className="text-white">
                          {bookingData.downpaymentType === "full"
                            ? "Full Payment"
                            : "Partial Payment"}
                        </span>
                      </div>
                      {bookingData.remainingBalance > 0 && (
                        <div className="flex justify-between text-orange-400">
                          <span>Remaining Balance:</span>
                          <span className="font-bold">
                            ₱{Number(bookingData.remainingBalance).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <h4 className="text-white font-semibold mb-4">
              II. TERMS AND CONDITIONS
            </h4>
            <div className="space-y-4 text-sm text-gray-300 max-h-80 overflow-y-auto pr-2">
              {/* Section 1: Services */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  1. SCOPE OF SERVICES
                </h5>
                <p className="mb-2">
                  Provider agrees to provide the Client with the services and
                  equipment listed in Section I (Booking Details) on the
                  specified date and time. Services include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Setup and installation of booked equipment/services</li>
                  <li>Operation and maintenance during the event duration</li>
                  <li>
                    Teardown and removal of equipment after the event concludes
                  </li>
                  <li>
                    Technical support for the duration of the booking period
                  </li>
                </ul>
              </div>

              {/* Section 2: Payment Terms */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  2. PAYMENT TERMS
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    The total booking amount is ₱
                    {Number(totalAmount).toLocaleString()} as specified above.
                  </li>
                  {bookingData.paymentMethod === "gcash" &&
                  bookingData.remainingBalance > 0 ? (
                    <>
                      <li>
                        Client has paid a downpayment and agrees to pay the
                        remaining balance of ₱
                        {Number(bookingData.remainingBalance).toLocaleString()}{" "}
                        on or before the event date.
                      </li>
                      <li>
                        Failure to pay the remaining balance may result in
                        service cancellation.
                      </li>
                    </>
                  ) : (
                    <li>
                      Payment must be completed before or on the event date as
                      per the agreed payment method.
                    </li>
                  )}
                  <li>All payments are non-refundable unless stated otherwise.</li>
                </ul>
              </div>

              {/* Section 3: Cancellation Policy */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  3. CANCELLATION & REFUND POLICY
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Client may cancel the booking at least 7 days before the
                    event date for a 50% refund.
                  </li>
                  <li>
                    Cancellations made less than 7 days before the event are
                    non-refundable.
                  </li>
                  <li>
                    Provider reserves the right to cancel the booking due to
                    unforeseen circumstances, with a full refund to the Client.
                  </li>
                  <li>
                    Weather-related cancellations will be evaluated on a
                    case-by-case basis.
                  </li>
                </ul>
              </div>

              {/* Section 4: Equipment and Inventory */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  4. EQUIPMENT CARE & LIABILITY
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Client agrees to handle all rented equipment with reasonable
                    care.
                  </li>
                  <li>
                    Client is responsible for any loss, theft, or damage to
                    equipment during the rental period.
                  </li>
                  <li>
                    Damaged equipment will be charged at replacement cost or
                    repair cost, whichever is applicable.
                  </li>
                  <li>
                    Provider will inspect all equipment before and after the
                    event.
                  </li>
                  <li>
                    Client must report any equipment issues immediately to the
                    Provider.
                  </li>
                </ul>
              </div>

              {/* Section 5: Setup and Venue Access */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  5. SETUP & VENUE ACCESS
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Provider's team will arrive at the setup time specified in
                    Section I.
                  </li>
                  <li>
                    Client must ensure venue access and adequate space for setup
                    at the specified time.
                  </li>
                  <li>
                    Venue must have access to electrical power and other
                    required utilities.
                  </li>
                  <li>
                    Client is responsible for obtaining necessary venue permits
                    and permissions.
                  </li>
                  <li>
                    Delays in venue access may result in reduced setup time or
                    additional charges.
                  </li>
                </ul>
              </div>

              {/* Section 6: Artist/Performer Terms (if applicable) */}
              {cart.some((item) => item.type === "bandArtist") && (
                <div>
                  <h5 className="text-white font-medium mb-2">
                    6. ARTIST/PERFORMER TERMS
                  </h5>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      Artist performance time and breaks are as mutually agreed.
                    </li>
                    <li>
                      Client must provide adequate facilities for artists
                      (dressing room, refreshments, etc.).
                    </li>
                    <li>
                      Performance repertoire will be discussed and agreed upon
                      in advance.
                    </li>
                    <li>
                      Client agrees not to record or reproduce artist
                      performances without written consent.
                    </li>
                    <li>
                      Artist safety and security are the responsibility of the
                      Client during the event.
                    </li>
                  </ul>
                </div>
              )}

              {/* Section 7: Force Majeure */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  7. FORCE MAJEURE
                </h5>
                <p>
                  Neither party shall be held liable for failure to perform
                  obligations due to circumstances beyond their reasonable
                  control, including but not limited to: natural disasters,
                  acts of God, government restrictions, pandemic, war, or civil
                  unrest. In such cases, the Provider will work with the Client
                  to reschedule or provide a full refund.
                </p>
              </div>

              {/* Section 8: Liability Limitations */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  8. LIMITATION OF LIABILITY
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Provider is not liable for injuries or damages occurring at
                    the Client's venue.
                  </li>
                  <li>
                    Provider's liability is limited to the total booking amount
                    paid.
                  </li>
                  <li>
                    Client agrees to hold Provider harmless from any claims
                    arising from the event.
                  </li>
                  <li>
                    Provider maintains insurance for equipment but not for
                    third-party incidents.
                  </li>
                </ul>
              </div>

              {/* Section 9: Privacy and Data */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  9. PRIVACY & DATA PROTECTION
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Client information will be used solely for booking and
                    service delivery purposes.
                  </li>
                  <li>
                    Provider will not share Client data with third parties
                    without consent.
                  </li>
                  <li>
                    Payment information is securely processed and not stored on
                    Provider's servers.
                  </li>
                  <li>
                    Client may request access to or deletion of their personal
                    data at any time.
                  </li>
                </ul>
              </div>

              {/* Section 10: Governing Law */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  10. GOVERNING LAW & DISPUTE RESOLUTION
                </h5>
                <p>
                  This Agreement shall be governed by and construed in
                  accordance with the laws of the Philippines. Any disputes
                  arising from this Agreement shall first be resolved through
                  good faith negotiations. If unresolved, disputes shall be
                  submitted to mediation or arbitration before pursuing legal
                  action.
                </p>
              </div>

              {/* Section 11: Entire Agreement */}
              <div>
                <h5 className="text-white font-medium mb-2">
                  11. ENTIRE AGREEMENT
                </h5>
                <p>
                  This Agreement constitutes the entire agreement between the
                  parties and supersedes all prior negotiations, representations,
                  or agreements. Any modifications must be made in writing and
                  signed by both parties.
                </p>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="mt-4 flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Please scroll and read all terms carefully</span>
            </div>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadTerms}
                onChange={(e) => setHasReadTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm">
                I acknowledge that I have read, understood, and agree to be
                bound by all terms and conditions stated in this Booking
                Agreement.
              </span>
            </label>
          </div>

          {/* Signature Section */}
          {hasReadTerms && (
            <div className="bg-gray-700/50 rounded-lg p-5 border border-gray-600">
              <h4 className="text-white font-semibold mb-4">
                III. CLIENT SIGNATURE
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                Please sign below to indicate your agreement to these terms and
                conditions:
              </p>

              {!signature ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg border-2 border-gray-600 overflow-hidden">
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        className: "w-full h-48 cursor-crosshair",
                      }}
                      backgroundColor="white"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={saveSignature}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Save Signature
                    </button>
                  </div>
                  {showError && (
                    <div className="text-red-400 text-sm flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Please provide your signature before continuing</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg border-2 border-green-600 p-4">
                    <img
                      src={signature}
                      alt="Signature"
                      className="w-full h-32 object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Signature captured successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSignature(null);
                      sigCanvas.current.clear();
                    }}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Change Signature
                  </button>
                </div>
              )}

              {/* Final Agreement Checkbox */}
              <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">
                    <strong className="text-white">
                      I, {userName}, hereby confirm that:
                    </strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>I have read and understood this entire agreement</li>
                      <li>
                        I agree to all terms and conditions stated herein
                      </li>
                      <li>
                        My digital signature above is legally binding and
                        equivalent to my handwritten signature
                      </li>
                      <li>
                        I am authorized to enter into this agreement on behalf
                        of myself or my organization
                      </li>
                    </ul>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAgree}
              disabled={!hasReadTerms || !signature || !agreedToTerms}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>I Agree & Sign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAgreement;

