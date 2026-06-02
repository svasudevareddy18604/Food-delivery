const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const Food    = require("../models/Food");
const createLog = require("../utils/createLog");

/* ── MULTER ── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ── ADD FOOD ── */
router.post("/add-food", upload.single("image"), async (req, res) => {
  try {
    const { merchantId, name, category, description, price, stock, available } = req.body;
    const newFood = new Food({
      merchantId, name, category, description, price, stock,
      available,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });
    await newFood.save();

    await createLog({
      user:   merchantId,
      role:   "Merchant",
      action: `Added new food item: ${name}`,
      status: "Success",
    });

    res.status(201).json({ success: true, message: "Food Added Successfully", food: newFood });
  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ── UPDATE FOOD ── */
router.put("/update-food/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, category, description, price, stock, available } = req.body;

    const updates = { name, category, description, price, stock, available };

    // only replace image if a new file was uploaded
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedFood) return res.status(404).json({ success: false, message: "Food not found" });

    await createLog({
      user:   updatedFood.merchantId,
      role:   "Merchant",
      action: `Updated food item: ${updatedFood.name}`,
      status: "Success",
    });

    res.status(200).json({ success: true, message: "Food Updated Successfully", food: updatedFood });
  } catch (error) {
    console.error("Update Food Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ── GET ALL AVAILABLE FOODS (for Home page) ── */
router.get("/all-foods", async (req, res) => {
  try {
    const foods = await Food.find({ available: true }).sort({ createdAt: -1 });

    await createLog({
      user:   "System",
      role:   "System",
      action: "Fetched all available foods",
      status: "Success",
    });

    res.status(200).json({ success: true, totalFoods: foods.length, foods });
  } catch (error) {
    console.error("Get All Foods Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ── GET FOODS BY MERCHANT ── */
router.get("/foods/:merchantId", async (req, res) => {
  try {
    const { merchantId } = req.params;
    if (!merchantId) return res.status(400).json({ success: false, message: "Merchant ID Required" });

    const foods = await Food.find({ merchantId }).sort({ createdAt: -1 });

    await createLog({
      user:   merchantId,
      role:   "Merchant",
      action: "Fetched own food listings",
      status: "Success",
    });

    res.status(200).json({ success: true, totalFoods: foods.length, foods });
  } catch (error) {
    console.error("Get Foods Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ── DELETE FOOD ── */
router.delete("/delete-food/:id", async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);

    await createLog({
      user:   deletedFood?.merchantId || "Unknown",
      role:   "Merchant",
      action: `Deleted food item: ${deletedFood?.name || req.params.id}`,
      status: "Success",
    });

    res.status(200).json({ success: true, message: "Food Deleted Successfully" });
  } catch (error) {
    console.error("Delete Food Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;