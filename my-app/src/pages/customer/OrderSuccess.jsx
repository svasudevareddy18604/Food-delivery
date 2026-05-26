import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./OrderSuccess.css";

const API_URL = import.meta.env.VITE_API_URL;

const FOOD_EMOJI = ["🍕","🍔","🍜","🌮","🍣","🥗","🍛","🥘","🍱","🫕"];
const emoji = (name = "") => FOOD_EMOJI[name.charCodeAt(0) % FOOD_EMOJI.length];

const statusClass = (s = "") => {
  const v = s.toLowerCase();
  if (v.includes("paid") || v.includes("complete")) return "os__status--paid";
  if (v.includes("placed") || v.includes("confirm")) return "os__status--placed";
  if (v.includes("deliver")) return "os__status--delivered";
  return "os__status--pending";
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.order); else setError(d.message); })
      .catch(() => setError("Failed to load order."))
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 60); });
  }, [orderId]);

  if (loading) return (
    <div className="os os--in">
      <Header />
      <div className="os__state">
        <div className="os__spinner" />
        <p className="os__state-text">Loading your order…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="os os--in">
      <Header />
      <div className="os__state">
        <p className="os__state-text os__state-text--err">⚠ {error}</p>
      </div>
    </div>
  );

  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <div className={`os ${mounted ? "os--in" : ""}`}>
      <Header />

      {/* ── HERO ── */}
      <div className="os__hero">
        <div className="os__hero-inner">
          <div className="os__check-ring">✓</div>

          <div className="os__hero-text">
            <div className="os__badge">✦ Order confirmed</div>
            <h1 className="os__title">
              You're all set,{" "}
              <em>enjoy your meal!</em>
            </h1>
            <p className="os__sub">Your order is being prepared and will arrive soon.</p>
          </div>

          <div className="os__stats">
            {[
              { v: `₹${order.totalAmount.toLocaleString()}`, l: "Total Paid" },
              { v: order.items.reduce((s, i) => s + i.quantity, 0), l: "Items" },
              { v: "~30 min", l: "ETA" },
            ].map(({ v, l }) => (
              <div className="os__stat" key={l}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="os__wrap">

        {/* ── ORDER INFO CARD ── */}
        <div className="os__card" style={{ animationDelay: "0ms" }}>
          <div className="os__id-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Order #{order._id.slice(-8).toUpperCase()}
          </div>

          <div className="os__meta">
            <div className="os__meta-item">
              <span className="os__meta-label">Payment Method</span>
              <span className="os__meta-value">{order.paymentMethod}</span>
            </div>
            <div className="os__meta-item">
              <span className="os__meta-label">Payment Status</span>
              <span className={`os__status ${statusClass(order.paymentStatus)}`}>
                <span className="os__status-dot" />
                {order.paymentStatus}
              </span>
            </div>
            <div className="os__meta-item">
              <span className="os__meta-label">Order Status</span>
              <span className={`os__status ${statusClass(order.orderStatus)}`}>
                <span className="os__status-dot" />
                {order.orderStatus}
              </span>
            </div>
            <div className="os__meta-item">
              <span className="os__meta-label">Delivery Address</span>
              <span className="os__meta-value">{order.address}</span>
            </div>
          </div>
        </div>

        {/* ── ITEMS CARD ── */}
        <div className="os__card" style={{ animationDelay: "80ms" }}>
          <p className="os__section-label">Ordered Items</p>
          <div className="os__items">
            {order.items.map((item, i) => (
              <div className="os__item" key={i} style={{ animationDelay: `${120 + i * 50}ms` }}>
                <div className="os__item-emoji">{emoji(item.name)}</div>
                <div className="os__item-info">
                  <p className="os__item-name">{item.name}</p>
                  <p className="os__item-qty">Qty {item.quantity} × ₹{item.price}</p>
                </div>
                <span className="os__item-price">
                  ₹{(Number(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="os__divider" style={{ marginTop: 20 }} />

          <div className="os__total-row">
            <span className="os__total-label">Grand Total</span>
            <span className="os__total-amount">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="os__actions">
          <button className="os__btn-primary" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Back to Home
          </button>
          <button className="os__btn-secondary" onClick={() => navigate("/my-orders")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            My Orders
          </button>
        </div>

      </div>
    </div>
  );
}