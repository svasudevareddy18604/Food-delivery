import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import "./MerchantAnalytics.css";

const MON_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_COLOR = {
  PLACED:           "#3b82f6",
  PREPARING:        "#f59e0b",
  OUT_FOR_DELIVERY: "#7c3aed",
  DELIVERED:        "#22c55e",
  CANCELLED:        "#ef4444",
};

const PIE_COLORS = ["#3b82f6","#f59e0b","#7c3aed","#22c55e","#ef4444"];

const API_URL = import.meta.env.VITE_API_URL;

/* ── tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ma__tooltip">
      <p className="ma__tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name.toLowerCase().includes("revenue") ? `₹${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── helpers ── */
function buildMonthly(orders) {
  const map = {};
  MON_LABELS.forEach(m => { map[m] = { month: m, revenue: 0, orders: 0 }; });
  orders.forEach(o => {
    const m = MON_LABELS[new Date(o.createdAt).getMonth()];
    map[m].orders  += 1;
    map[m].revenue += o.totalAmount || 0;
  });
  return MON_LABELS.map(m => map[m]);
}

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

function buildStatusDist(orders) {
  const map = {};
  orders.forEach(o => {
    map[o.orderStatus] = (map[o.orderStatus] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildTopItems(orders) {
  const map = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0 };
      map[item.name].qty     += item.quantity || 1;
      map[item.name].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
}

/* ── PDF export ── */
async function exportPDF(orders, stats, merchantName) {
  const { jsPDF } = await import("https://esm.sh/jspdf@2.5.1");
  const doc = new jsPDF();
  const orange = [255, 107, 43];
  const dark   = [26, 26, 46];

  doc.setFillColor(...orange);
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Analytics Report", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(merchantName || "Restaurant", 14, 25);
  doc.text(new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }), 14, 31);

  let y = 50;
  doc.setTextColor(...dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y); y += 8;

  const summaryData = [
    ["Total Orders",    stats.totalOrders],
    ["Total Revenue",   `₹${stats.revenue?.toLocaleString()}`],
    ["Delivered",       stats.delivered],
    ["Pending",         stats.pending],
    ["Cancelled",       stats.cancelled],
    ["Avg Order Value", `₹${stats.avgOrder?.toFixed(0)}`],
  ];

  summaryData.forEach(([label, val]) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 140);
    doc.text(label, 14, y);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(String(val ?? "0"), 80, y);
    y += 7;
  });

  y += 6;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("All Orders", 14, y); y += 8;

  const headers = ["Order ID", "Customer", "Phone", "Amount", "Status", "Payment", "Date"];
  const colW    = [28, 38, 28, 20, 26, 18, 22];
  let x = 14;

  doc.setFillColor(245, 245, 250);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 120);
  headers.forEach((h, i) => { doc.text(h, x, y); x += colW[i]; });
  y += 5;

  doc.setFont("helvetica", "normal");
  orders.forEach((o, idx) => {
    if (y > 275) { doc.addPage(); y = 20; }
    x = 14;
    if (idx % 2 === 0) { doc.setFillColor(252, 252, 255); doc.rect(14, y - 4, 182, 7, "F"); }
    doc.setTextColor(...dark);
    doc.setFontSize(7.5);
    const row = [
      `#${o._id?.slice(-8).toUpperCase()}`,
      o.customerName || "Customer",
      o.customerPhone || "—",
      `₹${o.totalAmount}`,
      o.orderStatus,
      o.paymentMethod,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—",
    ];
    row.forEach((v, i) => {
      const txt = String(v).slice(0, colW[i] / 2.2);
      doc.text(txt, x, y);
      x += colW[i];
    });
    y += 7;
  });

  doc.save(`analytics-${Date.now()}.pdf`);
}

