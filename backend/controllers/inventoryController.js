const Inventory = require("../models/Inventory");
const {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} = require("../utils/supabaseImageUpload");

// Add new inventory item (admin only)
exports.addInventory = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      image,
      condition,
      status,
      maintenanceIntervalDays,
      notes,
    } = req.body;
    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required." });
    }

    const inventoryData = {
      name,
      price,
      quantity,
      condition: condition || "excellent",
      status: status || "available",
      maintenanceIntervalDays: maintenanceIntervalDays || 90,
      notes,
    };

    // Upload image to Supabase Storage if provided
    if (image) {
      const uploadResult = await uploadImageToSupabase(image, "inventory");
      if (uploadResult.success) {
        inventoryData.image = uploadResult.url;
      } else {
        return res.status(400).json({
          success: false,
          message: `Failed to upload image: ${uploadResult.error}`,
        });
      }
    }

    // If maintenance interval is set, calculate next maintenance date
    if (inventoryData.maintenanceIntervalDays) {
      const nextDate = new Date();
      nextDate.setDate(
        nextDate.getDate() + inventoryData.maintenanceIntervalDays
      );
      inventoryData.nextMaintenanceDate = nextDate;
    }

    const inventory = new Inventory(inventoryData);
    await inventory.save();
    res.status(201).json({
      success: true,
      message: "Inventory item added successfully.",
      inventory,
    });
  } catch (error) {
    console.error("Add Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    // Optimized query with lean() for better performance
    const inventory = await Inventory.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, inventory });
  } catch (error) {
    console.error("Get Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get all inventory items (public - for clients)
exports.getPublicInventory = async (req, res) => {
  try {
    // Optimized query: select only necessary fields and use lean() for better performance
    const inventory = await Inventory.find(
      { quantity: { $gt: 0 }, status: { $ne: "retired" } },
      {
        name: 1,
        price: 1,
        quantity: 1,
        image: 1,
        condition: 1,
        status: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for faster JSON serialization

    // Set cache headers for 5 minutes
    res.set("Cache-Control", "public, max-age=300");
    res.status(200).json({ success: true, inventory });
  } catch (error) {
    console.error("Get Public Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Update inventory item (admin only)
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      quantity,
      image,
      condition,
      status,
      maintenanceIntervalDays,
      notes,
    } = req.body;

    // Find existing inventory item to check for old image
    const existingItem = await Inventory.findById(id);
    if (!existingItem) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found." });
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = price;
    if (quantity !== undefined) update.quantity = quantity;
    if (condition !== undefined) update.condition = condition;
    if (status !== undefined) update.status = status;
    if (maintenanceIntervalDays !== undefined)
      update.maintenanceIntervalDays = maintenanceIntervalDays;
    if (notes !== undefined) update.notes = notes;

    // Handle image upload if new image is provided
    if (image !== undefined) {
      // Delete old image from Supabase if exists
      if (existingItem.image) {
        await deleteImageFromSupabase(existingItem.image);
      }

      // Upload new image to Supabase Storage
      const uploadResult = await uploadImageToSupabase(image, "inventory");
      if (uploadResult.success) {
        update.image = uploadResult.url;
      } else {
        return res.status(400).json({
          success: false,
          message: `Failed to upload image: ${uploadResult.error}`,
        });
      }
    }

    const updated = await Inventory.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found." });
    }

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully.",
      inventory: updated,
    });
  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Delete inventory item (admin only)
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found." });
    }

    // Delete image from Supabase Storage if exists
    if (deleted.image) {
      await deleteImageFromSupabase(deleted.image);
    }

    res
      .status(200)
      .json({ success: true, message: "Inventory item deleted successfully." });
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Log maintenance for an inventory item
exports.logMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, performedBy, cost, notes } = req.body;

    if (!description || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "Description and performed by are required.",
      });
    }

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found." });
    }

    // Add maintenance record
    const maintenanceRecord = {
      date: new Date(),
      type: type || "routine",
      description,
      performedBy,
      cost: cost || 0,
      notes,
    };

    inventory.maintenanceHistory.push(maintenanceRecord);

    // Update last maintenance date
    inventory.lastMaintenanceDate = new Date();

    // Calculate and set next maintenance date
    const nextDate = inventory.calculateNextMaintenance();
    if (nextDate) {
      inventory.nextMaintenanceDate = nextDate;
    }

    // If status was under-maintenance, change to available
    if (inventory.status === "under-maintenance") {
      inventory.status = "available";
    }

    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Maintenance logged successfully.",
      inventory,
    });
  } catch (error) {
    console.error("Log Maintenance Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get items that need maintenance
exports.getMaintenanceDue = async (req, res) => {
  try {
    const today = new Date();
    const inventory = await Inventory.find({
      nextMaintenanceDate: { $lte: today },
      status: { $ne: "retired" },
    }).sort({ nextMaintenanceDate: 1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("Get Maintenance Due Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get maintenance history for an item
exports.getMaintenanceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found." });
    }

    res.status(200).json({
      success: true,
      maintenanceHistory: inventory.maintenanceHistory,
    });
  } catch (error) {
    console.error("Get Maintenance History Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
