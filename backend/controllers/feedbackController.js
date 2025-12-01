const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Inventory = require("../models/Inventory");

// Submit feedback (clients only)
const submitFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      bookingId,
      serviceUsage,
      equipmentStatus,
      valueFeedback,
      overallSatisfaction,
      additionalComments,
    } = req.body;

    // Validate required fields
    if (!overallSatisfaction || !overallSatisfaction.rating) {
      return res.status(400).json({
        success: false,
        message: "Overall satisfaction rating is required",
      });
    }

    // If bookingId is provided, verify it belongs to the user
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        user: userId,
      });
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or does not belong to you",
        });
      }
    }

    const feedback = new Feedback({
      user: userId,
      booking: bookingId || null,
      serviceUsage: serviceUsage || {},
      equipmentStatus: equipmentStatus || {},
      valueFeedback: valueFeedback || {},
      overallSatisfaction: overallSatisfaction || {},
      additionalComments: additionalComments || "",
    });

    await feedback.save();
    await feedback.populate("user", "fullName email");
    if (bookingId) {
      await feedback.populate("booking");
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// Get user's own feedback
const getMyFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const feedbacks = await Feedback.find({ user: userId })
      .populate("booking", "totalAmount bookingDate status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// Get all feedback (owners/admins only)
const getAllFeedback = async (req, res) => {
  try {
    const { status, startDate, endDate, minRating } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (minRating) {
      filter["overallSatisfaction.rating"] = { $gte: parseInt(minRating) };
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const feedbacks = await Feedback.find(filter)
      .populate("user", "fullName email")
      .populate("booking", "totalAmount bookingDate status")
      .populate("response.respondedBy", "fullName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// Get feedback insights/analytics (owners/admins only)
const getFeedbackInsights = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Overall satisfaction statistics
    const satisfactionStats = await Feedback.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$overallSatisfaction.rating" },
          ratings: {
            $push: "$overallSatisfaction.rating",
          },
        },
      },
    ]);

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$overallSatisfaction.rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    // Service usage insights
    const serviceUsageStats = await Feedback.aggregate([
      { $match: { ...dateFilter, "serviceUsage.rating": { $exists: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$serviceUsage.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Equipment status insights
    const equipmentStats = await Feedback.aggregate([
      { $match: { ...dateFilter, "equipmentStatus.rating": { $exists: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$equipmentStatus.rating" },
          totalRatings: { $sum: 1 },
          itemsWithIssues: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ["$equipmentStatus.equipmentIssues", []] } }, 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Value feedback insights
    const valueStats = await Feedback.aggregate([
      { $match: { ...dateFilter, "valueFeedback.rating": { $exists: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$valueFeedback.rating" },
          averagePriceSatisfaction: { $avg: "$valueFeedback.priceSatisfaction" },
          recommendationRate: {
            $avg: {
              $cond: ["$valueFeedback.wouldRecommend", 1, 0],
            },
          },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Feedback by month
    const feedbackByMonth = await Feedback.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          averageRating: { $avg: "$overallSatisfaction.rating" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // Equipment issues breakdown
    const equipmentIssues = await Feedback.aggregate([
      { $match: { ...dateFilter, "equipmentStatus.equipmentIssues": { $exists: true, $ne: [] } } },
      { $unwind: "$equipmentStatus.equipmentIssues" },
      {
        $group: {
          _id: "$equipmentStatus.equipmentIssues.severity",
          count: { $sum: 1 },
          items: { $addToSet: "$equipmentStatus.equipmentIssues.itemName" },
        },
      },
    ]);

    // Service usage breakdown
    const serviceUsageBreakdown = await Feedback.aggregate([
      { $match: { ...dateFilter, "serviceUsage.servicesUsed": { $exists: true, $ne: [] } } },
      { $unwind: "$serviceUsage.servicesUsed" },
      {
        $group: {
          _id: "$serviceUsage.servicesUsed",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent feedback (last 10)
    const recentFeedback = await Feedback.find(dateFilter)
      .populate("user", "fullName email")
      .populate("booking", "totalAmount bookingDate")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("overallSatisfaction.rating overallSatisfaction.comment createdAt user booking");

    // Calculate NPS-like score (Net Promoter Score)
    const promoters = await Feedback.countDocuments({
      ...dateFilter,
      "overallSatisfaction.rating": { $gte: 4 },
    });
    const detractors = await Feedback.countDocuments({
      ...dateFilter,
      "overallSatisfaction.rating": { $lte: 2 },
    });
    const total = satisfactionStats[0]?.totalFeedback || 0;
    const npsScore = total > 0 ? ((promoters - detractors) / total) * 100 : 0;

    res.json({
      success: true,
      data: {
        satisfaction: {
          ...satisfactionStats[0],
          ratingDistribution,
          npsScore: Math.round(npsScore * 100) / 100,
        },
        serviceUsage: serviceUsageStats[0] || {
          averageRating: 0,
          totalRatings: 0,
        },
        equipment: {
          ...equipmentStats[0],
          issuesBreakdown: equipmentIssues,
        },
        value: valueStats[0] || {
          averageRating: 0,
          averagePriceSatisfaction: 0,
          recommendationRate: 0,
          totalRatings: 0,
        },
        trends: {
          byMonth: feedbackByMonth,
          serviceUsageBreakdown,
        },
        recent: recentFeedback,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback insights",
      error: error.message,
    });
  }
};

// Update feedback status (owners/admins only)
const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!["submitted", "reviewed", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    )
      .populate("user", "fullName email")
      .populate("booking", "totalAmount bookingDate status");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      message: "Feedback status updated",
      data: feedback,
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback status",
      error: error.message,
    });
  }
};

// Respond to feedback (owners/admins only)
const respondToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Response message is required",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      {
        "response.message": message,
        "response.respondedBy": userId,
        "response.respondedAt": new Date(),
        status: "reviewed",
      },
      { new: true }
    )
      .populate("user", "fullName email")
      .populate("booking", "totalAmount bookingDate status")
      .populate("response.respondedBy", "fullName");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      message: "Response added successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error responding to feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to feedback",
      error: error.message,
    });
  }
};

// Get single feedback
const getFeedbackById = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.userId;
    const userRole = req.user.role;

    const feedback = await Feedback.findById(feedbackId)
      .populate("user", "fullName email")
      .populate("booking", "totalAmount bookingDate status")
      .populate("response.respondedBy", "fullName");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Users can only see their own feedback, owners/admins can see all
    if (!["owner", "admin"].includes(userRole) && feedback.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// Public: lightweight feedback list for homepage (no auth required)
// Uses Feedback model directly, but only exposes recent/high-rated reviews
const getPublicHomeFeedback = async (req, res) => {
  try {
    const { minRating = 3, limit = 9 } = req.query;

    const filter = {
      "overallSatisfaction.rating": { $gte: parseInt(minRating, 10) || 0 },
    };

    const feedbacks = await Feedback.find(filter)
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 9)
      .select("overallSatisfaction.rating overallSatisfaction.comment createdAt user");

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching public home feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public feedback",
      error: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackInsights,
  updateFeedbackStatus,
  respondToFeedback,
  getFeedbackById,
  getPublicHomeFeedback,
};

