const express  = require("express");
const Razorpay = require("razorpay");
const crypto   = require("crypto");

const Order    = require("../models/Order");
const User     = require("../models/User");
const createLog = require("../utils/createLog");

const router   = express.Router();

/* =========================
   RAZORPAY
========================= */

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   HELPER — GET CUSTOMER INFO
========================= */

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

/* =========================
   GENERATE ORDER NUMBER
========================= */

const generateOrderNumber = () =>
  "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

/* ══════════════════════════════════════
   POST /create-order
══════════════════════════════════════ */

router.post("/create-order", async (req, res) => {
  try {

    const {
      customerId,
      merchantId,
      items,
      address,
      paymentMethod,
      totalAmount,
      customerName:  nameFromForm,
      customerPhone: phoneFromForm,
    } = req.body;

    /* =========================
       VALIDATION
    ========================= */

    if (!customerId || !merchantId || !items?.length || !address || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    /* =========================
       RESOLVE NAME & PHONE
    ========================= */

    let customerName  = nameFromForm?.trim()  || "";
    let customerPhone = phoneFromForm?.trim()  || "";

    if (!customerName || !customerPhone) {
      const dbInfo  = await getCustomerInfo(customerId);
      customerName  = customerName  || dbInfo.customerName;
      customerPhone = customerPhone || dbInfo.customerPhone;
    }

    /* =========================
       ORDER NUMBER
    ========================= */

    const orderNumber = generateOrderNumber();

    /* =========================
       COD ORDER
    ========================= */

    if (paymentMethod === "COD") {

      const order = await Order.create({
        orderNumber,
        customerId,
        merchantId,
        items,
        address,
        customerName,
        customerPhone,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus:   "PLACED",
        totalAmount,
      });

      await createLog({
        user:   customerName,
        role:   "customer",
        action: `Placed COD order ${orderNumber} — ₹${totalAmount}`,
        status: "Success",
      });

      return res.status(201).json({
        success: true,
        paymentMethod: "COD",
        orderId: order._id,
        orderNumber,
      });
    }

    /* =========================
       ONLINE PAYMENT
    ========================= */

    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100),
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      orderNumber,
      customerId,
      merchantId,
      items,
      address,
      customerName,
      customerPhone,
      paymentMethod:   "ONLINE",
      paymentStatus:   "PENDING",
      orderStatus:     "PLACED",
      totalAmount,
      razorpayOrderId: rzpOrder.id,
    });

    await createLog({
      user:   customerName,
      role:   "customer",
      action: `Initiated online payment for order ${orderNumber} — ₹${totalAmount}`,
      status: "Success",
    });

    return res.status(201).json({
      success:         true,
      paymentMethod:   "ONLINE",
      orderId:         order._id,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("❌ checkout/create-order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════
   POST /verify-payment
══════════════════════════════════════ */

router.post("/verify-payment", async (req, res) => {
  try {

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    /* =========================
       VERIFY HMAC SIGNATURE
    ========================= */

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature) {

      /* fetch order for log context */
      const failedOrder = await Order.findById(orderId).select("customerName orderNumber");

      await createLog({
        user:   failedOrder?.customerName || orderId,
        role:   "customer",
        action: `Payment signature verification failed for order ${failedOrder?.orderNumber || orderId}`,
        status: "Failed",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    /* =========================
       MARK ORDER AS PAID
    ========================= */

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "PAID", razorpayPaymentId },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    /* =========================
       LOG SUCCESSFUL PAYMENT
    ========================= */

    await createLog({
      user:   order.customerName,
      role:   "customer",
      action: `Payment verified for order ${order.orderNumber} — ₹${order.totalAmount}`,
      status: "Success",
    });

    return res.json({ success: true, message: "Payment verified." });

  } catch (err) {
    console.error("❌ checkout/verify-payment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;