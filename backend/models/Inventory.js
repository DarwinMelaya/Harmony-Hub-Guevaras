const mongoose = require("mongoose");

const MaintenanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: [
      "routine",
      "repair",
      "inspection",
      "cleaning",
      "calibration",
      "other",
    ],
    default: "routine",
  },
  description: {
    type: String,
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
  },
});

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  image: {
    type: String, // Supabase Storage URL (primary image for backward compatibility)
    required: false,
  },
  images: {
    type: [String], // Full gallery of images
    default: [],
  },
  // Equipment condition tracking
  condition: {
    type: String,
    enum: ["excellent", "good", "fair", "poor", "needs-repair"],
    default: "excellent",
  },
  // Equipment status
  status: {
    type: String,
    enum: [
      "available",
      "in-use",
      "under-maintenance",
      "needs-repair",
      "retired",
    ],
    default: "available",
  },
  // Maintenance scheduling
  lastMaintenanceDate: {
    type: Date,
  },
  nextMaintenanceDate: {
    type: Date,
  },
  maintenanceIntervalDays: {
    type: Number,
    default: 90, // Default to 90 days (quarterly maintenance)
  },
  // Maintenance history
  maintenanceHistory: [MaintenanceRecordSchema],
  // Additional notes
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field to check if maintenance is due
InventorySchema.virtual("isMaintenanceDue").get(function () {
  if (!this.nextMaintenanceDate) return false;
  return new Date() >= this.nextMaintenanceDate;
});

// Virtual field to check if maintenance is overdue
InventorySchema.virtual("isMaintenanceOverdue").get(function () {
  if (!this.nextMaintenanceDate) return false;
  const daysOverdue = Math.floor(
    (new Date() - this.nextMaintenanceDate) / (1000 * 60 * 60 * 24)
  );
  return daysOverdue > 7; // Consider overdue if more than 7 days past due date
});

// Method to calculate next maintenance date
InventorySchema.methods.calculateNextMaintenance = function () {
  if (this.lastMaintenanceDate && this.maintenanceIntervalDays) {
    const next = new Date(this.lastMaintenanceDate);
    next.setDate(next.getDate() + this.maintenanceIntervalDays);
    return next;
  }
  // If no last maintenance, schedule from today
  if (this.maintenanceIntervalDays) {
    const next = new Date();
    next.setDate(next.getDate() + this.maintenanceIntervalDays);
    return next;
  }
  return null;
};

// Ensure virtuals are included in JSON
InventorySchema.set("toJSON", { virtuals: true });
InventorySchema.set("toObject", { virtuals: true });

// Ensure primary image stays in sync with gallery
InventorySchema.pre("save", function (next) {
  if (Array.isArray(this.images) && this.images.length > 0) {
    this.image = this.images[0];
  } else {
    this.images = this.image ? [this.image] : [];
  }
  next();
});

// Add indexes for better query performance
InventorySchema.index({ quantity: 1, status: 1 }); // For public inventory queries
InventorySchema.index({ status: 1 }); // For status filtering
InventorySchema.index({ createdAt: -1 }); // For sorting by creation date
InventorySchema.index({ nextMaintenanceDate: 1, status: 1 }); // For maintenance queries

module.exports = mongoose.model("Inventory", InventorySchema);
