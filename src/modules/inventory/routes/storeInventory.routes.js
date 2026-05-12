import express from "express";

import {

  assignProductToStore,

  getStoreInventory,

  getAllInventory,

  updateInventoryQuantity,

} from "../controllers/storeInventory.controller.js";

/* =========================================
   ROUTER
========================================= */

const router = express.Router();

/* =========================================
   ASSIGN PRODUCT TO STORE
========================================= */

router.post(
  "/assign",
  assignProductToStore
);

/* =========================================
   GET ALL INVENTORY
========================================= */

router.get(
  "/",
  getAllInventory
);

/* =========================================
   GET SINGLE STORE INVENTORY
========================================= */

router.get(
  "/store/:storeId",
  getStoreInventory
);

/* =========================================
   UPDATE INVENTORY QUANTITY
========================================= */

router.put(
  "/:inventoryId",
  updateInventoryQuantity
);

/* =========================================
   EXPORT
========================================= */

export default router;