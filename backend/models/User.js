const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  // Google OAuth fields (optional for manual registration)
  googleId: { type: String },
  profilePhoto: { type: String },

  // Manual registration fields
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  location: { type: String },
  username: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      // Password is only required if user is not using Google OAuth
      return !this.googleId;
    },
  },

  // Role-based fields
  role: {
    type: String,
    enum: ["owner", "admin", "client", "staff", "artist"],
    default: "client",
    required: true,
  },

  // Role-specific fields
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  
  // Email verification fields
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },

  // Password reset fields
  resetCode: { type: String },
  resetCodeExpires: { type: Date },

  // Artist-specific fields
  genre: {
    type: String,
    required: function () {
      return this.role === "artist";
    },
    trim: true,
  },
  booking_fee: {
    type: Number,
    required: function () {
      return this.role === "artist";
    },
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },

  // Common fields
  displayName: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving (only if password exists and is modified)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password (handle cases where password might not exist)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false; // If no password exists (Google OAuth user), return false
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has specific role
UserSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// Method to check if user has any of the specified roles
UserSchema.methods.hasAnyRole = function (roles) {
  return roles.includes(this.role);
};

// Method to check if user is owner
UserSchema.methods.isOwner = function () {
  return this.role === "owner";
};

// Method to check if user is admin
UserSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// Method to check if user is owner or admin
UserSchema.methods.isOwnerOrAdmin = function () {
  return ["owner", "admin"].includes(this.role);
};

// Method to check if user is staff or admin
UserSchema.methods.isStaffOrAdmin = function () {
  return ["admin", "staff"].includes(this.role);
};

// Method to check if user is artist
UserSchema.methods.isArtist = function () {
  return this.role === "artist";
};

// Method to check if user is client
UserSchema.methods.isClient = function () {
  return this.role === "client";
};

// Add indexes for better query performance
// Note: email and username already have indexes due to unique: true
UserSchema.index({ role: 1, isActive: 1, isAvailable: 1 }); // For artist queries
UserSchema.index({ role: 1, isActive: 1 }); // For role-based queries
UserSchema.index({ createdAt: -1 }); // For sorting by creation date

module.exports = mongoose.model("User", UserSchema);
