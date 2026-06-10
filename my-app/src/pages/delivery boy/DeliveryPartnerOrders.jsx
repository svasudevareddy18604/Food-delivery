import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/delivery partners/Layout";
import "./DeliveryPartnerOrders.css";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CONFIG = {
  PLACED:           { label: "New",        color: "var(--s-amber)",  bg: "var(--s-amber-bg)",  dot: "#f59e0b" },
  PREPARING:        { label: "Preparing",  color: "var(--s-blue)",   bg: "var(--s-blue-bg)",   dot: "#3b82f6" },
  OUT_FOR_DELIVERY: { label: "Picked Up",  color: "var(--s-purple)", bg: "var(--s-purple-bg)", dot: "#a855f7" },
  DELIVERED:        { label: "Delivered",  color: "var(--s-green)",  bg: "var(--s-green-bg)",  dot: "#22c55e" },
  CANCELLED:        { label: "Cancelled",  color: "var(--s-red)",    bg: "var(--s-red-bg)",    dot: "#ef4444" },
};

const NEXT_STATUS = {
  PLACED:           "PREPARING",
  PREPARING:        "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const NEXT_LABEL = {
  PLACED:           "Accept Order",
  PREPARING:        "Mark Picked Up",
  OUT_FOR_DELIVERY: "Mark Delivered",
};

const TABS = [
  { key: "all",              label: "All Orders"  },
  { key: "PLACED",           label: "New"         },
  { key: "PREPARING",        label: "Preparing"   },
  { key: "OUT_FOR_DELIVERY", label: "In Transit"  },
  { key: "DELIVERED",        label: "Delivered"   },
  { key: "CANCELLED",        label: "Cancelled"   },
];

/* ─── Icons ─────────────────────────────────────────────────── */
const Icon = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pin:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  phone:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.4 2 2 0 0 1 3.9 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  bag:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  clock:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  close:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  truck:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  refresh:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  empty:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
};

/* ─── Helpers ────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getToken() {
  return (
    localStorage.getItem("deliveryToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    null
  );
}

function getPartnerId() {
  const keys = ["deliveryPartner", "partner", "user"];
  for (const key of keys) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      const id = parsed?._id || parsed?.id;
      if (id) return id;
    } catch { /* skip */ }
  }
  return null;
}

/* ─── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order, onSelect, onStatusChange, updating }) {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;
  const orderId = order.orderNumber || order._id?.slice(-8).toUpperCase();

  return (
    <div
      className={`oc oc--${order.orderStatus?.toLowerCase()}`}
      onClick={() => onSelect(order)}
    >
      {/* Header */}
      <div className="oc__head">
        <div className="oc__id-wrap">
          <span className="oc__id">#{orderId}</span>
          <span className="oc__time">{timeAgo(order.createdAt)}</span>
        </div>
        <span className="oc__badge" style={{ color: cfg.color, background: cfg.bg }}>
          <span className="oc__badge-dot" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {/* Restaurant */}
      <div className="oc__restaurant">
        <span className="oc__rest-icon">{Icon.bag}</span>
        <div>
          <p className="oc__rest-name">Restaurant</p>
          <p className="oc__rest-addr">Merchant #{order.merchantId?.toString().slice(-6)}</p>
        </div>
      </div>

      <div className="oc__divider" />

      {/* Customer */}
      <div className="oc__customer">
        <span className="oc__cust-icon">{Icon.pin}</span>
        <div>
          <p className="oc__cust-name">{order.customerName || "Customer"}</p>
          <p className="oc__cust-addr">{order.address || "—"}</p>
        </div>
      </div>

      {/* Meta chips */}
      <div className="oc__meta">
        <span className="oc__chip">
          {Icon.truck}
          {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
        </span>
        <span className="oc__chip">
          {Icon.clock}
          {timeAgo(order.createdAt)}
        </span>
        <span className={`oc__chip oc__chip--pay ${order.paymentMethod === "COD" ? "oc__chip--cash" : ""}`}>
          ₹{order.totalAmount} · {order.paymentMethod === "COD" ? "Cash" : "Online"}
        </span>
      </div>

      {/* CTA */}
      {NEXT_STATUS[order.orderStatus] && (
        <button
          className={`oc__cta ${updating === order._id ? "oc__cta--loading" : ""}`}
          disabled={updating === order._id}
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(order._id, NEXT_STATUS[order.orderStatus]);
          }}
        >
          {updating === order._id ? "Updating…" : NEXT_LABEL[order.orderStatus]}
        </button>
      )}
    </div>
  );
}

