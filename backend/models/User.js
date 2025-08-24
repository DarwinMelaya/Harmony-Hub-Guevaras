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
  password: { type: String, required: true },

  // Role-based fields
  role: {
    type: String,
    enum: ["admin", "client", "staff", "artist"],
    default: "client",
    required: true,
  },

  // Role-specific fields
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },

  // Common fields
  displayName: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
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

// Method to check if user is admin
UserSchema.methods.isAdmin = function () {
  return this.role === "admin";
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

module.exports = mongoose.model("User", UserSchema);
