const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
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
UnitSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
// Note: name field already has an index due to unique: true
UnitSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Unit", UnitSchema);

