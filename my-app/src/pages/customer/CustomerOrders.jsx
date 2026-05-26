import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./CustomerOrders.css";

const API_URL = import.meta.env.VITE_API_URL;

const statusClass = (s = "") => {
  const v = s.toLowerCase().replace(/\s+/g, "_");
  return `co__status--${v}`;
};

const imgSrc = (img) =>
  img
    ? img.startsWith("http") ? img : `${API_URL}${img}`
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop";

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/orders/customer/${user._id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrders(d.orders); else setError(d.message); })
      .catch(() => setError("Failed to load orders."))
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 60); });
  }, []);

  if (loading) return (
    <div className="co co--in">
      <Header />
      <div className="co__state">
        <div className="co__spinner" />
        <p className="co__state-text">Loading your orders…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="co co--in">
      <Header />
      <div className="co__state">
        <p className="co__state-text co__state-text--err">⚠ {error}</p>
      </div>
    </div>
  );

  const totalSpend = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const totalItems = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);

  return (
    <div className={`co ${mounted ? "co--in" : ""}`}>
      <Header />

      {/* ── HERO ── */}
      <div className="co__hero">
        <div className="co__hero-inner">
          <div>
            <div className="co__badge">✦ Order history</div>
            <h1 className="co__title">
              My <em>Orders</em>
            </h1>
            <p className="co__sub">Track and manage all your food orders in one place.</p>
          </div>

          {orders.length > 0 && (
            <div className="co__stats">
              {[
                { v: orders.length,                    l: "Orders"      },
                { v: totalItems,                       l: "Items"       },
                { v: `₹${totalSpend.toLocaleString()}`, l: "Total Spent" },
              ].map(({ v, l }) => (
                <div className="co__stat" key={l}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="co__wrap">
        {orders.length === 0 ? (

          /* ── EMPTY ── */
          <div className="co__empty">
            <div className="co__empty-ring">🍽</div>
            <h2>No orders yet</h2>
            <p>Looks like you haven't ordered anything yet.<br />Let's fix that right now.</p>
            <button className="co__empty-cta" onClick={() => navigate("/")}>
              Browse Restaurants
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

        ) : (

          /* ── ORDER CARDS ── */
          <div className="co__grid">
            {orders.map((order, idx) => (
              <div
                className="co__card"
                key={order._id}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {/* HEAD */}
                <div className="co__card-head">
                  <span className="co__order-id">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`co__status ${statusClass(order.orderStatus)}`}>
                    <span className="co__status-dot" />
                    {order.orderStatus}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="co__items">
                  {order.items.map((item, i) => (
                    <div className="co__item" key={i}>
                      <div className="co__item-img">
                        <img src={imgSrc(item.image)} alt={item.name} loading="lazy" />
                      </div>
                      <div className="co__item-info">
                        <p className="co__item-name">{item.name}</p>
                        <p className="co__item-qty">Qty {item.quantity} × ₹{item.price}</p>
                      </div>
                      <span className="co__item-price">
                        ₹{(Number(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* DIVIDER */}
                <div className="co__divider" />

                {/* INFO ROW */}
                <div className="co__info">
                  <div className="co__info-item">
                    <span className="co__info-label">Payment Method</span>
                    <span className="co__info-value">{order.paymentMethod}</span>
                  </div>
                  <div className="co__info-item">
                    <span className="co__info-label">Payment Status</span>
                    <span className="co__info-value">{order.paymentStatus}</span>
                  </div>
                  <div className="co__info-item">
                    <span className="co__info-label">Delivery Address</span>
                    <span className="co__info-value">{order.address}</span>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="co__card-foot">
                  <div>
                    <p className="co__total-label">Grand Total</p>
                    <p className="co__total-amount">₹{Number(order.totalAmount).toLocaleString()}</p>
                  </div>
                  <button className="co__reorder" onClick={() => navigate("/")}>
                    Reorder
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

        )}
      </div>
    </div>
  );
}