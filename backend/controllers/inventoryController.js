const Inventory = require("../models/Inventory");

// Add new inventory item (admin only)
exports.addInventory = async (req, res) => {
  try {
    const { name, price, quantity, image } = req.body;
    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required." });
    }
    const inventory = new Inventory({ name, price, quantity, image });
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
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, inventory });
  } catch (error) {
    console.error("Get Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get all inventory items (public - for clients)
exports.getPublicInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ quantity: { $gt: 0 } }).sort({
      createdAt: -1,
    });
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
    const { name, price, quantity, image } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = price;
    if (quantity !== undefined) update.quantity = quantity;
    if (image !== undefined) update.image = image;

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
    res
      .status(200)
      .json({ success: true, message: "Inventory item deleted successfully." });
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
