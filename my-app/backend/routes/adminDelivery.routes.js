const express = require("express");
const router = express.Router();

const DeliveryPartner =
  require("../models/DeliveryPartner");

/* =====================================
   GET ALL DELIVERY PARTNERS
===================================== */

router.get(
  "/delivery-partners",
  async (req, res) => {
    try {
      const partners =
        await DeliveryPartner.find()
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: partners.length,
        partners,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =====================================
   GET SINGLE DELIVERY PARTNER
===================================== */

router.get(
  "/delivery-partners/:id",
  async (req, res) => {
    try {
      const partner =
        await DeliveryPartner.findById(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery partner not found",
        });
      }

      res.status(200).json({
        success: true,
        partner,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =====================================
   APPROVE DELIVERY PARTNER
===================================== */

router.put(
  "/delivery-partners/:id/approve",
  async (req, res) => {
    try {
      const partner =
        await DeliveryPartner.findById(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery partner not found",
        });
      }

      partner.approvalStatus =
        "Approved";

      partner.rejectionReason =
        "";

      await partner.save();

      res.status(200).json({
        success: true,
        message:
          "Delivery partner approved successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =====================================
   REJECT DELIVERY PARTNER
===================================== */

router.put(
  "/delivery-partners/:id/reject",
  async (req, res) => {
    try {
      const { reason } =
        req.body;

      const partner =
        await DeliveryPartner.findById(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery partner not found",
        });
      }

      partner.approvalStatus =
        "Rejected";

      partner.rejectionReason =
        reason || "Not specified";

      await partner.save();

      res.status(200).json({
        success: true,
        message:
          "Delivery partner rejected successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =====================================
   DISABLE DELIVERY PARTNER
===================================== */

router.put(
  "/delivery-partners/:id/deactivate",
  async (req, res) => {
    try {
      const partner =
        await DeliveryPartner.findById(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery partner not found",
        });
      }

      partner.isActive = false;

      await partner.save();

      res.status(200).json({
        success: true,
        message:
          "Delivery partner deactivated",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

module.exports = router;
