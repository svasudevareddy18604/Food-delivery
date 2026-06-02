const express = require("express");
const router = express.Router();

const DeliveryPartner = require("../models/DeliveryPartner");
const createLog = require("../utils/createLog");

/* =====================================
   GET DELIVERY PARTNER PROFILE STATUS
===================================== */

router.get("/profile/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;

    const partner = await DeliveryPartner.findOne({ mobile });

    /* ==========================
       NOT REGISTERED
    ========================== */

    if (!partner) {
      await createLog({
        user:   mobile,
        role:   "delivery",
        action: "Profile status checked — no registration found",
        status: "Warning",
      });

      return res.status(200).json({
        success:               true,
        exists:                false,
        registrationCompleted: false,
        approvalStatus:        null,
      });
    }

    /* ==========================
       REGISTERED
    ========================== */

    await createLog({
      user:   partner.fullName || mobile,
      role:   "delivery",
      action: `Profile status checked — registration: ${partner.registrationCompleted ? "complete" : "incomplete"}, approval: ${partner.approvalStatus || "pending"}`,
      status: "Success",
    });

    return res.status(200).json({
      success:               true,
      exists:                true,
      registrationCompleted: partner.registrationCompleted,
      approvalStatus:        partner.approvalStatus,
      fullName:              partner.fullName,
      mobile:                partner.mobile,
      profilePhoto:          partner.profilePhoto,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;