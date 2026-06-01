import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/customer/Header";
import "./Home.css";


/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const STATS = [
  { value: "200+", label: "Restaurants" },
  { value: "50K+", label: "Happy diners" },
  { value: "4.9★", label: "Avg rating" },
  { value: "30min", label: "Avg delivery" },
];

const API_URL = import.meta.env.VITE_API_URL;

const CAT_EMOJI = {
  pizza: "🍕", sushi: "🍣", healthy: "🥗", salad: "🥗",
  noodles: "🍜", pasta: "🍝", bakery: "🥐", burgers: "🍔",
  burger: "🍔", indian: "🍛", desserts: "🧁", dessert: "🧁",
  chinese: "🥡", mexican: "🌮", thai: "🍲", bbq: "🍖",
  seafood: "🦞", vegan: "🌱", sandwich: "🥪", coffee: "☕",
  biryani: "🍛", south: "🥘", north: "🍲", street: "🌯",
  snacks: "🍟", juice: "🥤", sweets: "🍮", rolls: "🌯",
  both: "🍽", veg: "🥦",
  default: "🍽",
};

const getEmoji = (label = "") =>
  CAT_EMOJI[label.toLowerCase()] || CAT_EMOJI.default;

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isOpen(opening, closing, isOnline) {
  if (isOnline === false) return false;
  if (!opening || !closing) return null;
  const now = new Date();
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

function StarRating({ rating = 0 }) {
  const r = Math.round(rating);
  return (
    <span className="stars">
      {"★".repeat(r)}{"☆".repeat(5 - r)}
      <em>{Number(rating).toFixed(1)}</em>
    </span>
  );
}


/* ══════════════════════════════════════
   MAINTENANCE BANNER
══════════════════════════════════════ */
function MaintenanceBanner({ settings }) {
  const [visible, setVisible] = useState(true);
  const startFormatted = formatDateTime(settings.maintenanceStartDate);
  const endFormatted   = formatDateTime(settings.maintenanceEndDate);

  if (!visible) return null;

  return (
    <div className="maintenance-banner" role="alert" aria-live="polite">
      {/* Animated grid pattern overlay */}
      <div className="maintenance-banner__grid" aria-hidden="true" />

      {/* Dismiss */}
      <button
        className="maintenance-banner__dismiss"
        onClick={() => setVisible(false)}
        aria-label="Dismiss maintenance notice"
      >
        ✕
      </button>

      <div className="maintenance-banner__inner">
        {/* Icon + Status row */}
        <div className="maintenance-banner__header">
          <span className="maintenance-banner__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" /><circle cx="12" cy="16" r=".5" fill="currentColor" />
            </svg>
          </span>
          <span className="maintenance-banner__status-label">
            Scheduled Maintenance
          </span>
          <span className="maintenance-banner__status-dot" aria-hidden="true" />
        </div>

        {/* Main message */}
        <h2 className="maintenance-banner__title">
          We're improving your experience
        </h2>

        <p className="maintenance-banner__message">
          Our engineering team is performing planned server upgrades and infrastructure
          enhancements to make Foodie faster, more reliable, and better than ever. Some
          features may be temporarily unavailable during this window.
        </p>

        {/* Timeline block */}
        {(startFormatted || endFormatted) && (
          <div className="maintenance-banner__timeline">
            {startFormatted && (
              <div className="maintenance-banner__time-item">
                <span className="maintenance-banner__time-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Starts
                </span>
                <span className="maintenance-banner__time-value">{startFormatted}</span>
              </div>
            )}

            {startFormatted && endFormatted && (
              <div className="maintenance-banner__time-sep" aria-hidden="true" />
            )}

            {endFormatted && (
              <div className="maintenance-banner__time-item">
                <span className="maintenance-banner__time-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                    <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back online by
                </span>
                <span className="maintenance-banner__time-value maintenance-banner__time-value--green">{endFormatted}</span>
              </div>
            )}
          </div>
        )}

        {/* Reassurance row */}
        <div className="maintenance-banner__reassurance">
          <span className="maintenance-banner__pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Your data is safe
          </span>
          <span className="maintenance-banner__pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.56 2 2 0 0 1 3.58 1.39h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
            </svg>
            Contact support@foodie.in
          </span>
          <span className="maintenance-banner__pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Back soon
          </span>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   CART TOAST
══════════════════════════════════════ */
function CartToast({ item, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="cart-toast">
      <span>🛒</span>
      <span>
        <strong>{item.name}</strong> added to cart!
      </span>
    </div>
  );
}


/* ══════════════════════════════════════
   RESTAURANT CARD
══════════════════════════════════════ */
function RestaurantCard({ r, onBook }) {
  const navigate = useNavigate();
  const open     = isOpen(r.openingTime, r.closingTime, r.isOnline);
  const cuisine  = r.restaurantType || "";

  return (
    <div className="r-card" onClick={() => navigate(`/restaurant/${r._id}`)}>
      <div className="r-card__img">
        {r.restaurantImage ? (
          <img
            src={
              r.restaurantImage.startsWith("http")
                ? r.restaurantImage
                : `${API_URL}/${r.restaurantImage.replace(/^\//, "")}`
            }
            alt={r.restaurantName}
            loading="lazy"
          />
        ) : (
          <span className="r-card__img-placeholder">🍽</span>
        )}

        {open !== null && (
          <span className={`badge ${open ? "badge--open" : "badge--closed"}`}>
            <span className="badge-dot" />
            {open ? "Open Now" : "Closed"}
          </span>
        )}
      </div>

      <div className="r-card__body">
        <div className="r-card__top">
          <h3 className="r-card__name">{r.restaurantName}</h3>
          <StarRating rating={r.rating || 4.2} />
        </div>

        {cuisine && (
          <p className="r-card__cuisines">
            {getEmoji(cuisine)} {cuisine}
          </p>
        )}

        <div className="r-card__hours">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <span className="r-card__hours-label">Hours</span>
            <span className="r-card__hours-value">
              {formatTime(r.openingTime)} — {formatTime(r.closingTime)}
            </span>
          </div>
        </div>

        <p className="r-card__address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {r.restaurantAddress}
        </p>

        <div className="r-card__footer">
          <span className="r-card__delivery">Free delivery</span>

          {r.tableReservationEnabled && (
            <button
              className="btn-book"
              onClick={(e) => {
                e.stopPropagation();
                onBook(r);
              }}
            >
              Reserve Table
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   FOOD ITEM CARD
══════════════════════════════════════ */
function FoodItemCard({ item, onAddToCart, isClosed }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleCart = (e) => {
    e.stopPropagation();
    if (isClosed) return;
    setAdding(true);
    onAddToCart(item);
    setTimeout(() => setAdding(false), 600);
  };

  const imgSrc = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_URL}/${item.image.replace(/^\//, "")}`
    : null;

  return (
    <div
      className={`food-card${isClosed ? " food-card--closed" : ""}`}
      onClick={() => navigate(`/restaurant/${item.restaurantId}`)}
    >
      <div className="food-card__img">
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} loading="lazy" />
        ) : (
          <span className="food-card__placeholder">
            {getEmoji(item.category || "")}
          </span>
        )}
        {item.category && (
          <span className="food-card__cat-badge">{item.category}</span>
        )}
        {isClosed && (
          <span className="food-card__closed-tag">Closed</span>
        )}
      </div>

      <div className="food-card__body">
        <p className="food-card__name">{item.name}</p>
        {item.description && (
          <p className="food-card__desc">{item.description}</p>
        )}
        <p className="food-card__restaurant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M3 11l19-9-9 19-2-8-8-2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {item.restaurantName}
        </p>
        <div className="food-card__footer">
          <span className="food-card__price">
            {item.price ? `₹${item.price}` : "—"}
          </span>
          <button
            className={`btn-cart ${adding ? "btn-cart--added" : ""} ${isClosed ? "btn-cart--disabled" : ""}`}
            onClick={handleCart}
            disabled={isClosed}
          >
            {isClosed ? "Closed" : adding ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   MENU ITEM CARD (horizontal scroll)
══════════════════════════════════════ */
function MenuItemCard({ item, onAddToCart, isClosed }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleCart = (e) => {
    e.stopPropagation();
    if (isClosed) return;
    setAdding(true);
    onAddToCart(item);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      className={`menu-item-card${isClosed ? " menu-item-card--closed" : ""}`}
      onClick={() => navigate(`/restaurant/${item.restaurantId}`)}
    >
      <div className="menu-item-card__img">
        {item.image ? (
          <img
            src={
              item.image.startsWith("http")
                ? item.image
                : `${API_URL}/${item.image.replace(/^\//, "")}`
            }
            alt={item.name}
            loading="lazy"
          />
        ) : (
          <span className="menu-item-card__placeholder">
            {getEmoji(item.category || "")}
          </span>
        )}
      </div>
      <div className="menu-item-card__body">
        <p className="menu-item-card__name">{item.name}</p>
        <p className="menu-item-card__restaurant">{item.restaurantName}</p>
        <div className="menu-item-card__footer">
          {item.price && (
            <span className="menu-item-card__price">₹{item.price}</span>
          )}
          <button
            className={`btn-cart btn-cart--sm ${adding ? "btn-cart--added" : ""} ${isClosed ? "btn-cart--disabled" : ""}`}
            onClick={handleCart}
            disabled={isClosed}
          >
            {isClosed ? "🔒" : adding ? "✓" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   BOOKING MODAL
══════════════════════════════════════ */
function BookingModal({ restaurant, onClose }) {
  const [form, setForm]       = useState({ date: "", time: "", guests: 2, note: "" });
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.date || !form.time) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/reservations`,
        { restaurantId: restaurant._id, ...form },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="modal__done">
            <span>🎉</span>
            <h3>Table Reserved!</h3>
            <p>
              We'll confirm your booking at{" "}
              <strong>{restaurant.restaurantName}</strong> shortly.
            </p>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal__head">
              <h3>Reserve at {restaurant.restaurantName}</h3>
              <button className="modal__close" onClick={onClose}>✕</button>
            </div>

            <div className="modal__fields">
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => set("date", e.target.value)}
                />
              </label>

              <label>
                Time
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                />
              </label>

              <label>
                Guests
                <select value={form.guests} onChange={(e) => set("guests", +e.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>

              <label className="modal__fields--full">
                Special request
                <textarea
                  rows={2}
                  placeholder="Allergies, occasion…"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                />
              </label>
            </div>

            <button
              className="btn-primary"
              disabled={loading || !form.date || !form.time}
              onClick={submit}
            >
              {loading ? "Booking…" : "Confirm Reservation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   MAIN HOME PAGE
══════════════════════════════════════ */
export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [foodItems, setFoodItems]     = useState([]);
  const [menuItems, setMenuItems]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [foodLoading, setFoodLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [activeCategory, setActiveCat]= useState("");
  const [booking, setBooking]         = useState(null);
  const [mounted, setMounted]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [openMap, setOpenMap]         = useState({});

  /* ── Maintenance state ── */
  const [maintenanceSettings, setMaintenanceSettings] = useState(null);
  const [maintenanceActive, setMaintenanceActive]     = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  /* ── Fetch settings (maintenance) ── */
  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/settings`);
      const s = data.settings;
      if (!s) return;

      if (s.maintenanceMode) {
        /* If scheduled, check the window */
        if (s.maintenanceStartDate && s.maintenanceEndDate) {
          const now   = new Date();
          const start = new Date(s.maintenanceStartDate);
          const end   = new Date(s.maintenanceEndDate);
          if (now >= start && now <= end) {
            setMaintenanceActive(true);
            setMaintenanceSettings(s);
          }
        } else {
          /* No schedule — always active */
          setMaintenanceActive(true);
          setMaintenanceSettings(s);
        }
      }
    } catch (err) {
      /* Silently fail — don't crash homepage over a settings error */
      console.warn("Could not fetch settings:", err);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetchSettings();
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setToast(item);
  };

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/merchant/approved-restaurants`);
      const list = data.restaurants || [];
      setRestaurants(list);
      setFiltered(list);

      const merchantMap = {};
      list.forEach((r) => {
        merchantMap[r._id] = r.restaurantName;
        if (r.merchantId) merchantMap[r.merchantId] = r.restaurantName;
      });

      const oMap = {};
      const now  = new Date();
      const cur  = now.getHours() * 60 + now.getMinutes();
      list.forEach((r) => {
        if (r.isOnline === false) {
          oMap[r._id] = false;
          if (r.merchantId) oMap[r.merchantId] = false;
          return;
        }
        if (r.openingTime && r.closingTime) {
          const [oh, om] = r.openingTime.split(":").map(Number);
          const [ch, cm] = r.closingTime.split(":").map(Number);
          const open = cur >= oh * 60 + om && cur <= ch * 60 + cm;
          oMap[r._id] = open;
          if (r.merchantId) oMap[r.merchantId] = open;
        }
      });
      setOpenMap(oMap);

      try {
        setFoodLoading(true);
        const foodRes = await axios.get(`${API_URL}/api/merchant-food/all-foods`);
        const foods = (foodRes.data.foods || []).map((f) => ({
          ...f,
          restaurantName: merchantMap[f.merchantId] || "Unknown restaurant",
          restaurantId:   f.merchantId,
        }));
        setFoodItems(foods);
        setMenuItems([...foods].sort(() => Math.random() - 0.5).slice(0, 12));
      } catch (foodErr) {
        console.warn("Could not load food items:", foodErr);
        const items = [];
        list.forEach((r) => {
          const foods = r.foodItems || r.menuItems || r.menu || [];
          foods.slice(0, 3).forEach((item) => {
            items.push({
              ...item,
              restaurantId:   r._id,
              restaurantName: r.restaurantName,
            });
          });
        });
        setFoodItems(items);
        setMenuItems(items.sort(() => Math.random() - 0.5).slice(0, 12));
      } finally {
        setFoodLoading(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    ...new Set(
      restaurants
        .map((r) => r.restaurantType)
        .filter(Boolean)
        .map((t) => t.toString().trim())
    ),
  ].slice(0, 14);

  const handleSearch = (q) => {
    setSearch(q);
    applyFilter(q, activeCategory);
  };

  const handleCategory = (cat) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCat(next);
    applyFilter(search, next);
  };

  const applyFilter = (q, cat) => {
    let list = restaurants;
    if (q)
      list = list.filter(
        (r) =>
          r.restaurantName?.toLowerCase().includes(q.toLowerCase()) ||
          r.restaurantType?.toLowerCase().includes(q.toLowerCase()) ||
          r.restaurantAddress?.toLowerCase().includes(q.toLowerCase())
      );
    if (cat)
      list = list.filter((r) =>
        r.restaurantType?.toLowerCase().includes(cat.toLowerCase())
      );
    setFiltered(list);
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className={`home ${mounted ? "home--in" : ""}`}>
      <Header cartCount={cartCount} />

      {/* ── MAINTENANCE BANNER ── */}
      {maintenanceActive && maintenanceSettings && (
        <MaintenanceBanner settings={maintenanceSettings} />
      )}

      {/* ── HERO ── */}
      <section className="hero">
        <div className="floating-foods" aria-hidden="true">
          {["🍕", "🍣", "🍔", "🌮", "🥗", "🍜", "🧁", "🍛"].map((e, i) => (
            <span key={i} className="food-bubble" style={{ "--i": i }}>{e}</span>
          ))}
        </div>

        <div className="hero__content">
          <div className="hero__text">
            <div className="hero__badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              The #1 food &amp; dining platform
            </div>

            <h1>
              Great food,
              <br />
              <em>right at your door.</em>
            </h1>
            <p>Order delivery, dine-in, or book a table — all in one place.</p>

            <div className="hero__search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Search restaurants, cuisines…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <button className="hero__search-clear" onClick={() => handleSearch("")}>✕</button>
              )}
            </div>
          </div>

          <div className="hero__stats">
            {STATS.map((s) => (
              <div key={s.label} className="hero__stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="section">
          <h2 className="section__title">What are you craving?</h2>
          <div className="categories">
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-chip ${activeCategory === c ? "cat-chip--active" : ""}`}
                onClick={() => handleCategory(c)}
              >
                <span>{getEmoji(c)}</span>
                {c}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── RESTAURANTS ── */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">
            {activeCategory ? `${activeCategory} spots` : "Top Restaurants"}
          </h2>
          {!loading && filtered.length > 0 && (
            <span className="section__count">{filtered.length} found</span>
          )}
        </div>

        {loading ? (
          <div className="grid">
            {[...Array(6)].map((_, i) => <div key={i} className="r-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <span>🍽</span>
            <h3>No restaurants found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((r) => (
              <RestaurantCard key={r._id} r={r} onBook={setBooking} />
            ))}
          </div>
        )}
      </section>

      {/* ── POPULAR DISHES GRID ── */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Popular Dishes</h2>
            <p className="section__sub">Order directly from our top picks</p>
          </div>
          {!foodLoading && foodItems.length > 0 && (
            <span className="section__count">{foodItems.length} items</span>
          )}
        </div>

        {foodLoading ? (
          <div className="food-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="food-skeleton" />)}
          </div>
        ) : foodItems.length === 0 ? (
          <div className="empty">
            <span>🍽</span>
            <h3>No food items found</h3>
            <p>Check back later for delicious options.</p>
          </div>
        ) : (
          <div className="food-grid">
            {foodItems.map((item, i) => (
              <FoodItemCard
                key={item._id || i}
                item={item}
                onAddToCart={addToCart}
                isClosed={openMap[item.restaurantId] === false}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── RECOMMENDED (horizontal scroll) ── */}
      {menuItems.length > 0 && (
        <section className="section section--dark-bg">
          <div className="section__head">
            <div>
              <h2 className="section__title">Recommended for you</h2>
              <p className="section__sub">Hand-picked dishes from top restaurants</p>
            </div>
          </div>
          <div className="menu-scroll">
            {menuItems.map((item, i) => (
              <MenuItemCard
                key={i}
                item={item}
                onAddToCart={addToCart}
                isClosed={openMap[item.restaurantId] === false}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="address-strip">
        <div className="address-strip__inner">
          <span className="address-strip__logo">Foodie</span>
          <div className="address-strip__links">
            <a href="/about">About</a>
            <a href="/careers">Careers</a>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
          <p className="address-strip__addr">
            📍 Infotact Solutions &amp; Co., Bengaluru, Karnataka 560001 ·
            support@foodie.in
          </p>
        </div>
      </footer>

      {/* ── BOOKING MODAL ── */}
      {booking && (
        <BookingModal restaurant={booking} onClose={() => setBooking(null)} />
      )}

      {/* ── CART TOAST ── */}
      {toast && <CartToast item={toast} onClose={() => setToast(null)} />}
    </div>
  );
}