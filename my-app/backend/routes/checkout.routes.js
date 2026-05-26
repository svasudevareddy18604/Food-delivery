const express  = require("express");
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Order    = require("../models/Order");
const User     = require("../models/User");
const router   = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ── helper: fallback fetch from DB if form didn't send name/phone ── */
const getCustomerInfo = async (customerId) => {
  try {
    const user = await User.findById(customerId).select("name phoneNumber");
    return {
      customerName:  user?.name        || "Customer",
      customerPhone: user?.phoneNumber || "No contact",
    };
  } catch {
    return { customerName: "Customer", customerPhone: "No contact" };
  }
};

/* ── POST /api/checkout/create-order ── */
router.post("/create-order", async (req, res) => {
  try {
    const {
      customerId, merchantId, items, address,
      paymentMethod, totalAmount,
      customerName, customerPhone,         // sent directly from checkout form
    } = req.body;

    if (!customerId || !merchantId || !items?.length || !address || !totalAmount)
      return res.status(400).json({ success: false, message: "Missing required fields." });

    /* use form values first, fall back to DB lookup */
    const name  = customerName  || (await getCustomerInfo(customerId)).customerName;
    const phone = customerPhone || (await getCustomerInfo(customerId)).customerPhone;

    if (paymentMethod === "COD") {
      const order = await Order.create({
        customerId, merchantId, items, address,
        customerName: name, customerPhone: phone,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus:   "PLACED",
        totalAmount,
      });
      return res.status(201).json({ success: true, paymentMethod: "COD", orderId: order._id });
    }

    /* ONLINE — create Razorpay order */
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100),
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      customerId, merchantId, items, address,
      customerName: name, customerPhone: phone,
      paymentMethod:   "ONLINE",
      paymentStatus:   "PENDING",
      orderStatus:     "PLACED",
      totalAmount,
      razorpayOrderId: rzpOrder.id,
    });

    res.status(201).json({
      success:         true,
      paymentMethod:   "ONLINE",
      orderId:         order._id,
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("checkout/create-order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/checkout/verify-payment ── */
router.post("/verify-payment", async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature)
      return res.status(400).json({ success: false, message: "Invalid payment signature." });

    await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "PAID", razorpayPaymentId },
      { returnDocument: "after" }
    );

    res.json({ success: true, message: "Payment verified." });

  } catch (err) {
    console.error("checkout/verify-payment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;