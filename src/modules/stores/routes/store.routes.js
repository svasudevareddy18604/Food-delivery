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

const router =
  express.Router();

/* =========================================
   ASSIGN PRODUCT
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
   UPDATE INVENTORY
========================================= */

router.put(

  "/:inventoryId",

  updateInventoryQuantity

);

/* =========================================
   EXPORT
========================================= */

export default router;