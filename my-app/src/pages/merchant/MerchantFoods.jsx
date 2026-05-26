import { useEffect, useState } from "react";
import axios from "axios";
import "./MerchantFoods.css";

const EMPTY_FORM = { name: "", category: "", price: "", stock: "", description: "", available: true, image: null };

const API_URL = import.meta.env.VITE_API_URL;

export default function MerchantFoods() {
  const [foods, setFoods]       = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editFood, setEditFood] = useState(null);
  const [foodData, setFoodData] = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchFoods(); }, []);

  const fetchFoods = async () => {
    try {
      const id = localStorage.getItem("merchantId");
      const { data } = await axios.get(`${API_URL}/api/merchant-food/foods/${id}`);
      setFoods(data.foods || []);
    } catch (e) { console.error(e); }
  };

  const set = (k, v) => setFoodData(p => ({ ...p, [k]: v }));
  const handleChange = e => set(e.target.name, e.target.value);

  const openAdd = () => {
    setEditFood(null);
    setFoodData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (f) => {
    setEditFood(f);
    setFoodData({
      name:        f.name,
      category:    f.category,
      price:       f.price,
      stock:       f.stock,
      description: f.description || "",
      available:   f.available,
      image:       null,
    });
    setShowForm(true);
  };

  const closeModal = () => { setShowForm(false); setEditFood(null); setFoodData(EMPTY_FORM); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const merchantId = localStorage.getItem("merchantId");
      const fd = new FormData();
      fd.append("merchantId",  merchantId);
      fd.append("name",        foodData.name);
      fd.append("category",    foodData.category);
      fd.append("price",       foodData.price);
      fd.append("stock",       foodData.stock);
      fd.append("description", foodData.description);
      fd.append("available",   foodData.available);
      if (foodData.image) fd.append("image", foodData.image);

      if (editFood) {
        await axios.put(
          `${API_URL}/api/merchant-food/update-food/${editFood._id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post(
          `${API_URL}/api/merchant-food/add-food`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      await fetchFoods();
      closeModal();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteFood = async id => {
    if (!window.confirm("Delete this food item?")) return;
    try {
      await axios.delete(`${API_URL}/api/merchant-food/delete-food/${id}`);
      fetchFoods();
    } catch (e) { console.error(e); }
  };

  const previewSrc = foodData.image
    ? URL.createObjectURL(foodData.image)
    : editFood?.image
      ? `${API_URL}${editFood.image}`
      : null;

  return (
    <div className="mf">
      {/* HEADER */}
      <div className="mf__header">
        <div>
          <h1>Food Management</h1>
          <p>Manage all your restaurant items</p>
        </div>
        <button className="mf__add-btn" onClick={openAdd}>
          <span>+</span> Add Food
        </button>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="mf__overlay" onClick={closeModal}>
          <div className="mf__modal" onClick={e => e.stopPropagation()}>
            <div className="mf__modal-head">
              <h2>{editFood ? "Edit Food Item" : "Add Food Item"}</h2>
              <button className="mf__close" onClick={closeModal}>✕</button>
            </div>
            <form className="mf__form" onSubmit={handleSubmit}>
              <div className="mf__form-row">
                <label>Food Name *
                  <input name="name" placeholder="e.g. Butter Chicken" value={foodData.name} onChange={handleChange} required />
                </label>
                <label>Category *
                  <input name="category" placeholder="e.g. Main Course" value={foodData.category} onChange={handleChange} required />
                </label>
              </div>
              <div className="mf__form-row">
                <label>Price (₹) *
                  <input type="number" name="price" placeholder="0" value={foodData.price} onChange={handleChange} required />
                </label>
                <label>Stock Qty *
                  <input type="number" name="stock" placeholder="0" value={foodData.stock} onChange={handleChange} required />
                </label>
              </div>
              <label>Description
                <textarea name="description" placeholder="Describe the dish…" rows={3} value={foodData.description} onChange={handleChange} />
              </label>
              <label>{editFood ? "Replace Image (optional)" : "Food Image *"}
                <input type="file" accept="image/*" onChange={e => set("image", e.target.files[0])} required={!editFood} />
              </label>
              {previewSrc && <img src={previewSrc} alt="Preview" className="mf__preview" />}
              <div className="mf__avail">
                <input type="checkbox" id="avail" checked={foodData.available}
                  onChange={() => set("available", !foodData.available)} />
                <label htmlFor="avail">Mark as Available</label>
              </div>
              <button type="submit" className="mf__submit" disabled={loading}>
                {loading ? <span className="mf__spinner" /> : editFood ? "Update Food Item" : "Save Food Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="mf__table-wrap">
        <table className="mf__table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.length === 0 ? (
              <tr><td colSpan="7" className="mf__empty">
                <span>🍽</span>
                <p>No food items yet. Add your first dish!</p>
              </td></tr>
            ) : foods.map(f => (
              <tr key={f._id}>
                <td><img src={`${API_URL}${f.image}`} alt={f.name} className="mf__thumb" /></td>
                <td className="mf__name">{f.name}</td>
                <td><span className="mf__cat">{f.category}</span></td>
                <td className="mf__price">₹{f.price}</td>
                <td>{f.stock}</td>
                <td>
                  <span className={`mf__status ${f.available ? "mf__status--on" : "mf__status--off"}`}>
                    {f.available ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="mf__actions">
                  <button className="mf__btn mf__btn--edit" onClick={() => openEdit(f)}>Edit</button>
                  <button className="mf__btn mf__btn--del"  onClick={() => deleteFood(f._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}