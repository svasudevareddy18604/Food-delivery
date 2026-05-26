const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  customerId:    { type: String, required: true },
  merchantId:    { type: String, required: true },

  /* ── customer snapshot (stored at order time) ── */
  customerName:  { type: String, default: "Customer"    },
  customerPhone: { type: String, default: "No contact"  },

  items: [{
    foodId:   String,
    name:     String,
    image:    String,
    price:    Number,
    quantity: Number,
  }],

  address:       { type: String, required: true },

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

  orderStatus: {
    type: String,
    enum: [
      "PLACED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",        // ← was missing, caused update to silently fail
    ],
    default: "PLACED",
  },

  totalAmount:       { type: Number, required: true },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);