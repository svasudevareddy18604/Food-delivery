import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/delivery partners/Layout";
import "./DeliveryPartnerOrders.css"; // reuse existing styles (oc__, dpo__ classes)

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

/* ─── Icons (same set as DeliveryPartnerOrders) ──────────────── */
const Icon = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pin:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  bag:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  clock:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
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
  return localStorage.getItem("token") || null;
}

function getPartnerId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?._id || null;
  } catch {
    return null;
  }
}

/* ─── Available Order Card ───────────────────────────────────── */
function AvailableOrderCard({ order, onAccept, accepting, takenIds }) {
  const orderId = order.orderNumber || order._id?.slice(-8).toUpperCase();
  const isTaken     = takenIds.has(order._id);
  const isAccepting = accepting === order._id;

  return (
    <div className={`oc oc--placed ${isTaken ? "oc--taken" : ""}`}>
      {/* Header */}
      <div className="oc__head">
        <div className="oc__id-wrap">
          <span className="oc__id">#{orderId}</span>
          <span className="oc__time">{timeAgo(order.createdAt)}</span>
        </div>
        <span className="oc__badge" style={{ color: "var(--s-amber)", background: "var(--s-amber-bg)" }}>
          <span className="oc__badge-dot" style={{ background: "#f59e0b" }} />
          New
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
      {isTaken ? (
        <button className="oc__cta" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
          Accepted by another partner
        </button>
      ) : (
        <button
          className={`oc__cta ${isAccepting ? "oc__cta--loading" : ""}`}
          disabled={isAccepting}
          onClick={() => onAccept(order._id)}
        >
          {isAccepting ? "Accepting…" : "Accept Order"}
        </button>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AvailableOrders() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [accepting,   setAccepting]   = useState(null);
  const [takenIds,    setTakenIds]    = useState(new Set()); // orders rejected with 409, shown briefly as "taken"
  const [lastRefresh, setLastRefresh] = useState(null);

  /* ── Fetch available orders ── */
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const token = getToken();

      const res = await fetch(`${BASE_URL}/orders/available`, {
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
        throw new Error(data.message || "Failed to fetch available orders");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Poll every 10s — available orders change faster than assigned ones ── */
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  /* ── Accept order (first-come-first-serve) ── */
  const handleAccept = useCallback(async (orderId) => {
    const partnerId = getPartnerId();
    if (!partnerId) {
      setError("Session not found. Please log in again.");
      return;
    }

    setAccepting(orderId);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/orders/${orderId}/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ partnerId }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Someone else got there first — show "taken" state briefly, then remove
        setTakenIds((prev) => new Set(prev).add(orderId));
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o._id !== orderId));
          setTakenIds((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        }, 1800);
        return;
      }

      if (!data.success) throw new Error(data.message || "Failed to accept order");

      // Success — remove from available list immediately.
      // The order now lives in the partner's "My Orders" feed (DeliveryPartnerOrders.jsx).
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      alert(`Failed to accept order: ${err.message}`);
    } finally {
      setAccepting(null);
    }
  }, []);

  /* ── Filter ── */
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      o._id?.toLowerCase().includes(q) ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.address?.toLowerCase().includes(q)
    );
  });

  /* ── Render ── */
  return (
    <Layout>
      <div className="dpo">

        {/* Page Header */}
        <div className="dpo__header">
          <div className="dpo__header-left">
            <h1 className="dpo__title">Available Orders</h1>
            <span className="dpo__subtitle">
              {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} waiting`}
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
        </div>

        {/* Content */}
        {loading ? (
          <div className="dpo__skeleton-grid">
            {[1, 2, 3, 4].map((n) => (
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
            <p className="dpo__empty-title">No orders available</p>
            <p className="dpo__empty-sub">
              {search ? `No results for "${search}"` : "Check back shortly — new orders appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="dpo__grid">
            {filtered.map((order) => (
              <AvailableOrderCard
                key={order._id}
                order={order}
                onAccept={handleAccept}
                accepting={accepting}
                takenIds={takenIds}
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}