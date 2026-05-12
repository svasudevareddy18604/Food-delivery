import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreInventory",
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    items: [orderItemSchema],

    itemsCount: {
      type: Number,
      default: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Online", "Other"],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed", "Refunded"],
      default: "Paid",
    },

    orderStatus: {
      type: String,
      enum: ["Completed", "Pending", "Cancelled", "Refunded"],
      default: "Completed",
    },

    cashierName: {
      type: String,
      default: "Cashier",
    },

    cashierId: {
      type: String,
      default: "N/A",
    },

    storeId: {
      type: String,
      default: "",
    },

    storeName: {
      type: String,
      default: "Main Store",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = "ORD-" + random;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;