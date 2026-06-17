const express = require("express");
const router = express.Router();

const DeliveryPartner =
  require("../models/DeliveryPartner");

const deliveryUpload =
  require("../middleware/deliveryUpload");

/* =====================================
   DELIVERY PARTNER REGISTRATION
===================================== */

router.post(

  "/register",

  deliveryUpload.fields([
    {
      name: "profilePhoto",
      maxCount: 1,
    },
    {
      name: "aadhaarFront",
      maxCount: 1,
    },
    {
      name: "aadhaarBack",
      maxCount: 1,
    },
    {
      name: "drivingLicenseImage",
      maxCount: 1,
    },
    {
      name: "vehicleRC",
      maxCount: 1,
    },
  ]),

  async (req, res) => {

    try {

      const {

        userId,

        fullName,
        mobile,
        email,
        dob,
        gender,

        houseNo,
        street,
        area,
        city,
        state,
        pincode,

        aadhaarNumber,
        drivingLicenseNumber,

        vehicleType,
        vehicleNumber,

        bankHolderName,
        bankName,
        accountNumber,
        ifscCode,
        upiId,

        emergencyName,
        emergencyRelation,
        emergencyPhone,

        workType,
        preferredArea,
        workingHours,

        locationPermission,

      } = req.body;

      /* ==========================
         VALIDATION
      ========================== */

      if (
        !userId ||
        !fullName ||
        !mobile
      ) {
        return res.status(400).json({
          success: false,
          message:
            "User ID, Full Name and Mobile Number are required",
        });
      }

      /* ==========================
         CHECK EXISTING PROFILE
      ========================== */

      const existingPartner =
        await DeliveryPartner.findOne({
          userId,
        });

      /* ==========================
         FILE PATHS
      ========================== */

      const profilePhoto =
        req.files?.profilePhoto?.[0]?.path || "";

      const aadhaarFront =
        req.files?.aadhaarFront?.[0]?.path || "";

      const aadhaarBack =
        req.files?.aadhaarBack?.[0]?.path || "";

      const drivingLicenseImage =
        req.files?.drivingLicenseImage?.[0]?.path || "";

      const vehicleRC =
        req.files?.vehicleRC?.[0]?.path || "";

      let partner;

      /* ==========================
         UPDATE EXISTING PROFILE
      ========================== */

      if (existingPartner) {

        partner = existingPartner;

        partner.userId = userId;

        partner.fullName =
          fullName;

        partner.mobile =
          mobile;

        partner.email =
          email;

        partner.dob =
          dob;

        partner.gender =
          gender;

        if (profilePhoto)
          partner.profilePhoto =
            profilePhoto;

        partner.address = {
          houseNo,
          street,
          area,
          city,
          state,
          pincode,
        };

        partner.aadhaarNumber =
          aadhaarNumber;

        if (aadhaarFront)
          partner.aadhaarFront =
            aadhaarFront;

        if (aadhaarBack)
          partner.aadhaarBack =
            aadhaarBack;

        partner.drivingLicenseNumber =
          drivingLicenseNumber;

        if (drivingLicenseImage)
          partner.drivingLicenseImage =
            drivingLicenseImage;

        partner.vehicleType =
          vehicleType;

        partner.vehicleNumber =
          vehicleNumber;

        if (vehicleRC)
          partner.vehicleRC =
            vehicleRC;

        partner.bankHolderName =
          bankHolderName;

        partner.bankName =
          bankName;

        partner.accountNumber =
          accountNumber;

        partner.ifscCode =
          ifscCode;

        partner.upiId =
          upiId;

        partner.emergencyName =
          emergencyName;

        partner.emergencyRelation =
          emergencyRelation;

        partner.emergencyPhone =
          emergencyPhone;

        partner.workType =
          workType;

        partner.preferredArea =
          preferredArea;

        partner.workingHours =
          workingHours;

        partner.locationPermission =
          locationPermission === "true";

        partner.registrationCompleted =
          true;

        partner.approvalStatus =
          "Pending";

        partner.rejectionReason =
          "";

        await partner.save();

      }

      /* ==========================
         CREATE NEW PROFILE
      ========================== */

      else {

        partner =
          await DeliveryPartner.create({

            userId,

            fullName,
            mobile,
            email,
            dob,
            gender,

            profilePhoto,

            address: {
              houseNo,
              street,
              area,
              city,
              state,
              pincode,
            },

            aadhaarNumber,
            aadhaarFront,
            aadhaarBack,

            drivingLicenseNumber,
            drivingLicenseImage,

            vehicleType,
            vehicleNumber,
            vehicleRC,

            bankHolderName,
            bankName,
            accountNumber,
            ifscCode,
            upiId,

            emergencyName,
            emergencyRelation,
            emergencyPhone,

            workType,
            preferredArea,
            workingHours,

            locationPermission:
              locationPermission ===
              "true",

            registrationCompleted:
              true,

            approvalStatus:
              "Pending",

            rejectionReason:
              "",

            isActive:
              true,

          });

      }

      /* ==========================
         SUCCESS
      ========================== */

      return res.status(201).json({

        success: true,

        message:
          "Registration submitted successfully. Waiting for admin approval.",

        registrationCompleted:
          true,

        approvalStatus:
          partner.approvalStatus,

      });

    }

    catch (error) {

      console.error(
        "DELIVERY REGISTRATION ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Registration failed",

      });

    }

  }

);

/* =====================================
   GET DELIVERY PARTNER BY USER ID
===================================== */
router.get("/by-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const partner = await DeliveryPartner.findOne({ userId }).select(
      "_id fullName profilePhoto vehicleType preferredArea isOnline approvalStatus"
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "No delivery partner account found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      _id: partner._id,
      fullName: partner.fullName,
      profilePhoto: partner.profilePhoto,
      vehicleType: partner.vehicleType,
      preferredArea: partner.preferredArea,
      isOnline: partner.isOnline,
      approvalStatus: partner.approvalStatus,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
