const Booking = require("../models/Booking");
const Inventory = require("../models/Inventory");
const Packages = require("../models/Packages");
const User = require("../models/User");
const { generateBookingAgreementPDF } = require("../utils/pdfGenerator");
const {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} = require("../utils/supabaseImageUpload");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      items,
      bookingDate,
      bookingTime,
      duration = 1,
      setupDate,
      setupTime,
      notes,
      contactInfo,
      agreement,
    } = req.body;

    const userId = req.user.id;
    
    // Get user details for agreement
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required for booking",
      });
    }

    if (!bookingDate || !bookingTime || !setupDate || !setupTime) {
      return res.status(400).json({
        success: false,
        message: "Booking date, time, setup date, and setup time are required",
      });
    }

    // Validate booking date is not in the past and validate setup date
    // Parse date components to avoid timezone issues
    const [yearCheck, monthCheck, dayCheck] = bookingDate
      .split("-")
      .map(Number);
    const [hours, minutes] = bookingTime.split(":").map(Number);
    const bookingDateTime = new Date(
      yearCheck,
      monthCheck - 1,
      dayCheck,
      hours,
      minutes
    );
    if (bookingDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Booking date and time cannot be in the past",
      });
    }

    // Parse setup date
    const [setupYear, setupMonth, setupDay] = setupDate.split("-").map(Number);
    const setupDateObj = new Date(setupYear, setupMonth - 1, setupDay);
    const bookingDateObj = new Date(yearCheck, monthCheck - 1, dayCheck);

    // Validate setup date is before or equal to booking date
    if (setupDateObj > bookingDateObj) {
      return res.status(400).json({
        success: false,
        message: "Setup date must be before or equal to the booking date",
      });
    }

    // If same date, validate setup time is before booking time
    if (setupDateObj.getTime() === bookingDateObj.getTime()) {
      const [setupHours, setupMinutes] = setupTime.split(":").map(Number);
      if (
        setupHours > hours ||
        (setupHours === hours && setupMinutes >= minutes)
      ) {
        return res.status(400).json({
          success: false,
          message: "Setup time must be before the booking time",
        });
      }
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Validate each item and calculate total
    for (const item of items) {
      const { type, itemId, quantity, price, name } = item;
      // Normalize quantity: non-inventory items are singular
      const normalizedQuantity = type === "inventory" ? quantity : 1;

      if (!type || !itemId || !normalizedQuantity || !price || !name) {
        return res.status(400).json({
          success: false,
          message: "Invalid item data",
        });
      }

      // Check if item exists and is available
      let itemExists = false;
      let isAvailable = true;

      switch (type) {
        case "inventory":
          const inventoryItem = await Inventory.findById(itemId);
          if (inventoryItem) {
            itemExists = true;
            isAvailable = inventoryItem.quantity >= normalizedQuantity;
          }
          break;

        case "package":
          const packageItem = await Packages.findById(itemId);
          if (packageItem) {
            itemExists = true;
            // Treat undefined as available for backward compatibility
            const packageAvailable = packageItem.isAvailable !== false;
            if (!packageAvailable) {
              isAvailable = false;
              break;
            }
          }
          break;

        case "bandArtist":
          const artist = await User.findById(itemId);
          if (
            artist &&
            artist.role === "artist" &&
            artist.isActive &&
            artist.isAvailable !== false
          ) {
            itemExists = true;

            // Check if artist is already booked on the same date
            // Parse date components to avoid timezone issues
            const [year, month, day] = bookingDate.split("-").map(Number);
            const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
            const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

            const existingBooking = await Booking.findOne({
              "items.type": "bandArtist",
              "items.itemId": itemId,
              bookingDate: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
              status: { $in: ["pending", "confirmed"] },
            });

            if (existingBooking) {
              isAvailable = false;
            }
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid item type",
          });
      }

      if (!itemExists) {
        return res.status(404).json({
          success: false,
          message: `${type} item not found`,
        });
      }

      if (!isAvailable) {
        let message = `${name} is not available`;
        if (type === "inventory") {
          message += " in the requested quantity";
        } else if (type === "bandArtist") {
          message += " on the selected date";
        }
        return res.status(400).json({
          success: false,
          message: message,
        });
      }

      validatedItems.push({
        type,
        itemId,
        quantity: normalizedQuantity,
        price,
        name,
      });

      totalAmount += price * normalizedQuantity;
    }

    // Prepare agreement data with client information
    let agreementData = null;
    if (agreement) {
      agreementData = {
        ...agreement,
        clientName: user.fullName || user.username,
        clientEmail: user.email,
      };
    }

    // Create the booking
    const booking = new Booking({
      user: userId,
      items: validatedItems,
      totalAmount,
      bookingDate: bookingDateObj,
      bookingTime,
      duration,
      setupDate: setupDateObj,
      setupTime,
      notes,
      contactInfo,
      paymentMethod: null,
      paymentReference: null,
      paymentImage: null,
      downpaymentType: null,
      downpaymentPercentage: null,
      downpaymentAmount: 0,
      remainingBalance: totalAmount,
      paymentStatus: "awaiting_confirmation",
      agreement: agreementData,
    });

    await booking.save();

    // Apply side effects upon booking creation
    // - Decrease inventory quantities for inventory items
    // - Mark packages as unavailable
    for (const bookingItem of validatedItems) {
      if (bookingItem.type === "inventory") {
        await Inventory.findByIdAndUpdate(
          bookingItem.itemId,
          { $inc: { quantity: -bookingItem.quantity } },
          { new: true }
        );
      } else if (bookingItem.type === "package") {
        await Packages.findByIdAndUpdate(
          bookingItem.itemId,
          { $set: { isAvailable: false } },
          { new: true }
        );
      }
    }

    // Populate the booking with item details
    await booking.populate("user", "fullName email username");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "fullName email username")
      .populate({
        path: "items.itemId",
        model: "Packages",
        populate: {
          path: "items.inventoryItem",
          model: "Inventory",
          select: "name price quantity image",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "fullName email username")
      .populate({
        path: "items.itemId",
        model: "Packages",
        populate: {
          path: "items.inventoryItem",
          model: "Inventory",
          select: "name price quantity image",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate("user", "fullName email username")
      .populate({
        path: "items.itemId",
        model: "Packages",
        populate: {
          path: "items.inventoryItem",
          model: "Inventory",
          select: "name price quantity image",
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user can access this booking
    if (userRole !== "admin" && booking.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, issueType, affectedItems, cancellationReason } = req.body;

    if (
      !["pending", "confirmed", "cancelled", "completed", "refunded"].includes(
        req.body.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const previousStatus = booking.status;
    booking.status = status;

    if (previousStatus !== "confirmed" && status === "confirmed") {
      booking.paymentStatus = "awaiting_selection";
      booking.paymentSelectionAt = null;
      booking.paymentSubmittedAt = null;
      booking.paymentVerifiedAt = null;
    }

    if (status === "completed") {
      if (issueType) booking.issueType = issueType; // "lost" | "damaged"
      if (affectedItems && Array.isArray(affectedItems)) {
        booking.affectedItems = affectedItems;
      }

      // Clear remaining balance when marking as completed
      // This means the balance has been collected from the client
      booking.remainingBalance = 0;
    }

    // Handle cancellation with reason and refund
    if (status === "cancelled" && previousStatus !== "cancelled") {
      // Require cancellation reason when admin cancels
      if (!cancellationReason || cancellationReason.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required",
        });
      }

      booking.cancellationReason = cancellationReason.trim();

      // Calculate refund amount based on payment method
      if (booking.paymentMethod === "gcash") {
        // For GCash payments, refund the amount that was paid
        const paidAmount = booking.downpaymentAmount || booking.totalAmount || 0;
        booking.refundAmount = paidAmount;
        booking.refundStatus = "pending"; // Admin needs to process the refund
      } else {
        // For cash payments, no refund is applicable
        booking.refundAmount = 0;
        booking.refundStatus = "not_applicable";
      }
    }

    await booking.save();

    // Handle side effects based on status transitions
    // Return inventory quantities when booking gets confirmed
    if (previousStatus !== "confirmed" && status === "confirmed") {
      for (const item of booking.items) {
        if (item.type === "inventory") {
          await Inventory.findByIdAndUpdate(
            item.itemId,
            { $inc: { quantity: item.quantity } },
            { new: true }
          );
        }
      }
    }

    // Re-enable availability for packages when completed
    if (previousStatus !== "completed" && status === "completed") {
      for (const item of booking.items) {
        if (item.type === "package") {
          await Packages.findByIdAndUpdate(
            item.itemId,
            { $set: { isAvailable: true } },
            { new: true }
          );
        }
      }
    }

    // When booking is cancelled by admin, restore inventory and re-enable package availability
    if (previousStatus !== "cancelled" && status === "cancelled") {
      for (const item of booking.items) {
        if (item.type === "inventory") {
          await Inventory.findByIdAndUpdate(
            item.itemId,
            { $inc: { quantity: item.quantity } },
            { new: true }
          );
        } else if (item.type === "package") {
          await Packages.findByIdAndUpdate(
            item.itemId,
            { $set: { isAvailable: true } },
            { new: true }
          );
        }
      }
    }

    await booking.populate("user", "fullName email username");

    res.json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Cancel booking (user can cancel their own bookings)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;

    // Validate cancellation reason is provided
    if (!cancellationReason || cancellationReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user can cancel this booking
    if (booking.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      });
    }

    // Set cancellation reason
    booking.cancellationReason = cancellationReason.trim();
    booking.status = "cancelled";

    // Calculate refund amount based on payment method
    if (booking.paymentMethod === "gcash") {
      // For GCash payments, refund the amount that was paid (downpaymentAmount or totalAmount)
      const paidAmount = booking.downpaymentAmount || booking.totalAmount || 0;
      booking.refundAmount = paidAmount;
      booking.refundStatus = "pending"; // Admin needs to process the refund
    } else {
      // For cash payments, no refund is applicable
      booking.refundAmount = 0;
      booking.refundStatus = "not_applicable";
    }

    await booking.save();

    // Restore inventory and re-enable package availability on cancellation
    for (const item of booking.items) {
      if (item.type === "inventory") {
        await Inventory.findByIdAndUpdate(
          item.itemId,
          { $inc: { quantity: item.quantity } },
          { new: true }
        );
      } else if (item.type === "package") {
        await Packages.findByIdAndUpdate(
          item.itemId,
          { $set: { isAvailable: true } },
          { new: true }
        );
      }
    }

    await booking.populate("user", "fullName email username");

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Client: submit or update payment details after admin confirmation
const submitPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      paymentMethod,
      paymentReference,
      paymentImage,
      downpaymentType = "percentage",
      downpaymentPercentage = 50,
      agreement,
    } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking must be confirmed by admin before selecting payment method",
      });
    }

    if (!["cash", "gcash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Require contract/agreement to be signed together with payment
    if (!agreement || !agreement.signature) {
      return res.status(400).json({
        success: false,
        message:
          "Client must sign the booking agreement together with payment details",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let computedDownpaymentType = null;
    let computedDownpaymentPercentage = null;
    let computedDownpaymentAmount = 0;
    let computedRemainingBalance = booking.totalAmount;

    if (paymentMethod === "gcash") {
      if (!paymentReference || !paymentImage) {
        return res.status(400).json({
          success: false,
          message: "Payment reference and screenshot are required for GCash",
        });
      }

      computedDownpaymentType =
        downpaymentType === "full" ? "full" : "percentage";

      if (computedDownpaymentType === "percentage") {
        const sanitizedPercentage = Number(downpaymentPercentage) || 50;
        if (sanitizedPercentage <= 0 || sanitizedPercentage > 100) {
          return res.status(400).json({
            success: false,
            message: "Downpayment percentage must be between 1 and 100",
          });
        }
        computedDownpaymentPercentage = sanitizedPercentage;
        computedDownpaymentAmount =
          (booking.totalAmount * sanitizedPercentage) / 100;
      } else {
        computedDownpaymentPercentage = 100;
        computedDownpaymentAmount = booking.totalAmount;
      }

      computedRemainingBalance =
        booking.totalAmount - computedDownpaymentAmount;
    } else {
      // Cash payments are collected on event day
      computedDownpaymentType = null;
      computedDownpaymentPercentage = null;
      computedDownpaymentAmount = 0;
      computedRemainingBalance = booking.totalAmount;
    }

    // Update agreement with latest client signature/info
    booking.agreement = {
      ...(booking.agreement || {}),
      ...agreement,
      clientName: user.fullName || user.username,
      clientEmail: user.email,
    };

    booking.paymentMethod = paymentMethod;
    booking.paymentReference = paymentMethod === "gcash" ? paymentReference : null;
    booking.paymentImage = paymentMethod === "gcash" ? paymentImage : null;
    booking.downpaymentType = computedDownpaymentType;
    booking.downpaymentPercentage = computedDownpaymentPercentage;
    booking.downpaymentAmount = computedDownpaymentAmount;
    booking.remainingBalance = computedRemainingBalance;
    booking.paymentStatus = "submitted";
    booking.paymentSelectionAt = booking.paymentSelectionAt || new Date();
    booking.paymentSubmittedAt = new Date();

    await booking.save();
    await booking.populate("user", "fullName email username");

    res.json({
      success: true,
      message: "Payment details submitted successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error submitting payment details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get bookings for a specific artist
const getArtistBookings = async (req, res) => {
  try {
    const artistId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query to find bookings where this artist is involved
    const query = {
      "items.type": "bandArtist",
      "items.itemId": artistId,
    };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "fullName email username phoneNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    // Format the response to include artist-specific information
    const formattedBookings = bookings.map((booking) => {
      const artistItem = booking.items.find(
        (item) =>
          item.type === "bandArtist" && item.itemId.toString() === artistId
      );

      return {
        ...booking.toObject(),
        artistItem: artistItem, // Include the specific artist item details
        clientInfo: {
          fullName: booking.user.fullName,
          email: booking.user.email,
          username: booking.user.username,
          phoneNumber: booking.user.phoneNumber,
        },
      };
    });

    res.json({
      success: true,
      data: formattedBookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching artist bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Check artist availability for specific date
const checkArtistAvailability = async (req, res) => {
  try {
    const { artistId, bookingDate } = req.query;

    if (!artistId || !bookingDate) {
      return res.status(400).json({
        success: false,
        message: "Artist ID and booking date are required",
      });
    }

    // Check if artist exists and is generally available
    const artist = await User.findById(artistId);
    if (
      !artist ||
      artist.role !== "artist" ||
      !artist.isActive ||
      artist.isAvailable === false
    ) {
      return res.json({
        success: true,
        available: false,
        reason: "Artist is not available for booking",
      });
    }

    // Check if artist is already booked on the specific date
    // Parse date components to avoid timezone issues
    const [year, month, day] = bookingDate.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      "items.type": "bandArtist",
      "items.itemId": artistId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ["pending", "confirmed"] },
    });
    const isAvailable = !existingBooking;

    res.json({
      success: true,
      available: isAvailable,
      reason: isAvailable ? null : "Artist is already booked on this date",
      artist: {
        _id: artist._id,
        fullName: artist.fullName,
        genre: artist.genre,
        booking_fee: artist.booking_fee,
      },
    });
  } catch (error) {
    console.error("Error checking artist availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all bookings for calendar view (public - limited info for privacy)
const getPublicCalendarBookings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query for date range
    const query = {
      status: { $in: ["pending", "confirmed"] }, // Only show active bookings
    };

    // If date range is provided, filter by it
    if (startDate && endDate) {
      query.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch bookings with limited information for privacy
    const bookings = await Booking.find(query)
      .select(
        "bookingDate bookingTime duration status totalAmount items.type items.name items.itemId"
      )
      .sort({ bookingDate: 1 });

    // Format bookings to hide sensitive information
    const publicBookings = bookings.map((booking) => ({
      _id: booking._id,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      duration: booking.duration,
      status: booking.status,
      totalAmount: booking.totalAmount,
      itemsCount: booking.items?.length || 0,
      items: booking.items?.map((item) => ({
        type: item.type,
        name: item.name,
        itemId: item.itemId, // Include itemId to check artist bookings
      })),
    }));

    res.json({
      success: true,
      data: publicBookings,
      total: publicBookings.length,
    });
  } catch (error) {
    console.error("Error fetching public calendar bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Download booking agreement as PDF
const downloadBookingAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate("user", "fullName email username")
      .populate({
        path: "items.itemId",
        model: "Packages",
        populate: {
          path: "items.inventoryItem",
          model: "Inventory",
          select: "name price quantity image",
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user can access this booking agreement
    if (
      !["admin", "owner", "staff"].includes(userRole) &&
      booking.user._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if booking has agreement
    if (!booking.agreement || !booking.agreement.signature) {
      return res.status(400).json({
        success: false,
        message: "No signed agreement found for this booking",
      });
    }

    // Check if admin has signed (only for client users)
    if (
      userRole === "client" &&
      (!booking.agreement.adminSignature || !booking.agreement.adminSignerName)
    ) {
      return res.status(400).json({
        success: false,
        message: "Agreement is pending admin signature. Please wait for the admin to sign the contract.",
      });
    }

    // Generate and send PDF
    generateBookingAgreementPDF(booking, res);
  } catch (error) {
    console.error("Error downloading booking agreement:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin sign booking agreement
const adminSignAgreement = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { adminSignature, adminSignerName, technicalStaff } = req.body;

    // Only admin, owner, and staff can sign
    if (!["admin", "owner", "staff"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can sign booking agreements",
      });
    }

    // Validate required fields
    if (!adminSignature || !adminSignerName) {
      return res.status(400).json({
        success: false,
        message: "Admin signature and signer name are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking has client agreement
    if (!booking.agreement || !booking.agreement.signature) {
      return res.status(400).json({
        success: false,
        message: "Client must sign the agreement first",
      });
    }

    if (booking.paymentStatus !== "submitted") {
      return res.status(400).json({
        success: false,
        message:
          "Client must select a payment method and submit payment details before admin can sign",
      });
    }

    // Update booking with admin signature
    booking.agreement.adminSignature = adminSignature;
    booking.agreement.adminSignedAt = new Date();
    booking.agreement.adminSignerName = adminSignerName;
    booking.agreement.adminSignerId = userId;
    booking.paymentStatus = "verified";
    booking.paymentVerifiedAt = new Date();

    // Update technical staff if provided
    if (technicalStaff) {
      booking.technicalStaff = {
        count: technicalStaff.count || 6,
        drivers: technicalStaff.drivers || 2,
        totalCrew: technicalStaff.totalCrew || 8,
        vehicles: technicalStaff.vehicles || 1,
      };
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Agreement signed successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error signing agreement:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Process refund (admin/owner/staff only)
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundProof } = req.body;
    const userRole = req.user.role;

    // Only admin, owner, and staff can process refunds
    if (!["admin", "owner", "staff"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can process refunds",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking is cancelled
    if (booking.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled bookings can have refunds processed",
      });
    }

    // Check if refund is applicable
    if (booking.refundStatus === "not_applicable") {
      return res.status(400).json({
        success: false,
        message: "Refund is not applicable for this booking",
      });
    }

    // Check if refund is already processed
    if (booking.refundStatus === "processed") {
      return res.status(400).json({
        success: false,
        message: "Refund has already been processed",
      });
    }

    // Handle GCash refunds - require proof
    if (booking.paymentMethod === "gcash") {
      if (!refundProof || refundProof.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Refund proof is required for GCash refunds",
        });
      }

      // Upload refund proof to Supabase
      const uploadResult = await uploadImageToSupabase(
        refundProof,
        "refunds"
      );
      if (uploadResult.success) {
        booking.refundProof = uploadResult.url;
      } else {
        return res.status(400).json({
          success: false,
          message: `Failed to upload refund proof: ${uploadResult.error}`,
        });
      }
    }

    // Mark refund as processed and change status to refunded
    booking.refundStatus = "processed";
    booking.refundedAt = new Date();
    booking.status = "refunded"; // Change status from cancelled to refunded

    await booking.save();
    await booking.populate("user", "fullName email username");

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add extension charge to booking
const addBookingExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, rate, amount, description, paymentMethod = "cash" } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const parsedHours = hours !== undefined ? Number(hours) : null;
    const parsedRate = rate !== undefined ? Number(rate) : null;
    let computedAmount =
      amount !== undefined ? Number(amount) : null;

    if ((computedAmount === null || isNaN(computedAmount)) && parsedHours !== null && parsedRate !== null) {
      computedAmount = parsedHours * parsedRate;
    }

    if (computedAmount === null || isNaN(computedAmount) || computedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid amount or hour/rate combination is required.",
      });
    }

    const extension = {
      hours: parsedHours,
      rate: parsedRate,
      amount: computedAmount,
      description: description?.trim(),
      paymentMethod: ["cash", "gcash"].includes(paymentMethod)
        ? paymentMethod
        : "cash",
      recordedBy: req.user.id,
    };

    booking.extensions.push(extension);
    booking.extensionBalance =
      Number(booking.extensionBalance || 0) + computedAmount;

    await booking.save();
    await booking.populate("user", "fullName email username");
    await booking.populate({
      path: "items.itemId",
      model: "Packages",
      populate: {
        path: "items.inventoryItem",
        model: "Inventory",
        select: "name price quantity image",
      },
    });

    res.json({
      success: true,
      message: "Extension charge added successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error adding booking extension:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark extension as paid
const markExtensionPaid = async (req, res) => {
  try {
    const { id, extensionId } = req.params;
    const { paymentProof } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const extension = booking.extensions.id(extensionId);
    if (!extension) {
      return res.status(404).json({
        success: false,
        message: "Extension charge not found",
      });
    }

    if (extension.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Extension charge already marked as paid",
      });
    }

    if (extension.paymentMethod === "gcash" && paymentProof) {
      const uploadResult = await uploadImageToSupabase(paymentProof, "extensions");
      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: `Failed to upload payment proof: ${uploadResult.error}`,
        });
      }
      extension.paymentProof = uploadResult.url;
    }

    extension.status = "paid";
    extension.paidAt = new Date();

    const newBalance = Number(booking.extensionBalance || 0) - Number(extension.amount || 0);
    booking.extensionBalance = newBalance > 0 ? newBalance : 0;

    await booking.save();
    await booking.populate("user", "fullName email username");
    await booking.populate({
      path: "items.itemId",
      model: "Packages",
      populate: {
        path: "items.inventoryItem",
        model: "Inventory",
        select: "name price quantity image",
      },
    });

    res.json({
      success: true,
      message: "Extension charge marked as paid",
      data: booking,
    });
  } catch (error) {
    console.error("Error marking extension as paid:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  submitPaymentDetails,
  getArtistBookings,
  checkArtistAvailability,
  getPublicCalendarBookings,
  downloadBookingAgreement,
  adminSignAgreement,
  processRefund,
  addBookingExtension,
  markExtensionPaid,
};
