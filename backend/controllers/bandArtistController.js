const BandArtist = require("../models/BandArtist");

// Add new band artist (Admin only)
const addBandArtist = async (req, res) => {
  try {
    const { name, genre, booking_fee } = req.body;
    const createdBy = req.userId; // Fixed: use req.userId instead of req.user.userId

    // Validate required fields
    if (!name || !genre || !booking_fee) {
      return res.status(400).json({
        success: false,
        message: "Name, genre, and booking_fee are required",
      });
    }

    // Validate booking_fee is a positive number
    if (typeof booking_fee !== "number" || booking_fee < 0) {
      return res.status(400).json({
        success: false,
        message: "Booking fee must be a positive number",
      });
    }

    // Check if band artist with same name already exists
    const existingBandArtist = await BandArtist.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive match
    });

    if (existingBandArtist) {
      return res.status(400).json({
        success: false,
        message: "A band artist with this name already exists",
      });
    }

    // Create new band artist
    const bandArtist = new BandArtist({
      name,
      genre,
      booking_fee,
      createdBy,
    });

    await bandArtist.save();

    // Populate creator info
    await bandArtist.populate("createdBy", "fullName username");

    res.status(201).json({
      success: true,
      message: "Band artist added successfully",
      data: bandArtist,
    });
  } catch (error) {
    console.error("Add band artist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all band artists
const getAllBandArtists = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, genre, isActive } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: "i" };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get band artists with pagination
    const bandArtists = await BandArtist.find(filter)
      .populate("createdBy", "fullName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await BandArtist.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bandArtists,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all band artists error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get band artist by ID
const getBandArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const bandArtist = await BandArtist.findById(id).populate(
      "createdBy",
      "fullName username"
    );

    if (!bandArtist) {
      return res.status(404).json({
        success: false,
        message: "Band artist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bandArtist,
    });
  } catch (error) {
    console.error("Get band artist by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update band artist (Admin only)
const updateBandArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, genre, booking_fee, isActive } = req.body;

    const bandArtist = await BandArtist.findById(id);

    if (!bandArtist) {
      return res.status(404).json({
        success: false,
        message: "Band artist not found",
      });
    }

    // Check if name is being changed and if it conflicts with existing name
    if (name && name !== bandArtist.name) {
      const existingBandArtist = await BandArtist.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id }, // Exclude current band artist
      });

      if (existingBandArtist) {
        return res.status(400).json({
          success: false,
          message: "A band artist with this name already exists",
        });
      }
    }

    // Update fields
    if (name !== undefined) bandArtist.name = name;
    if (genre !== undefined) bandArtist.genre = genre;
    if (booking_fee !== undefined) {
      if (typeof booking_fee !== "number" || booking_fee < 0) {
        return res.status(400).json({
          success: false,
          message: "Booking fee must be a positive number",
        });
      }
      bandArtist.booking_fee = booking_fee;
    }
    if (isActive !== undefined) bandArtist.isActive = isActive;

    await bandArtist.save();
    await bandArtist.populate("createdBy", "fullName username");

    res.status(200).json({
      success: true,
      message: "Band artist updated successfully",
      data: bandArtist,
    });
  } catch (error) {
    console.error("Update band artist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete band artist (Admin only)
const deleteBandArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const bandArtist = await BandArtist.findById(id);

    if (!bandArtist) {
      return res.status(404).json({
        success: false,
        message: "Band artist not found",
      });
    }

    await BandArtist.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Band artist deleted successfully",
    });
  } catch (error) {
    console.error("Delete band artist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle band artist status (Admin only)
const toggleBandArtistStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const bandArtist = await BandArtist.findById(id);

    if (!bandArtist) {
      return res.status(404).json({
        success: false,
        message: "Band artist not found",
      });
    }

    bandArtist.isActive = !bandArtist.isActive;
    await bandArtist.save();
    await bandArtist.populate("createdBy", "fullName username");

    res.status(200).json({
      success: true,
      message: `Band artist ${
        bandArtist.isActive ? "activated" : "deactivated"
      } successfully`,
      data: bandArtist,
    });
  } catch (error) {
    console.error("Toggle band artist status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addBandArtist,
  getAllBandArtists,
  getBandArtistById,
  updateBandArtist,
  deleteBandArtist,
  toggleBandArtistStatus,
};
