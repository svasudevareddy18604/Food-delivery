import React, { useState } from "react";
import "./DeliveryDashboard.css";
import Layout from "../../components/delivery partners/Layout";

// ─── Mock Data ────────────────────────────────────────────────

const STATS = [
  { id: 1, icon: "📦", label: "Total Orders", value: "1,284", change: "+12%", up: true,  colorClass: "stat-indigo" },
  { id: 2, icon: "✅", label: "Delivered",    value: "1,198", change: "+8%",  up: true,  colorClass: "stat-green"  },
  { id: 3, icon: "🕐", label: "Pending",      value: "54",    change: "-3%",  up: false, colorClass: "stat-amber"  },
  { id: 4, icon: "❌", label: "Cancelled",    value: "32",    change: "+1%",  up: false, colorClass: "stat-red"    },
];

const ORDERS = [
  { id: "#ORD-4821", customer: "Arjun Mehta",  address: "Hitech City, Hyderabad",  amount: "₹340", status: "Delivered",  time: "10 min ago" },
  { id: "#ORD-4820", customer: "Priya Sharma",  address: "Gachibowli, Hyderabad",   amount: "₹520", status: "In Transit", time: "25 min ago" },
  { id: "#ORD-4819", customer: "Ravi Kumar",    address: "Kukatpally, Hyderabad",   amount: "₹210", status: "Pending",    time: "40 min ago" },
  { id: "#ORD-4818", customer: "Sneha Reddy",   address: "Madhapur, Hyderabad",     amount: "₹780", status: "Delivered",  time: "1h ago"     },
  { id: "#ORD-4817", customer: "Vikram Das",    address: "Kondapur, Hyderabad",     amount: "₹150", status: "Cancelled",  time: "2h ago"     },
];

const QUICK_ACTIONS = [
  { icon: "🗺️", label: "View Route",   cls: "qa-indigo" },
  { icon: "📋", label: "All Orders",   cls: "qa-green"  },
  { icon: "💬", label: "Support Chat", cls: "qa-amber"  },
  { icon: "📊", label: "My Reports",   cls: "qa-pink"   },
];

const PERFORMANCE = [
  { label: "On-Time Rate",    value: 94, cls: "perf-green"  },
  { label: "Acceptance Rate", value: 88, cls: "perf-indigo" },
  { label: "Customer Rating", value: 96, cls: "perf-amber"  },
];

const TABS = [
  { id: "all",       label: "All"        },
  { id: "delivered", label: "Delivered"  },
  { id: "intransit", label: "In Transit" },
  { id: "pending",   label: "Pending"    },
  { id: "cancelled", label: "Cancelled"  },
];

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    "Delivered":  "badge-green",
    "In Transit": "badge-blue",
    "Pending":    "badge-amber",
    "Cancelled":  "badge-red",
  };
  return (
    <span className={`status-badge ${map[status] || "badge-amber"}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────

export default function DeliveryDashboard() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders =
    activeTab === "all"
      ? ORDERS
      : ORDERS.filter(
          (o) => o.status.toLowerCase().replace(" ", "") === activeTab
        );

  return (
    <Layout>
      <div className="db-page">

        {/* ── Welcome Banner ── */}
        <div className="db-banner">
          <div className="db-banner__left">
            <p className="db-banner__sub">Good morning 👋</p>
            <h2 className="db-banner__title">Welcome back, Ravi!</h2>
            <p className="db-banner__desc">
              You have{" "}
              <strong className="db-banner__highlight">54 pending orders</strong>{" "}
              today. Keep it up!
            </p>
          </div>
          <div className="db-banner__earnings">
            <span className="db-banner__moto">🛵</span>
            <div>
              <p className="db-banner__earn-label">Today's Earnings</p>
              <p className="db-banner__earn-value">₹2,340</p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="db-stats">
          {STATS.map((s, i) => (
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
              <span className={`stat-card__change ${s.up ? "change-up" : "change-down"}`}>
                {s.up ? "▲" : "▼"} {s.change}
              </span>
            </div>
          ))}
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
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="db-empty">No orders found</td>
                    </tr>
                  ) : (
                    filteredOrders.map((o, i) => (
                      <tr key={o.id} className={i % 2 === 0 ? "tr-even" : ""}>
                        <td className="db-td td-id">{o.id}</td>
                        <td className="db-td">{o.customer}</td>
                        <td className="db-td td-addr">{o.address}</td>
                        <td className="db-td td-amt">{o.amount}</td>
                        <td className="db-td"><StatusBadge status={o.status} /></td>
                        <td className="db-td td-time">{o.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
              <div className="perf-list">
                {PERFORMANCE.map((p) => (
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
              <div className="db-rating">
                <span className="rating-stars">★★★★★</span>
                <span className="rating-text">4.8 / 5.0 · 312 reviews</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}