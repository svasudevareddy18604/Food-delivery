const User = require("../models/User");
const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");

exports.getAnalytics = async (req, res) => {
  try {
    const totalCustomers =
      await User.countDocuments({
        role: "customer",
      });

    const totalMerchants =
      await User.countDocuments({
        role: "merchant",
      });

    const totalAdmins =
      await User.countDocuments({
        role: "admin",
      });

    const totalDeliveryUsers =
      await User.countDocuments({
        role: "delivery",
      });

    const totalDeliveryPartners =
      await DeliveryPartner.countDocuments();

    const totalOrders =
      await Order.countDocuments();

    const deliveredOrders =
      await Order.countDocuments({
        orderStatus: "DELIVERED",
      });

    const cancelledOrders =
      await Order.countDocuments({
        orderStatus: "CANCELLED",
      });

    const preparingOrders =
      await Order.countDocuments({
        orderStatus: "PREPARING",
      });

    const outForDeliveryOrders =
      await Order.countDocuments({
        orderStatus: "OUT_FOR_DELIVERY",
      });

    const placedOrders =
      await Order.countDocuments({
        orderStatus: "PLACED",
      });

    const totalRevenueData =
      await Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]);

    const totalRevenue =
      totalRevenueData[0]?.totalRevenue || 0;

    const paidOrders =
      await Order.countDocuments({
        paymentStatus: "PAID",
      });

    const codOrders =
      await Order.countDocuments({
        paymentMethod: "COD",
      });

    const onlineOrders =
      await Order.countDocuments({
        paymentMethod: "ONLINE",
      });

    res.json({
      success: true,

      users: {
        customers: totalCustomers,
        merchants: totalMerchants,
        deliveryUsers: totalDeliveryUsers,
        admins: totalAdmins,
        deliveryPartners: totalDeliveryPartners,
      },

      orders: {
        total: totalOrders,
        placed: placedOrders,
        preparing: preparingOrders,
        outForDelivery: outForDeliveryOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },

      payments: {
        paidOrders,
        codOrders,
        onlineOrders,
      },

      revenue: {
        totalRevenue,
      },
    });

  } catch (error) {
    console.error("Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};
