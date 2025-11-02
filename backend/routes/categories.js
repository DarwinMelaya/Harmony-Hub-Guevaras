const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// POST /api/categories - Add new category (owner/admin/staff only)
router.post("/", authenticateToken, authorizeOwnerOrAdmin, addCategory);

// GET /api/categories - Get all categories (owner/admin/staff only)
router.get("/", authenticateToken, authorizeOwnerOrAdmin, getAllCategories);

// PUT /api/categories/:id - Update category (owner/admin/staff only)
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updateCategory);

// DELETE /api/categories/:id - Delete category (owner/admin/staff only)
router.delete("/:id", authenticateToken, authorizeOwnerOrAdmin, deleteCategory);

module.exports = router;

