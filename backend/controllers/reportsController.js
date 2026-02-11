const Booking = require("../models/Booking");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Packages = require("../models/Packages");
const {
  generateSummaryReportPDF,
  generateBookingReportPDF,
  generateInventoryReportPDF,
  generatePackageReportPDF,
  generateRevenueReportPDF,
  generateEarningsReportPDF,
  generateDamageReportPDF,
} = require("../utils/reportsPdfGenerator");

// Get summary/dashboard report
const getSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get total counts
    const totalBookings = await Booking.countDocuments(dateFilter);
    const totalUsers = await User.countDocuments();
    const totalInventory = await Inventory.countDocuments();
    const totalPackages = await Packages.countDocuments();

    // Get booking statistics
    const bookingsByStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      { $match: { ...dateFilter, status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          averageBookingValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get user statistics by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
        },
      },
    ]);

    // Get inventory statistics
    const inventoryByStatus = await Inventory.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const inventoryByCondition = await Inventory.aggregate([
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get package statistics
    const packagesAvailable = await Packages.countDocuments({ isAvailable: true });
    const packagesUnavailable = await Packages.countDocuments({ isAvailable: false });

    // Get payment method statistics
    const paymentMethodStats = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get recent bookings (last 10)
    const recentBookings = await Booking.find(dateFilter)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("totalAmount status bookingDate createdAt");

    res.json({
      success: true,
      data: {
        summary: {
          totalBookings,
          totalUsers,
          totalInventory,
          totalPackages,
        },
        bookings: {
          byStatus: bookingsByStatus,
          recent: recentBookings,
        },
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          totalDownpayment: 0,
          totalRemainingBalance: 0,
          averageBookingValue: 0,
        },
        users: {
          byRole: usersByRole,
        },
        inventory: {
          byStatus: inventoryByStatus,
          byCondition: inventoryByCondition,
        },
        packages: {
          available: packagesAvailable,
          unavailable: packagesUnavailable,
        },
        payments: {
          byMethod: paymentMethodStats,
        },
      },
    });
  } catch (error) {
    console.error("Error generating summary report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate summary report",
      error: error.message,
    });
  }
};

// Get booking reports
const getBookingReport = async (req, res) => {
  try {
    const { status, startDate, endDate, paymentMethod } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate("user", "fullName email phoneNumber")
      .sort({ bookingDate: -1 });

    // Get statistics
    const stats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          averageBookingValue: { $avg: "$totalAmount" },
          minBookingValue: { $min: "$totalAmount" },
          maxBookingValue: { $max: "$totalAmount" },
        },
      },
    ]);

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get bookings by month
    const bookingsByMonth = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" },
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        statistics: stats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          totalDownpayment: 0,
          totalRemainingBalance: 0,
          averageBookingValue: 0,
          minBookingValue: 0,
          maxBookingValue: 0,
        },
        byStatus: bookingsByStatus,
        byMonth: bookingsByMonth,
      },
    });
  } catch (error) {
    console.error("Error generating booking report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate booking report",
      error: error.message,
    });
  }
};

// Get inventory reports
const getInventoryReport = async (req, res) => {
  try {
    const { status, condition } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (condition) filter.condition = condition;

    // Get inventory items
    const inventory = await Inventory.find(filter)
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
          averagePrice: { $avg: "$price" },
        },
      },
    ]);

    // Get inventory by status
    const inventoryByStatus = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
    ]);

    // Get inventory by condition
    const inventoryByCondition = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    // Get maintenance statistics
    const maintenanceStats = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          itemsNeedingMaintenance: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$nextMaintenanceDate", null] },
                    { $lte: ["$nextMaintenanceDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalMaintenanceRecords: {
            $sum: { $size: { $ifNull: ["$maintenanceHistory", []] } },
          },
        },
      },
    ]);

    // Get items needing maintenance
    const itemsNeedingMaintenance = await Inventory.find({
      ...filter,
      nextMaintenanceDate: { $lte: new Date() },
    })
      .select("name status condition nextMaintenanceDate lastMaintenanceDate")
      .sort({ nextMaintenanceDate: 1 });

    res.json({
      success: true,
      data: {
        inventory,
        statistics: stats[0] || {
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
          averagePrice: 0,
        },
        byStatus: inventoryByStatus,
        byCondition: inventoryByCondition,
        maintenance: {
          ...maintenanceStats[0],
          itemsNeedingMaintenance: itemsNeedingMaintenance,
        },
      },
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message,
    });
  }
};

