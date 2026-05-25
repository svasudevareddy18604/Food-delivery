const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const Food    = require("../models/Food");

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

    res.status(200).json({ success: true, message: "Food Updated Successfully", food: updatedFood });
  } catch (error) {
    console.error("Update Food Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ── GET FOODS BY MERCHANT ── */
router.get("/foods/:merchantId", async (req, res) => {
  try {
    const { merchantId } = req.params;
    if (!merchantId) return res.status(400).json({ success: false, message: "Merchant ID Required" });
    const foods = await Food.find({ merchantId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, totalFoods: foods.length, foods });
  } catch (error) {
    console.error("Get Foods Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ── DELETE FOOD ── */
router.delete("/delete-food/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Food Deleted Successfully" });
  } catch (error) {
    console.error("Delete Food Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;