const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
} = require("../utils/sendEmail");
const {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} = require("../utils/supabaseImageUpload");

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(
      verificationCodeExpires.getMinutes() + 10
    ); // 10 minutes expiry

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
      isVerified: false,
      isActive: false, // User is inactive until verified
      verificationCode,
      verificationCodeExpires,
    };

    // Add artist-specific fields if role is artist
    if (userRole === "artist") {
      userData.genre = genre;
      userData.booking_fee = parseFloat(booking_fee);
    }

    const user = new User(userData);
    await user.save();

    // Send verification email
    try {
      const emailHtml = getVerificationEmailTemplate(
        user.fullName,
        verificationCode
      );
      const emailText = `Hi ${user.fullName}, your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;

      await sendEmail(
        user.email,
        "Verify Your Email - Harmony Hub",
        emailText,
        emailHtml
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue even if email fails - user can request resend
    }

    // Return user data (without password and verification code)
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
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    // Add artist-specific fields to response if user is an artist
    if (user.role === "artist") {
      userResponse.genre = user.genre;
      userResponse.booking_fee = user.booking_fee;
    }

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification code.",
      data: userResponse,
      requiresVerification: true,
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

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message:
          "Please verify your email address before logging in. Check your email for the verification code.",
        requiresVerification: true,
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
    const {
      fullName,
      phoneNumber,
      location,
      username,
      displayName,
      profilePhoto,
      removeProfilePhoto,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSupabaseUrl = (url) =>
      typeof url === "string" && url.includes("/storage/v1/object/public/");

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
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
      user.username = username;
    }

    // Update basic fields (allow empty strings but ignore undefined)
    if (fullName !== undefined) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (location !== undefined) user.location = location;
    if (displayName !== undefined) user.displayName = displayName;

    let newProfilePhotoUrl;
    const shouldRemovePhoto =
      removeProfilePhoto === true || profilePhoto === null;

    if (!shouldRemovePhoto && typeof profilePhoto === "string") {
      const isBase64Image = profilePhoto.startsWith("data:");

      if (isBase64Image) {
        const uploadResult = await uploadImageToSupabase(
          profilePhoto,
          "profile-photos"
        );

        if (!uploadResult.success) {
          return res.status(400).json({
            success: false,
            message: `Failed to upload profile photo: ${uploadResult.error}`,
          });
        }

        newProfilePhotoUrl = uploadResult.url;
      } else if (profilePhoto.trim()) {
        // Accept direct URL updates (e.g., from external providers)
        newProfilePhotoUrl = profilePhoto.trim();
      }
    }

    if (shouldRemovePhoto) {
      if (isSupabaseUrl(user.profilePhoto)) {
        await deleteImageFromSupabase(user.profilePhoto);
      }
      user.profilePhoto = undefined;
    } else if (newProfilePhotoUrl) {
      if (
        user.profilePhoto &&
        user.profilePhoto !== newProfilePhotoUrl &&
        isSupabaseUrl(user.profilePhoto)
      ) {
        await deleteImageFromSupabase(user.profilePhoto);
      }
      user.profilePhoto = newProfilePhotoUrl;
    }

    user.updatedAt = Date.now();
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.verificationCode;
    delete userObject.verificationCodeExpires;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userObject,
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

// Delete user by ID (allows clients to delete users)
const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent users from deleting themselves
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account. Please use the account deletion feature.",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user by ID error:", error);
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

// Verify email with verification code
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if verification code matches
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Check if verification code has expired
    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Verify user and activate account
    user.isVerified = true;
    user.isActive = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.updatedAt = Date.now();
    await user.save();

    // Send welcome email
    try {
      const emailHtml = getWelcomeEmailTemplate(user.fullName, user.email);
      const emailText = `Welcome to Harmony Hub, ${user.fullName}! Your email has been verified successfully.`;

      await sendEmail(
        user.email,
        "Welcome to Harmony Hub! 🎉",
        emailText,
        emailHtml
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue even if email fails
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
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    // Add artist-specific fields to response if user is an artist
    if (user.role === "artist") {
      userResponse.genre = user.genre;
      userResponse.booking_fee = user.booking_fee;
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Harmony Hub.",
      data: userResponse,
      token,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(
      verificationCodeExpires.getMinutes() + 10
    ); // 10 minutes expiry

    // Update user with new verification code
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    user.updatedAt = Date.now();
    await user.save();

    // Send verification email
    try {
      const emailHtml = getVerificationEmailTemplate(
        user.fullName,
        verificationCode
      );
      const emailText = `Hi ${user.fullName}, your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;

      await sendEmail(
        user.email,
        "Verify Your Email - Harmony Hub",
        emailText,
        emailHtml
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Forgot password - send reset code
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset code has been sent.",
      });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google authentication. Please sign in with Google.",
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date();
    resetCodeExpires.setMinutes(resetCodeExpires.getMinutes() + 10); // 10 minutes expiry

    // Update user with reset code
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    user.updatedAt = Date.now();
    await user.save();

    // Send password reset email
    try {
      const emailHtml = getPasswordResetEmailTemplate(user.fullName, resetCode);
      const emailText = `Hi ${user.fullName}, your password reset code is: ${resetCode}. This code will expire in 10 minutes.`;

      await sendEmail(
        user.email,
        "Password Reset Request - Harmony Hub",
        emailText,
        emailHtml
      );
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset code sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reset password with reset code
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code, and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if reset code matches
    if (user.resetCode !== resetCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    // Check if reset code has expired
    if (!user.resetCodeExpires || new Date() > user.resetCodeExpires) {
      return res.status(400).json({
        success: false,
        message: "Reset code has expired. Please request a new one.",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
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
  deleteUserById,
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
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
};
