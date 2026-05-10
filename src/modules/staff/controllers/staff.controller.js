import bcrypt from "bcryptjs";

import Staff from "../model/staff.model.js";

import getStaffData
from "../services/staff.service.js";

import sendStaffCredentials
from "../services/sendStaffCredentials.js";

/* ================= PASSWORD GENERATOR ================= */

const generatePassword = () => {

  return Math.random()
    .toString(36)
    .slice(-8);
};

/* ================= GET STAFF ================= */

const getStaff = async (
  req,
  res,
  next
) => {

  try {

    const { store_id } =
      req.query;

    const data =
      await getStaffData(
        store_id
      );

    return res.status(200).json({

      success: true,

      ...data

    });

  } catch (err) {

    console.error(
      "GET STAFF ERROR:",
      err
    );

    next(err);

  }

};

/* ================= CREATE STAFF ================= */

const createStaff = async (
  req,
  res,
  next
) => {

  try {

    console.log("\n");
    console.log("=================================");
    console.log("🚀 CREATE STAFF STARTED");
    console.log("=================================");

    let {

      name,

      email,

      username,

      role,

      status,

      shift,

      store_id

    } = req.body;

    console.log("📦 REQUEST BODY:");
    console.log(req.body);

    /* ================= VALIDATION ================= */

    if (

      !name ||

      !email ||

      !username ||

      !store_id

    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, Email, Username and Store required"

      });

    }

    /* ================= CLEAN DATA ================= */

    email =
      email
        .toLowerCase()
        .trim();

    username =
      username
        .toLowerCase()
        .trim();

    /* ================= CHECK EMAIL ================= */

    const existingEmail =
      await Staff.findOne({

        email

      });

    if (existingEmail) {

      return res.status(400).json({

        success: false,

        message:
          "Email already exists"

      });

    }

    /* ================= CHECK USERNAME ================= */

    const existingUsername =
      await Staff.findOne({

        username

      });

    if (existingUsername) {

      return res.status(400).json({

        success: false,

        message:
          "Username already exists"

      });

    }

    /* ================= PASSWORD ================= */

    const rawPassword =
      generatePassword();

    console.log(
      "🔑 GENERATED PASSWORD:",
      rawPassword
    );

    const hashedPassword =
      await bcrypt.hash(

        rawPassword,

        10

      );

    /* ================= CREATE STAFF ================= */

    console.log(
      "💾 CREATING STAFF..."
    );

    const staff =
      await Staff.create({

        name,

        email,

        username,

        password:
          hashedPassword,

        role:
          role || "Cashier",

        status:
          status || "Active",

        shift:
          shift || "Morning",

        store_id,

        orders: 0,

        sales: 0,

        avgOrder: 0,

        mustChangePassword: true

      });

    console.log(
      "✅ STAFF CREATED SUCCESSFULLY"
    );

    console.log(staff);

    /* ================= SEND EMAIL ================= */

    console.log("\n");
    console.log("=================================");
    console.log("📧 SENDING STAFF EMAIL");
    console.log("=================================");

    const emailResponse =
      await sendStaffCredentials({

        name,

        email,

        username,

        password:
          rawPassword,

        role:
          staff.role

      });

    console.log(
      "📧 EMAIL RESPONSE:"
    );

    console.log(emailResponse);

    console.log(
      "✅ EMAIL FUNCTION COMPLETED"
    );

    /* ================= RESPONSE ================= */

    return res.status(201).json({

      success: true,

      message:
        "Staff created successfully",

      staff

    });

  } catch (err) {

    console.log("\n");
    console.log("=================================");
    console.log("❌ CREATE STAFF ERROR");
    console.log("=================================");

    console.error(err);

    next(err);

  }

};

/* ================= UPDATE STAFF ================= */

const updateStaff = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const updated =
      await Staff.findByIdAndUpdate(

        id,

        req.body,

        {

          new: true,

          runValidators: true

        }

      );

    if (!updated) {

      return res.status(404).json({

        success: false,

        message:
          "Staff not found"

      });

    }

    return res.status(200).json({

      success: true,

      message:
        "Staff updated successfully",

      staff: updated

    });

  } catch (err) {

    console.error(
      "UPDATE STAFF ERROR:",
      err
    );

    next(err);

  }

};

/* ================= DELETE STAFF ================= */

const deleteStaff = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const deleted =
      await Staff.findByIdAndDelete(
        id
      );

    if (!deleted) {

      return res.status(404).json({

        success: false,

        message:
          "Staff not found"

      });

    }

    return res.status(200).json({

      success: true,

      message:
        "Staff deleted permanently"

    });

  } catch (err) {

    console.error(
      "DELETE STAFF ERROR:",
      err
    );

    next(err);

  }

};

export default {

  getStaff,

  createStaff,

  updateStaff,

  deleteStaff

};