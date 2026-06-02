const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const User    = require("../models/User");
const createLog = require("../utils/createLog");

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/* =========================
   MERCHANT REGISTRATION
========================= */
router.put("/register/:id", upload.single("restaurantImage"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Basic fields
    user.restaurantName    = req.body.restaurantName;
    user.phoneNumber       = req.body.phoneNumber;
    user.restaurantAddress = req.body.restaurantAddress;
    user.restaurantType    = req.body.restaurantType;
    user.openingTime       = req.body.openingTime;
    user.closingTime       = req.body.closingTime;

    // Location from browser Geolocation API (no geocoding)
    const latitude  = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      user.location = {
        type:        "Point",
        coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
      };
    }

    // Restaurant image
    if (req.file) {
      user.restaurantImage = `/uploads/${req.file.filename}`;
    }

    user.registrationCompleted = true;
    user.isApproved            = false;

    await user.save();

    await createLog({
      user:   user.name,
      role:   user.role,
      action: "Submitted merchant registration",
      status: "Success",
    });

    res.status(200).json({
      success: true,
      message: "Merchant Registration Submitted",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   GET APPROVED RESTAURANTS
========================= */
router.get("/approved-restaurants", async (req, res) => {
  try {
    const restaurants = await User.find({
      role:                  "merchant",
      registrationCompleted: true,
      isApproved:            true,
    })
      .select(
        "_id restaurantName restaurantType restaurantAddress openingTime closingTime phoneNumber restaurantImage tableReservationEnabled isOnline location"
      )
      .sort({ createdAt: -1 });

    await createLog({
      user:   "System",
      role:   "System",
      action: "Fetched approved restaurants list",
      status: "Success",
    });

    res.status(200).json({
      success:          true,
      totalRestaurants: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Approved Restaurant Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   GET SINGLE MERCHANT
========================= */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id restaurantName restaurantType restaurantAddress openingTime closingTime phoneNumber restaurantImage isApproved tableReservationEnabled isOnline location"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    await createLog({
      user:   user.name,
      role:   user.role,
      action: "Fetched single merchant profile",
      status: "Success",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;