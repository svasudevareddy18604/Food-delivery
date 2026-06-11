const express = require("express");
const router  = express.Router();
const User    = require("../models/User");

/* =========================
   GET ALL MERCHANTS
========================= */
router.get("/merchants", async (req, res) => {
  try {
    const merchants = await User.find({
      role: "merchant",
      registrationCompleted: true,
    })
      .select("_id restaurantName email phoneNumber restaurantType restaurantAddress isApproved isRejected isBlocked createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(merchants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
})

/* =========================
   GET ALL CUSTOMERS
========================= */
router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("_id name email phoneNumber isBlocked createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: customers.length, customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   BLOCK CUSTOMER
========================= */
router.put("/customers/block/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = true;
    await user.save();

    res.status(200).json({ success: true, message: "Customer blocked", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   UNBLOCK CUSTOMER
========================= */
router.put("/customers/unblock/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ success: true, message: "Customer unblocked", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   APPROVE MERCHANT
========================= */
router.put("/approve/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isApproved = true;
    user.isRejected = false;
    user.isBlocked  = false;
    await user.save();

    res.status(200).json({ success: true, message: "Merchant approved", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   REJECT MERCHANT
========================= */
router.put("/reject/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isApproved = false;
    user.isRejected = true;
    await user.save();

    res.status(200).json({ success: true, message: "Merchant rejected", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
