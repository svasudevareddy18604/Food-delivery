const mongoose =
  require("mongoose");

const orderSchema =
  new mongoose.Schema({

    customerId: {

      type: String,

      required: true
    },

    merchantId: {

      type: String,

      required: true
    },

    items: [

      {
        foodId: String,

        name: String,

        image: String,

        price: Number,

        quantity: Number
      }
    ],

    address: {

      type: String,

      required: true
    },

    paymentMethod: {

      type: String,

      enum: ["COD", "ONLINE"],

      default: "COD"
    },

    paymentStatus: {

      type: String,

      enum: [

        "PENDING",
        "PAID"
      ],

      default: "PENDING"
    },

    orderStatus: {

      type: String,

      enum: [

        "PLACED",
        "ACCEPTED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
      ],

      default: "PLACED"
    },

    totalAmount: {

      type: Number,

      required: true
    }

  }, {

    timestamps: true
  });

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );