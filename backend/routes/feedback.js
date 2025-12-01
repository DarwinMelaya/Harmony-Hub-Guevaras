const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackInsights,
  updateFeedbackStatus,
  respondToFeedback,
  getFeedbackById,
  getPublicHomeFeedback,
} = require("../controllers/feedbackController");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../utils/roles");

// Public routes (no authentication)
router.get("/public/home", getPublicHomeFeedback);

// All other routes require authentication
router.use(authenticateToken);

// Client routes - submit and view own feedback
router.post("/submit", submitFeedback);
router.get("/my-feedback", getMyFeedback);

// Owner/Admin routes - view all feedback and insights (specific routes first)
router.get("/insights/analytics", requireRole(["owner", "admin"]), getFeedbackInsights);
router.get("/", requireRole(["owner", "admin"]), getAllFeedback);

// Generic routes (must come after specific routes)
router.get("/:feedbackId", getFeedbackById);
router.patch("/:feedbackId/status", requireRole(["owner", "admin"]), updateFeedbackStatus);
router.post("/:feedbackId/respond", requireRole(["owner", "admin"]), respondToFeedback);

module.exports = router;

