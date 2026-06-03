const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================
   CREATE FOLDERS IF MISSING
========================= */

const folders = [
  "uploads/delivery-partners/profile",
  "uploads/delivery-partners/aadhaar",
  "uploads/delivery-partners/license",
  "uploads/delivery-partners/vehicle",
];

folders.forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

/* =========================
   STORAGE
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profilePhoto") {
      cb(
        null,
        "uploads/delivery-partners/profile"
      );
    } 
    else if (
      file.fieldname === "aadhaarFront" ||
      file.fieldname === "aadhaarBack"
    ) {
      cb(
        null,
        "uploads/delivery-partners/aadhaar"
      );
    } 
    else if (
      file.fieldname === "drivingLicenseImage"
    ) {
      cb(
        null,
        "uploads/delivery-partners/license"
      );
    } 
    else if (
      file.fieldname === "vehicleRC"
    ) {
      cb(
        null,
        "uploads/delivery-partners/vehicle"
      );
    } 
    else {
      cb(
        new Error("Invalid upload field"),
        false
      );
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/* =========================
   FILE FILTER
========================= */

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes =
    /jpeg|jpg|png|webp|pdf/;

  const ext =
    allowedTypes.test(
      path.extname(
        file.originalname
      ).toLowerCase()
    );

  const mime =
    allowedTypes.test(
      file.mimetype
    );

  if (ext && mime) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Only JPG, PNG, WEBP and PDF files are allowed"
    )
  );
};

/* =========================
   UPLOAD CONFIG
========================= */

const deliveryUpload =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });

module.exports =
  deliveryUpload;
