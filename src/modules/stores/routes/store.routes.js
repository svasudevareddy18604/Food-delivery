import express from "express";

import {
  assignProductToStore,
  getStoreInventory,
  getAllInventory,
  updateInventoryQuantity,
} from "../../inventory/controllers/storeInventory.controller.js";

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
   GET STORE INVENTORY
========================================= */

router.get(
  "/store/:storeId",
  getStoreInventory
);

/* =========================================
   GET ALL INVENTORY
========================================= */

router.get(
  "/all",
  getAllInventory
);

/* =========================================
   UPDATE INVENTORY QUANTITY
========================================= */

router.put(
  "/:inventoryId",
  updateInventoryQuantity
);

/* =========================================
   EXPORT ROUTER
========================================= */

export default router;