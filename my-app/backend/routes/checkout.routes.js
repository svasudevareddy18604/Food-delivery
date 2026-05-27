const express  = require("express");
const Razorpay = require("razorpay");
const crypto   = require("crypto");

const Order    = require("../models/Order");
const User     = require("../models/User");

const router   = express.Router();

/* =========================
   RAZORPAY
========================= */

const razorpay = new Razorpay({

  key_id:
    process.env.RAZORPAY_KEY_ID,

  key_secret:
    process.env.RAZORPAY_KEY_SECRET,

});

/* =========================
   HELPER — GET CUSTOMER INFO
   Falls back to DB if frontend
   didn't send name / phone
========================= */

const getCustomerInfo =
  async (customerId) => {

    try {

      const user =
        await User.findById(customerId)
          .select("name phoneNumber");

      return {

        customerName:
          user?.name || "Customer",

        customerPhone:
          user?.phoneNumber || "No contact",

      };

    } catch {

      return {

        customerName:  "Customer",
        customerPhone: "No contact",

      };

    }

  };

/* =========================
   GENERATE ORDER NUMBER
========================= */

const generateOrderNumber = () =>
  "ORD-" +
  Date.now() +
  "-" +
  Math.floor(Math.random() * 1000);

/* ══════════════════════════════════════
   POST /create-order
   Accepts both COD and ONLINE payments.
   customerName & customerPhone come
   from the checkout form (already
   pre-filled from the user's profile).
══════════════════════════════════════ */

router.post(

  "/create-order",

  async (req, res) => {

    try {

      const {

        customerId,
        merchantId,
        items,
        address,

        paymentMethod,
        totalAmount,

        /* sent from Checkout.jsx form */
        customerName:  nameFromForm,
        customerPhone: phoneFromForm,

      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (

        !customerId  ||
        !merchantId  ||
        !items?.length ||
        !address     ||
        !totalAmount

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Missing required fields.",

        });

      }

      /* =========================
         RESOLVE NAME & PHONE
         Prefer form values; fall back
         to the DB record so orders
         always have contact info.
      ========================= */

      let customerName  = nameFromForm?.trim()  || "";
      let customerPhone = phoneFromForm?.trim()  || "";

      if (!customerName || !customerPhone) {

        const dbInfo =
          await getCustomerInfo(customerId);

        customerName  =
          customerName  || dbInfo.customerName;

        customerPhone =
          customerPhone || dbInfo.customerPhone;

      }

      /* =========================
         ORDER NUMBER
      ========================= */

      const orderNumber = generateOrderNumber();

      /* =========================
         COD ORDER
      ========================= */

      if (paymentMethod === "COD") {

        const order = await Order.create({

          orderNumber,

          customerId,
          merchantId,

          items,
          address,

          customerName,
          customerPhone,

          paymentMethod: "COD",
          paymentStatus: "PENDING",
          orderStatus:   "PLACED",

          totalAmount,

        });

        return res.status(201).json({

          success: true,

          paymentMethod: "COD",

          orderId:     order._id,
          orderNumber,

        });

      }

      /* =========================
         ONLINE PAYMENT
         Create Razorpay order first,
         then persist our order doc.
      ========================= */

      const rzpOrder = await razorpay.orders.create({

        amount:   Math.round(totalAmount * 100),
        currency: "INR",
        receipt:  `receipt_${Date.now()}`,

      });

      const order = await Order.create({

        orderNumber,

        customerId,
        merchantId,

        items,
        address,

        customerName,
        customerPhone,

        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        orderStatus:   "PLACED",

        totalAmount,

        razorpayOrderId: rzpOrder.id,

      });

      return res.status(201).json({

        success: true,

        paymentMethod: "ONLINE",

        orderId:         order._id,
        orderNumber,

        razorpayOrderId: rzpOrder.id,
        amount:          rzpOrder.amount,
        currency:        rzpOrder.currency,

        keyId: process.env.RAZORPAY_KEY_ID,

      });

    } catch (err) {

      console.error(
        "❌ checkout/create-order:",
        err
      );

      res.status(500).json({

        success: false,
        message: err.message,

      });

    }

  }

);

/* ══════════════════════════════════════
   POST /verify-payment
   Verifies Razorpay HMAC signature and
   marks the order as PAID.
══════════════════════════════════════ */

router.post(

  "/verify-payment",

  async (req, res) => {

    try {

      const {

        orderId,

        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,

      } = req.body;

      /* =========================
         VERIFY HMAC SIGNATURE
      ========================= */

      const expected = crypto

        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )

        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )

        .digest("hex");

      if (expected !== razorpaySignature) {

        return res.status(400).json({

          success: false,
          message: "Invalid payment signature.",

        });

      }

      /* =========================
         MARK ORDER AS PAID
      ========================= */

      const order = await Order.findByIdAndUpdate(

        orderId,

        {
          paymentStatus:    "PAID",
          razorpayPaymentId,
        },

        { new: true }

      );

      if (!order) {

        return res.status(404).json({

          success: false,
          message: "Order not found.",

        });

      }

      /* =========================
         SUCCESS
      ========================= */

      return res.json({

        success: true,
        message: "Payment verified.",

      });

    } catch (err) {

      console.error(
        "❌ checkout/verify-payment:",
        err
      );

      res.status(500).json({

        success: false,
        message: err.message,

      });

    }

  }

);

module.exports = router;