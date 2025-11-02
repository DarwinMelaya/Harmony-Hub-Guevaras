const Unit = require("../models/Unit");

// Add new unit
exports.addUnit = async (req, res) => {
  try {
    const { name, symbol } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({
        success: false,
        message: "Name and symbol are required.",
      });
    }

    // Check if unit with same name already exists
    const existingUnit = await Unit.findOne({ name: name.trim() });
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: "A unit with this name already exists.",
      });
    }

    const unit = new Unit({
      name: name.trim(),
      symbol: symbol.trim(),
    });

    await unit.save();

    res.status(201).json({
      success: true,
      message: "Unit added successfully.",
      unit,
    });
  } catch (error) {
    console.error("Add Unit Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get all units
exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      units,
    });
  } catch (error) {
    console.error("Get Units Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Update unit
exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({
        success: false,
        message: "Name and symbol are required.",
      });
    }

    // Check if another unit with the same name exists (excluding current unit)
    const existingUnit = await Unit.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });

    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: "A unit with this name already exists.",
      });
    }

    const updatedUnit = await Unit.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        symbol: symbol.trim(),
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUnit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Unit updated successfully.",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error("Update Unit Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Delete unit
exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUnit = await Unit.findByIdAndDelete(id);

    if (!deletedUnit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Unit Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