/* ── Excel export ── */
async function exportExcel(orders, stats, merchantName) {
  const XLSX = await import("https://esm.sh/xlsx@0.18.5");

  const wb = XLSX.utils.book_new();

  const summaryRows = [
    ["Metric", "Value"],
    ["Restaurant", merchantName || "—"],
    ["Report Date", new Date().toLocaleDateString("en-IN")],
    ["Total Orders", stats.totalOrders],
    ["Total Revenue", stats.revenue],
    ["Delivered", stats.delivered],
    ["Pending", stats.pending],
    ["Cancelled", stats.cancelled],
    ["Avg Order Value", stats.avgOrder?.toFixed(0)],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");

  const orderRows = [
    ["Order ID","Customer","Phone","Address","Items","Amount","Payment Method","Payment Status","Order Status","Date"],
    ...orders.map(o => [
      `#${o._id?.slice(-8).toUpperCase()}`,
      o.customerName || "Customer",
      o.customerPhone || "—",
      o.address || "—",
      (o.items || []).map(i => `${i.name} ×${i.quantity}`).join(", "),
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—",
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(orderRows), "Orders");

  const itemMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      itemMap[item.name].qty     += item.quantity || 1;
      itemMap[item.name].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const itemRows = [
    ["Item Name", "Total Qty Sold", "Total Revenue"],
    ...Object.values(itemMap).sort((a, b) => b.qty - a.qty).map(i => [i.name, i.qty, i.revenue]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(itemRows), "Top Items");

  XLSX.writeFile(wb, `analytics-${Date.now()}.xlsx`);
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function MerchantAnalytics() {
  const [orders,   setOrders]   = useState([]);
  const [stats,    setStats]    = useState({});
  const [monthly,  setMonthly]  = useState([]);
  const [weekly,   setWeekly]   = useState([]);
  const [statusD,  setStatusD]  = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mounted,  setMounted]  = useState(false);
  const [exporting, setExporting] = useState("");
  const [merchantName, setMerchantName] = useState("");

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user       = JSON.parse(localStorage.getItem("user"));
      const merchantId = user?._id || localStorage.getItem("merchantId");
      setMerchantName(user?.restaurantName || user?.name || "Restaurant");

      const { data } = await axios.get(
        `${API_URL}/api/orders/merchant/${merchantId}`
      );
      const all = data.orders || [];
      setOrders(all);

      const delivered  = all.filter(o => o.orderStatus === "DELIVERED");
      const pending    = all.filter(o => ["PLACED","PREPARING","OUT_FOR_DELIVERY"].includes(o.orderStatus));
      const cancelled  = all.filter(o => o.orderStatus === "CANCELLED");
      const totalRev   = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);

      setStats({
        totalOrders: all.length,
        revenue:     totalRev,
        delivered:   delivered.length,
        pending:     pending.length,
        cancelled:   cancelled.length,
        avgOrder:    all.length ? totalRev / (delivered.length || 1) : 0,
      });

      setMonthly(buildMonthly(all));
      setWeekly(buildWeekly(all));
      setStatusD(buildStatusDist(all));
      setTopItems(buildTopItems(all));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async () => {
    setExporting("pdf");
    await exportPDF(orders, stats, merchantName);
    setExporting("");
  };

  const handleExcel = async () => {
    setExporting("excel");
    await exportExcel(orders, stats, merchantName);
    setExporting("");
  };

  if (loading) return (
    <div className="ma__loading">
      <div className="ma__spinner" />
      <p>Loading analytics…</p>
    </div>
  );

  return (
    <div className={`ma ${mounted ? "ma--in" : ""}`}>

      {/* ── HEADER ── */}
      <div className="ma__header">
        <div>
          <h1 className="ma__title">Analytics</h1>
          <p className="ma__sub">Full report for {merchantName}</p>
        </div>
        <div className="ma__export-btns">
          <button className="ma__btn ma__btn--excel" onClick={handleExcel} disabled={!!exporting}>
            {exporting === "excel" ? <span className="ma__btn-spinner" /> : "📊"}
            {exporting === "excel" ? "Exporting…" : "Export Excel"}
          </button>
          <button className="ma__btn ma__btn--pdf" onClick={handlePDF} disabled={!!exporting}>
            {exporting === "pdf" ? <span className="ma__btn-spinner" /> : "📄"}
            {exporting === "pdf" ? "Generating…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="ma__stats">
        {[
          { label: "Total Orders",    value: stats.totalOrders,               icon: "📦", color: "blue"   },
          { label: "Total Revenue",   value: `₹${stats.revenue?.toLocaleString() || 0}`, icon: "💰", color: "green"  },
          { label: "Delivered",       value: stats.delivered,                 icon: "✅", color: "emerald"},
          { label: "Pending",         value: stats.pending,                   icon: "⏳", color: "amber"  },
          { label: "Cancelled",       value: stats.cancelled,                 icon: "❌", color: "red"    },
          { label: "Avg Order Value", value: `₹${stats.avgOrder?.toFixed(0) || 0}`, icon: "📈", color: "purple" },
        ].map(c => (
          <div key={c.label} className={`ma__stat ma__stat--${c.color}`}>
            <span className="ma__stat-icon">{c.icon}</span>
            <div>
              <p className="ma__stat-label">{c.label}</p>
              <p className="ma__stat-value">{c.value ?? "0"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="ma__charts-row">

        <div className="ma__card">
          <div className="ma__card-head">
            <h3>Monthly Revenue</h3>
            <span className="ma__badge">{new Date().getFullYear()}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ff6b2b" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#grad1)" radius={[6,6,0,0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ma__card">
          <div className="ma__card-head">
            <h3>Monthly Orders</h3>
            <span className="ma__badge">{new Date().getFullYear()}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="orders" stroke="#ff6b2b" strokeWidth={2.5}
                dot={{ fill: "#ff6b2b", r: 4 }} activeDot={{ r: 6 }} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="ma__charts-row">

        <div className="ma__card">
          <div className="ma__card-head">
            <h3>Weekly Pattern</h3>
            <span className="ma__badge">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06d6a0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="url(#grad2)" radius={[6,6,0,0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ma__card">
          <div className="ma__card-head">
            <h3>Order Status Distribution</h3>
            <span className="ma__badge">All Time</span>
          </div>
          {statusD.length === 0 ? (
            <div className="ma__empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusD} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" nameKey="name" label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  } labelLine={false}>
                  {statusD.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ── TOP ITEMS ── */}
      <div className="ma__card ma__card--full">
        <div className="ma__card-head">
          <h3>Top Selling Items</h3>
          <span className="ma__badge">By Quantity</span>
        </div>
        {topItems.length === 0 ? (
          <div className="ma__empty">No items data yet</div>
        ) : (
          <div className="ma__items-list">
            {topItems.map((item, i) => (
              <div key={item.name} className="ma__item-row">
                <span className="ma__item-rank">#{i + 1}</span>
                <span className="ma__item-name">{item.name}</span>
                <div className="ma__item-bar-wrap">
                  <div className="ma__item-bar"
                    style={{ width: `${(item.qty / topItems[0].qty) * 100}%` }} />
                </div>
                <span className="ma__item-qty">{item.qty} sold</span>
                <span className="ma__item-rev">₹{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FULL ORDERS TABLE ── */}
      <div className="ma__card ma__card--full">
        <div className="ma__card-head">
          <h3>All Orders</h3>
          <span className="ma__badge">{orders.length} total</span>
        </div>
        <div className="ma__table-wrap">
          <table className="ma__table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td className="ma__oid">#{o._id?.slice(-8).toUpperCase()}</td>
                  <td>{o.customerName || "Customer"}</td>
                  <td className="ma__muted">{o.customerPhone || "—"}</td>
                  <td>{(o.items || []).length} item{(o.items||[]).length !== 1 ? "s" : ""}</td>
                  <td className="ma__amount">₹{o.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`ma__pay ma__pay--${o.paymentMethod?.toLowerCase()}`}>
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className="ma__status" style={{ background: `${STATUS_COLOR[o.orderStatus]}18`, color: STATUS_COLOR[o.orderStatus] }}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="ma__muted">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}