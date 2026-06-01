const Settings = require("../models/Settings");

const maintenanceCheck = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();

    // No settings doc or maintenance disabled → pass through
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // ── Exclusions — check FIRST before anything else ───────
    // These routes are NEVER blocked, even during maintenance
    const excluded = [
      "/api/auth",          // login, signup, forgot-password
      "/api/admin",         // admin panel
      "/api/settings",      // frontend reads maintenance status from here
    ];
    if (excluded.some((p) => req.originalUrl.startsWith(p))) {
      return next();
    }

    if (req.originalUrl === "/" || req.originalUrl.startsWith("/uploads")) {
      return next();
    }
    // ────────────────────────────────────────────────────────

    // If a schedule is set, only block within that window
    if (settings.maintenanceStartDate && settings.maintenanceEndDate) {
      const now   = new Date();
      const start = new Date(settings.maintenanceStartDate);
      const end   = new Date(settings.maintenanceEndDate);
      if (now < start || now > end) {
        return next(); // outside the window → not in maintenance
      }
    }

    return res.status(503).json({
      success: false,
      maintenance: true,
      message: "Website is currently under maintenance.",
      startDate: settings.maintenanceStartDate,
      endDate:   settings.maintenanceEndDate,
    });

  } catch (error) {
    console.error("Maintenance Check Error:", error);
    next(); // never crash the app over a settings fetch
  }
};

module.exports = maintenanceCheck;