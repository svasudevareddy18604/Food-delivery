import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [stats, setStats] = useState({
    totalMerchants:    0,
    activeMerchants:   0,
    blockedMerchants:  0,
    rejectedMerchants: 0,
    pendingMerchants:  0,
    totalCustomers:    0,
    blockedCustomers:  0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [merchantRes, customerRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/merchants`),
        axios.get(`${API_URL}/api/admin/customers`),
      ]);

      const merchants = merchantRes.data;
      const customers = customerRes.data.customers ?? [];

      setStats({
        totalMerchants:    merchants.length,
        activeMerchants:   merchants.filter((m) =>  m.isApproved && !m.isBlocked).length,
        blockedMerchants:  merchants.filter((m) =>  m.isBlocked).length,
        rejectedMerchants: merchants.filter((m) =>  m.isRejected).length,
        pendingMerchants:  merchants.filter((m) => !m.isApproved && !m.isRejected && !m.isBlocked).length,
        totalCustomers:    customers.length,
        blockedCustomers:  customers.filter((c) =>  c.isBlocked).length,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const CARDS = [
    { label: "Total Merchants",   value: stats.totalMerchants,    color: "orange", icon: <StoreIcon /> },
    { label: "Total Customers",   value: stats.totalCustomers,    color: "purple", icon: <UsersIcon /> },
    { label: "Active Merchants",  value: stats.activeMerchants,   color: "green",  icon: <ActiveIcon /> },
    { label: "Pending Approval",  value: stats.pendingMerchants,  color: "amber",  icon: <ClockIcon /> },
    { label: "Blocked Merchants", value: stats.blockedMerchants,  color: "red",    icon: <BlockIcon /> },
    { label: "Blocked Customers", value: stats.blockedCustomers,  color: "rose",   icon: <UserBlockIcon /> },
    { label: "Rejected",          value: stats.rejectedMerchants, color: "gray",   icon: <XIcon /> },
  ];

  return (
    <div className="home-content">

      {/* ── Heading ── */}
      <div className="home-heading">
        <h1 className="home-title">Overview</h1>
        <p className="home-sub">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="home-loading">Loading stats…</div>
      ) : (
        <div className="home-grid">
          {CARDS.map(({ label, value, color, icon }) => (
            <div className={`home-card home-card--${color}`} key={label}>
              <div className="card-icon">{icon}</div>
              <div className="card-body">
                <span className="card-value">{value}</span>
                <span className="card-label">{label}</span>
              </div>
              <div className="card-glow" />
            </div>
          ))}
        </div>
      )}

      {/* ── Summary Bar ── */}
      {!loading && (
        <div className="home-summary">
          <div className="summary-item">
            <span className="summary-dot dot-purple" />
            <span>{stats.totalCustomers} registered customers</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-dot dot-green" />
            <span>{stats.activeMerchants} active merchants</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-dot dot-amber" />
            <span>{stats.pendingMerchants} pending approvals</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-dot dot-red" />
            <span>{stats.blockedMerchants} blocked merchants</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-dot dot-rose" />
            <span>{stats.blockedCustomers} blocked customers</span>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Icons ── */
function StoreIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 21V9M19 9v12H5"/><rect x="9" y="14" width="6" height="7" rx="1"/></svg>; }
function UsersIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function ActiveIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>; }
function ClockIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function BlockIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function UserBlockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="17"/><line x1="23" y1="11" x2="17" y2="17"/></svg>; }
function XIcon()         { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>; }

export default Home;