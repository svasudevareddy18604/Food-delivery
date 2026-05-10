import mongoose from "mongoose";

/* =========================================
   STORE INVENTORY SCHEMA
========================================= */

const storeInventorySchema =
  new mongoose.Schema(

    {

      /* =====================================
         STORE
      ===================================== */

      store: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Store",

        required: true,

      },

      /* =====================================
         PRODUCT
      ===================================== */

      product: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Product",

        required: true,

      },

      /* =====================================
         QUANTITY
      ===================================== */

      quantity: {

        type: Number,

        default: 0,

        min: 0,

      },

      /* =====================================
         LOW STOCK LIMIT
      ===================================== */

      lowStockLimit: {

        type: Number,

        default: 10,

      },

      /* =====================================
         STATUS
      ===================================== */

      status: {

        type: String,

        enum: [

          "Active",

          "Low Stock",

          "Out of Stock",

        ],

        default: "Active",

      },

    },

    {

      timestamps: true,

    }

  );

/* =========================================
   AUTO STATUS UPDATE
========================================= */

storeInventorySchema.pre(

  "save",

  function (next) {

    /* OUT OF STOCK */

    if (this.quantity <= 0) {

      this.status =
        "Out of Stock";

    }

    /* LOW STOCK */

    else if (

      this.quantity <
      this.lowStockLimit

    ) {

      this.status =
        "Low Stock";

    }

    /* ACTIVE */

    else {

      this.status =
        "Active";

    }

    next();

  }

);

/* =========================================
   PREVENT DUPLICATES
========================================= */

storeInventorySchema.index(

  {

    store: 1,

    product: 1,

  },

  {

    unique: true,

  }

);

/* =========================================
   EXPORT MODEL
========================================= */

const StoreInventory =
  mongoose.model(

    "StoreInventory",

    storeInventorySchema

  );

export default StoreInventory;