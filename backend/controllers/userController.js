const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register new user
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      location,
      username,
      password,
      role,
      genre,
      booking_fee,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Validate role if provided (only admin can assign admin/staff roles)
    const validRoles = ["client", "artist", "staff", "admin"];
    const userRole = role || "client";

    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Validate artist-specific fields
    if (userRole === "artist") {
      if (!genre || !booking_fee) {
        return res.status(400).json({
          success: false,
          message: "Genre and booking fee are required for artist registration",
        });
      }
      if (booking_fee < 0) {
        return res.status(400).json({
          success: false,
          message: "Booking fee must be a positive number",
        });
      }
    }

    // Create new user
    const userData = {
      fullName,
      email,
      phoneNumber,
      location,
      username,
      password,
      role: userRole,
      displayName: fullName,
    };

    // Add artist-specific fields if role is artist
    if (userRole === "artist") {
      userData.genre = genre;
      userData.booking_fee = parseFloat(booking_fee);
    }

    const user = new User(userData);

    await user.save();

    // Send confirmation email
  const sendEmail = require("../utils/sendEmail");

  await sendEmail(
    user.email,
    "Welcome to Harmony Hub 🎉",
    `Hi ${user.fullName}, you just signed up on Harmony Hub using this email.`,
    `
      <h2>Welcome to Harmony Hub!</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>We’re excited to have you join our community! You successfully signed up on <strong>Harmony Hub</strong> using this email address: <b>${user.email}</b>.</p>
      <p>If this wasn’t you, please ignore this message.</p>
      <br/>
      <p>With love,<br/>The Harmony Hub Team</p>
    `
  );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    // Add artist-specific fields to response if user is an artist
    if (user.role === "artist") {
      userResponse.genre = user.genre;
      userResponse.booking_fee = user.booking_fee;
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, location, username, displayName } = req.body;

    // Check if username is being changed and if it's already taken
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        phoneNumber,
        location,
        username,
        displayName,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Optimized query with lean() for better performance
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get users by role (admin/staff only)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ["admin", "client", "staff", "artist"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const users = await User.find({ role })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update user role (admin/owner only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user; // Current user making the request

    // Only admins can change user roles
    if (currentUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can change user roles",
      });
    }

    // Validate role
    const validRoles = ["admin", "client", "staff", "artist", "owner"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Find the target user
    const targetUser = await User.findById(userId).select("-password");
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admins from changing their own role
    if (currentUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Update the user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle user active status (admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    user.isActive = !user.isActive;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
          inactive: {
            $sum: { $cond: ["$isActive", 0, 1] },
          },
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: stats,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all artists (staff/admin only)
const getArtists = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, genre, isActive } = req.query;

    // Build filter object
    const filter = { role: "artist" };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ];
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: "i" };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get artists with pagination
    const artists = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: artists,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get artists error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all artists for public display (no auth required)
const getArtistsPublic = async (req, res) => {
  try {
    // Optimized query: select only necessary fields and use lean() for better performance
    const artists = await User.find(
      {
        role: "artist",
        isActive: true,
        isAvailable: true,
      },
      {
        fullName: 1,
        displayName: 1,
        genre: 1,
        booking_fee: 1,
        profilePhoto: 1,
        isAvailable: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for faster JSON serialization

    // Set cache headers for 5 minutes
    res.set("Cache-Control", "public, max-age=300");
    res.status(200).json({
      success: true,
      data: artists,
    });
  } catch (error) {
    console.error("Get artists public error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update artist availability (artist only)
const updateArtistAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const userId = req.userId;

    // Find the user and verify they are an artist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        success: false,
        message: "Only artists can update their availability",
      });
    }

    // Update availability
    user.isAvailable = isAvailable;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: `Availability updated to ${
        isAvailable ? "Available" : "Not Available"
      }`,
      data: {
        _id: user._id,
        fullName: user.fullName,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    console.error("Update artist availability error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update artist availability by ID (admin/staff only)
const updateArtistAvailabilityById = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAvailable } = req.body;

    // Find the user and verify they are an artist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "artist") {
      return res.status(400).json({
        success: false,
        message: "User is not an artist",
      });
    }

    // Update availability
    user.isAvailable = isAvailable;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: `Artist availability updated to ${
        isAvailable ? "Available" : "Not Available"
      }`,
      data: {
        _id: user._id,
        fullName: user.fullName,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    console.error("Update artist availability by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update artist booking fee (artist only)
const updateArtistBookingFee = async (req, res) => {
  try {
    const { booking_fee } = req.body;
    const userId = req.userId;

    // Validate booking fee
    if (booking_fee === undefined || booking_fee === null) {
      return res.status(400).json({
        success: false,
        message: "Booking fee is required",
      });
    }

    if (typeof booking_fee !== "number" || booking_fee < 0) {
      return res.status(400).json({
        success: false,
        message: "Booking fee must be a positive number",
      });
    }

    // Find the user and verify they are an artist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        success: false,
        message: "Only artists can update their booking fee",
      });
    }

    // Update booking fee
    user.booking_fee = parseFloat(booking_fee);
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Booking fee updated successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        booking_fee: user.booking_fee,
      },
    });
  } catch (error) {
    console.error("Update artist booking fee error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser,
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  toggleUserStatus,
  getUserStats,
  getArtists,
  getArtistsPublic,
  updateArtistAvailability,
  updateArtistAvailabilityById,
  updateArtistBookingFee,
};
