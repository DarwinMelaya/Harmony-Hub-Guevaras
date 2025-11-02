const Category = require("../models/Category");

// Add new category
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description ? description.trim() : "",
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category added successfully.",
      category,
    });
  } catch (error) {
    console.error("Add Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    // Check if another category with the same name exists (excluding current category)
    const existingCategory = await Category.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description ? description.trim() : "",
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