// Get damage items report (inventory items in poor/needs-repair condition or under maintenance)
const getDamageReport = async (req, res) => {
  try {
    const { status, condition } = req.query;

    // Base filter: items that are damaged or need repair/maintenance
    const baseDamageFilter = {
      $or: [
        { condition: { $in: ["poor", "needs-repair"] } },
        { status: { $in: ["under-maintenance", "needs-repair"] } },
      ],
    };

    // Optional extra filters from query
    if (status) {
      baseDamageFilter.status = status;
    }
    if (condition) {
      baseDamageFilter.condition = condition;
    }

    const damagedItems = await Inventory.find(baseDamageFilter)
      .populate("category", "name")
      .populate("unit", "name symbol")
      .sort({ condition: 1, status: 1, name: 1 });

    const damageStats = await Inventory.aggregate([
      { $match: baseDamageFilter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
    ]);

    const byCondition = await Inventory.aggregate([
      { $match: baseDamageFilter },
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    // Also include damage reported at booking completion (customer returns)
    const bookingDamageFilter = {
      status: "completed",
      issueType: { $in: ["lost", "damaged"] },
    };

    const damageFromBookings = await Booking.find(bookingDamageFilter)
      .populate("user", "fullName email")
      .sort({ bookingDate: -1 })
      .select("bookingDate issueType affectedItems totalAmount createdAt");

    res.json({
      success: true,
      data: {
        damagedItems,
        statistics: damageStats[0] || {
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
        },
        byCondition,
        damageFromBookings,
      },
    });
  } catch (error) {
    console.error("Error generating damage items report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate damage items report",
      error: error.message,
    });
  }
};

// Get package reports
const getPackageReport = async (req, res) => {
  try {
    const { isAvailable } = req.query;

    // Build filter
    const filter = {};
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    // Get packages
    const packages = await Packages.find(filter)
      .populate("items.inventoryItem", "name price")
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = await Packages.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          availablePackages: {
            $sum: { $cond: ["$isAvailable", 1, 0] },
          },
          unavailablePackages: {
            $sum: { $cond: ["$isAvailable", 0, 1] },
          },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalValue: { $sum: "$price" },
        },
      },
    ]);

    // Get package usage in bookings
    const packageUsage = await Booking.aggregate([
      {
        $unwind: "$items",
      },
      {
        $match: {
          "items.type": "package",
        },
      },
      {
        $group: {
          _id: "$items.itemId",
          bookingCount: { $sum: 1 },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "_id",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $project: {
          packageName: "$package.name",
          bookingCount: 1,
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { bookingCount: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        packages,
        statistics: stats[0] || {
          totalPackages: 0,
          availablePackages: 0,
          unavailablePackages: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          totalValue: 0,
        },
        usage: packageUsage,
      },
    });
  } catch (error) {
    console.error("Error generating package report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate package report",
      error: error.message,
    });
  }
};

// Get revenue reports
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;

    // Build filter
    const filter = {
      status: { $in: ["confirmed", "completed"] },
    };
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get revenue by payment method
    const revenueByPaymentMethod = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // Get revenue by status
    const revenueByStatus = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          totalRevenue: { $sum: "$totalAmount" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        statistics: revenueStats[0] || {
          totalRevenue: 0,
          totalDownpayment: 0,
          totalRemainingBalance: 0,
          totalBookings: 0,
          averageBookingValue: 0,
        },
        byPaymentMethod: revenueByPaymentMethod,
        byMonth: revenueByMonth,
        byStatus: revenueByStatus,
      },
    });
  } catch (error) {
    console.error("Error generating revenue report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate revenue report",
      error: error.message,
    });
  }
};

// PDF Generation Functions
const downloadSummaryReportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get total counts
    const totalBookings = await Booking.countDocuments(dateFilter);
    const totalUsers = await User.countDocuments();
    const totalInventory = await Inventory.countDocuments();
    const totalPackages = await Packages.countDocuments();

    // Get booking statistics
    const bookingsByStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      { $match: { ...dateFilter, status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          averageBookingValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get user statistics by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
          inactive: {
            $sum: { $cond: ["$isActive", 0, 1] },
          },
        },
      },
    ]);

    const reportData = {
      summary: {
        totalBookings,
        totalUsers,
        totalInventory,
        totalPackages,
      },
      bookings: {
        byStatus: bookingsByStatus,
      },
      revenue: revenueStats[0] || {
        totalRevenue: 0,
        totalDownpayment: 0,
        totalRemainingBalance: 0,
        averageBookingValue: 0,
      },
      users: {
        byRole: usersByRole,
      },
    };

    generateSummaryReportPDF(reportData, { startDate, endDate }, res);
  } catch (error) {
    console.error("Error generating summary report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate summary report PDF",
      error: error.message,
    });
  }
};

