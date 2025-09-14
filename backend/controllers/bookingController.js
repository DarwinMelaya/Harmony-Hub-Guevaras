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
      notes,
      contactInfo,
      paymentMethod = "cash",
      paymentReference,
      paymentImage,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required for booking",
      });
    }

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "Booking date and time are required",
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

    // Validate booking date is not in the past
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    if (bookingDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Booking date and time cannot be in the past",
      });
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
            isAvailable = true;
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
        return res.status(400).json({
          success: false,
          message: `${name} is not available${
            type === "inventory" ? " in the requested quantity" : ""
          }`,
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

    // Create the booking
    const booking = new Booking({
      user: userId,
      items: validatedItems,
      totalAmount,
      bookingDate: new Date(bookingDate),
      bookingTime,
      duration,
      notes,
      contactInfo,
      paymentMethod,
      paymentReference,
      paymentImage,
    });

    await booking.save();

    // Apply side effects upon booking creation
    // - Decrease inventory quantities for inventory items
    // - Mark packages and band artists as unavailable
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
      } else if (bookingItem.type === "bandArtist") {
        await User.findByIdAndUpdate(
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

    const booking = await Booking.findById(id).populate(
      "user",
      "fullName email username"
    );

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
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
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

    // Re-enable availability for packages and band artists when completed
    if (previousStatus !== "completed" && status === "completed") {
      for (const item of booking.items) {
        if (item.type === "package") {
          await Packages.findByIdAndUpdate(
            item.itemId,
            { $set: { isAvailable: true } },
            { new: true }
          );
        } else if (item.type === "bandArtist") {
          await User.findByIdAndUpdate(
            item.itemId,
            { $set: { isAvailable: true } },
            { new: true }
          );
        }
      }
    }

    // When booking is cancelled by admin, restore inventory and re-enable availability
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
        } else if (item.type === "bandArtist") {
          await User.findByIdAndUpdate(
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

    // Restore inventory and re-enable availability on cancellation
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
      } else if (item.type === "bandArtist") {
        await User.findByIdAndUpdate(
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

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
