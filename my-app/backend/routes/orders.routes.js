const express   = require("express");
const mongoose  = require("mongoose");
const router    = express.Router();
const Order     = require("../models/Order");
const User      = require("../models/User");
const createLog = require("../utils/createLog");

const ALLOWED_STATUSES = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const STATUS_PRIORITY = {
  PLACED:           0,
  PREPARING:        1,
  OUT_FOR_DELIVERY: 2,
  CANCELLED:        3,
  DELIVERED:        4,
};

/* =========================================================
   GET CUSTOMER ORDERS
========================================================= */
router.get("/customer/:customerId", async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId })
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// GET orders assigned to a delivery partner
router.get("/delivery/:partnerId", async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartnerId: req.params.partnerId })
      .populate("customerId", "name phone email")
      .populate("merchantId", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   GET MERCHANT ORDERS
========================================================= */
router.get("/merchant/:merchantId", async (req, res) => {
  try {
    const orders = await Order.find({ merchantId: req.params.merchantId })
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 });

    const sorted = orders.sort(
      (a, b) =>
        (STATUS_PRIORITY[a.orderStatus] ?? 99) -
        (STATUS_PRIORITY[b.orderStatus] ?? 99)
    );

    res.status(200).json({ success: true, merchantId: req.params.merchantId, orders: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */
router.put("/:orderId/status", async (req, res) => {
  try {
    const { orderId }     = req.params;
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId))
      return res.status(400).json({ success: false, message: "Invalid Order ID" });

    if (!ALLOWED_STATUSES.includes(orderStatus))
      return res.status(400).json({ success: false, message: "Invalid order status" });

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    ).populate("customerId", "name phone email");

    if (!updatedOrder)
      return res.status(404).json({ success: false, message: "Order not found" });

    const merchant = await User.findById(updatedOrder.merchantId).select("name role");

    await createLog({
      user:   merchant?.name || updatedOrder.merchantId?.toString() || "Unknown",
      role:   merchant?.role || "Merchant",
      action: `Updated order ${orderId} status to ${orderStatus}`,
      status: "Success",
    });

    res.status(200).json({ success: true, message: "Order status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   GET SINGLE ORDER
========================================================= */
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId))
      return res.status(400).json({ success: false, message: "Invalid Order ID" });

    const order = await Order.findById(orderId)
      .populate("customerId", "name phone email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;