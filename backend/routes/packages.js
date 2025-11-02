const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
PackageSchema.index({ isAvailable: 1, createdAt: -1 }); // For public packages queries
PackageSchema.index({ createdAt: -1 }); // For sorting by creation date

module.exports = mongoose.model("Packages", PackageSchema);
