const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const router  = express.Router();
const User    = require("../models/User");

/* =========================
   LOGIN ROUTE
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* 1. Find user */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    /* 2. Check password */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    /* 3. Blocked check — stops token generation entirely */
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    /* 4. Generate token */
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* 5. Send clean user object (never send raw password) */
    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        _id:                   user._id,
        name:                  user.name,
        email:                 user.email,
        role:                  user.role,
        isBlocked:             user.isBlocked,
        isApproved:            user.isApproved,
        isRejected:            user.isRejected,
        registrationCompleted: user.registrationCompleted,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;