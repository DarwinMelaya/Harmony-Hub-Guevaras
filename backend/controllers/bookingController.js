const Booking = require("../models/Booking");
const Inventory = require("../models/Inventory");
const Packages = require("../models/Packages");
const User = require("../models/User");

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
      paymentMethod = "cash",
      paymentReference,
      paymentImage,
      downpaymentType = "full",
      downpaymentPercentage = 100,
      downpaymentAmount,
      remainingBalance,
    } = req.body;

    const userId = req.user.id;

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

    // Validate payment method
    if (!["cash", "gcash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Validate GCash payment requirements
    if (paymentMethod === "gcash") {
      if (!paymentReference || !paymentImage) {
        return res.status(400).json({
          success: false,
          message:
            "Payment reference and image are required for GCash payments",
        });
      }
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

    // Calculate downpayment if not provided
    let calculatedDownpayment = downpaymentAmount;
    let calculatedRemainingBalance = remainingBalance;

    if (paymentMethod === "gcash") {
      if (!calculatedDownpayment) {
        calculatedDownpayment =
          downpaymentType === "full"
            ? totalAmount
            : (totalAmount * downpaymentPercentage) / 100;
      }
      if (!calculatedRemainingBalance) {
        calculatedRemainingBalance = totalAmount - calculatedDownpayment;
      }
    } else {
      // For cash payment, no downpayment concept
      calculatedDownpayment = 0;
      calculatedRemainingBalance = totalAmount;
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
      paymentMethod,
      paymentReference,
      paymentImage,
      downpaymentType,
      downpaymentPercentage,
      downpaymentAmount: calculatedDownpayment,
      remainingBalance: calculatedRemainingBalance,
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
    const { status, issueType, affectedItems } = req.body;

    if (
      !["pending", "confirmed", "cancelled", "completed"].includes(
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

    if (status === "completed") {
      if (issueType) booking.issueType = issueType; // "lost" | "damaged"
      if (affectedItems && Array.isArray(affectedItems)) {
        booking.affectedItems = affectedItems;
      }

      // Clear remaining balance when marking as completed
      // This means the balance has been collected from the client
      booking.remainingBalance = 0;
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
    const userId = req.user.id;

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

    booking.status = "cancelled";
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

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getArtistBookings,
  checkArtistAvailability,
};
