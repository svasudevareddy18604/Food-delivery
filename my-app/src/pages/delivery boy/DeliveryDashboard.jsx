import React, { useState, useEffect, useCallback } from "react";
import "./DeliveryDashboard.css";
import Layout from "../../components/delivery partners/Layout";

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    Delivered: "badge-green",
    "In Transit": "badge-blue",
    Pending: "badge-amber",
    Cancelled: "badge-red",
  };
  return (
    <span className={`status-badge ${map[status] || "badge-amber"}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

// ─── Bike Loader ──────────────────────────────────────────────

function BikeLoader({ text = "Fetching your dashboard…" }) {
  return (
    <div className="bike-loader-wrap">
      <div className="bike-scene">
        <div className="bike-road">
          <div className="bike-dashes" />
        </div>
        <div className="bike-rider">
          {/* SVG inline bike */}
          <svg viewBox="0 0 80 52" className="bike-svg" xmlns="http://www.w3.org/2000/svg">
            {/* Rear wheel */}
            <circle cx="18" cy="38" r="12" stroke="#6366f1" strokeWidth="3" fill="none" />
            <circle cx="18" cy="38" r="3" fill="#6366f1" />
            {/* Front wheel */}
            <circle cx="62" cy="38" r="12" stroke="#6366f1" strokeWidth="3" fill="none" />
            <circle cx="62" cy="38" r="3" fill="#6366f1" />
            {/* Frame */}
            <line x1="18" y1="38" x2="40" y2="18" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="18" x2="62" y2="38" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="18" x2="30" y2="38" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="18" x2="48" y2="18" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            {/* Handlebar */}
            <line x1="48" y1="18" x2="55" y2="24" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="48" y1="14" x2="48" y2="22" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            {/* Seat */}
            <line x1="36" y1="18" x2="44" y2="18" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="18" x2="40" y2="10" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
            {/* Rider body */}
            <circle cx="40" cy="7" r="5" fill="#f97316" />
            <line x1="40" y1="12" x2="40" y2="18" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            {/* Delivery bag */}
            <rect x="26" y="12" width="12" height="9" rx="2" fill="#22c55e" />
            <line x1="28" y1="12" x2="28" y2="9" stroke="#22c55e" strokeWidth="1.5" />
            <line x1="36" y1="12" x2="36" y2="9" stroke="#22c55e" strokeWidth="1.5" />
          </svg>
        </div>
        {/* speed lines */}
        <div className="speed-lines">
          <span /><span /><span />
        </div>
      </div>
      <p className="bike-loader-text">{text}</p>
      <div className="bike-loader-dots">
        <span /><span /><span />
      </div>
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
      <div className="sk sk-badge" />
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

// ─── Tabs Config ──────────────────────────────────────────────

const TABS = [
  { id: "all",        label: "All"        },
  { id: "delivered",  label: "Delivered"  },
  { id: "in-transit", label: "In Transit" },
  { id: "pending",    label: "Pending"    },
  { id: "cancelled",  label: "Cancelled"  },
];

const QUICK_ACTIONS = [
  { icon: "🗺️", label: "View Route",   cls: "qa-indigo" },
  { icon: "📋", label: "All Orders",   cls: "qa-green"  },
  { icon: "💬", label: "Support Chat", cls: "qa-amber"  },
  { icon: "📊", label: "My Reports",   cls: "qa-pink"   },
];

// ─── Dashboard Page ───────────────────────────────────────────

export default function DeliveryDashboard() {
  // Replace with real auth context: const { partnerId } = useAuth();
  const partnerId = "dp_001";

  const [activeTab,   setActiveTab]   = useState("all");
  const [loading,     setLoading]     = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error,       setError]       = useState(null);

  const [profile,     setProfile]     = useState(null);
  const [stats,       setStats]       = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [performance, setPerformance] = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, total: 0, pages: 1 });

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
        setStats(buildStats(statsData));
        setPerformance(buildPerf(perfData));
        setStatsLoaded(true);

        // orders slightly after so stats appear first (like Swiggy/Zomato UX)
        const ordersData = await fetchOrders(partnerId, { status: "all" });
        if (cancelled) return;
        setOrders(ordersData.orders || []);
        setPagination({
          page:  ordersData.page  || 1,
          total: ordersData.total || 0,
          pages: ordersData.pages || 1,
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [partnerId]);

  // ── Tab / filter change ──
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

  // ── Helpers ──
  function buildStats(data) {
    return [
      { id: 1, icon: "📦", label: "Total Orders", value: fmt(data.totalOrders),    change: data.totalOrdersChange,    up: data.totalOrdersUp,    colorClass: "stat-indigo" },
      { id: 2, icon: "✅", label: "Delivered",    value: fmt(data.delivered),       change: data.deliveredChange,       up: data.deliveredUp,       colorClass: "stat-green"  },
      { id: 3, icon: "🕐", label: "Pending",      value: fmt(data.pending),         change: data.pendingChange,         up: data.pendingUp,         colorClass: "stat-amber"  },
      { id: 4, icon: "❌", label: "Cancelled",    value: fmt(data.cancelled),       change: data.cancelledChange,       up: data.cancelledUp,       colorClass: "stat-red"    },
    ];
  }

  function buildPerf(data) {
    return [
      { label: "On-Time Rate",    value: data.onTimeRate,    cls: "perf-green"  },
      { label: "Acceptance Rate", value: data.acceptanceRate, cls: "perf-indigo" },
      { label: "Customer Rating", value: data.customerRating, cls: "perf-amber"  },
    ];
  }

  function fmt(n) {
    if (n === undefined || n === null) return "—";
    return Number(n).toLocaleString("en-IN");
  }

  function getHour() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  // ── Full screen bike loader on first load ──
  if (loading) return <Layout><BikeLoader /></Layout>;

  // ── Error state ──
  // ── Error state — show loader instead of error (APIs not ready yet) ──
if (error) return <Layout><BikeLoader text="Getting things ready…" /></Layout>;
  return (
    <Layout>
      <div className="db-page">

        {/* ── Welcome Banner ── */}
        <div className="db-banner">
          <div className="db-banner__left">
            <p className="db-banner__sub">{getHour()} 👋</p>
            <h2 className="db-banner__title">
              Welcome back, {profile?.firstName || "Partner"}!
            </h2>
            <p className="db-banner__desc">
              You have{" "}
              <strong className="db-banner__highlight">
                {fmt(stats.find(s => s.label === "Pending")?.value?.replace(/,/g, "") || 0)} pending orders
              </strong>{" "}
              today. Keep it up!
            </p>
          </div>
          <div className="db-banner__earnings">
            <span className="db-banner__moto">🛵</span>
            <div>
              <p className="db-banner__earn-label">Today's Earnings</p>
              <p className="db-banner__earn-value">
                ₹{profile?.todayEarnings !== undefined
                  ? Number(profile.todayEarnings).toLocaleString("en-IN")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="db-stats">
          {!statsLoaded
            ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            : stats.map((s, i) => (
              <div
                key={s.id}
                className="stat-card"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`stat-card__icon ${s.colorClass}`}>{s.icon}</div>
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

        {/* ── Bottom Row ── */}
        <div className="db-bottom">

          {/* Orders Table */}
          <div className="db-card">
            <div className="db-card__header">
              <h3 className="db-card__title">Recent Orders</h3>
              <button className="db-view-all">View all →</button>
            </div>

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
                    <circle cx="9" cy="19" r="6" stroke="#6366f1" strokeWidth="2" fill="none" />
                    <circle cx="31" cy="19" r="6" stroke="#6366f1" strokeWidth="2" fill="none" />
                    <line x1="9"  y1="19" x2="20" y2="9"  stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="20" y1="9"  x2="31" y2="19" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="20" y1="9"  x2="15" y2="19" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="24" y1="9"  x2="28" y2="12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="24" y1="7"  x2="24" y2="11" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
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
                        {["Order ID", "Customer", "Address", "Amount", "Status", "Time"].map((h) => (
                          <th key={h} className="db-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="db-empty">No orders found</td>
                        </tr>
                      ) : (
                        orders.map((o, i) => (
                          <tr key={o._id || o.id} className={i % 2 === 0 ? "tr-even" : ""}>
                            <td className="db-td td-id">#{o.orderId || o._id?.slice(-6)}</td>
                            <td className="db-td">{o.customerName}</td>
                            <td className="db-td td-addr">{o.deliveryAddress}</td>
                            <td className="db-td td-amt">₹{Number(o.amount).toLocaleString("en-IN")}</td>
                            <td className="db-td"><StatusBadge status={o.status} /></td>
                            <td className="db-td td-time">{o.timeAgo || formatTime(o.updatedAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="db-pagination">
                    <button
                      className="pg-btn"
                      disabled={pagination.page === 1}
                      onClick={() => loadOrders(activeTab, pagination.page - 1)}
                    >← Prev</button>
                    <span className="pg-info">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      className="pg-btn"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => loadOrders(activeTab, pagination.page + 1)}
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="db-right">

            <div className="db-card">
              <h3 className="db-card__title">Quick Actions</h3>
              <div className="qa-grid">
                {QUICK_ACTIONS.map((a) => (
                  <button key={a.label} className="qa-btn">
                    <span className={`qa-icon ${a.cls}`}>{a.icon}</span>
                    <span className="qa-label">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="db-card">
              <h3 className="db-card__title">Delivery Performance</h3>
              {performance.length === 0 ? (
                <div className="perf-list">
                  {[1,2,3].map(i => (
                    <div key={i} className="perf-item">
                      <div className="sk sk-label" style={{ marginBottom: 6 }} />
                      <div className="sk sk-bar" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="perf-list">
                    {performance.map((p) => (
                      <div key={p.label} className="perf-item">
                        <div className="perf-top">
                          <span className="perf-label">{p.label}</span>
                          <span className={`perf-pct ${p.cls}`}>{p.value}%</span>
                        </div>
                        <div className="perf-bar">
                          <div className={`perf-fill ${p.cls}`} style={{ width: `${p.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {profile?.rating && (
                    <div className="db-rating">
                      <span className="rating-stars">{"★".repeat(Math.round(profile.rating))}{"☆".repeat(5 - Math.round(profile.rating))}</span>
                      <span className="rating-text">
                        {profile.rating.toFixed(1)} / 5.0 · {profile.totalReviews?.toLocaleString("en-IN") || 0} reviews
                      </span>
                    </div>
                  )}
                </>
              )}
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
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}