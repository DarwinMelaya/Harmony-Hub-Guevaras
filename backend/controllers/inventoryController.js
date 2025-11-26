const Inventory = require("../models/Inventory");
const {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} = require("../utils/supabaseImageUpload");

const uploadImagesBatch = async (base64Images = []) => {
  const uploadedUrls = [];

  for (const base64Image of base64Images) {
    const uploadResult = await uploadImageToSupabase(base64Image, "inventory");
    if (!uploadResult.success) {
      await Promise.all(
        uploadedUrls.map((url) => deleteImageFromSupabase(url))
      );
      return { success: false, error: uploadResult.error };
    }
    uploadedUrls.push(uploadResult.url);
  }

  return { success: true, urls: uploadedUrls };
};

// Add new inventory item (admin only)
exports.addInventory = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      unit,
      category,
      image,
      images,
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
      images: [],
    };

    // Add unit and category if provided
    if (unit) inventoryData.unit = unit;
    if (category) inventoryData.category = category;

    const normalizedImages =
      Array.isArray(images) && images.length > 0
        ? images.filter(Boolean)
        : [];

    if (normalizedImages.length > 0) {
      const uploadResult = await uploadImagesBatch(normalizedImages);
      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: `Failed to upload image: ${uploadResult.error}`,
        });
      }
      inventoryData.images = uploadResult.urls;
      inventoryData.image = uploadResult.urls[0];
    } else if (image) {
      const uploadResult = await uploadImageToSupabase(image, "inventory");
      if (uploadResult.success) {
        inventoryData.image = uploadResult.url;
        inventoryData.images = [uploadResult.url];
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
    // Optimized query with lean() for better performance and populate unit and category
    const inventory = await Inventory.find()
      .populate('unit', 'name symbol')
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .lean();
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
        unit: 1,
        category: 1,
        image: 1,
        images: 1,
        condition: 1,
        status: 1,
        createdAt: 1,
      }
    )
      .populate('unit', 'name symbol')
      .populate('category', 'name description')
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
      unit,
      category,
      image,
      images,
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
    if (unit !== undefined) update.unit = unit || null;
    if (category !== undefined) update.category = category || null;
    if (condition !== undefined) update.condition = condition;
    if (status !== undefined) update.status = status;
    if (maintenanceIntervalDays !== undefined)
      update.maintenanceIntervalDays = maintenanceIntervalDays;
    if (notes !== undefined) update.notes = notes;

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be provided as an array.",
        });
      }

      const processedImageUrls = [];
      const uploadedUrls = [];

      for (const img of images) {
        if (typeof img !== "string" || !img.trim()) {
          continue;
        }

        if (img.startsWith("data:")) {
          const uploadResult = await uploadImageToSupabase(img, "inventory");
          if (!uploadResult.success) {
            await Promise.all(
              uploadedUrls.map((url) => deleteImageFromSupabase(url))
            );
            return res.status(400).json({
              success: false,
              message: `Failed to upload image: ${uploadResult.error}`,
            });
          }
          processedImageUrls.push(uploadResult.url);
          uploadedUrls.push(uploadResult.url);
        } else {
          processedImageUrls.push(img);
        }
      }

      const previousImages =
        existingItem.images?.length > 0
          ? existingItem.images
          : existingItem.image
          ? [existingItem.image]
          : [];

      const imagesToDelete = previousImages.filter(
        (url) => !processedImageUrls.includes(url)
      );

      await Promise.all(
        imagesToDelete.map((url) => deleteImageFromSupabase(url))
      );

      update.images = processedImageUrls;
      update.image = processedImageUrls[0] || null;
    } else if (image !== undefined) {
      if (image === null || image === "") {
        const allImages = [
          ...(existingItem.images || []),
          existingItem.image,
        ].filter(Boolean);
        await Promise.all(
          allImages.map((url) => deleteImageFromSupabase(url))
        );
        update.image = null;
        update.images = [];
      } else if (typeof image === "string" && image.startsWith("data:")) {
        const allImages = [
          ...(existingItem.images || []),
          existingItem.image,
        ].filter(Boolean);
        await Promise.all(
          allImages.map((url) => deleteImageFromSupabase(url))
        );

        const uploadResult = await uploadImageToSupabase(image, "inventory");
        if (uploadResult.success) {
          update.image = uploadResult.url;
          update.images = [uploadResult.url];
        } else {
          return res.status(400).json({
            success: false,
            message: `Failed to upload image: ${uploadResult.error}`,
          });
        }
      }
    }

    const updated = await Inventory.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate('unit', 'name symbol')
      .populate('category', 'name description');

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

    const imageSet = new Set(
      [...(deleted.images || []), deleted.image].filter(Boolean)
    );

    if (imageSet.size > 0) {
      await Promise.all(
        Array.from(imageSet).map((url) => deleteImageFromSupabase(url))
      );
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
