import express from "express";

import cors from "cors";

/* =========================================
   ROUTES
========================================= */

import authRoutes
from "./modules/auth/routes/index.js";

import staffRoutes
from "./modules/staff/routes/staff.routes.js";

import settingsRoutes
from "./modules/settings/routes/index.js";

import productRoutes
from "./modules/products/routes/index.js";

import storeRoutes
from "./modules/stores/routes/index.js";

/* =========================================
   INVENTORY ROUTES
========================================= */

import inventoryRoutes
from "./modules/inventory/routes/index.js";

/* =========================================
   SUPPLY ROUTES
========================================= */

import supplyRequestRoutes
from "./modules/supply/routes/supply.routes.js";

/* =========================================
   CASHIER ROUTES
========================================= */

import cashierRoutes
from "./modules/cashier/routes/index.js";

const app = express();

/* =========================================
   INIT
========================================= */

console.log(
  "✅ App initialized"
);

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({

  extended: true,

}));

/* =========================================
   STATIC FILES
========================================= */

app.use(
  "/uploads",
  express.static("uploads")
);

/* =========================================
   HEALTH CHECK
========================================= */

app.get(

  "/",

  (req, res) => {

    res.send(
      "API Running..."
    );

  }

);

/* =========================================
   AUTH ROUTES
========================================= */

app.use(
  "/api/auth",
  authRoutes
);

/* =========================================
   STAFF ROUTES
========================================= */

app.use(
  "/api/staff",
  staffRoutes
);

/* =========================================
   PRODUCT ROUTES
========================================= */

app.use(
  "/api/products",
  productRoutes
);

/* =========================================
   SETTINGS ROUTES
========================================= */

app.use(
  "/api/settings",
  settingsRoutes
);

/* =========================================
   STORE ROUTES
========================================= */

app.use(
  "/api/stores",
  storeRoutes
);

/* =========================================
   INVENTORY ROUTES
========================================= */

app.use(
  "/api/inventory",
  inventoryRoutes
);

/* =========================================
   CASHIER ROUTES
========================================= */

app.use(
  "/api/cashier",
  cashierRoutes
);

/* =========================================
   SUPPLY REQUEST ROUTES
========================================= */

app.use(
  "/api/supply-requests",
  supplyRequestRoutes
);

/* =========================================
   OPTIONAL OLD ROUTE SUPPORT
========================================= */

app.use(
  "/api/supplies",
  supplyRequestRoutes
);

/* =========================================
   404 HANDLER
========================================= */

app.use(

  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "Route not found",

    });

  }

);

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(

  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "🔥 FULL ERROR:",
      err
    );

    res.status(500).json({

      success: false,

      message:
        err.message ||
        "Internal Server Error",

    });

  }

);

export default app;