const express = require("express");

const router = express.Router();

const User =
  require("../models/User");

/* =========================
   MERCHANT REGISTRATION
========================= */

router.put(

  "/register/:id",

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      /* USER NOT FOUND */

      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found"
        });
      }

      /* =========================
         UPDATE MERCHANT DATA
      ========================= */

      user.restaurantName =
        req.body.restaurantName;

      user.phoneNumber =
        req.body.phoneNumber;

      user.restaurantAddress =
        req.body.restaurantAddress;

      user.restaurantType =
        req.body.restaurantType;

      user.openingTime =
        req.body.openingTime;

      user.closingTime =
        req.body.closingTime;

      /* =========================
         REGISTRATION STATUS
      ========================= */

      user.registrationCompleted =
        true;

      user.isApproved =
        false;

      /* =========================
         SAVE USER
      ========================= */

      await user.save();

      /* =========================
         RESPONSE
      ========================= */

      res.status(200).json({

        success: true,

        message:
          "Merchant Registration Submitted",

        user
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

/* =========================
   GET APPROVED RESTAURANTS
========================= */

router.get(

  "/approved-restaurants",

  async (req, res) => {

    try {

      const restaurants =
        await User.find({

          role: "merchant",

          registrationCompleted: true,

          isApproved: true
        });

      res.status(200).json({

        success: true,

        restaurants
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

/* =========================
   GET SINGLE MERCHANT
========================= */

router.get(

  "/:id",

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      /* USER NOT FOUND */

      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "Merchant not found"
        });
      }

      res.status(200).json({

        success: true,

        user
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

module.exports = router;