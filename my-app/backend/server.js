const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

/* =========================
   DATABASE
========================= */
const connectDB = require("./config/db");

/* =========================
   MAINTENANCE MIDDLEWARE
========================= */
const maintenanceCheck = require("./middleware/maintenanceCheck");

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
app.use(express.urlencoded({ extended: true }));

/* =========================
   MAINTENANCE MODE
========================= */
app.use(maintenanceCheck);

/* =========================
   STATIC FOLDER
========================= */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================
   ROUTES
========================= */

/* AUTH */
app.use("/api/auth", require("./routes/signup.routes"));
app.use("/api/auth", require("./routes/login.routes"));

/* FORGOT PASSWORD */
app.use("/api/auth", require("./routes/forgotpassword.routes"));

/* ADMIN */
app.use("/api/admin", require("./routes/admin.routes"));

/* ADMIN SETTINGS */
app.use(
  "/api/admin/settings",
  require("./routes/adminsettings.routes")
);

/* MERCHANT */
app.use("/api/merchant", require("./routes/merchant.routes"));

/* NEARBY RESTAURANTS */
app.use(
  "/api/nearby-restaurants",
  require("./routes/nearbyrestaurants.routes")
);

/* MERCHANT FOOD */
app.use(
  "/api/merchant-food",
  require("./routes/merchantfood.routes")
);

/* PAYMENT */
app.use(
  "/api/payment",
  require("./routes/payment.routes")
);

/* MERCHANT SETTINGS */
app.use(
  "/api/merchant-settings",
  require("./routes/merchantsettings.routes")
);

/* ORDERS */
app.use(
  "/api/orders",
  require("./routes/orders.routes")
);

/* CHECKOUT */
app.use(
  "/api/checkout",
  require("./routes/checkout.routes")
);

/* RESERVATIONS */
app.use(
  "/api/reservations",
  require("./routes/reservations.routes")
);

/* PROFILE */
app.use(
  "/api",
  require("./routes/profile.routes")
);

/* =========================
   DELIVERY PARTNER
========================= */
app.use(
  "/api/delivery-partner",
  require("./routes/deliveryRegistration.routes")
);

app.use(
  "/api/delivery",
  require("./routes/deliveryProfile.routes")
);

app.use(
  "/api/admin",
  require("./routes/adminDelivery.routes")
);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("OmniRetail Backend Running");
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});