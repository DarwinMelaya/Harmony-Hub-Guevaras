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
  setupDate: {
    type: Date,
    required: true,
  },
  setupTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
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
  // ✅ Agreement Fields
  agreement: {
    signature: {
      type: String, // Base64 encoded signature image
    },
    agreedAt: {
      type: Date,
    },
    agreedToTerms: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
    clientName: {
      type: String,
    },
    clientEmail: {
      type: String,
    },
    // Admin signature fields
    adminSignature: {
      type: String, // Base64 encoded signature image
    },
    adminSignedAt: {
      type: Date,
    },
    adminSignerName: {
      type: String, // Name of the person who signed (typed by admin)
    },
    adminSignerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  // Technical staff details (editable by admin)
  technicalStaff: {
    count: {
      type: Number,
      default: 6,
    },
    drivers: {
      type: Number,
      default: 2,
    },
    totalCrew: {
      type: Number,
      default: 8,
    },
    vehicles: {
      type: Number,
      default: 1,
    },
  },
  // Cancellation and Refund Fields
  cancellationReason: {
    type: String,
    trim: true,
  },
  refundAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  refundStatus: {
    type: String,
    enum: ["pending", "processed", "not_applicable"],
    default: "not_applicable",
  },
  refundedAt: {
    type: Date,
  },
  refundProof: {
    type: String, // URL to refund proof image (for GCash refunds)
  },
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
