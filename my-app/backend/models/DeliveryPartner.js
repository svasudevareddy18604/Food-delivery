const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
{
    /* =========================
       USER REFERENCE
    ========================= */

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    /* =========================
       PERSONAL DETAILS
    ========================= */

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    mobile: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        default: ""
    },

    dob: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        default: ""
    },

    profilePhoto: {
        type: String,
        default: ""
    },

    /* =========================
       ADDRESS
    ========================= */

    address: {
        houseNo: {
            type: String,
            default: ""
        },

        street: {
            type: String,
            default: ""
        },

        area: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        pincode: {
            type: String,
            default: ""
        }
    },

    /* =========================
       DOCUMENTS
    ========================= */

    aadhaarNumber: {
        type: String,
        default: ""
    },

    aadhaarFront: {
        type: String,
        default: ""
    },

    aadhaarBack: {
        type: String,
        default: ""
    },

    drivingLicenseNumber: {
        type: String,
        default: ""
    },

    drivingLicenseImage: {
        type: String,
        default: ""
    },

    /* =========================
       VEHICLE DETAILS
    ========================= */

    vehicleType: {
        type: String,
        default: ""
    },

    vehicleNumber: {
        type: String,
        default: ""
    },

    vehicleRC: {
        type: String,
        default: ""
    },

    /* =========================
       BANK DETAILS
    ========================= */

    bankHolderName: {
        type: String,
        default: ""
    },

    bankName: {
        type: String,
        default: ""
    },

    accountNumber: {
        type: String,
        default: ""
    },

    ifscCode: {
        type: String,
        default: ""
    },

    upiId: {
        type: String,
        default: ""
    },

    /* =========================
       EMERGENCY CONTACT
    ========================= */

    emergencyName: {
        type: String,
        default: ""
    },

    emergencyRelation: {
        type: String,
        default: ""
    },

    emergencyPhone: {
        type: String,
        default: ""
    },

    /* =========================
       WORK DETAILS
    ========================= */

    workType: {
        type: String,
        enum: [
            "Full Time",
            "Part Time"
        ],
        default: "Part Time"
    },

    preferredArea: {
        type: String,
        default: ""
    },

    workingHours: {
        type: String,
        default: ""
    },

    /* =========================
       LOCATION ACCESS
    ========================= */

    locationPermission: {
        type: Boolean,
        default: false
    },

    /* =========================
       REGISTRATION STATUS
    ========================= */

    registrationCompleted: {
        type: Boolean,
        default: false
    },

    /* =========================
       ADMIN APPROVAL
    ========================= */

    approvalStatus: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected"
        ],
        default: "Pending"
    },

    rejectionReason: {
        type: String,
        default: ""
    },

    /* =========================
       ACCOUNT STATUS
    ========================= */

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: {
        type: Date,
        default: null
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "DeliveryPartner",
    deliveryPartnerSchema
);
