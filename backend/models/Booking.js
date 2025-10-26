const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      type: {
        type: String,
        enum: ["inventory", "package", "bandArtist"],
        required: true,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  bookingTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in hours
    default: 1,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
  },
  contactInfo: {
    phone: String,
    email: String,
    address: String,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "gcash"],
    default: "cash",
  },
  paymentReference: {
    type: String,
    trim: true,
  },
  paymentImage: {
    type: String, // base64 string or file path
  },
  downpaymentType: {
    type: String,
    enum: ["full", "percentage"],
    default: "full",
  },
  downpaymentPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  downpaymentAmount: {
    type: Number,
    min: 0,
  },
  remainingBalance: {
    type: Number,
    min: 0,
    default: 0,
  },
  // ✅ New Fields for Completion Issues
  issueType: {
    type: String,
    enum: ["lost", "damaged"],
    default: null,
  },
  affectedItems: [
    {
      type: String,
      trim: true,
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
BookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
BookingSchema.index({ user: 1, bookingDate: 1 });
BookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
