const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false, // Optional - feedback can be general or booking-specific
  },
  // Service Usage Feedback
  serviceUsage: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    servicesUsed: [{
      type: String, // e.g., "inventory", "package", "bandArtist"
    }],
  },
  // Equipment Status Feedback
  equipmentStatus: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    equipmentIssues: [{
      itemName: String,
      issue: String,
      severity: {
        type: String,
        enum: ["minor", "moderate", "major"],
      },
    }],
  },
  // Revenue/Value Feedback
  valueFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    priceSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
    },
    wouldRecommend: {
      type: Boolean,
      default: false,
    },
  },
  // Overall Customer Satisfaction
  overallSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    improvements: [{
      type: String,
    }],
    highlights: [{
      type: String,
    }],
  },
  // Additional feedback
  additionalComments: {
    type: String,
    trim: true,
  },
  // Status
  status: {
    type: String,
    enum: ["submitted", "reviewed", "archived"],
    default: "submitted",
  },
  // Admin/Owner response
  response: {
    message: {
      type: String,
      trim: true,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
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
FeedbackSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
FeedbackSchema.index({ user: 1, createdAt: -1 });
FeedbackSchema.index({ booking: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ "overallSatisfaction.rating": 1 });
FeedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);

