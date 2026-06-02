const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const router = express.Router();

const User      = require("../models/User");
const createLog = require("../utils/createLog");

/* =========================
   SIGNUP ROUTE
========================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    /* =========================
       CHECK USER EXISTS
    ========================= */
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      await createLog({
        user:   email,
        role:   role || "Unknown",
        action: "Signup attempt with already registered email",
        status: "Warning",
      });

      return res.status(400).json({
        message: "User already exists",
      });
    }

    /* =========================
       HASH PASSWORD
    ========================= */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       CREATE USER
    ========================= */
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    /* =========================
       GENERATE JWT
    ========================= */
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* =========================
       LOG SUCCESSFUL SIGNUP
    ========================= */
    await createLog({
      user:   newUser.name,
      role:   newUser.role,
      action: "Registered a new account on the platform",
      status: "Success",
    });

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    res.status(201).json({
      message: "Signup Successful",
      token,
      user: {
        id:    newUser._id,
        name:  newUser.name,
        email: newUser.email,
        role:  newUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;