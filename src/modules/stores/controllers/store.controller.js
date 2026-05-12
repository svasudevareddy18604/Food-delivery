import {
  getAllStores,
  getStoreById,
  createStore,
  updateStoreById,
  deleteStoreById
} from "../services/store.service.js";

/* ================= GET ALL ================= */
export const getStores = async (req, res) => {
  try {
    const stores = await getAllStores();

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });

  } catch (err) {
    console.error("🔥 GET STORES ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stores"
    });
  }
};

/* ================= GET ONE ================= */
export const getStore = async (req, res) => {
  try {
    const store = await getStoreById(req.params.id);

    return res.status(200).json({
      success: true,
      data: store
    });

  } catch (err) {
    console.error("🔥 GET STORE ERROR:", err);

    return res.status(404).json({
      success: false,
      message: err.message || "Store not found"
    });
  }
};

/* ================= ADD ================= */
export const addStore = async (req, res) => {
  try {
    const { name, location, address, pincode } = req.body;

    // 🔥 BASIC VALIDATION
    if (!name || !location || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const store = await createStore(req.body);

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store
    });

  } catch (err) {
    console.error("🔥 ADD STORE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create store"
    });
  }
};

/* ================= UPDATE ================= */
export const updateStore = async (req, res) => {
  try {
    const updated = await updateStoreById(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: updated
    });

  } catch (err) {
    console.error("🔥 UPDATE STORE ERROR:", err);

    return res.status(404).json({
      success: false,
      message: err.message || "Store not found"
    });
  }
};

/* ================= DELETE ================= */
export const deleteStore = async (req, res) => {
  try {
    const result = await deleteStoreById(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (err) {
    console.error("🔥 DELETE STORE ERROR:", err);

    return res.status(404).json({
      success: false,
      message: err.message || "Store not found"
    });
  }
};