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
      foodId:   { type: String },
      name:     { type: String },
      image:    { type: String },
      price:    { type: Number },
      quantity: { type: Number, default: 1 },
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
    enum: ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    default: "PLACED",
  },

  /* =========================
     DELIVERY PARTNER
     ⚠️  deliveryPartnerId must always be a User._id
        (not a DeliveryPartner._id) — see DeliveryPartner.userId
  ========================= */
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // When a partner accepted the order (first-come-first-serve audit trail)
  acceptedAt: {
    type: Date,
    default: null,
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
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },

}, { timestamps: true });

/* =========================================================
   INDEXES
   Speeds up the delivery-partner "available orders" poll,
   which filters on orderStatus + deliveryPartnerId every
   time a partner's app refreshes.
========================================================= */
orderSchema.index({ orderStatus: 1, deliveryPartnerId: 1 });

module.exports = mongoose.model("Order", orderSchema);