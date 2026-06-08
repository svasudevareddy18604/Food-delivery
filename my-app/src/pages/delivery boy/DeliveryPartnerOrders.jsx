import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DeliveryPartnerOrders.css";

/* ─── Mock data ─────────────────────────────────────────────── */
const MOCK_ORDERS = [
  {
    id: "ORD-4821",
    status: "pending",
    restaurant: { name: "Spice Garden", address: "12 MG Road, Bengaluru" },
    customer: { name: "Rohan Mehta", address: "45 Indiranagar, Bengaluru", phone: "+91 98765 43210" },
    items: [{ name: "Butter Chicken", qty: 2 }, { name: "Garlic Naan", qty: 4 }],
    distance: "3.2 km",
    estimatedTime: "18 min",
    payment: { method: "Online", amount: 648 },
    placedAt: "2 min ago",
  },
  {
    id: "ORD-4820",
    status: "accepted",
    restaurant: { name: "The Burger Co.", address: "8 Koramangala, Bengaluru" },
    customer: { name: "Priya Sharma", address: "22 HSR Layout, Bengaluru", phone: "+91 91234 56789" },
    items: [{ name: "Double Smash Burger", qty: 1 }, { name: "Loaded Fries", qty: 1 }, { name: "Coke", qty: 2 }],
    distance: "5.1 km",
    estimatedTime: "26 min",
    payment: { method: "Cash", amount: 420 },
    placedAt: "8 min ago",
  },
  {
    id: "ORD-4819",
    status: "picked_up",
    restaurant: { name: "Dosa Express", address: "3 Jayanagar, Bengaluru" },
    customer: { name: "Kavya Nair", address: "77 BTM Layout, Bengaluru", phone: "+91 99887 76655" },
    items: [{ name: "Masala Dosa", qty: 3 }, { name: "Filter Coffee", qty: 2 }],
    distance: "2.4 km",
    estimatedTime: "12 min",
    payment: { method: "Online", amount: 310 },
    placedAt: "15 min ago",
  },
  {
    id: "ORD-4818",
    status: "delivered",
    restaurant: { name: "Pizza Planet", address: "9 Whitefield, Bengaluru" },
    customer: { name: "Amit Joshi", address: "14 ITPL Road, Bengaluru", phone: "+91 88999 11223" },
    items: [{ name: "Margherita (L)", qty: 1 }, { name: "Pepperoni (M)", qty: 1 }],
    distance: "6.8 km",
    estimatedTime: "—",
    payment: { method: "Online", amount: 780 },
    placedAt: "42 min ago",
  },
  {
    id: "ORD-4817",
    status: "cancelled",
    restaurant: { name: "Sushi Zen", address: "5 UB City, Bengaluru" },
    customer: { name: "Sneha Pillai", address: "30 Sadashivanagar, Bengaluru", phone: "+91 77888 33445" },
    items: [{ name: "Dragon Roll", qty: 2 }],
    distance: "7.3 km",
    estimatedTime: "—",
    payment: { method: "Online", amount: 560 },
    placedAt: "1 hr ago",
  },
];

const STATUS_CONFIG = {
  pending:   { label: "New",        color: "var(--s-amber)",  bg: "var(--s-amber-bg)",  dot: "#f59e0b" },
  accepted:  { label: "Accepted",   color: "var(--s-blue)",   bg: "var(--s-blue-bg)",   dot: "#3b82f6" },
  picked_up: { label: "Picked Up",  color: "var(--s-purple)", bg: "var(--s-purple-bg)", dot: "#a855f7" },
  delivered: { label: "Delivered",  color: "var(--s-green)",  bg: "var(--s-green-bg)",  dot: "#22c55e" },
  cancelled: { label: "Cancelled",  color: "var(--s-red)",    bg: "var(--s-red-bg)",    dot: "#ef4444" },
};

const NEXT_STATUS = {
  pending:   "accepted",
  accepted:  "picked_up",
  picked_up: "delivered",
};

const NEXT_LABEL = {
  pending:   "Accept Order",
  accepted:  "Mark Picked Up",
  picked_up: "Mark Delivered",
};

const TABS = [
  { key: "all",       label: "All Orders" },
  { key: "pending",   label: "New" },
  { key: "accepted",  label: "Accepted" },
  { key: "picked_up", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

/* ─── Icons ─────────────────────────────────────────────────── */
const Icon = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.4 2 2 0 0 1 3.9 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  rupee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="8" x2="18" y2="8"/>
      <line x1="6" y1="13" x2="12" y2="13"/><path d="M6 3v18l6-4 6 4V3"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  empty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6M9 16h4"/>
    </svg>
  ),
};

