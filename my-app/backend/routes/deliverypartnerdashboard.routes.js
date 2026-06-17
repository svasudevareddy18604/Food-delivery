const express        = require("express");
const mongoose       = require("mongoose");
const router         = express.Router();
const Order          = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");

/* =========================================================
   HELPERS
========================================================= */

// Resolve a DeliveryPartner._id to the User._id used on Order.deliveryPartnerId
async function resolveUserId(partnerId) {
  if (!mongoose.Types.ObjectId.isValid(partnerId)) return null;
  const partner = await DeliveryPartner.findById(partnerId).select("userId");
  return partner ? partner.userId : null;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d;
}

function startOfMonth() {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

async function sumEarnings(userId, since) {
  const result = await Order.aggregate([
    {
      $match: {
        deliveryPartnerId: userId,
        orderStatus: "DELIVERED",
        ...(since ? { updatedAt: { $gte: since } } : {}),
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  return result[0]?.total || 0;
}

/* =========================================================
   GET PROFILE
   Merges DeliveryPartner doc with computed earnings figures.
========================================================= */
router.get("/:partnerId/profile", async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId))
      return res.status(400).json({ success: false, message: "Invalid partner ID" });

    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const userId = partner.userId;

    const [todayEarnings, weekEarnings, monthEarnings, deliveriesToday] = await Promise.all([
      sumEarnings(userId, startOfToday()),
      sumEarnings(userId, startOfWeek()),
      sumEarnings(userId, startOfMonth()),
      Order.countDocuments({
        deliveryPartnerId: userId,
        orderStatus: "DELIVERED",
        updatedAt: { $gte: startOfToday() },
      }),
    ]);

    res.status(200).json({
      success: true,
      partnerId: partner._id,
      firstName: partner.fullName?.split(" ")[0] || "Partner",
      fullName: partner.fullName,
      avatar: partner.profilePhoto || null,
      vehicleType: partner.vehicleType || "—",
      zone: partner.preferredArea || "—",
      available: !!partner.isOnline,

      // Real, computed
      todayEarnings,
      weekEarnings,
      monthEarnings,
      deliveriesToday,

      // Not yet backed by real data — explicit placeholders, not invented numbers
      rating: null,
      totalReviews: 0,
      shiftHours: "—",
      kmCovered: "—",
      avgDeliveryTime: "—",
      incentives: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   GET STATS  (the 6 stat cards)
========================================================= */
router.get("/:partnerId/stats", async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId))
      return res.status(400).json({ success: false, message: "Invalid partner ID" });

    const userId = await resolveUserId(partnerId);
    if (!userId)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const [totalOrders, delivered, active, cancelled, todayEarnings] = await Promise.all([
      Order.countDocuments({ deliveryPartnerId: userId }),
      Order.countDocuments({ deliveryPartnerId: userId, orderStatus: "DELIVERED" }),
      Order.countDocuments({ deliveryPartnerId: userId, orderStatus: "OUT_FOR_DELIVERY" }),
      Order.countDocuments({ deliveryPartnerId: userId, orderStatus: "CANCELLED" }),
      sumEarnings(userId, startOfToday()),
    ]);

    res.status(200).json({
      success: true,
      totalOrders,
      delivered,
      active,
      cancelled,
      todayEarnings,
      // No historical snapshot exists yet to compute real trend deltas —
      // omit rather than invent. Frontend treats missing change as "no badge".
      totalOrdersChange: null,
      deliveredChange: null,
      deliveredUp: null,
      cancelledChange: null,
      earningsChange: null,
      earningsUp: null,
      avgRating: null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   GET ORDERS  (paginated, filterable by status)
========================================================= */
router.get("/:partnerId/orders", async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(partnerId))
      return res.status(400).json({ success: false, message: "Invalid partner ID" });

    const userId = await resolveUserId(partnerId);
    if (!userId)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const query = { deliveryPartnerId: userId };
    if (status && status !== "all") query.orderStatus = status;

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      orders,
      page: pageNum,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   GET PERFORMANCE
   No backing data exists for these yet — returns honest
   zeros rather than fabricated percentages.
========================================================= */
router.get("/:partnerId/performance", async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId))
      return res.status(400).json({ success: false, message: "Invalid partner ID" });

    const userId = await resolveUserId(partnerId);
    if (!userId)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    res.status(200).json({
      success: true,
      onTimeRate: 0,
      acceptanceRate: 0,
      customerRating: 0,
      completionRate: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   PATCH AVAILABILITY  (online / offline toggle)
========================================================= */
router.patch("/:partnerId/availability", async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { available }  = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId))
      return res.status(400).json({ success: false, message: "Invalid partner ID" });

    if (typeof available !== "boolean")
      return res.status(400).json({ success: false, message: "available must be a boolean" });

    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      { isOnline: available },
      { new: true }
    );

    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    res.status(200).json({ success: true, available: partner.isOnline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;