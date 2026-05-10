import express from "express";

import storeInventoryRoutes
from "./storeInventory.routes.js";

/* =========================================
   ROUTER
========================================= */

const router =
  express.Router();

/* =========================================
   INVENTORY ROUTES
========================================= */

router.use(

  "/store-inventory",

  storeInventoryRoutes

);

export default router;