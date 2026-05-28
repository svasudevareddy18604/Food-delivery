/* ==============================================
   merchantRoutes.js  —  Full updated file
   ============================================== */

const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const User    = require("../models/User");

/* ── Multer config ── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error("Images only"));
  },
});

/* ==============================================
   GET /api/merchant-settings/settings/:id
   Returns full merchant profile for Settings page
   ============================================== */
router.get("/settings/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id name email restaurantName restaurantAddress restaurantType " +
      "phoneNumber restaurantImage openingTime closingTime " +
      "isOnline isApproved registrationCompleted createdAt " +
      "tableReservationEnabled totalTables maxGuestsPerTable " +
      "reservationSlotDuration advanceBookingDays"
    );

    if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

    res.status(200).json({ success: true, merchant: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   PUT /api/merchant-settings/settings/:id
   Update editable fields + optional new image
   Includes table reservation config fields
   ============================================== */
router.put(
  "/settings/:id",
  upload.single("restaurantImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

      /* Basic restaurant fields */
      const allowedText = [
        "restaurantName", "phoneNumber", "restaurantAddress",
        "restaurantType", "openingTime", "closingTime",
      ];
      allowedText.forEach(f => {
        if (req.body[f] !== undefined) user[f] = req.body[f];
      });

      /* Table reservation config fields */
      const allowedTable = [
        "tableReservationEnabled", "totalTables",
        "maxGuestsPerTable", "reservationSlotDuration", "advanceBookingDays",
      ];
      allowedTable.forEach(f => {
        if (req.body[f] !== undefined) {
          /* tableReservationEnabled comes as string "true"/"false" from FormData */
          if (f === "tableReservationEnabled") {
            user[f] = req.body[f] === "true" || req.body[f] === true;
          } else {
            /* numeric fields */
            user[f] = req.body[f] !== "" ? Number(req.body[f]) : undefined;
          }
        }
      });

      if (req.file) user.restaurantImage = `/uploads/${req.file.filename}`;

      await user.save();
      res.status(200).json({ success: true, message: "Settings updated", merchant: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

/* ==============================================
   PATCH /api/merchant-settings/settings/:id/online
   Toggle isOnline status only
   ============================================== */
router.patch("/settings/:id/online", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

    user.isOnline = req.body.isOnline;   // true | false
    await user.save();

    res.status(200).json({ success: true, isOnline: user.isOnline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   PATCH /api/merchant-settings/settings/:id/table-reservation
   Toggle tableReservationEnabled status only
   ============================================== */
router.patch("/settings/:id/table-reservation", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

    user.tableReservationEnabled = Boolean(req.body.tableReservationEnabled);
    await user.save();

    res.status(200).json({
      success: true,
      tableReservationEnabled: user.tableReservationEnabled,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;