import SupplyRequest
from "../models/supplyRequest.model.js";

import Product
from "../../products/models/product.model.js";

/* =====================================================
   GET ALL SUPPLY REQUESTS
===================================================== */

export const getRequests =
  async (req, res) => {

    try {

      const requests =
        await SupplyRequest.find()

          .populate({

            path: "store_id",

            select:
              "store_code name location"

          })

          .sort({
            createdAt: -1
          });

      return res.status(200).json({

        success: true,

        count: requests.length,

        requests

      });

    } catch (err) {

      console.error(
        "GET REQUESTS ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch supply requests"

      });

    }

  };

/* =====================================================
   CREATE SUPPLY REQUEST
===================================================== */

export const createRequest =
  async (req, res) => {

    try {

      const {

        product_id,

        product_name,

        sku,

        quantity,

        vendor_name,

        store_id,

        store_code,

        store_name,

        notes

      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (

        !product_id ||

        !product_name ||

        !sku ||

        !quantity ||

        !store_id ||

        !store_code ||

        !store_name

      ) {

        return res.status(400).json({

          success: false,

          message:
            "All required fields must be provided"

        });

      }

      /* =========================
         PRODUCT CHECK
      ========================= */

      const product =
        await Product.findById(
          product_id
        );

      if (!product) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found"

        });

      }

      /* =========================
         CREATE REQUEST
      ========================= */

      const request =
        await SupplyRequest.create({

          product_id,

          product_name,

          sku,

          quantity:
            Number(quantity),

          vendor_name:
            vendor_name ||
            "Main Vendor",

          store_id,

          store_code,

          store_name,

          notes:
            notes || "",

          requested_by:
            "Vendor",

          status:
            "Pending"

        });

      /* =========================
         RESPONSE
      ========================= */

      return res.status(201).json({

        success: true,

        message:
          "Supply request created successfully",

        request

      });

    } catch (err) {

      console.error(
        "CREATE REQUEST ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||
          "Failed to create request"

      });

    }

  };

/* =====================================================
   UPDATE REQUEST STATUS
===================================================== */

export const updateRequestStatus =
  async (req, res) => {

    try {

      const {

        status,

        admin_response,

        approved_quantity

      } = req.body;

      /* =========================
         FIND REQUEST
      ========================= */

      const request =
        await SupplyRequest.findById(
          req.params.id
        );

      if (!request) {

        return res.status(404).json({

          success: false,

          message:
            "Supply request not found"

        });

      }

      /* =========================
         UPDATE REQUEST
      ========================= */

      request.status =
        status || request.status;

      request.admin_response =
        admin_response || "";

      request.approved_quantity =
        approved_quantity ||
        request.quantity;

      await request.save();

      /* =========================
         IF DELIVERED
         UPDATE PRODUCT STOCK
      ========================= */

      if (
        status === "Delivered"
      ) {

        const product =
          await Product.findById(
            request.product_id
          );

        if (product) {

          product.stock +=
            Number(
              request.approved_quantity
            );

          /* =====================
             PRODUCT STATUS
          ===================== */

          if (
            product.stock <= 0
          ) {

            product.status =
              "Out of Stock";

          }

          else if (
            product.stock < 10
          ) {

            product.status =
              "Low Stock";

          }

          else {

            product.status =
              "Active";

          }

          await product.save();

        }

      }

      /* =========================
         RESPONSE
      ========================= */

      return res.status(200).json({

        success: true,

        message:
          "Supply request updated successfully",

        request

      });

    } catch (err) {

      console.error(
        "UPDATE REQUEST ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||
          "Failed to update request"

      });

    }

  };

/* =====================================================
   DELETE REQUEST
===================================================== */

export const deleteRequest =
  async (req, res) => {

    try {

      const request =
        await SupplyRequest.findByIdAndDelete(
          req.params.id
        );

      if (!request) {

        return res.status(404).json({

          success: false,

          message:
            "Request not found"

        });

      }

      return res.status(200).json({

        success: true,

        message:
          "Request deleted successfully"

      });

    } catch (err) {

      console.error(
        "DELETE REQUEST ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to delete request"

      });

    }

  };