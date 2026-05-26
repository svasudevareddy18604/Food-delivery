import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./RestaurantDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

const DELIVERY_TIMES = { Starter: 15, Main: 30, Dessert: 20, Beverage: 10, Snack: 12, default: 25 };
const getDelivery = (cat) => DELIVERY_TIMES[cat] || DELIVERY_TIMES.default;
const IMG_FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";
const imgSrc = (p) => p ? (p.startsWith("http") ? p : `${API_URL}${p}`) : IMG_FALLBACK;

function isOpen(opening, closing) {
  if (!opening || !closing) return null;
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ── BOOKING MODAL ── */
function BookingModal({ restaurant, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "", guests: "2", note: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name || !form.date || !form.time) return alert("Fill required fields.");
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  };

  return (
    <div className="rd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rd-modal">
        {done ? (
          <div className="rd-modal__done">
            <div className="rd-done-icon">🎉</div>
            <h3>Table Booked!</h3>
            <p>Your table for <strong>{form.guests} guests</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong> is confirmed.</p>
            <button className="rd-btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="rd-modal__head">
              <div>
                <span className="rd-modal__tag">Reserve a Table</span>
                <h3>{restaurant}</h3>
              </div>
              <button className="rd-modal__close" onClick={onClose}>✕</button>
            </div>
            <div className="rd-modal__grid">
              <label>Full Name *<input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" /></label>
              <label>Email<input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@mail.com" /></label>
              <label>Phone<input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" /></label>
              <label>Guests *
                <select value={form.guests} onChange={e => set("guests", e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label>Date *<input type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => set("date", e.target.value)} /></label>
              <label>Time *
                <select value={form.time} onChange={e => set("time", e.target.value)}>
                  <option value="">Select time</option>
                  {["12:00","12:30","13:00","13:30","19:00","19:30","20:00","20:30","21:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="rd-modal__full">Special Requests
                <textarea rows={2} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Allergies, occasion, seating…" />
              </label>
            </div>
            <button className="rd-btn-primary" onClick={submit} disabled={loading}>
              {loading ? <span className="rd-spinner" /> : "Confirm Reservation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── FOOD CARD ── */
function FoodCard({ food, onAdd, isClosed, badge }) {
  const [adding, setAdding] = useState(false);
  const handle = () => {
    if (isClosed) return;
    setAdding(true);
    onAdd(food);
    setTimeout(() => setAdding(false), 700);
  };
  return (
    <div className={`rd-card ${badge ? "rd-card--featured" : ""} ${isClosed ? "rd-card--closed" : ""}`}>
      {badge && <div className="rd-card__badge">{badge}</div>}
      {isClosed && <div className="rd-card__closed-tag">Closed</div>}
      <div className="rd-card__img">
        <img src={imgSrc(food.image)} alt={food.name} loading="lazy" />
        {!isClosed && (
          <div className="rd-card__overlay">
            <button className="rd-card__quick" onClick={handle}>+ Quick Add</button>
          </div>
        )}
      </div>
      <div className="rd-card__body">
        <div className="rd-card__top">
          <h3>{food.name}</h3>
          <span className="rd-card__price">₹{food.price}</span>
        </div>
        <span className="rd-card__cat">{food.category}</span>
        <p className="rd-card__desc">{food.description}</p>
        <div className="rd-card__footer">
          <span className="rd-card__time">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {getDelivery(food.category)}–{getDelivery(food.category) + 5} min
          </span>
          <button
            className={`rd-card__btn ${adding ? "rd-card__btn--added" : ""}`}
            onClick={handle}
            disabled={isClosed}
          >
            {isClosed ? "Unavailable" : adding ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function RestaurantDetails() {
  const navigate = useNavigate();
  const { merchantId } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("All");
  const [search, setSearch]         = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [toast, setToast]           = useState(null);
  const [cart, setCart]             = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });
  const toastTimer = useRef(null);

  useEffect(() => { fetchAll(); }, [merchantId]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  }, [cart]);

  const fetchAll = async () => {
    try {
      const [restRes, foodRes] = await Promise.all([
        axios.get(`${API_URL}/api/merchant/approved-restaurants`),
        axios.get(`${API_URL}/api/merchant-food/foods/${merchantId}`),
      ]);
      const list = restRes.data.restaurants || [];
      const found = list.find(r => r._id === merchantId);
      setRestaurant(found || null);
      setFoods(foodRes.data.foods || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food) => {
    setCart(prev => {
      const ex = prev.find(i => i._id === food._id);
      if (ex) return prev.map(i => i._id === food._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...food, quantity: 1 }];
    });
    showToast(`"${food.name}" added!`);
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const open = restaurant ? isOpen(restaurant.openingTime, restaurant.closingTime) : null;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cats = ["All", ...new Set(foods.map(f => f.category).filter(Boolean))];
  const filtered = foods.filter(f =>
    (activeTab === "All" || f.category === activeTab) &&
    (f.name?.toLowerCase().includes(search.toLowerCase()) || (f.description || "").toLowerCase().includes(search.toLowerCase()))
  );
  const recommended = [...foods].sort(() => 0.5 - Math.random()).slice(0, 3);

  if (loading) return (
    <div className="rd-page">
      <div className="rd-skeleton-hero" />
      <div className="rd-skeleton-grid">
        {[1,2,3,4,5,6].map(i => <div key={i} className="rd-skeleton-card" />)}
      </div>
    </div>
  );

  return (
    <div className="rd-page">

      {/* ── HERO ── */}
      <div className="rd-hero">
        <div className="rd-hero__bg" />
        {restaurant?.restaurantImage && (
          <div className="rd-hero__cover">
            <img src={imgSrc(restaurant.restaurantImage)} alt={restaurant.restaurantName} />
          </div>
        )}
        <div className="rd-hero__content">
          <div className="rd-hero__left">
            <div className={`rd-hero__status ${open === false ? "rd-hero__status--closed" : ""}`}>
              <span className="rd-dot" />
              {open === null ? "Hours unknown" : open ? "Open Now" : "Closed"}
            </div>
            <h1>{restaurant?.restaurantName || "Restaurant"}</h1>
            <p className="rd-hero__cuisine">{restaurant?.restaurantType || "Multi-Cuisine"}</p>
            <div className="rd-hero__meta">
              <span>⭐ {restaurant?.rating || "4.5"}</span>
              <span className="rd-sep">·</span>
              <span>🕐 {formatTime(restaurant?.openingTime)} – {formatTime(restaurant?.closingTime)}</span>
              <span className="rd-sep">·</span>
              <span>📍 {restaurant?.restaurantAddress}</span>
            </div>
          </div>

          <div className="rd-hero__actions">
            <button className="rd-btn-cart" onClick={() => navigate("/cart")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className="rd-cart-count">{cartCount}</span>}
              Cart
            </button>
            <button className="rd-btn-book" onClick={() => setShowBooking(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Reserve Table
            </button>
            <button className="rd-btn-ghost" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </div>
      </div>

      <div className="rd-main">

        {/* ── CHEF'S PICKS ── */}
        {recommended.length > 0 && (
          <section className="rd-section">
            <div className="rd-section__head">
              <h2>⚡ Chef's Picks</h2>
              <span>{recommended.length} items</span>
            </div>
            <div className="rd-picks">
              {recommended.map(f => (
                <div className="rd-pick" key={f._id + "_rec"}>
                  <div className="rd-pick__img">
                    <img src={imgSrc(f.image)} alt={f.name} loading="lazy" />
                    <div className="rd-pick__overlay">
                      {!open ? (
                        <span className="rd-pick__closed">Closed</span>
                      ) : (
                        <button onClick={() => addToCart(f)}>+ Add to Cart</button>
                      )}
                    </div>
                    <div className="rd-pick__info">
                      <span className="rd-pick__name">{f.name}</span>
                      <span className="rd-pick__price">₹{f.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FULL MENU ── */}
        <section className="rd-section">
          <div className="rd-section__head">
            <h2>🍽 Full Menu</h2>
            <span>{filtered.length} items</span>
          </div>

          <div className="rd-controls">
            <div className="rd-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…" />
              {search && <button onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="rd-tabs">
              {cats.map(c => (
                <button key={c} className={`rd-tab ${activeTab === c ? "rd-tab--active" : ""}`} onClick={() => setActiveTab(c)}>{c}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rd-empty"><span>🍽</span><h3>No dishes found</h3><p>Try a different filter.</p></div>
          ) : (
            <div className="rd-grid">
              {filtered.map((f, i) => (
                <FoodCard
                  key={f._id}
                  food={f}
                  onAdd={addToCart}
                  isClosed={open === false}
                  badge={i === 0 && activeTab === "All" ? "🔥 Bestseller" : null}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {showBooking && <BookingModal restaurant={restaurant?.restaurantName} onClose={() => setShowBooking(false)} />}
      {toast && <div className="rd-toast">{toast}</div>}
    </div>
  );
}