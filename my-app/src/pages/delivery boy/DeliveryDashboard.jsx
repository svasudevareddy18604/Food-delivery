import React, { useState, useEffect, useCallback, useRef } from "react";
import "./DeliveryDashboard.css";
import Layout from "../../components/delivery partners/Layout";

// ─── Availability Toggle ───────────────────────────────────────
function AvailabilityToggle({ available, onChange }) {
  return (
    <div className={`avail-pill ${available ? "avail-on" : "avail-off"}`} onClick={onChange}>
      <div className="avail-knob">
        <span className="avail-icon">{available ? "🟢" : "🔴"}</span>
      </div>
      <div className="avail-text">
        <span className="avail-status">{available ? "Available" : "Offline"}</span>
        <span className="avail-sub">{available ? "Accepting orders" : "Not accepting"}</span>
      </div>
      <div className={`avail-switch ${available ? "switch-on" : "switch-off"}`}>
        <div className="avail-thumb" />
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    DELIVERED:        { cls: "badge-green",  label: "Delivered"       },
    OUT_FOR_DELIVERY: { cls: "badge-blue",   label: "Out for Delivery" },
    PREPARING:        { cls: "badge-purple", label: "Preparing"       },
    PLACED:           { cls: "badge-amber",  label: "Placed"          },
    CANCELLED:        { cls: "badge-red",    label: "Cancelled"       },
    // legacy
    Delivered:        { cls: "badge-green",  label: "Delivered"       },
    "In Transit":     { cls: "badge-blue",   label: "In Transit"      },
    Pending:          { cls: "badge-amber",  label: "Pending"         },
    Cancelled:        { cls: "badge-red",    label: "Cancelled"       },
  };
  const { cls, label } = map[status] || { cls: "badge-amber", label: status };
  return (
    <span className={`status-badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

// ─── Pulse Ring for active order ──────────────────────────────
function PulseRing() {
  return (
    <span className="pulse-ring">
      <span className="pulse-core" />
    </span>
  );
}

// ─── Bike Loader ──────────────────────────────────────────────
function BikeLoader({ text = "Getting your dashboard ready…" }) {
  return (
    <div className="bike-loader-wrap">
      <div className="bike-scene">
        <div className="bike-road"><div className="bike-dashes" /></div>
        <div className="bike-rider">
          <svg viewBox="0 0 80 52" className="bike-svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="38" r="12" stroke="#6366f1" strokeWidth="3" fill="none" />
            <circle cx="18" cy="38" r="3" fill="#6366f1" />
            <circle cx="62" cy="38" r="12" stroke="#6366f1" strokeWidth="3" fill="none" />
            <circle cx="62" cy="38" r="3" fill="#6366f1" />
            <line x1="18" y1="38" x2="40" y2="18" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="18" x2="62" y2="38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="18" x2="30" y2="38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="18" x2="48" y2="18" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="48" y1="18" x2="55" y2="24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="48" y1="14" x2="48" y2="22" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="18" x2="44" y2="18" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="18" x2="40" y2="10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="7" r="5" fill="#f97316" />
            <line x1="40" y1="12" x2="40" y2="18" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="26" y="12" width="12" height="9" rx="2" fill="#22c55e" />
            <line x1="28" y1="12" x2="28" y2="9" stroke="#22c55e" strokeWidth="1.5" />
            <line x1="36" y1="12" x2="36" y2="9" stroke="#22c55e" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="speed-lines"><span /><span /><span /></div>
      </div>
      <p className="bike-loader-text">{text}</p>
      <div className="bike-loader-dots"><span /><span /><span /></div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="stat-card skeleton-card">
      <div className="sk sk-icon" />
      <div className="stat-card__body">
        <div className="sk sk-label" />
        <div className="sk sk-value" />
      </div>
    </div>
  );
}

// ─── Mini Stat ────────────────────────────────────────────────
function MiniStat({ label, value, unit = "" }) {
  return (
    <div className="mini-stat">
      <p className="mini-stat__label">{label}</p>
      <p className="mini-stat__value">{value}<span className="mini-stat__unit">{unit}</span></p>
    </div>
  );
}

// ─── API Layer ────────────────────────────────────────────────
async function fetchDashboardStats(partnerId) {
  const res = await fetch(`/api/delivery-partners/${partnerId}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchOrders(partnerId, { status, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status && status !== "all") params.append("status", status);
  const res = await fetch(`/api/delivery-partners/${partnerId}/orders?${params}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

async function fetchPerformance(partnerId) {
  const res = await fetch(`/api/delivery-partners/${partnerId}/performance`);
  if (!res.ok) throw new Error("Failed to fetch performance");
  return res.json();
}

async function fetchProfile(partnerId) {
  const res = await fetch(`/api/delivery-partners/${partnerId}/profile`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

async function toggleAvailability(partnerId, available) {
  const res = await fetch(`/api/delivery-partners/${partnerId}/availability`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ available }),
  });
  if (!res.ok) throw new Error("Failed to update availability");
  return res.json();
}

// ─── Tabs Config ──────────────────────────────────────────────
const TABS = [
  { id: "all",              label: "All",          count: null },
  { id: "OUT_FOR_DELIVERY", label: "Active",       count: null },
  { id: "PLACED",           label: "Placed",       count: null },
  { id: "PREPARING",        label: "Preparing",    count: null },
  { id: "DELIVERED",        label: "Delivered",    count: null },
  { id: "CANCELLED",        label: "Cancelled",    count: null },
];

const QUICK_ACTIONS = [
  { icon: "🗺️",  label: "Navigate",      cls: "qa-indigo", desc: "Open route map"     },
  { icon: "📋",  label: "My Orders",     cls: "qa-green",  desc: "Full order history"  },
  { icon: "💬",  label: "Support",       cls: "qa-amber",  desc: "Chat with support"   },
  { icon: "📊",  label: "Earnings",      cls: "qa-blue",   desc: "View your reports"   },
  { icon: "🔔",  label: "Alerts",        cls: "qa-pink",   desc: "View notifications"  },
  { icon: "⚙️",  label: "Settings",      cls: "qa-slate",  desc: "Account settings"    },
];

// ─── Dashboard Page ───────────────────────────────────────────
export default function DeliveryDashboard() {
  const partnerId = "dp_001";

  const [available,    setAvailable]    = useState(true);
  const [availLoading, setAvailLoading] = useState(false);
  const [activeTab,    setActiveTab]    = useState("all");
  const [loading,      setLoading]      = useState(true);
  const [statsLoaded,  setStatsLoaded]  = useState(false);
  const [ordersLoading,setOrdersLoading]= useState(false);
  const [error,        setError]        = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [stats,        setStats]        = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [performance,  setPerformance]  = useState([]);
  const [pagination,   setPagination]   = useState({ page: 1, total: 0, pages: 1 });
  const [now,          setNow]          = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Initial load ──
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [profileData, statsData, perfData] = await Promise.all([
          fetchProfile(partnerId),
          fetchDashboardStats(partnerId),
          fetchPerformance(partnerId),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setAvailable(profileData?.available ?? true);
        setStats(buildStats(statsData));
        setPerformance(buildPerf(perfData));
        setStatsLoaded(true);
        const ordersData = await fetchOrders(partnerId, { status: "all" });
        if (cancelled) return;
        setOrders(ordersData.orders || []);
        setPagination({ page: ordersData.page || 1, total: ordersData.total || 0, pages: ordersData.pages || 1 });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [partnerId]);

  // ── Orders fetch ──
  const loadOrders = useCallback(async (status, page = 1) => {
    setOrdersLoading(true);
    try {
      const data = await fetchOrders(partnerId, { status, page });
      setOrders(data.orders || []);
      setPagination({ page: data.page || 1, total: data.total || 0, pages: data.pages || 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [partnerId]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    loadOrders(tabId);
  };

  // ── Availability toggle ──
  const handleAvailToggle = async () => {
    if (availLoading) return;
    const next = !available;
    setAvailable(next);
    setAvailLoading(true);
    try {
      await toggleAvailability(partnerId, next);
    } catch {
      setAvailable(!next); // revert on fail
    } finally {
      setAvailLoading(false);
    }
  };

  // ── Helpers ──
  function buildStats(data) {
    return [
      { id: 1, icon: "📦", label: "Total Orders",   value: fmt(data.totalOrders),   change: data.totalOrdersChange,   up: true,              colorClass: "stat-indigo", bg: "#eef2ff" },
      { id: 2, icon: "✅", label: "Delivered",       value: fmt(data.delivered),     change: data.deliveredChange,     up: data.deliveredUp,  colorClass: "stat-green",  bg: "#f0fdf4" },
      { id: 3, icon: "🏃", label: "Active Now",      value: fmt(data.active ?? data.pending), change: null,            up: null,              colorClass: "stat-blue",   bg: "#eff6ff" },
      { id: 4, icon: "💰", label: "Today's Earnings",value: `₹${fmt(data.todayEarnings)}`, change: data.earningsChange, up: data.earningsUp, colorClass: "stat-amber",  bg: "#fffbeb" },
      { id: 5, icon: "❌", label: "Cancelled",       value: fmt(data.cancelled),     change: data.cancelledChange,     up: false,             colorClass: "stat-red",    bg: "#fef2f2" },
      { id: 6, icon: "⭐", label: "Avg Rating",      value: data.avgRating ? `${Number(data.avgRating).toFixed(1)}` : "—", change: null, up: null, colorClass: "stat-purple", bg: "#fdf4ff" },
    ];
  }

  function buildPerf(data) {
    return [
      { label: "On-Time Delivery",  value: data.onTimeRate,     cls: "perf-green",  icon: "⏱️" },
      { label: "Acceptance Rate",   value: data.acceptanceRate, cls: "perf-indigo", icon: "✅" },
      { label: "Customer Rating",   value: data.customerRating, cls: "perf-amber",  icon: "⭐" },
      { label: "Completion Rate",   value: data.completionRate, cls: "perf-blue",   icon: "🎯" },
    ];
  }

  function fmt(n) {
    if (n === undefined || n === null) return "—";
    return Number(n).toLocaleString("en-IN");
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  function fmtClock(date) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }

  function fmtDate(date) {
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const activeOrders = orders.filter(o => o.orderStatus === "OUT_FOR_DELIVERY" || o.status === "In Transit");

  if (loading) return <Layout><BikeLoader /></Layout>;
  if (error)   return <Layout><BikeLoader text="Connecting to server…" /></Layout>;

  return (
    <Layout>
      <div className="db-page">

        {/* ══════════ TOP HEADER BAR ══════════ */}
        <div className="db-topbar">
          <div className="db-topbar__left">
            <div className="db-topbar__avatar">
              <img
                src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.firstName || "D")}&background=6366f1&color=fff&size=80`}
                alt="avatar"
                className="topbar-avatar-img"
              />
              <div className={`avatar-status-dot ${available ? "dot-green" : "dot-gray"}`} />
            </div>
            <div className="db-topbar__info">
              <div className="db-topbar__greeting">{getGreeting()}, {profile?.firstName || "Partner"} 👋</div>
              <div className="db-topbar__id">
                ID: <span>{profile?.partnerId || partnerId}</span>
                &nbsp;·&nbsp;
                {profile?.vehicleType || "2-Wheeler"}
                &nbsp;·&nbsp;
                <span className="topbar-zone">{profile?.zone || "Chennai Central"}</span>
              </div>
            </div>
          </div>

          <div className="db-topbar__center">
            <div className="db-clock">
              <div className="db-clock__time">{fmtClock(now)}</div>
              <div className="db-clock__date">{fmtDate(now)}</div>
            </div>
          </div>

          <div className="db-topbar__right">
            <AvailabilityToggle available={available} onChange={handleAvailToggle} />
          </div>
        </div>

        {/* ══════════ ACTIVE ORDER ALERT ══════════ */}
        {available && activeOrders.length > 0 && (
          <div className="active-alert">
            <div className="active-alert__pulse">
              <PulseRing />
              <span className="active-alert__label">Live Delivery in Progress</span>
            </div>
            <div className="active-alert__orders">
              {activeOrders.slice(0, 2).map(o => (
                <div key={o._id || o.id} className="active-order-chip">
                  <span className="aoc-id">#{o.orderNumber || o.orderId || o._id?.slice(-6)}</span>
                  <span className="aoc-addr">{o.address || o.deliveryAddress}</span>
                  <button className="aoc-nav">Navigate →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ OFFLINE BANNER ══════════ */}
        {!available && (
          <div className="offline-banner">
            <span className="offline-icon">😴</span>
            <div>
              <p className="offline-title">You're currently offline</p>
              <p className="offline-sub">Toggle available above to start accepting delivery orders.</p>
            </div>
            <button className="offline-go-online" onClick={handleAvailToggle}>Go Online</button>
          </div>
        )}

        {/* ══════════ STAT CARDS ══════════ */}
        <div className="db-stats">
          {!statsLoaded
            ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
            : stats.map((s, i) => (
              <div key={s.id} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`stat-card__icon ${s.colorClass}`} style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div className="stat-card__body">
                  <p className="stat-card__label">{s.label}</p>
                  <p className="stat-card__value">{s.value}</p>
                </div>
                {s.change && (
                  <span className={`stat-card__change ${s.up ? "change-up" : "change-down"}`}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </span>
                )}
              </div>
            ))
          }
        </div>

        {/* ══════════ MINI KPI ROW ══════════ */}
        <div className="db-kpi-row">
          <MiniStat label="Shift Hours" value={profile?.shiftHours ?? "6.5"} unit="h" />
          <div className="kpi-divider" />
          <MiniStat label="KM Covered" value={profile?.kmCovered ?? "42"} unit=" km" />
          <div className="kpi-divider" />
          <MiniStat label="Deliveries Today" value={profile?.deliveriesToday ?? "—"} />
          <div className="kpi-divider" />
          <MiniStat label="Avg Delivery Time" value={profile?.avgDeliveryTime ?? "28"} unit=" min" />
          <div className="kpi-divider" />
          <MiniStat label="This Week" value={`₹${fmt(profile?.weekEarnings ?? 0)}`} />
          <div className="kpi-divider" />
          <MiniStat label="This Month" value={`₹${fmt(profile?.monthEarnings ?? 0)}`} />
        </div>

        {/* ══════════ BOTTOM GRID ══════════ */}
        <div className="db-bottom">

          {/* ── Orders Table ── */}
          <div className="db-card">
            <div className="db-card__header">
              <div>
                <h3 className="db-card__title">Order History</h3>
                <p className="db-card__sub">
                  {pagination.total > 0 ? `${fmt(pagination.total)} total orders` : "Your delivery records"}
                </p>
              </div>
              <button className="db-view-all">View All →</button>
            </div>

            {/* Tabs */}
            <div className="db-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`db-tab ${activeTab === t.id ? "db-tab--active" : ""}`}
                  onClick={() => handleTabChange(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {ordersLoading ? (
              <div className="orders-loading">
                <div className="mini-bike">
                  <svg viewBox="0 0 40 26" className="mini-bike-svg" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9"  cy="19" r="6" stroke="#6366f1" strokeWidth="2" fill="none" />
                    <circle cx="31" cy="19" r="6" stroke="#6366f1" strokeWidth="2" fill="none" />
                    <line x1="9"  y1="19" x2="20" y2="9"  stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="20" y1="9"  x2="31" y2="19" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="20" y1="9"  x2="15" y2="19" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="24" y1="9"  x2="28" y2="12" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="24" y1="7"  x2="24" y2="11" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="20" cy="4" r="2.5" fill="#f97316" />
                  </svg>
                </div>
                <span className="orders-loading-text">Loading orders…</span>
              </div>
            ) : (
              <>
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        {["Order #", "Customer", "Items", "Address", "Amount", "Payment", "Status", "Time"].map(h => (
                          <th key={h} className="db-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="db-empty">
                            <div className="empty-state">
                              <span className="empty-icon">📭</span>
                              <p>No orders found for this filter</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        orders.map((o, i) => (
                          <tr key={o._id || o.id} className={i % 2 === 0 ? "tr-even" : ""}>
                            <td className="db-td td-id">
                              #{o.orderNumber || o.orderId || o._id?.slice(-6)}
                            </td>
                            <td className="db-td">
                              <div className="cust-cell">
                                <span className="cust-name">{o.customerName || "Customer"}</span>
                                {o.customerPhone && (
                                  <span className="cust-phone">{o.customerPhone}</span>
                                )}
                              </div>
                            </td>
                            <td className="db-td td-items">
                              {o.items?.length
                                ? <span className="items-count">{o.items.length} item{o.items.length > 1 ? "s" : ""}</span>
                                : "—"
                              }
                            </td>
                            <td className="db-td td-addr" title={o.address || o.deliveryAddress}>
                              {(o.address || o.deliveryAddress || "").substring(0, 32)}
                              {(o.address || o.deliveryAddress || "").length > 32 ? "…" : ""}
                            </td>
                            <td className="db-td td-amt">
                              ₹{Number(o.totalAmount || o.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="db-td">
                              <span className={`pay-badge ${o.paymentMethod === "ONLINE" ? "pay-online" : "pay-cod"}`}>
                                {o.paymentMethod || "COD"}
                              </span>
                            </td>
                            <td className="db-td">
                              <StatusBadge status={o.orderStatus || o.status} />
                            </td>
                            <td className="db-td td-time">
                              {o.timeAgo || formatTime(o.updatedAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {pagination.pages > 1 && (
                  <div className="db-pagination">
                    <button className="pg-btn" disabled={pagination.page === 1}
                      onClick={() => loadOrders(activeTab, pagination.page - 1)}>← Prev</button>
                    <span className="pg-info">Page {pagination.page} of {pagination.pages} · {fmt(pagination.total)} orders</span>
                    <button className="pg-btn" disabled={pagination.page === pagination.pages}
                      onClick={() => loadOrders(activeTab, pagination.page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="db-right">

            {/* Performance Card */}
            <div className="db-card">
              <div className="db-card__header">
                <div>
                  <h3 className="db-card__title">My Performance</h3>
                  <p className="db-card__sub">This month's metrics</p>
                </div>
                {profile?.rating && (
                  <div className="rating-chip">
                    <span className="rating-star-icon">⭐</span>
                    <span>{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {performance.length === 0 ? (
                <div className="perf-list">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="perf-item">
                      <div className="sk sk-label" style={{ marginBottom: 6 }} />
                      <div className="sk sk-bar" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="perf-list">
                  {performance.map((p) => (
                    <div key={p.label} className="perf-item">
                      <div className="perf-top">
                        <span className="perf-icon">{p.icon}</span>
                        <span className="perf-label">{p.label}</span>
                        <span className={`perf-pct ${p.cls}`}>{p.value ?? 0}%</span>
                      </div>
                      <div className="perf-bar">
                        <div className={`perf-fill ${p.cls}`} style={{ width: `${p.value ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profile?.totalReviews > 0 && (
                <div className="review-row">
                  <span className="review-stars">
                    {"★".repeat(Math.round(profile.rating || 0))}
                    {"☆".repeat(5 - Math.round(profile.rating || 0))}
                  </span>
                  <span className="review-text">
                    {(profile.rating || 0).toFixed(1)} / 5.0 · {fmt(profile.totalReviews)} reviews
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="db-card">
              <h3 className="db-card__title">Quick Actions</h3>
              <p className="db-card__sub" style={{ marginBottom: 14 }}>Shortcuts for your workflow</p>
              <div className="qa-grid">
                {QUICK_ACTIONS.map((a) => (
                  <button key={a.label} className="qa-btn">
                    <span className={`qa-icon ${a.cls}`}>{a.icon}</span>
                    <span className="qa-label">{a.label}</span>
                    <span className="qa-desc">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="db-card earnings-card">
              <div className="db-card__header">
                <div>
                  <h3 className="db-card__title">Earnings</h3>
                  <p className="db-card__sub">Breakdown summary</p>
                </div>
                <span className="earn-period-badge">June 2025</span>
              </div>
              <div className="earn-breakdown">
                <div className="earn-row">
                  <span className="earn-label">Today</span>
                  <span className="earn-val earn-green">₹{fmt(profile?.todayEarnings ?? 0)}</span>
                </div>
                <div className="earn-row">
                  <span className="earn-label">This Week</span>
                  <span className="earn-val">₹{fmt(profile?.weekEarnings ?? 0)}</span>
                </div>
                <div className="earn-row">
                  <span className="earn-label">This Month</span>
                  <span className="earn-val">₹{fmt(profile?.monthEarnings ?? 0)}</span>
                </div>
                <div className="earn-divider" />
                <div className="earn-row earn-row--total">
                  <span className="earn-label">Incentives Earned</span>
                  <span className="earn-val earn-gold">₹{fmt(profile?.incentives ?? 0)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── Utility ──────────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}