import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./MerchantHome.css";

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

function StatCard({ label, icon, color, value, prefix = "" }) {
  return (
    <div className={`mh__stat mh__stat--${color}`}>
      <div className="mh__stat-icon">{icon}</div>
      <div>
        <p className="mh__stat-label">{label}</p>
        <p className="mh__stat-value">{prefix}{value ?? "0"}</p>
      </div>
    </div>
  );
}

/* ── helpers ── */
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildWeekly(orders) {
  const map = {};
  DAY_LABELS.forEach(d => { map[d] = { day: d, orders: 0, revenue: 0 }; });
  orders.forEach(o => {
    const d = DAY_LABELS[new Date(o.createdAt).getDay()];
    map[d].orders  += 1;
    map[d].revenue += o.totalAmount || 0;
  });
  return DAY_LABELS.map(d => map[d]);
}

function buildMonthly(orders) {
  const map = {};
  MON_LABELS.forEach(m => { map[m] = { month: m, revenue: 0 }; });
  orders.forEach(o => {
    const m = MON_LABELS[new Date(o.createdAt).getMonth()];
    map[m].revenue += o.totalAmount || 0;
  });
  return MON_LABELS.map(m => map[m]);
}

const STATUS_COLOR = {
  PLACED:           "blue",
  PREPARING:        "amber",
  OUT_FOR_DELIVERY: "purple",
  DELIVERED:        "green",
  CANCELLED:        "red",
};

const API_URL = import.meta.env.VITE_API_URL;

export default function MerchantHome() {
  const [orders,  setOrders]  = useState([]);
  const [stats,   setStats]   = useState({});
  const [weekly,  setWeekly]  = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const merchant   = JSON.parse(localStorage.getItem("user"));
      const merchantId = merchant?._id || localStorage.getItem("merchantId");

      const { data } = await axios.get(
        `${API_URL}/api/orders/merchant/${merchantId}`
      );

      const all = data.orders || [];
      setOrders(all);

      setStats({
        totalOrders: all.length,
        revenue:     all
                       .filter(o => o.orderStatus === "DELIVERED")
                       .reduce((s, o) => s + (o.totalAmount || 0), 0),
        pending:     all.filter(o =>
                       ["PLACED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.orderStatus)
                     ).length,
        completed:   all.filter(o => o.orderStatus === "DELIVERED").length,
      });

      setWeekly(buildWeekly(all));
      setMonthly(buildMonthly(all));
    } catch (err) {
      console.error(err);
      setStats({ totalOrders: 0, revenue: 0, pending: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = [...orders].slice(0, 6);

  return (
    <div className={`mh ${mounted ? "mh--in" : ""}`}>

      {/* ── BANNER ── */}
      <div className="mh__banner">
        <div>
          <p className="mh__banner-sub">Good day 👋</p>
          <h1 className="mh__banner-title">Dashboard Overview</h1>
        </div>
        <div className="mh__banner-date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="mh__stats">
        <StatCard label="Total Orders"  icon="📦" color="blue"   value={stats.totalOrders} />
        <StatCard label="Total Revenue" icon="💰" color="green"  value={stats.revenue?.toLocaleString()} prefix="₹" />
        <StatCard label="Pending"       icon="⏳" color="amber"  value={stats.pending} />
        <StatCard label="Completed"     icon="✅" color="purple" value={stats.completed} />
      </div>

      {/* ── CHARTS ── */}
      <div className="mh__charts">

        <div className="mh__chart-card">
          <div className="mh__chart-head">
            <h3>Weekly Orders</h3>
            <span className="mh__chart-badge">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,43,.08)" />
              <XAxis dataKey="day"  tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="orders" stroke="#ff6b2b" strokeWidth={2.5}
                dot={{ fill: "#ff6b2b", r: 4 }} activeDot={{ r: 6 }} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mh__chart-card">
          <div className="mh__chart-head">
            <h3>Monthly Revenue</h3>
            <span className="mh__chart-badge">{new Date().getFullYear()}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ff6b2b" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,43,.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8b8fa8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── RECENT ORDERS TABLE ── */}
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
                  <th>Phone</th>
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
                    <td>{o.customerName || "Customer"}</td>
                    <td className="mh__muted">{o.customerPhone || "—"}</td>
                    <td>{o.items?.length ?? 1} item{o.items?.length !== 1 ? "s" : ""}</td>
                    <td className="mh__amount">₹{o.totalAmount?.toLocaleString() || "—"}</td>
                    <td>
                      <span className={`mh__status mh__status--${STATUS_COLOR[o.orderStatus] || "blue"}`}>
                        {o.orderStatus || "—"}
                      </span>
                    </td>
                    <td className="mh__date">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                        : "—"}
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