const downloadBookingReportPDF = async (req, res) => {
  try {
    const { status, startDate, endDate, paymentMethod } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate("user", "fullName email")
      .sort({ bookingDate: -1 });

    // Get statistics
    const stats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          averageBookingValue: { $avg: "$totalAmount" },
          minBookingValue: { $min: "$totalAmount" },
          maxBookingValue: { $max: "$totalAmount" },
        },
      },
    ]);

    const reportData = {
      bookings,
      statistics: stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        totalDownpayment: 0,
        totalRemainingBalance: 0,
        averageBookingValue: 0,
        minBookingValue: 0,
        maxBookingValue: 0,
      },
    };

    generateBookingReportPDF(reportData, { status, startDate, endDate, paymentMethod }, res);
  } catch (error) {
    console.error("Error generating booking report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate booking report PDF",
      error: error.message,
    });
  }
};

const downloadInventoryReportPDF = async (req, res) => {
  try {
    const { status, condition } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (condition) filter.condition = condition;

    // Get inventory items
    const inventory = await Inventory.find(filter)
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
          averagePrice: { $avg: "$price" },
        },
      },
    ]);

    const reportData = {
      inventory,
      statistics: stats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        averagePrice: 0,
      },
    };

    generateInventoryReportPDF(reportData, { status, condition }, res);
  } catch (error) {
    console.error("Error generating inventory report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report PDF",
      error: error.message,
    });
  }
};

const downloadDamageReportPDF = async (req, res) => {
  try {
    const { status, condition } = req.query;

    const baseDamageFilter = {
      $or: [
        { condition: { $in: ["poor", "needs-repair"] } },
        { status: { $in: ["under-maintenance", "needs-repair"] } },
      ],
    };

    if (status) {
      baseDamageFilter.status = status;
    }
    if (condition) {
      baseDamageFilter.condition = condition;
    }

    const damagedItems = await Inventory.find(baseDamageFilter)
      .populate("category", "name")
      .populate("unit", "name symbol")
      .sort({ condition: 1, status: 1, name: 1 });

    const damageStats = await Inventory.aggregate([
      { $match: baseDamageFilter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
    ]);

    const byCondition = await Inventory.aggregate([
      { $match: baseDamageFilter },
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const bookingDamageFilter = {
      status: "completed",
      issueType: { $in: ["lost", "damaged"] },
    };

    const damageFromBookings = await Booking.find(bookingDamageFilter)
      .populate("user", "fullName email")
      .sort({ bookingDate: -1 })
      .select("bookingDate issueType affectedItems totalAmount createdAt");

    const reportData = {
      damagedItems,
      statistics: damageStats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
      },
      byCondition,
      damageFromBookings,
    };

    generateDamageReportPDF(reportData, { status, condition }, res);
  } catch (error) {
    console.error("Error generating damage items report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate damage items report PDF",
      error: error.message,
    });
  }
};

const downloadPackageReportPDF = async (req, res) => {
  try {
    const { isAvailable } = req.query;

    // Build filter
    const filter = {};
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    // Get packages
    const packages = await Packages.find(filter)
      .populate("items.inventoryItem", "name price")
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = await Packages.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          availablePackages: {
            $sum: { $cond: ["$isAvailable", 1, 0] },
          },
          unavailablePackages: {
            $sum: { $cond: ["$isAvailable", 0, 1] },
          },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalValue: { $sum: "$price" },
        },
      },
    ]);

    const reportData = {
      packages,
      statistics: stats[0] || {
        totalPackages: 0,
        availablePackages: 0,
        unavailablePackages: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalValue: 0,
      },
    };

    generatePackageReportPDF(reportData, { isAvailable }, res);
  } catch (error) {
    console.error("Error generating package report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate package report PDF",
      error: error.message,
    });
  }
};

const downloadRevenueReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;

    // Build filter
    const filter = {
      status: { $in: ["confirmed", "completed"] },
    };
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get revenue by payment method
    const revenueByPaymentMethod = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    const reportData = {
      statistics: revenueStats[0] || {
        totalRevenue: 0,
        totalDownpayment: 0,
        totalRemainingBalance: 0,
        totalBookings: 0,
        averageBookingValue: 0,
      },
      byPaymentMethod: revenueByPaymentMethod,
      byMonth: revenueByMonth,
    };

    generateRevenueReportPDF(reportData, { startDate, endDate, paymentMethod }, res);
  } catch (error) {
    console.error("Error generating revenue report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate revenue report PDF",
      error: error.message,
    });
  }
};

// Get earnings reports
const getEarningsReport = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, filterBy } = req.query;

    // Build filter
    const filter = {
      status: { $in: ["confirmed", "completed"] },
    };
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get earnings statistics
    const earningsStats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get earnings by payment method
    const earningsByPaymentMethod = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          totalEarnings: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    // Get earnings by day, month, or year based on filterBy
    let earningsByPeriod = [];
    let groupBy = {};

    if (filterBy === "day") {
      groupBy = {
        year: { $year: "$bookingDate" },
        month: { $month: "$bookingDate" },
        day: { $dayOfMonth: "$bookingDate" },
      };
    } else if (filterBy === "month") {
      groupBy = {
        year: { $year: "$bookingDate" },
        month: { $month: "$bookingDate" },
      };
    } else if (filterBy === "year") {
      groupBy = {
        year: { $year: "$bookingDate" },
      };
    } else {
      // Default to month if not specified
      groupBy = {
        year: { $year: "$bookingDate" },
        month: { $month: "$bookingDate" },
      };
    }

    earningsByPeriod = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          totalEarnings: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    ]);

    // Get earnings by status
    const earningsByStatus = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          totalEarnings: { $sum: "$totalAmount" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        statistics: earningsStats[0] || {
          totalEarnings: 0,
          totalDownpayment: 0,
          totalRemainingBalance: 0,
          totalBookings: 0,
          averageBookingValue: 0,
        },
        byPaymentMethod: earningsByPaymentMethod,
        byPeriod: earningsByPeriod,
        byStatus: earningsByStatus,
        filterBy: filterBy || "month",
      },
    });
  } catch (error) {
    console.error("Error generating earnings report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate earnings report",
      error: error.message,
    });
  }
};

// PDF Generation for Earnings
const downloadEarningsReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, filterBy } = req.query;

    // Build filter
    const filter = {
      status: { $in: ["confirmed", "completed"] },
    };
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get earnings statistics
    const earningsStats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get earnings by payment method
    const earningsByPaymentMethod = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          totalEarnings: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    // Get earnings by period
    let groupBy = {};
    if (filterBy === "day") {
      groupBy = {
        year: { $year: "$bookingDate" },
        month: { $month: "$bookingDate" },
        day: { $dayOfMonth: "$bookingDate" },
      };
    } else if (filterBy === "month") {
      groupBy = {
        year: { $year: "$bookingDate" },
        month: { $month: "$bookingDate" },
      };
    } else if (filterBy === "year") {
      groupBy = {
        year: { $year: "$bookingDate" },
      };
    } else {
      groupBy = {
        year: { $year: "$bookingDate" },
        month: { $month: "$bookingDate" },
      };
    }

    const earningsByPeriod = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          totalEarnings: { $sum: "$totalAmount" },
          totalDownpayment: { $sum: "$downpaymentAmount" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    ]);

    const reportData = {
      statistics: earningsStats[0] || {
        totalEarnings: 0,
        totalDownpayment: 0,
        totalRemainingBalance: 0,
        totalBookings: 0,
        averageBookingValue: 0,
      },
      byPaymentMethod: earningsByPaymentMethod,
      byPeriod: earningsByPeriod,
      filterBy: filterBy || "month",
    };

    generateEarningsReportPDF(reportData, { startDate, endDate, paymentMethod, filterBy }, res);
  } catch (error) {
    console.error("Error generating earnings report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate earnings report PDF",
      error: error.message,
    });
  }
};

module.exports = {
  getSummaryReport,
  getBookingReport,
  getInventoryReport,
  getPackageReport,
  getRevenueReport,
  getEarningsReport,
  getDamageReport,
  downloadSummaryReportPDF,
  downloadBookingReportPDF,
  downloadInventoryReportPDF,
  downloadPackageReportPDF,
  downloadRevenueReportPDF,
  downloadEarningsReportPDF,
  downloadDamageReportPDF,
};

