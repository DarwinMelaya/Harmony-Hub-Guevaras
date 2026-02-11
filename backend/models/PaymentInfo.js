const mongoose = require("mongoose");

const paymentInfoSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: "GCash",
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    qrImage: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentInfo", paymentInfoSchema);

