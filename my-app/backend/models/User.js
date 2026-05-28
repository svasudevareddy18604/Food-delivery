const mongoose = require("mongoose");

/* ── Delivery Address sub-schema ── */
const addressSchema = new mongoose.Schema(
  {
    label:     { type: String, default: "Home" },   // "Home" | "Work" | custom
    line1:     { type: String, required: true },
    line2:     { type: String, default: "" },
    city:      { type: String, default: "" },
    pincode:   { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    /* ── BASIC INFO  (name & email are NOT editable by the user) ── */
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    /* ── ROLE ── */
    role: {
      type:     String,
      enum:     ["customer", "merchant", "delivery", "admin"],
      required: true,
    },

    /* ── CUSTOMER CONTACT ── */
    phoneNumber:       { type: String, default: "" },
    deliveryAddresses: { type: [addressSchema], default: [] },

    /* ── MERCHANT DETAILS ── */
    restaurantName:    { type: String, default: "" },
    restaurantAddress: { type: String, default: "" },
    restaurantType:    { type: String, default: "" },
    restaurantImage:   { type: String, default: "" },
    openingTime:       { type: String, default: "" },
    closingTime:       { type: String, default: "" },

    /* ── ONLINE / OFFLINE TOGGLE ── */
    isOnline: { type: Boolean, default: false },

    /* ── TABLE RESERVATION ── */
    // Master switch — when true, customers can book tables at this restaurant
    tableReservationEnabled: { type: Boolean, default: false },

    // Total number of physical tables available for booking
    totalTables: { type: Number, default: null },

    // Maximum guests allowed per table
    maxGuestsPerTable: { type: Number, default: null },

    // Duration of a single reservation slot in minutes (e.g. 60 = 1 hour)
    reservationSlotDuration: { type: Number, default: 60 },

    // How many days in advance a customer can make a booking
    advanceBookingDays: { type: Number, default: 7 },

    /* ── APPROVAL & STATUS ── */
    registrationCompleted: { type: Boolean, default: false },
    isApproved:            { type: Boolean, default: false },
    isRejected:            { type: Boolean, default: false },
    isBlocked:             { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);