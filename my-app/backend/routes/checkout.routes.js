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
   HELPER
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

        customerName: "Customer",

        customerPhone: "No contact",

      };

    }

  };

/* =========================
   GENERATE ORDER NUMBER
========================= */

const generateOrderNumber = () => {

  return (
    "ORD-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000)
  );

};

/* =========================
   CREATE ORDER
========================= */

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

        customerName,
        customerPhone,

      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (

        !customerId ||
        !merchantId ||
        !items?.length ||
        !address ||
        !totalAmount

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Missing required fields."

        });

      }

      /* =========================
         CUSTOMER INFO
      ========================= */

      const customerData =
        await getCustomerInfo(customerId);

      const name =
        customerName ||
        customerData.customerName;

      const phone =
        customerPhone ||
        customerData.customerPhone;

      /* =========================
         ORDER NUMBER
      ========================= */

      const orderNumber =
        generateOrderNumber();

      /* =========================
         COD ORDER
      ========================= */

      if (paymentMethod === "COD") {

        const order =
          await Order.create({

            orderNumber,

            customerId,
            merchantId,

            items,

            address,

            customerName: name,

            customerPhone: phone,

            paymentMethod: "COD",

            paymentStatus: "PENDING",

            orderStatus: "PLACED",

            totalAmount,

          });

        return res.status(201).json({

          success: true,

          paymentMethod: "COD",

          orderId: order._id,

          orderNumber,

        });

      }

      /* =========================
         ONLINE PAYMENT
      ========================= */

      const rzpOrder =
        await razorpay.orders.create({

          amount:
            Math.round(totalAmount * 100),

          currency: "INR",

          receipt:
            `receipt_${Date.now()}`,

        });

      /* =========================
         CREATE ONLINE ORDER
      ========================= */

      const order =
        await Order.create({

          orderNumber,

          customerId,
          merchantId,

          items,

          address,

          customerName: name,

          customerPhone: phone,

          paymentMethod: "ONLINE",

          paymentStatus: "PENDING",

          orderStatus: "PLACED",

          totalAmount,

          razorpayOrderId:
            rzpOrder.id,

        });

      /* =========================
         RESPONSE
      ========================= */

      res.status(201).json({

        success: true,

        paymentMethod: "ONLINE",

        orderId:
          order._id,

        orderNumber,

        razorpayOrderId:
          rzpOrder.id,

        amount:
          rzpOrder.amount,

        currency:
          rzpOrder.currency,

        keyId:
          process.env.RAZORPAY_KEY_ID,

      });

    } catch (err) {

      console.error(
        "checkout/create-order:",
        err
      );

      res.status(500).json({

        success: false,

        message: err.message,

      });

    }

  }
);

/* =========================
   VERIFY PAYMENT
========================= */

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
         VERIFY SIGNATURE
      ========================= */

      const expected =
        crypto

          .createHmac(

            "sha256",

            process.env
              .RAZORPAY_KEY_SECRET

          )

          .update(
            `${razorpayOrderId}|${razorpayPaymentId}`
          )

          .digest("hex");

      if (
        expected !==
        razorpaySignature
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid payment signature.",

        });

      }

      /* =========================
         UPDATE ORDER
      ========================= */

      await Order.findByIdAndUpdate(

        orderId,

        {

          paymentStatus: "PAID",

          razorpayPaymentId,

        },

        {

          new: true,

        }

      );

      /* =========================
         SUCCESS
      ========================= */

      res.json({

        success: true,

        message:
          "Payment verified.",

      });

    } catch (err) {

      console.error(
        "checkout/verify-payment:",
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