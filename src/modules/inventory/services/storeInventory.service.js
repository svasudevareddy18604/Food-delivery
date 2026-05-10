import StoreInventory from "../models/storeInventory.model.js";

/* =========================================
   ASSIGN PRODUCT TO STORE
========================================= */

export const assignProductToStore =
  async (data) => {

    try {

      const {

        store,

        product,

        quantity,

        lowStockLimit,

      } = data;

      /* VALIDATION */

      if (

        !store ||

        !product

      ) {

        throw new Error(

          "Store and Product are required"

        );

      }

      /* CHECK EXISTING */

      const existingInventory =

        await StoreInventory.findOne({

          store,

          product,

        });

      /* IF EXISTS -> UPDATE */

      if (existingInventory) {

        existingInventory.quantity +=
          Number(quantity || 0);

        if (lowStockLimit) {

          existingInventory.lowStockLimit =
            lowStockLimit;

        }

        await existingInventory.save();

        return existingInventory;

      }

      /* CREATE NEW */

      const inventory =

        await StoreInventory.create({

          store,

          product,

          quantity:
            Number(quantity || 0),

          lowStockLimit:
            Number(lowStockLimit || 10),

        });

      return inventory;

    }

    catch (err) {

      console.log(

        "ASSIGN PRODUCT SERVICE ERROR:",

        err

      );

      throw err;

    }

  };

/* =========================================
   GET STORE INVENTORY
========================================= */

export const getStoreInventory =
  async (storeId) => {

    try {

      const inventory =

        await StoreInventory.find({

          store: storeId,

        })

        .populate("product")

        .populate("store")

        .sort({

          createdAt: -1,

        });

      return inventory;

    }

    catch (err) {

      console.log(

        "GET STORE INVENTORY ERROR:",

        err

      );

      throw err;

    }

  };

/* =========================================
   UPDATE INVENTORY QUANTITY
========================================= */

export const updateInventoryQuantity =
  async (

    inventoryId,

    quantity

  ) => {

    try {

      const inventory =

        await StoreInventory.findById(

          inventoryId

        );

      if (!inventory) {

        throw new Error(

          "Inventory not found"

        );

      }

      inventory.quantity =
        Number(quantity);

      await inventory.save();

      return inventory;

    }

    catch (err) {

      console.log(

        "UPDATE INVENTORY ERROR:",

        err

      );

      throw err;

    }

  };