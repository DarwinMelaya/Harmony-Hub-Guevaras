const PaymentInfo = require("../models/PaymentInfo");

const sanitizeMobileNumber = (value = "") =>
  value.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

// Public endpoint: get active payment info
exports.getPublicPaymentInfos = async (_req, res) => {
  try {
    const paymentInfos = await PaymentInfo.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("label mobileNumber qrImage isActive createdAt");

    return res.json({
      success: true,
      data: paymentInfos,
    });
  } catch (error) {
    console.error("Public PaymentInfo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Create new payment info
exports.createPaymentInfo = async (req, res) => {
  try {
    const { mobileNumber, qrImage, label = "GCash", isActive = true } = req.body;

    if (!mobileNumber || !qrImage) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and QR image are required.",
      });
    }

    const paymentInfo = await PaymentInfo.create({
      label: label.trim() || "GCash",
      mobileNumber: sanitizeMobileNumber(mobileNumber),
      qrImage,
      isActive,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Payment info added successfully.",
      data: paymentInfo,
    });
  } catch (error) {
    console.error("Create PaymentInfo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get all payment info
exports.getPaymentInfos = async (_req, res) => {
  try {
    const paymentInfos = await PaymentInfo.find()
      .sort({ isActive: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: paymentInfos,
    });
  } catch (error) {
    console.error("Get PaymentInfo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update payment info
exports.updatePaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { mobileNumber, qrImage, label, isActive } = req.body;

    const paymentInfo = await PaymentInfo.findById(id);
    if (!paymentInfo) {
      return res.status(404).json({
        success: false,
        message: "Payment info not found.",
      });
    }

    if (mobileNumber) {
      paymentInfo.mobileNumber = sanitizeMobileNumber(mobileNumber);
    }
    if (typeof qrImage === "string" && qrImage.trim().length > 0) {
      paymentInfo.qrImage = qrImage;
    }
    if (typeof label === "string") {
      paymentInfo.label = label.trim() || paymentInfo.label;
    }
    if (typeof isActive === "boolean") {
      paymentInfo.isActive = isActive;
    }

    await paymentInfo.save();

    return res.json({
      success: true,
      message: "Payment info updated successfully.",
      data: paymentInfo,
    });
  } catch (error) {
    console.error("Update PaymentInfo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete payment info
exports.deletePaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PaymentInfo.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Payment info not found.",
      });
    }

    return res.json({
      success: true,
      message: "Payment info deleted successfully.",
    });
  } catch (error) {
    console.error("Delete PaymentInfo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

