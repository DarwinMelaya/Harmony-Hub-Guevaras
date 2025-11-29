import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Phone,
  QrCode,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  X,
} from "lucide-react";

const defaultFormState = {
  label: "GCash",
  mobileNumber: "",
  qrImage: "",
  isActive: true,
};

const PaymentInfo = () => {
  const [paymentInfos, setPaymentInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState(defaultFormState);
  const [qrPreview, setQrPreview] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPaymentInfos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5000/api/payment-info", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load payment info");
      }

      setPaymentInfos(data.data || []);
    } catch (err) {
      console.error("Payment Info Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPaymentInfos();
    }
  }, [token]);

  const resetForm = () => {
    setFormData(defaultFormState);
    setQrPreview("");
    setError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (info) => {
    setSelectedPayment(info);
    setFormData({
      label: info.label || "GCash",
      mobileNumber: info.mobileNumber || "",
      qrImage: info.qrImage || "",
      isActive: info.isActive ?? true,
    });
    setQrPreview(info.qrImage || "");
    setError(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (info) => {
    setPaymentToDelete(info);
    setShowDeleteModal(true);
  };

  const handleQrUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image for the QR code.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, qrImage: reader.result }));
      setQrPreview(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const validateForm = () => {
    if (!formData.mobileNumber.trim()) {
      setError("Mobile number is required.");
      return false;
    }
    if (!formData.qrImage) {
      setError("QR code image is required.");
      return false;
    }
    return true;
  };

  const handleAddPaymentInfo = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/payment-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add payment info.");
      }

      setPaymentInfos((prev) => [data.data, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error("Add Payment Info Error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPaymentInfo = async (event) => {
    event.preventDefault();
    if (!selectedPayment || !validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/payment-info/${selectedPayment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update payment info.");
      }

      setPaymentInfos((prev) =>
        prev.map((info) => (info._id === data.data._id ? data.data : info))
      );
      setShowEditModal(false);
      setSelectedPayment(null);
      resetForm();
    } catch (err) {
      console.error("Update Payment Info Error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaymentInfo = async () => {
    if (!paymentToDelete) return;
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/payment-info/${paymentToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete payment info.");
      }

      setPaymentInfos((prev) =>
        prev.filter((info) => info._id !== paymentToDelete._id)
      );
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    } catch (err) {
      console.error("Delete Payment Info Error:", err);
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredPaymentInfos = paymentInfos.filter((info) => {
    const term = searchTerm.toLowerCase();
    return (
      info.label?.toLowerCase().includes(term) ||
      info.mobileNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search payment info..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Payment Info
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-300">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredPaymentInfos.length === 0 ? (
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm ? "No payment info found" : "No payment info added yet"}
          </h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Add your payment details to guide clients."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPaymentInfos.map((info) => (
            <div
              key={info._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-400">
                    {info.label || "GCash"}
                  </p>
                  <p className="text-xl font-semibold text-white flex items-center gap-2 mt-1">
                    <Phone className="w-5 h-5 text-blue-400" />
                    {info.mobileNumber}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full border ${
                    info.isActive
                      ? "bg-green-500/20 text-green-300 border-green-500/40"
                      : "bg-gray-600/20 text-gray-300 border-gray-500/40"
                  }`}
                >
                  {info.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {info.qrImage && (
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 flex items-center justify-center">
                  <img
                    src={info.qrImage}
                    alt={`${info.label || "GCash"} QR`}
                    className="max-h-48 object-contain"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(info)}
                  className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(info)}
                  className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredPaymentInfos.length > 0 && (
        <p className="text-sm text-gray-400">
          Showing {filteredPaymentInfos.length} of {paymentInfos.length} payment
          method{paymentInfos.length === 1 ? "" : "s"}.
        </p>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <PaymentInfoModal
          title="Add Payment Info"
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          onSubmit={handleAddPaymentInfo}
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          qrPreview={qrPreview}
          handleQrUpload={handleQrUpload}
          setQrPreview={setQrPreview}
          isEdit={false}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPayment && (
        <PaymentInfoModal
          title="Edit Payment Info"
          onClose={() => {
            setShowEditModal(false);
            setSelectedPayment(null);
            resetForm();
          }}
          onSubmit={handleEditPaymentInfo}
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          qrPreview={qrPreview}
          handleQrUpload={handleQrUpload}
          setQrPreview={setQrPreview}
          isEdit
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-3 p-6 border-b border-gray-800">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Payment Info
                </h3>
                <p className="text-gray-400 text-sm">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <p className="text-gray-300">
                Are you sure you want to remove the payment info for{" "}
                <span className="font-semibold text-white">
                  {paymentToDelete.label} - {paymentToDelete.mobileNumber}
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-gray-800">
              <button
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPaymentToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleDeletePaymentInfo}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentInfoModal = ({
  title,
  onClose,
  onSubmit,
  formData,
  setFormData,
  submitting,
  qrPreview,
  handleQrUpload,
  setQrPreview,
  isEdit,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">
              Provide the mobile number and QR code clients should use.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Label / Method Name
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
              placeholder="e.g., GCash, PayMaya"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mobile Number *
            </label>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    mobileNumber: event.target.value,
                  }))
                }
                placeholder="+63 900 000 0000"
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              QR Code Image *
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-dashed border-gray-600 rounded-lg text-gray-300 cursor-pointer hover:border-blue-500 hover:text-white transition-colors">
                <ImageIcon className="w-5 h-5" />
                <span>Upload QR Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrUpload}
                />
              </label>
              {qrPreview && (
                <button
                  type="button"
                  className="text-sm text-red-300 hover:text-red-200"
                  onClick={() => {
                    setQrPreview("");
                    setFormData((prev) => ({ ...prev, qrImage: "" }));
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            {qrPreview && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-center">
                <img
                  src={qrPreview}
                  alt="QR Preview"
                  className="max-h-48 object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: event.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-300 text-sm">
              Mark as active
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEdit ? "Saving..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Payment Info"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentInfo;
