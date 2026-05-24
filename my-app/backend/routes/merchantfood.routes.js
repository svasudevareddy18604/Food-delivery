const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const Food =
  require("../models/Food");

/* =========================
   MULTER STORAGE
========================= */

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      cb(
        null,
        "uploads/"
      );
    },

    filename: function (
      req,
      file,
      cb
    ) {

      cb(
        null,

        Date.now() +
        path.extname(
          file.originalname
        )
      );
    }

  });

const upload =
  multer({
    storage
  });

/* =========================
   ADD FOOD
========================= */

router.post(

  "/add-food",

  upload.single("image"),

  async (req, res) => {

    try {

      const {

        merchantId,
        name,
        category,
        description,
        price,
        stock,
        available

      } = req.body;

      const newFood =
        new Food({

          merchantId,

          name,

          category,

          description,

          price,

          stock,

          available,

          image:
            req.file
            ? `/uploads/${req.file.filename}`
            : ""
        });

      await newFood.save();

      res.status(201).json({

        success: true,

        message:
          "Food added successfully",

        food: newFood
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
   GET ALL FOODS
========================= */

router.get(

  "/foods/:merchantId",

  async (req, res) => {

    try {

      const foods =
        await Food.find({

          merchantId:
            req.params.merchantId

        }).sort({
          createdAt: -1
        });

      res.json({

        success: true,

        foods
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
   DELETE FOOD
========================= */

router.delete(

  "/delete-food/:id",

  async (req, res) => {

    try {

      await Food.findByIdAndDelete(
        req.params.id
      );

      res.json({

        success: true,

        message:
          "Food deleted"
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