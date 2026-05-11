import express from "express";

import {

  getStores,

  getStore,

  addStore,

  updateStore,

  deleteStore

} from "../controllers/store.controller.js";

/* =========================================
   ROUTER
========================================= */

const router =
  express.Router();

/* =========================================
   GET ALL STORES
========================================= */

router.get(

  "/",

  getStores

);

/* =========================================
   GET SINGLE STORE
========================================= */

router.get(

  "/:id",

  getStore

);

/* =========================================
   CREATE STORE
========================================= */

router.post(

  "/",

  addStore

);

/* =========================================
   UPDATE STORE
========================================= */

router.put(

  "/:id",

  updateStore

);

/* =========================================
   DELETE STORE
========================================= */

router.delete(

  "/:id",

  deleteStore

);

/* =========================================
   EXPORT
========================================= */

export default router;