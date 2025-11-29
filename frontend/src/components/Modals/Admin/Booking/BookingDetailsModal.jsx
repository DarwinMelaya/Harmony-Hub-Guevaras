import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Package,
  Music,
} from "lucide-react";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "-";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getPaymentStatusMeta = (status) => {
  switch (status) {
    case "awaiting_selection":
      return {
        label: "Awaiting customer payment selection",
        classes: "bg-yellow-900/40 text-yellow-200 border-yellow-600/40",
      };
    case "submitted":
      return {
        label: "Payment submitted (awaiting review)",
        classes: "bg-blue-900/40 text-blue-200 border-blue-600/40",
      };
    case "verified":
      return {
        label: "Payment verified",
        classes: "bg-green-900/40 text-green-200 border-green-600/40",
      };
    case "awaiting_confirmation":
    default:
      return {
        label: "Pending admin confirmation",
        classes: "bg-gray-700 text-gray-300 border-gray-600",
      };
  }
};

const getItemIcon = (type) => {
  switch (type) {
    case "inventory":
      return <ShoppingCart className="w-4 h-4" />;
    case "package":
      return <Package className="w-4 h-4" />;
    case "bandArtist":
      return <Music className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getIssueIcon = (issueType) => {
  switch (issueType) {
    case "lost":
      return <XCircle className="w-4 h-4 text-red-400" />;
    case "damaged":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  }
};

const hasIssues = (booking) => {
  return (
    booking.issueType &&
    booking.affectedItems &&
    booking.affectedItems.length > 0
  );
};

const BookingDetailsModal = ({
  isOpen,
  onClose,
  selectedBooking,
  canAdminSign,
  downloadingAgreement,
  onDownloadAgreement,
  onSignAsAdmin,
  onOpenExtensionModal,
  onOpenExtensionPaymentModal,
  onOpenAddItemModal,
  onRemoveItem,
  onOpenCancelModal,
  onOpenRefundModal,
  onConfirmBooking,
  onMarkAsCompleted,
  updatingStatus,
}) => {
  if (!isOpen || !selectedBooking) return null;

  const displayRemainingBalance =
    selectedBooking.paymentMethod === "cash"
      ? Math.max(
          Number(selectedBooking.totalAmount || 0) -
            Number(selectedBooking.downpaymentAmount || 0),
          0
        )
      : Number(selectedBooking.remainingBalance || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Customer Information
            </h3>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-medium">
                    {selectedBooking.user?.fullName ||
                      selectedBooking.user?.username}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{selectedBooking.user?.email}</p>
                </div>
                {selectedBooking.contactInfo?.phone && (
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">
                      {selectedBooking.contactInfo.phone}
                    </p>
                  </div>
                )}
                {selectedBooking.contactInfo?.address && (
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white">
                      {selectedBooking.contactInfo.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Booking Information
            </h3>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-white font-medium">
                    {formatDate(selectedBooking.bookingDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Time</p>
                  <p className="text-white">
                    {formatTime(selectedBooking.bookingTime)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">⏰ Setup Date</p>
                  <p className="text-white">
                    {selectedBooking.setupDate
                      ? formatDate(selectedBooking.setupDate)
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">⏰ Setup Time</p>
                  <p className="text-white">
                    {selectedBooking.setupTime
                      ? formatTime(selectedBooking.setupTime)
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-white">{selectedBooking.duration} hours</p>
                </div>
              </div>
              {selectedBooking.notes && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm">Notes</p>
                  <p className="text-white">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Agreement Section */}
          {selectedBooking.agreement &&
            selectedBooking.agreement.signature && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  Signed Agreement
                </h3>
                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-4 rounded-lg border border-blue-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-medium mb-1">
                        Client has signed the booking agreement
                      </p>
                      <p className="text-gray-400 text-sm">
                        Signed on:{" "}
                        {new Date(
                          selectedBooking.agreement.agreedAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Signed by: {selectedBooking.agreement.clientName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedBooking.agreement.adminSignature ? (
                        <button
                          onClick={() => onDownloadAgreement(selectedBooking._id)}
                          disabled={downloadingAgreement === selectedBooking._id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          {downloadingAgreement === selectedBooking._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download PDF
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={onSignAsAdmin}
                          disabled={!canAdminSign}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                            canAdminSign
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-600 text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          Sign as Admin
                        </button>
                      )}
                      {!selectedBooking.agreement.adminSignature &&
                        !canAdminSign && (
                          <p className="text-xs text-orange-300 mt-2">
                            Require client payment submission before signing.
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Client Signature Preview */}
                  <div className="mb-4 pt-4 border-t border-blue-700/30">
                    <p className="text-gray-400 text-sm mb-2">
                      Client Signature:
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <img
                        src={selectedBooking.agreement.signature}
                        alt="Client Signature"
                        className="h-24 object-contain mx-auto"
                      />
                    </div>
                  </div>

                  {/* Admin Signature Status */}
                  {selectedBooking.agreement.adminSignature ? (
                    <div className="pt-4 border-t border-blue-700/30">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <p className="text-green-400 font-medium">
                          Admin has signed the agreement
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        Signed by:{" "}
                        {selectedBooking.agreement.adminSignerName}
                      </p>
                      <p className="text-gray-400 text-xs mb-3">
                        On:{" "}
                        {new Date(
                          selectedBooking.agreement.adminSignedAt
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-gray-400 text-sm mb-2">
                        Admin Signature:
                      </p>
                      <div className="bg-white rounded-lg p-3">
                        <img
                          src={selectedBooking.agreement.adminSignature}
                          alt="Admin Signature"
                          className="h-24 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-blue-700/30">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
                        <p className="text-orange-400 font-medium">
                          Waiting for admin signature
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Payment Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Payment Information
            </h3>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-gray-400 text-sm">Payment Status:</p>
                {(() => {
                  const meta = getPaymentStatusMeta(
                    selectedBooking.paymentStatus
                  );
                  return (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.classes}`}
                    >
                      {meta.label}
                    </span>
                  );
                })()}
              </div>

              {!selectedBooking.paymentMethod ? (
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 text-sm text-gray-300">
                  <p>
                    The client has not submitted payment details yet. Once
                    their booking is confirmed, they can choose Cash or GCash
                    from the customer portal, and the details will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Payment Method</p>
                      <p className="text-white font-medium capitalize">
                        {selectedBooking.paymentMethod === "gcash"
                          ? "GCash"
                          : "Cash"}
                      </p>
                    </div>
                    {selectedBooking.paymentReference && (
                      <div>
                        <p className="text-gray-400 text-sm">
                          Reference Number
                        </p>
                        <p className="text-white font-mono">
                          {selectedBooking.paymentReference}
                        </p>
                      </div>
                    )}
                  </div>

              {selectedBooking.downpaymentType && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h4 className="text-white font-medium mb-3">
                    {selectedBooking.paymentMethod === "cash"
                      ? "Downpayment Plan"
                      : "Payment Breakdown"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Payment Option</p>
                      <p className="text-white capitalize">
                        {selectedBooking.downpaymentType === "full"
                          ? "Full Payment"
                          : `Downpayment (${
                              selectedBooking.downpaymentPercentage || 50
                            }%)`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">
                        {selectedBooking.paymentMethod === "cash"
                          ? "Downpayment Amount"
                          : "Amount Paid"}
                      </p>
                      <p
                        className={`font-bold ${
                          selectedBooking.paymentMethod === "cash"
                            ? "text-yellow-300"
                            : "text-green-400"
                        }`}
                      >
                        ₱
                        {Number(
                          selectedBooking.downpaymentAmount ||
                            selectedBooking.totalAmount
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Remaining Balance</p>
                      <p className="text-blue-300 font-bold">
                        ₱{displayRemainingBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedBooking.paymentMethod === "cash" ? (
                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <p className="text-yellow-200 text-sm">
                        Collect ₱
                        {Number(
                          selectedBooking.downpaymentAmount || 0
                        ).toLocaleString()}{" "}
                        in cash as agreed. The remaining balance above reflects
                        the amount due after this planned downpayment.
                      </p>
                    </div>
                  ) : (
                    selectedBooking.downpaymentType === "percentage" &&
                    displayRemainingBalance > 0 && (
                      <div className="mt-3 p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                        <p className="text-orange-300 text-sm">
                          ⚠️ Remaining balance of ₱
                          {displayRemainingBalance.toLocaleString()} to be
                          collected on service day
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

                  {selectedBooking.paymentImage && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">
                        Payment Screenshot
                      </p>
                      <img
                        src={selectedBooking.paymentImage}
                        alt="Payment screenshot"
                        className="w-48 h-48 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Extension Charges */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Extension Charges
              </h3>
              <button
                onClick={() => onOpenExtensionModal(selectedBooking)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Add Extension
              </button>
            </div>
            {selectedBooking.extensions &&
            selectedBooking.extensions.length > 0 ? (
              <div className="space-y-3">
                {selectedBooking.extensions.map((extension) => (
                  <div
                    key={extension._id || extension.createdAt}
                    className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-white font-semibold">
                          ₱{Number(extension.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {extension.description || "Extension charge"}
                        </p>
                        <div className="text-xs text-gray-400 mt-2 flex flex-wrap gap-3">
                          {extension.hours !== null &&
                            extension.hours !== undefined && (
                              <span>{extension.hours} hr(s)</span>
                            )}
                          {extension.rate !== null &&
                            extension.rate !== undefined && (
                              <span>
                                @ ₱
                                {Number(extension.rate || 0).toLocaleString()}/hr
                              </span>
                            )}
                          <span className="capitalize">
                            Method: {extension.paymentMethod || "cash"}
                          </span>
                          <span>
                            Recorded:{" "}
                            {extension.createdAt
                              ? new Date(extension.createdAt).toLocaleString()
                              : "-"}
                          </span>
                          {extension.paidAt && (
                            <span>
                              Paid on:{" "}
                              {new Date(extension.paidAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            extension.status === "paid"
                              ? "bg-green-900/40 text-green-300 border-green-500/30"
                              : "bg-yellow-900/40 text-yellow-300 border-yellow-500/30"
                          }`}
                        >
                          {extension.status === "paid" ? "Paid" : "Pending"}
                        </span>
                        {extension.status !== "paid" && (
                          <button
                            onClick={() =>
                              onOpenExtensionPaymentModal(selectedBooking, extension)
                            }
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            Mark as Paid
                          </button>
                        )}
                        {extension.paymentProof && (
                          <a
                            href={extension.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 text-xs underline"
                          >
                            View Proof
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4 text-gray-400 text-sm border border-gray-600">
                No extension charges recorded yet.
              </div>
            )}
            <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-between text-sm">
              <span className="text-gray-300">
                Outstanding Extension Balance
              </span>
              <span className="text-white font-semibold">
                ₱
                {Number(selectedBooking.extensionBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Booked Items
              </h3>
              {["pending", "confirmed"].includes(selectedBooking.status) && (
                <button
                  onClick={() => onOpenAddItemModal(selectedBooking)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Add Item
                </button>
              )}
            </div>
            <div className="space-y-3">
              {selectedBooking.items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="bg-gray-700 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      {getItemIcon(item.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{item.name}</p>
                          {item.isAdditional && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-900/50 text-green-300 border border-green-600/60">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm capitalize">
                          {item.type === "bandArtist" ? "Band Artist" : item.type}
                        </p>
                        {item.addedAt && (
                          <p className="text-gray-500 text-xs mt-1">
                            Added: {new Date(item.addedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white font-medium">x{item.quantity}</p>
                        <p className="text-green-400 font-bold">
                          ₱
                          {Number(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      {["pending", "confirmed"].includes(
                        selectedBooking.status
                      ) && (
                        <button
                          onClick={() => onRemoveItem(item)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Display package items if this is a package */}
                  {item.type === "package" &&
                    item.itemId &&
                    item.itemId.items && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-gray-300 text-sm font-medium mb-2">
                          Package Contents:
                        </p>
                        <div className="space-y-2">
                          {item.itemId.items.map((packageItem, pIndex) => (
                            <div
                              key={pIndex}
                              className="flex items-center justify-between bg-gray-600 p-2 rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <ShoppingCart className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-300 text-sm">
                                  {packageItem.inventoryItem?.name ||
                                    "Unknown Item"}
                                </span>
                                <span className="text-gray-400 text-xs">
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-lg">
                  Total Amount:
                </span>
                <span className="text-green-400 font-bold text-xl">
                  ₱{Number(selectedBooking.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation and Refund Section */}
          {(selectedBooking.status === "cancelled" ||
            selectedBooking.status === "refunded") && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-400" />
                Cancellation Information
              </h3>
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                {selectedBooking.cancellationReason && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-2 font-medium">
                      Cancellation Reason:
                    </p>
                    <p className="text-white text-sm italic">
                      {selectedBooking.cancellationReason}
                    </p>
                  </div>
                )}
                {selectedBooking.refundAmount > 0 && (
                  <div className="mt-4 pt-4 border-t border-red-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300 text-sm mb-1">
                          Refund Amount:
                        </p>
                        <p className="text-green-400 font-bold text-lg">
                          ₱
                          {Number(selectedBooking.refundAmount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm mb-1">
                          Refund Status:
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBooking.refundStatus === "processed"
                              ? "bg-green-100 text-green-800"
                              : selectedBooking.refundStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedBooking.refundStatus === "processed"
                            ? "Processed"
                            : selectedBooking.refundStatus === "pending"
                            ? "Pending"
                            : "Not Applicable"}
                        </span>
                      </div>
                    </div>
                    {selectedBooking.refundedAt && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-xs">
                          Refunded on:{" "}
                          {new Date(selectedBooking.refundedAt).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}
                    {selectedBooking.refundProof && (
                      <div className="mt-3">
                        <p className="text-gray-300 text-sm mb-2 font-medium">
                          Refund Proof:
                        </p>
                        <img
                          src={selectedBooking.refundProof}
                          alt="Refund proof"
                          className="w-48 h-48 object-cover rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                    {selectedBooking.refundStatus === "pending" && (
                      <div className="mt-4 pt-4 border-t border-red-700">
                        <button
                          onClick={onOpenRefundModal}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          {selectedBooking.paymentMethod === "gcash"
                            ? "Upload Refund Proof"
                            : "Mark as Refunded"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issues Section */}
          {hasIssues(selectedBooking) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Reported Issues
              </h3>
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {getIssueIcon(selectedBooking.issueType)}
                  <span className="text-red-300 font-medium ml-2 capitalize">
                    {selectedBooking.issueType} Items
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm mb-2">Affected Items:</p>
                  {selectedBooking.affectedItems.map((itemName, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-white text-sm">{itemName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Close
            </button>
            {selectedBooking.status === "pending" && (
              <>
                <button
                  onClick={onConfirmBooking}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={onOpenCancelModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Cancel Booking
                </button>
              </>
            )}
            {selectedBooking.status === "confirmed" && (
              <button
                onClick={onMarkAsCompleted}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;

