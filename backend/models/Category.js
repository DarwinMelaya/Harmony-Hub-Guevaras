const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
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
CategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
// Note: name field already has an index due to unique: true
CategorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", CategorySchema);

