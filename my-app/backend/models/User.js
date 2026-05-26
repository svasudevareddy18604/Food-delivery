const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    /* ROLE */
    role: {
      type: String,
      enum: ["customer", "merchant", "delivery", "admin"],
      required: true,
    },

    /* MERCHANT DETAILS */
    restaurantName:    { type: String, default: "" },
    restaurantAddress: { type: String, default: "" },
    restaurantType:    { type: String, default: "" },
    phoneNumber:       { type: String, default: "" },
    restaurantImage:   { type: String, default: "" },
    openingTime:       { type: String, default: "" },
    closingTime:       { type: String, default: "" },

    /* ONLINE / OFFLINE TOGGLE */
    isOnline: { type: Boolean, default: false },

    /* APPROVAL & STATUS */
    registrationCompleted: { type: Boolean, default: false },
    isApproved:            { type: Boolean, default: false },
    isRejected:            { type: Boolean, default: false },
    isBlocked:             { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);