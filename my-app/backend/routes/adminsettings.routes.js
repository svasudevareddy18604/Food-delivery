const express = require("express");
const router = express.Router();

const Settings = require("../models/Settings");

/*
=================================================
GET SETTINGS
=================================================
*/
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
});

/*
=================================================
UPDATE SETTINGS
=================================================
*/
router.put("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    const allowedUpdates = {
      maintenanceMode: req.body.maintenanceMode,
      storeOpen: req.body.storeOpen,
      acceptOrders: req.body.acceptOrders,
      acceptCOD: req.body.acceptCOD,
      acceptOnlinePayments: req.body.acceptOnlinePayments,
      deliveryAvailable: req.body.deliveryAvailable,
      minimumOrderAmount: req.body.minimumOrderAmount,
      deliveryRadiusKm: req.body.deliveryRadiusKm,
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] !== undefined) {
        settings[key] = allowedUpdates[key];
      }
    });

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
});

module.exports = router;