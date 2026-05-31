const Settings = require("../models/Settings");

const maintenanceCheck = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();

    // No settings document yet
    if (!settings) {
      return next();
    }

    // Website not in maintenance mode
    if (!settings.maintenanceMode) {
      return next();
    }

    // Allow admin settings APIs
    if (req.originalUrl.startsWith("/api/admin/settings")) {
      return next();
    }

    // Allow admin APIs
    if (req.originalUrl.startsWith("/api/admin")) {
      return next();
    }

    // Allow root health check
    if (req.originalUrl === "/") {
      return next();
    }

    // Block everything else
    return res.status(503).json({
      success: false,
      maintenance: true,
      message:
        "Website is currently under maintenance. Please try again later.",
    });
  } catch (error) {
    console.error("Maintenance Check Error:", error);

    // Don't break the website if DB fails
    next();
  }
};

module.exports = maintenanceCheck;