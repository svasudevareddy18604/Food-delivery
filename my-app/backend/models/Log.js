const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      default: "System",
    },

    role: {
      type: String,
      default: "System",
    },

    action: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Success", "Warning", "Failed"],
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Log", logSchema);
