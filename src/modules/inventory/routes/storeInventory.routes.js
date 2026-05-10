import express from "express";

import {

  assignProductToStore,

  getStoreInventory,

  updateInventoryQuantity,

} from "../controllers/storeInventory.controller.js";

/* =========================================
   ROUTER
========================================= */

const router =
  express.Router();

/* =========================================
   ASSIGN PRODUCT TO STORE
========================================= */

router.post(

  "/assign",

  async (req, res) => {

    try {

      const inventory =

        await assignProductToStore(
          req.body
        );

      console.log(
        "PRODUCT ASSIGNED:",
        inventory
      );

      return res.status(201).json({

        success: true,

        message:
          "Product assigned to store successfully",

        inventory,

      });

    }

    catch (err) {

      console.log(

        "ASSIGN PRODUCT ROUTE ERROR:",

        err

      );

      return res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

/* =========================================
   GET STORE INVENTORY
========================================= */

router.get(

  "/store/:storeId",

  async (req, res) => {

    try {

      const inventory =

        await getStoreInventory(
          req.params.storeId
        );

      console.log(
        "STORE INVENTORY:",
        inventory.length
      );

      return res.status(200).json({

        success: true,

        count:
          inventory.length,

        inventory,

      });

    }

    catch (err) {

      console.log(

        "GET INVENTORY ROUTE ERROR:",

        err

      );

      return res.status(500).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

/* =========================================
   UPDATE INVENTORY QUANTITY
========================================= */

router.put(

  "/:inventoryId",

  async (req, res) => {

    try {

      const inventory =

        await updateInventoryQuantity(

          req.params.inventoryId,

          req.body.quantity

        );

      console.log(
        "INVENTORY UPDATED:",
        inventory
      );

      return res.status(200).json({

        success: true,

        message:
          "Inventory updated successfully",

        inventory,

      });

    }

    catch (err) {

      console.log(

        "UPDATE INVENTORY ROUTE ERROR:",

        err

      );

      return res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

export default router;