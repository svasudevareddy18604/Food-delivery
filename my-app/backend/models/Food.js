const mongoose = require("mongoose");

/* =========================
   FOOD SCHEMA
========================= */

const foodSchema =
  new mongoose.Schema(

    {

      merchantId: {

        type: String,

        required: true
      },

      name: {

        type: String,

        required: true,

        trim: true
      },

      category: {

        type: String,

        required: true,

        trim: true
      },

      description: {

        type: String,

        default: ""
      },

      price: {

        type: Number,

        required: true
      },

      stock: {

        type: Number,

        default: 0
      },

      image: {

        type: String,

        default: ""
      },

      available: {

        type: Boolean,

        default: true
      }

    },

    {
      timestamps: true
    }
  );

/* =========================
   EXPORT MODEL
========================= */

const Food =
  mongoose.model(
    "Food",
    foodSchema
  );

module.exports = Food;
