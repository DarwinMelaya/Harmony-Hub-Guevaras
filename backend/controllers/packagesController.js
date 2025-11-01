const Package = require("../models/Packages");
const Inventory = require("../models/Inventory");
const {
  uploadImageToFirebase,
  deleteImageFromFirebase,
  replaceImageInFirebase,
} = require("../utils/firebaseImageUpload");

// Add new package
exports.addPackage = async (req, res) => {
  try {
    const { name, description, items, price, image } = req.body;

    // Validate inventory items
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.inventoryItem);
      if (!inventoryItem) {
        return res
          .status(400)
          .json({ error: `Inventory item not found: ${item.inventoryItem}` });
      }
    }

    const packageData = {
      name,
      description,
      items,
      price,
    };

    // Upload image to Firebase Storage if provided
    if (image) {
      try {
        const imageUrl = await uploadImageToFirebase(image, "packages");
        packageData.image = imageUrl;
      } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({
          error: "Failed to upload image to Firebase Storage.",
        });
      }
    }

    const newPackage = new Package(packageData);
    await newPackage.save();

    res.status(201).json({
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({ error: "Server error while creating package" });
  }
};

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    // Optimized query with lean() for better performance
    const packages = await Package.find()
      .populate("items.inventoryItem", "name price quantity image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Server error while fetching packages" });
  }
};

// Get all packages (public - for clients)
exports.getPublicPackages = async (req, res) => {
  try {
    // Optimized query: use lean() and limit populated fields for better performance
    const packages = await Package.find(
      { isAvailable: true },
      {
        name: 1,
        description: 1,
        price: 1,
        image: 1,
        items: 1,
        isAvailable: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    )
      .populate({
        path: "items.inventoryItem",
        select: "name price quantity", // Exclude images from populated inventory items
      })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for faster JSON serialization

    // Set cache headers for 5 minutes
    res.set("Cache-Control", "public, max-age=300");
    res.status(200).json({ success: true, packages });
  } catch (error) {
    console.error("Error fetching public packages:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching packages",
    });
  }
};

// Update package (admin only)
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, items, price, image, isAvailable } = req.body;

    // Find the existing package
    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    // Optionally validate items' inventory references
    if (Array.isArray(items)) {
      for (const item of items) {
        const inventoryItem = await Inventory.findById(item.inventoryItem);
        if (!inventoryItem) {
          return res
            .status(400)
            .json({
              success: false,
              error: `Inventory item not found: ${item.inventoryItem}`,
            });
        }
      }
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (items !== undefined) update.items = items;
    if (price !== undefined) update.price = price;
    if (isAvailable !== undefined) update.isAvailable = isAvailable;

    // Handle image update - replace in Firebase Storage if new image provided
    if (image !== undefined) {
      if (image) {
        // New image provided - upload to Firebase and delete old image
        try {
          const newImageUrl = await replaceImageInFirebase(
            existingPackage.image,
            image,
            "packages"
          );
          update.image = newImageUrl;
        } catch (error) {
          console.error("Image update error:", error);
          return res.status(500).json({
            success: false,
            error: "Failed to update image in Firebase Storage.",
          });
        }
      } else {
        // Image set to null/empty - delete old image from Firebase
        if (existingPackage.image) {
          await deleteImageFromFirebase(existingPackage.image);
        }
        update.image = null;
      }
    }

    const updated = await Package.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("items.inventoryItem", "name price quantity image");

    res
      .status(200)
      .json({
        success: true,
        message: "Package updated successfully",
        package: updated,
      });
  } catch (error) {
    console.error("Error updating package:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while updating package" });
  }
};

// Delete package (admin only)
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Package.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    // Delete image from Firebase Storage if exists
    if (deleted.image) {
      await deleteImageFromFirebase(deleted.image);
    }

    res
      .status(200)
      .json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while deleting package" });
  }
};
