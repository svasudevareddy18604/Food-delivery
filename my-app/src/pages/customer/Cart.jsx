import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./Cart.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
    setTimeout(() => setMounted(true), 60);
  }, []);

  const save = (updated) => {
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const inc   = (id) => save(items.map(i => i._id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const dec   = (id) => save(items.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  const del   = (id) => save(items.filter(i => i._id !== id));
  const clear = ()   => save([]);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const delivery = items.length > 0 ? 40 : 0;
  const total    = subtotal + delivery;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  const imgSrc = (p) => p
    ? (p.startsWith("http") ? p : `${API_URL}${p}`)
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop";

  return (
    <div className={`cp ${mounted ? "cp--in" : ""}`}>
      <Header />

      {/* ── AMBIENT BG ── */}
      <div className="cp__bg" aria-hidden="true">
        <div className="cp__blob cp__blob--1" />
        <div className="cp__blob cp__blob--2" />
      </div>

      <div className="cp__wrap">

        {/* ── HEADER ROW ── */}
        <div className="cp__top">
          <div className="cp__top-left">
            <button className="cp__back" onClick={() => navigate(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div>
              <h1 className="cp__title">Your Cart</h1>
              <p className="cp__sub">{totalQty > 0 ? `${totalQty} item${totalQty > 1 ? "s" : ""} · ready to order` : "Nothing here yet"}</p>
            </div>
          </div>
          {items.length > 0 && (
            <button className="cp__clear" onClick={clear}>Clear all</button>
          )}
        </div>

        {items.length === 0 ? (

          /* ── EMPTY ── */
          <div className="cp__empty">
            <div className="cp__empty-ring">
              <span>🛒</span>
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.<br/>Let's fix that.</p>
            <button className="cp__empty-cta" onClick={() => navigate("/")}>
              Explore Restaurants
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

        ) : (

          <div className="cp__layout">

            {/* ── ITEMS ── */}
            <div className="cp__items">
              {items.map((item, idx) => (
                <div className="cp__item" key={item._id} style={{ animationDelay: `${idx * 60}ms` }}>

                  {/* Image */}
                  <div className="cp__item-img">
                    <img src={imgSrc(item.image)} alt={item.name} loading="lazy" />
                  </div>

                  {/* Info */}
                  <div className="cp__item-body">
                    <div className="cp__item-row">
                      <div>
                        <h3 className="cp__item-name">{item.name}</h3>
                        {item.restaurantName && <p className="cp__item-rest">📍 {item.restaurantName}</p>}
                        {item.category && <span className="cp__item-cat">{item.category}</span>}
                      </div>
                      <button className="cp__item-del" onClick={() => del(item._id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>

                    <div className="cp__item-foot">
                      <div className="cp__item-price">
                        <span className="cp__item-total">₹{(Number(item.price) * item.quantity).toLocaleString()}</span>
                        <span className="cp__item-unit">₹{item.price} each</span>
                      </div>
                      <div className="cp__stepper">
                        <button onClick={() => dec(item._id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => inc(item._id)}>+</button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}

              {/* Upsell nudge */}
              <div className="cp__nudge">
                🎉 You're getting <strong>free delivery</strong> on this order!
              </div>
            </div>

            {/* ── SUMMARY ── */}
            <div className="cp__summary">
              <div className="cp__summary-inner">
                <h2 className="cp__summary-title">Order Summary</h2>

                <div className="cp__summary-rows">
                  <div className="cp__row">
                    <span>Subtotal <em>({totalQty} items)</em></span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="cp__row">
                    <span>Delivery</span>
                    <span className="cp__row--free">FREE ✓</span>
                  </div>
                  <div className="cp__row cp__row--tax">
                    <span>Taxes & fees</span>
                    <span>₹{delivery}</span>
                  </div>
                </div>

                <div className="cp__divider" />

                <div className="cp__total">
                  <span>Grand Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <button className="cp__cta" onClick={() => navigate("/checkout")}>
                  <span>Proceed to Checkout</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <button className="cp__more" onClick={() => navigate("/")}>
                  + Add more items
                </button>

                {/* Trust badges */}
                <div className="cp__trust">
                  {["🔒 Secure checkout", "🚀 Fast delivery", "✅ Easy returns"].map(b => (
                    <span key={b}>{b}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}