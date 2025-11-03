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
          <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-700/30 rounded-lg p-6 mb-6">
            <h3 className="text-3xl font-bold text-orange-400 mb-2 text-center tracking-wider">
              GUEVARRA
            </h3>
            <h4 className="text-sm font-semibold text-orange-300 mb-4 text-center tracking-widest">
              LIGHTS AND SOUNDS
            </h4>
            <h4 className="text-xl font-bold text-white mb-4 text-center border-t border-b border-gray-600 py-3">
              CONTRACT
            </h4>
            <p className="text-gray-300 text-sm text-center">
              Date:{" "}
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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Client:</p>
                <p className="text-white font-bold text-lg">{userName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-400 mb-1">Venue:</p>
                  <p className="text-white font-medium text-sm">
                    {bookingData.contactInfo?.address?.split(',')[0] || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Date:</p>
                  <p className="text-white font-medium">
                    {new Date(bookingData.bookingDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-400 text-xs">Time: {bookingData.bookingTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Quotation */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <h4 className="text-white font-bold mb-4 text-center bg-gray-600 py-2 rounded">
              Equipment Quotation
            </h4>

            {/* Subject Line */}
            <div className="mb-4 pb-3 border-b border-gray-600">
              <p className="text-gray-400 text-sm">Subject:</p>
              <p className="text-white font-medium">
                {cart.map(item => item.type === 'bandArtist' ? 'BAND/ARTIST' : item.name.toUpperCase()).join(' / ')}
              </p>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              {/* Group items by type */}
              {cart.some(item => item.type === 'inventory' && item.category?.name?.toLowerCase().includes('audio')) && (
                <div className="mb-3">
                  <h5 className="text-white font-bold mb-2 text-center bg-gray-600 py-1">AUDIO</h5>
                  {cart.filter(item => item.type === 'inventory' && item.category?.name?.toLowerCase().includes('audio')).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-700">
                      <span className="text-gray-300">{item.name}</span>
                      <div className="flex gap-8">
                        <span className="text-white">{item.quantity}</span>
                        <span className="text-gray-400 text-xs">{item.unit?.symbol || 'Units'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.some(item => item.type === 'inventory' && item.category?.name?.toLowerCase().includes('light')) && (
                <div className="mb-3">
                  <h5 className="text-white font-bold mb-2 text-center bg-gray-600 py-1">LIGHTS</h5>
                  {cart.filter(item => item.type === 'inventory' && item.category?.name?.toLowerCase().includes('light')).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-700">
                      <span className="text-gray-300">{item.name}</span>
                      <div className="flex gap-8">
                        <span className="text-white">{item.quantity}</span>
                        <span className="text-gray-400 text-xs">{item.unit?.symbol || 'Units'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other inventory items */}
              {cart.filter(item => 
                item.type === 'inventory' && 
                !item.category?.name?.toLowerCase().includes('audio') && 
                !item.category?.name?.toLowerCase().includes('light')
              ).map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-700">
                  <span className="text-gray-300">{item.name}</span>
                  <div className="flex gap-8">
                    <span className="text-white">{item.quantity}</span>
                    <span className="text-gray-400 text-xs">{item.unit?.symbol || 'Units'}</span>
                  </div>
                </div>
              ))}

              {/* Band Artists */}
              {cart.filter(item => item.type === 'bandArtist').map((item, index) => (
                <div key={index} className="mb-2">
                  <h5 className="text-white font-bold mb-1 text-center bg-gray-600 py-1">BAND/ARTIST</h5>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-700">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white">1</span>
                  </div>
                </div>
              ))}

              {/* Packages */}
              {cart.filter(item => item.type === 'package').map((item, index) => (
                <div key={index} className="mb-2">
                  <h5 className="text-white font-bold mb-1 text-center bg-gray-600 py-1">PACKAGE</h5>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-700">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white">1</span>
                  </div>
                </div>
              ))}

              {/* Technical Staff */}
              <div className="mt-4">
                <h5 className="text-white font-bold mb-2 text-center bg-gray-600 py-1">TECHNICAL STAFF & TRANSPORT VEHICLE</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between border-b border-gray-700 py-1">
                    <span className="text-gray-300">Technical Staff</span>
                    <span className="text-white">Included</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 py-1">
                    <span className="text-gray-300">Transport Vehicle</span>
                    <span className="text-white">Included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Price Section */}
            <div className="mt-6 pt-4 border-t-2 border-gray-600">
              <div className="bg-gray-800/70 p-4 rounded">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-bold text-lg">TOTAL PRICE:</span>
                  <span className="text-green-400 font-bold text-2xl">
                    Php. {Number(totalAmount).toLocaleString()}.00
                  </span>
                </div>

                {bookingData.paymentMethod === "gcash" && bookingData.remainingBalance > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-t border-gray-700">
                      <span className="text-gray-300">Down payment:</span>
                      <span className="text-white font-medium">
                        {Number(totalAmount - bookingData.remainingBalance).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Date:</span>
                      <span className="text-white">
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-gray-700">
                      <span className="text-orange-400 font-bold">BALANCE:</span>
                      <span className="text-orange-400 font-bold text-xl">
                        {Number(bookingData.remainingBalance).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600">
            <h4 className="text-white font-bold mb-4 text-center bg-gray-600 py-2 rounded">
              NOTE:
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded">
                <p className="text-yellow-200 font-medium">
                  NOTE; THE {bookingData.downpaymentPercentage || 20} PERCENT DOWN PAYMENT IS NON REFUNDABLE IF CLIENT CHOOSES TO CANCEL
                </p>
              </div>

              <div className="bg-gray-800/50 p-3 rounded space-y-2">
                <p className="text-white">
                  * {bookingData.downpaymentPercentage || 20}% Down payment should be given at the time of signing this contract. After the event, remaining balance must be paid.
                </p>
                
                <p className="text-white">
                  * Please ensure the safety and security of the supplier at the venue.
                </p>

                <p className="text-white">
                  * Power supply should be stable at 220v.
                </p>

                <p className="text-white">
                  * The client is responsible for paying for any damage that event attendees may have caused to the equipment.
                </p>

                <p className="text-white">
                  * Please follow to the time constraints; excess time will result in additional charges.
                </p>

                <p className="text-red-400 font-medium">
                  * Crew meals should be provided by the client. LUNCH & DINNER
                </p>

                <p className="text-white">
                  * This agreement contains the entire understanding between the Supplier and the Client.
                </p>
              </div>

              <div className="bg-gray-800/50 p-3 rounded">
                <p className="text-gray-300 italic">
                  * Kindly sign on the space provided below
                </p>
              </div>
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
              <h4 className="text-white font-bold mb-4 text-center bg-gray-600 py-2 rounded">
                CLIENT SIGNATURE
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                By signing below, you acknowledge that you have read and agree to all terms stated in this contract:
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

