const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const path = require("path");

/* =========================
   DATABASE
========================= */

const connectDB =
  require("./config/db");

/* =========================
   LOAD ENV
========================= */

dotenv.config();

/* =========================
   CONNECT DATABASE
========================= */

connectDB();

/* =========================
   EXPRESS APP
========================= */

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

/* =========================
   STATIC FOLDER
========================= */

app.use(
  "/uploads",

  express.static(
    path.join(__dirname, "uploads")
  )
);

/* =========================
   ROUTES
========================= */

/* AUTH ROUTES */

app.use(
  "/api/auth",

  require("./routes/signup.routes")
);

app.use(
  "/api/auth",

  require("./routes/login.routes")
);

/* ADMIN ROUTES */

app.use(
  "/api/admin",

  require("./routes/admin.routes")
);

/* MERCHANT ROUTES */

app.use(
  "/api/merchant",

  require("./routes/merchant.routes")
);

/* MERCHANT FOOD ROUTES */

app.use(
  "/api/merchant-food",

  require("./routes/merchantfood.routes")
);

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {

  res.send(
    "OmniRetail Backend Running"
  );
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route Not Found"

  });
});

/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server Running On Port ${PORT}`
  );
});