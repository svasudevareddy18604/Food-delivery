const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  /* =========================
     ORDER NUMBER
  ========================= */

  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },

  /* =========================
     CUSTOMER + MERCHANT
  ========================= */

  customerId: {
    type: String,
    required: true,
  },

  merchantId: {
    type: String,
    required: true,
  },

  /* =========================
     CUSTOMER SNAPSHOT
  ========================= */

  customerName: {
    type: String,
    default: "Customer",
  },

  customerPhone: {
    type: String,
    default: "No contact",
  },

  /* =========================
     ORDER ITEMS
  ========================= */

  items: [
    {
      foodId: {
        type: String,
      },

      name: {
        type: String,
      },

      image: {
        type: String,
      },

      price: {
        type: Number,
      },

      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],

  /* =========================
     DELIVERY ADDRESS
  ========================= */

  address: {
    type: String,
    required: true,
  },

  /* =========================
     PAYMENT
  ========================= */

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD",
  },

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING",
  },

  /* =========================
     ORDER STATUS
  ========================= */

  orderStatus: {
    type: String,

    enum: [
      "PLACED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ],

    default: "PLACED",
  },

  /* =========================
     TOTAL
  ========================= */

  totalAmount: {
    type: Number,
    required: true,
  },

  /* =========================
     RAZORPAY
  ========================= */

  razorpayOrderId: {
    type: String,
  },

  razorpayPaymentId: {
    type: String,
  },

}, {

  timestamps: true

});

module.exports =
  mongoose.model("Order", orderSchema);