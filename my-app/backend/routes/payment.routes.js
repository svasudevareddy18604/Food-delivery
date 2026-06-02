const express   = require("express");
const Razorpay  = require("razorpay");
const router    = express.Router();
const createLog = require("../utils/createLog");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   CREATE ORDER
========================= */
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount:   req.body.amount * 100,
      currency: "INR",
      receipt:  "receipt_order",
    };

    const order = await razorpay.orders.create(options);

    await createLog({
      user:   req.body.customerId || "Unknown",
      role:   "Customer",
      action: `Initiated payment of ₹${req.body.amount}`,
      status: "Success",
    });

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;