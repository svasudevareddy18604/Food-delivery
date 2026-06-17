const express   = require("express");
const mongoose  = require("mongoose");
const router    = express.Router();
const Order     = require("../models/Order");
const User      = require("../models/User");
const createLog = require("../utils/createLog");

const ALLOWED_STATUSES = [
  "PLACED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

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
   GET DELIVERY PARTNER ORDERS  (orders assigned to ME)
   ⚠️  Must be above /:orderId wildcard
========================================================= */
router.get("/delivery/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;

    const orders = await Order.find({ deliveryPartnerId: partnerId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   GET AVAILABLE ORDERS  (unclaimed, visible to ALL partners)
   First-come-first-serve pool — no location filtering yet.
   ⚠️  Must be above /:orderId wildcard
========================================================= */
router.get("/available", async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "PLACED",
      deliveryPartnerId: null,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   ACCEPT ORDER  (first-come-first-serve, race-safe)
   A delivery partner claims an unassigned order. Uses an
   atomic findOneAndUpdate guarded on deliveryPartnerId: null
   so two partners tapping "Accept" at the same time can't
   both win — only the first write succeeds.
   ⚠️  Must be above /:orderId wildcard
========================================================= */
router.put("/:orderId/accept", async (req, res) => {
  try {
    const { orderId }   = req.params;
    const { partnerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId))
      return res.status(400).json({ success: false, message: "Invalid Order ID" });

    if (!partnerId)
      return res.status(400).json({ success: false, message: "partnerId is required" });

    // Atomic: only succeeds if no one else has claimed it yet
    const order = await Order.findOneAndUpdate(
      { _id: orderId, deliveryPartnerId: null },
      { deliveryPartnerId: partnerId, acceptedAt: new Date() },
      { new: true }
    );

    if (!order) {
      // Either the order doesn't exist, or someone already accepted it
      const exists = await Order.findById(orderId).select("deliveryPartnerId");
      if (!exists) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      return res.status(409).json({
        success: false,
        message: "Order already accepted by another partner",
        code: "ALREADY_ACCEPTED",
      });
    }

    await createLog({
      user:   partnerId,
      role:   "DeliveryPartner",
      action: `Partner ${partnerId} accepted order ${orderId}`,
      status: "Success",
    });

    res.status(200).json({ success: true, message: "Order accepted", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   ASSIGN DELIVERY PARTNER TO ORDER  (manual/admin override)
   ⚠️  Must be above /:orderId wildcard
========================================================= */
router.put("/:orderId/assign-partner", async (req, res) => {
  try {
    const { orderId }   = req.params;
    const { partnerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId))
      return res.status(400).json({ success: false, message: "Invalid Order ID" });

    if (!partnerId)
      return res.status(400).json({ success: false, message: "partnerId is required" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryPartnerId: partnerId },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    await createLog({
      user:   partnerId,
      role:   "DeliveryPartner",
      action: `Assigned delivery partner ${partnerId} to order ${orderId}`,
      status: "Success",
    });

    res.status(200).json({ success: true, message: "Partner assigned", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   UPDATE ORDER STATUS
   ⚠️  Must be above /:orderId wildcard
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
    );

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
   ⚠️  KEEP THIS LAST — wildcard catches everything above
========================================================= */
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId))
      return res.status(400).json({ success: false, message: "Invalid Order ID" });

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;