/* ─── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order, onSelect, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div
      className={`oc oc--${order.status}`}
      onClick={() => onSelect(order)}
    >
      {/* Header row */}
      <div className="oc__head">
        <div className="oc__id-wrap">
          <span className="oc__id">{order.id}</span>
          <span className="oc__time">{order.placedAt}</span>
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
          <p className="oc__rest-name">{order.restaurant.name}</p>
          <p className="oc__rest-addr">{order.restaurant.address}</p>
        </div>
      </div>

      {/* Divider line */}
      <div className="oc__divider" />

      {/* Customer row */}
      <div className="oc__customer">
        <span className="oc__cust-icon">{Icon.pin}</span>
        <div>
          <p className="oc__cust-name">{order.customer.name}</p>
          <p className="oc__cust-addr">{order.customer.address}</p>
        </div>
      </div>

      {/* Meta chips */}
      <div className="oc__meta">
        <span className="oc__chip">
          {Icon.truck}
          {order.distance}
        </span>
        <span className="oc__chip">
          {Icon.clock}
          {order.estimatedTime}
        </span>
        <span className={`oc__chip oc__chip--pay ${order.payment.method === "Cash" ? "oc__chip--cash" : ""}`}>
          ₹{order.payment.amount} · {order.payment.method}
        </span>
      </div>

      {/* Action button */}
      {NEXT_STATUS[order.status] && (
        <button
          className="oc__cta"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(order.id, NEXT_STATUS[order.status]);
          }}
        >
          {NEXT_LABEL[order.status]}
        </button>
      )}
    </div>
  );
}

/* ─── Order Detail Drawer ────────────────────────────────────── */
function OrderDrawer({ order, onClose, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="od-overlay" onClick={onClose}>
      <div className="od" onClick={(e) => e.stopPropagation()}>
        {/* Drawer handle */}
        <div className="od__handle" />

        {/* Header */}
        <div className="od__header">
          <div>
            <h2 className="od__title">{order.id}</h2>
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
              {["pending", "accepted", "picked_up", "delivered"].map((s, i) => {
                const statuses = ["pending", "accepted", "picked_up", "delivered", "cancelled"];
                const currentIdx = statuses.indexOf(order.status);
                const stepIdx = ["pending", "accepted", "picked_up", "delivered"].indexOf(s);
                const done = order.status === "cancelled" ? false : stepIdx <= currentIdx;
                const active = s === order.status;
                return (
                  <div key={s} className={`od__tl-step ${done ? "od__tl-step--done" : ""} ${active ? "od__tl-step--active" : ""}`}>
                    <div className="od__tl-dot" />
                    {i < 3 && <div className="od__tl-line" />}
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
                <p className="od__loc-name">{order.restaurant.name}</p>
                <p className="od__loc-addr">{order.restaurant.address}</p>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="od__section">
            <h3 className="od__section-title">Deliver To</h3>
            <div className="od__location-card od__location-card--delivery">
              <span className="od__loc-icon">{Icon.pin}</span>
              <div>
                <p className="od__loc-name">{order.customer.name}</p>
                <p className="od__loc-addr">{order.customer.address}</p>
              </div>
              <a
                className="od__call-btn"
                href={`tel:${order.customer.phone}`}
                onClick={(e) => e.stopPropagation()}
              >
                {Icon.phone}
              </a>
            </div>
          </div>

          {/* Items */}
          <div className="od__section">
            <h3 className="od__section-title">Order Items</h3>
            <div className="od__items">
              {order.items.map((item, i) => (
                <div key={i} className="od__item-row">
                  <span className="od__item-qty">{item.qty}×</span>
                  <span className="od__item-name">{item.name}</span>
                </div>
              ))}
              <div className="od__total-row">
                <span>Total</span>
                <span className="od__total-amt">₹{order.payment.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="od__section">
            <h3 className="od__section-title">Payment</h3>
            <div className={`od__pay-card ${order.payment.method === "Cash" ? "od__pay-card--cash" : "od__pay-card--online"}`}>
              <span className="od__pay-method">{order.payment.method === "Cash" ? "💵 Cash on Delivery" : "💳 Paid Online"}</span>
              <span className="od__pay-amount">₹{order.payment.amount}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="od__meta-row">
            <div className="od__meta-item">
              <span className="od__meta-label">Distance</span>
              <span className="od__meta-value">{order.distance}</span>
            </div>
            <div className="od__meta-item">
              <span className="od__meta-label">Est. Time</span>
              <span className="od__meta-value">{order.estimatedTime}</span>
            </div>
            <div className="od__meta-item">
              <span className="od__meta-label">Placed</span>
              <span className="od__meta-value">{order.placedAt}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        {NEXT_STATUS[order.status] && (
          <div className="od__footer">
            <button
              className="od__cta"
              onClick={() => {
                onStatusChange(order.id, NEXT_STATUS[order.status]);
                onClose();
              }}
            >
              {NEXT_LABEL[order.status]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function DeliveryPartnerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusChange = useCallback((orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
  }, []);

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.restaurant.name.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });

  return (
    <div className="dpo">
      {/* ── Page Header ── */}
      <div className="dpo__header">
        <div className="dpo__header-left">
          <h1 className="dpo__title">Orders</h1>
          <span className="dpo__subtitle">{orders.length} total today</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="dpo__search-wrap">
        <span className="dpo__search-icon">{Icon.search}</span>
        <input
          className="dpo__search"
          placeholder="Search by order ID, restaurant, or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="dpo__search-clear" onClick={() => setSearch("")}>
            {Icon.close}
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
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
              {count > 0 && (
                <span className="dpo__tab-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Orders Grid ── */}
      {filtered.length === 0 ? (
        <div className="dpo__empty">
          <span className="dpo__empty-icon">{Icon.empty}</span>
          <p className="dpo__empty-title">No orders found</p>
          <p className="dpo__empty-sub">
            {search ? `No results for "${search}"` : "There are no orders in this category yet."}
          </p>
        </div>
      ) : (
        <div className="dpo__grid">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onSelect={setSelectedOrder}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedOrder && (
        <OrderDrawer
          order={orders.find((o) => o.id === selectedOrder.id)}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}