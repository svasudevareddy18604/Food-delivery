const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    storeOpen: {
      type: Boolean,
      default: true,
    },

    acceptOrders: {
      type: Boolean,
      default: true,
    },

    acceptCOD: {
      type: Boolean,
      default: true,
    },

    acceptOnlinePayments: {
      type: Boolean,
      default: true,
    },

    deliveryAvailable: {
      type: Boolean,
      default: true,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
    },

    deliveryRadiusKm: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);