import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import "./MerchantHome.css";

const STAT_CARDS = [
  { key: "totalOrders",   label: "Total Orders",   icon: "📦", color: "blue"   },
  { key: "revenue",       label: "Total Revenue",  icon: "💰", color: "green"  },
  { key: "pending",       label: "Pending",         icon: "⏳", color: "amber"  },
  { key: "completed",     label: "Completed",       icon: "✅", color: "purple" },
];

const MOCK_WEEKLY = [
  { day: "Mon", orders: 12, revenue: 3200 },
  { day: "Tue", orders: 19, revenue: 5100 },
  { day: "Wed", orders: 15, revenue: 4200 },
  { day: "Thu", orders: 22, revenue: 6800 },
  { day: "Fri", orders: 30, revenue: 9100 },
  { day: "Sat", orders: 28, revenue: 8400 },
  { day: "Sun", orders: 18, revenue: 5600 },
];

const MOCK_MONTHLY = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 55000 }, { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 49000 }, { month: "Jun", revenue: 72000 },
];

const STATUS_CLASS = { pending: "amber", completed: "green", cancelled: "red", processing: "blue" };

function StatCard({ label, icon, color, value, prefix = "" }) {
  return (
    <div className={`mh__stat mh__stat--${color}`}>
      <div className="mh__stat-icon">{icon}</div>
      <div>
        <p className="mh__stat-label">{label}</p>
        <p className="mh__stat-value">{prefix}{value ?? "—"}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="mh__tooltip">
      <p className="mh__tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === "revenue" ? `₹${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function MerchantHome() {
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const merchantId = localStorage.getItem("merchantId");
      const { data } = await axios.get(
        `http://localhost:5000/api/orders/merchant/${merchantId}`
      );
      const allOrders = data.orders || [];
      setOrders(allOrders);
      setStats({
        totalOrders: allOrders.length,
        revenue:     allOrders.filter(o => o.status === "completed").reduce((s, o) => s + (o.totalAmount || 0), 0),
        pending:     allOrders.filter(o => o.status === "pending").length,
        completed:   allOrders.filter(o => o.status === "completed").length,
      });
    } catch {
      // fallback mock stats for UI preview
      setStats({ totalOrders: 127, revenue: 48320, pending: 8, completed: 114 });
      setOrders([]);
    } finally { setLoading(false); }
  };

  const recentOrders = orders.slice(0, 6);

  return (
    <div className={`mh ${mounted ? "mh--in" : ""}`}>

      {/* ── WELCOME BANNER ── */}
      <div className="mh__banner">
        <div>
          <p className="mh__banner-sub">Good day 👋</p>
          <h1 className="mh__banner-title">Dashboard Overview</h1>
        </div>
        <div className="mh__banner-date">
          {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="mh__stats">
        <StatCard label="Total Orders"   icon="📦" color="blue"   value={stats.totalOrders} />
        <StatCard label="Total Revenue"  icon="💰" color="green"  value={stats.revenue?.toLocaleString()} prefix="₹" />
        <StatCard label="Pending"        icon="⏳" color="amber"  value={stats.pending} />
        <StatCard label="Completed"      icon="✅" color="purple" value={stats.completed} />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="mh__charts">
        {/* Weekly orders line chart */}
        <div className="mh__chart-card">
          <div className="mh__chart-head">
            <h3>Weekly Orders</h3>
            <span className="mh__chart-badge">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_WEEKLY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,43,.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="orders" stroke="#ff6b2b" strokeWidth={2.5}
                dot={{ fill: "#ff6b2b", r: 4 }} activeDot={{ r: 6 }} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly revenue bar chart */}
        <div className="mh__chart-card">
          <div className="mh__chart-head">
            <h3>Monthly Revenue</h3>
            <span className="mh__chart-badge">2024</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_MONTHLY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,43,.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6,6,0,0]} name="revenue" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6b2b" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── RECENT ORDERS ── */}
      <div className="mh__orders-card">
        <div className="mh__chart-head">
          <h3>Recent Orders</h3>
          <span className="mh__chart-badge">{orders.length} total</span>
        </div>

        {loading ? (
          <div className="mh__skeletons">
            {[...Array(4)].map((_, i) => <div key={i} className="mh__skeleton-row" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="mh__empty"><span>📭</span><p>No orders yet</p></div>
        ) : (
          <div className="mh__table-wrap">
            <table className="mh__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o._id}>
                    <td className="mh__order-id">#{o._id?.slice(-6).toUpperCase()}</td>
                    <td>{o.customerName || o.userId?.name || "Customer"}</td>
                    <td>{o.items?.length ?? 1} item{o.items?.length !== 1 ? "s" : ""}</td>
                    <td className="mh__amount">₹{o.totalAmount?.toLocaleString() || "—"}</td>
                    <td>
                      <span className={`mh__status mh__status--${STATUS_CLASS[o.status] || "blue"}`}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="mh__date">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}