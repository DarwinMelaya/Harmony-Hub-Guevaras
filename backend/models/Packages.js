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
    image: {
      type: String, 
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Packages", PackageSchema);
