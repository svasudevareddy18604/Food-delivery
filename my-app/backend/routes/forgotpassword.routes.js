const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");

const router = express.Router();

/* ====================================
   EMAIL CONFIG
==================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ====================================
   SEND OTP
==================================== */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
      role: "customer",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await PasswordReset.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt,
      },
      {
        upsert: true,
        new: true,
      }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Foodie Password Reset OTP",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Password Reset</h2>

          <p>Your OTP is:</p>

          <h1 style="
            color:#ff6600;
            letter-spacing:5px;
          ">
            ${otp}
          </h1>

          <p>
            OTP valid for 10 minutes.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/* ====================================
   VERIFY OTP
==================================== */

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record =
      await PasswordReset.findOne({
        email,
        otp,
      });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

/* ====================================
   RESET PASSWORD
==================================== */

router.post("/reset-password", async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    const record =
      await PasswordReset.findOne({
        email,
        otp,
      });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      }
    );

    await PasswordReset.deleteOne({
      email,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
});

module.exports = router;