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
    const inventory = await Inventory.find({ quantity: { $gt: 0 } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, inventory });
  } catch (error) {
    console.error("Get Public Inventory Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};