/* ─── Order Drawer ───────────────────────────────────────────── */
function OrderDrawer({ order, onClose, onStatusChange, updating }) {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;
  const STEPS = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
  const orderId = order.orderNumber || order._id?.slice(-8).toUpperCase();

  return (
    <div className="od-overlay" onClick={onClose}>
      <div className="od" onClick={(e) => e.stopPropagation()}>
        <div className="od__handle" />

        {/* Header */}
        <div className="od__header">
          <div>
            <h2 className="od__title">#{orderId}</h2>
            <span className="od__badge" style={{ color: cfg.color, background: cfg.bg }}>
              <span className="od__badge-dot" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
          </div>
          <button className="od__close" onClick={onClose}>{Icon.close}</button>
        </div>

        <div className="od__body">

          {/* Timeline */}
          <div className="od__section">
            <h3 className="od__section-title">Order Timeline</h3>
            <div className="od__timeline">
              {STEPS.map((s, i) => {
                const currentIdx = STEPS.indexOf(order.orderStatus);
                const stepIdx    = STEPS.indexOf(s);
                const done   = order.orderStatus !== "CANCELLED" && stepIdx <= currentIdx;
                const active = s === order.orderStatus;
                return (
                  <div
                    key={s}
                    className={`od__tl-step ${done ? "od__tl-step--done" : ""} ${active ? "od__tl-step--active" : ""}`}
                  >
                    <div className="od__tl-dot" />
                    {i < STEPS.length - 1 && <div className="od__tl-line" />}
                    <span className="od__tl-label">{STATUS_CONFIG[s].label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pickup */}
          <div className="od__section">
            <h3 className="od__section-title">Pickup From</h3>
            <div className="od__location-card od__location-card--pickup">
              <span className="od__loc-icon">{Icon.bag}</span>
              <div>
                <p className="od__loc-name">Restaurant</p>
                <p className="od__loc-addr">Merchant #{order.merchantId?.toString().slice(-6)}</p>
              </div>
            </div>
          </div>

          {/* Deliver To */}
          <div className="od__section">
            <h3 className="od__section-title">Deliver To</h3>
            <div className="od__location-card od__location-card--delivery">
              <span className="od__loc-icon">{Icon.pin}</span>
              <div>
                <p className="od__loc-name">{order.customerName || "Customer"}</p>
                <p className="od__loc-addr">{order.address || "—"}</p>
              </div>
              {order.customerPhone && order.customerPhone !== "No contact" && (
                <a
                  className="od__call-btn"
                  href={`tel:${order.customerPhone}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Icon.phone}
                </a>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="od__section">
            <h3 className="od__section-title">Order Items</h3>
            <div className="od__items">
              {order.items?.map((item, i) => (
                <div key={i} className="od__item-row">
                  <span className="od__item-qty">{item.quantity}×</span>
                  <span className="od__item-name">{item.name}</span>
                  <span className="od__item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="od__total-row">
                <span>Total</span>
                <span className="od__total-amt">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="od__section">
            <h3 className="od__section-title">Payment</h3>
            <div className={`od__pay-card ${order.paymentMethod === "COD" ? "od__pay-card--cash" : "od__pay-card--online"}`}>
              <span className="od__pay-method">
                {order.paymentMethod === "COD" ? "💵 Cash on Delivery" : "💳 Paid Online"}
              </span>
              <span className="od__pay-amount">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="od__meta-row">
            <div className="od__meta-item">
              <span className="od__meta-label">Order No.</span>
              <span className="od__meta-value">{order.orderNumber || "—"}</span>
            </div>
            <div className="od__meta-item">
              <span className="od__meta-label">Placed</span>
              <span className="od__meta-value">{timeAgo(order.createdAt)}</span>
            </div>
            <div className="od__meta-item">
              <span className="od__meta-label">Items</span>
              <span className="od__meta-value">{order.items?.length || 0}</span>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        {NEXT_STATUS[order.orderStatus] && (
          <div className="od__footer">
            <button
              className={`od__cta ${updating === order._id ? "od__cta--loading" : ""}`}
              disabled={updating === order._id}
              onClick={() => {
                onStatusChange(order._id, NEXT_STATUS[order.orderStatus]);
                onClose();
              }}
            >
              {updating === order._id ? "Updating…" : NEXT_LABEL[order.orderStatus]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function DeliveryPartnerOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [activeTab,     setActiveTab]     = useState("all");
  const [search,        setSearch]        = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating,      setUpdating]      = useState(null);
  const [lastRefresh,   setLastRefresh]   = useState(null);

  /* ── Fetch ── */
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const partnerId = getPartnerId();
      const token     = getToken();

      if (!partnerId) {
        setError("Session not found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/orders/delivery/${partnerId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setLastRefresh(new Date());
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Poll every 30s ── */
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  /* ── Status update ── */
  const handleStatusChange = useCallback(async (orderId, nextStatus) => {
    setUpdating(orderId);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => o._id === orderId ? { ...o, orderStatus: nextStatus } : o)
        );
        setSelectedOrder((prev) =>
          prev?._id === orderId ? { ...prev, orderStatus: nextStatus } : prev
        );
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      alert(`Failed to update order: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  }, []);

  /* ── Filter ── */
  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.orderStatus === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o._id?.toLowerCase().includes(q) ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.address?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {};
  orders.forEach((o) => {
    counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
  });

  /* ── Render ── */
  return (
    <Layout>
      <div className="dpo">

        {/* Page Header */}
        <div className="dpo__header">
          <div className="dpo__header-left">
            <h1 className="dpo__title">Orders</h1>
            <span className="dpo__subtitle">
              {loading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          <button
            className={`dpo__refresh-btn ${loading ? "dpo__refresh-btn--spinning" : ""}`}
            onClick={() => fetchOrders()}
            title="Refresh"
          >
            {Icon.refresh}
            {lastRefresh && (
              <span className="dpo__refresh-time">
                {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="dpo__error">
            ⚠️ {error}
            <button onClick={() => fetchOrders()}>Retry</button>
          </div>
        )}

        {/* Search */}
        <div className="dpo__search-wrap">
          <span className="dpo__search-icon">{Icon.search}</span>
          <input
            className="dpo__search"
            placeholder="Search by order ID, customer name, or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="dpo__search-clear" onClick={() => setSearch("")}>
              {Icon.close}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="dpo__tabs">
          {TABS.map((tab) => {
            const count = tab.key === "all" ? orders.length : counts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                className={`dpo__tab ${activeTab === tab.key ? "dpo__tab--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {count > 0 && <span className="dpo__tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="dpo__skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="dpo__skeleton-card">
                <div className="dpo__skeleton-line dpo__skeleton-line--short" />
                <div className="dpo__skeleton-line" />
                <div className="dpo__skeleton-line dpo__skeleton-line--med" />
                <div className="dpo__skeleton-line dpo__skeleton-line--short" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="dpo__empty">
            <span className="dpo__empty-icon">{Icon.empty}</span>
            <p className="dpo__empty-title">No orders found</p>
            <p className="dpo__empty-sub">
              {search
                ? `No results for "${search}"`
                : "No orders in this category yet."}
            </p>
          </div>
        ) : (
          <div className="dpo__grid">
            {filtered.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onSelect={setSelectedOrder}
                onStatusChange={handleStatusChange}
                updating={updating}
              />
            ))}
          </div>
        )}

        {/* Drawer */}
        {selectedOrder && (
          <OrderDrawer
            order={orders.find((o) => o._id === selectedOrder._id) || selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            updating={updating}
          />
        )}

      </div>
    </Layout>
  );
}