import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";

const NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", path: "/admin",           icon: <GridIcon /> },
      { label: "Analytics", path: "/admin/analytics", icon: <ChartIcon /> },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Merchants", path: "/admin/merchants", icon: <StoreIcon /> },
      { label: "Orders",    path: "/admin/orders",    icon: <BoxIcon /> },
      { label: "Customers", path: "/admin/customers", icon: <UsersIcon /> },
      { label: "Products",  path: "/admin/products",  icon: <TagIcon /> },
      { label: "Delivery Partners",  path: "/admin/delivery",  icon: <TruckIcon /> },  // ← ADDED
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings",  path: "/admin/settings",  icon: <GearIcon /> },
      { label: "Logs",      path: "/admin/logs",      icon: <LogIcon /> },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("merchantId");
    navigate("/login");
  };

  const adminName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.name || "Admin";
    } catch {
      return "Admin";
    }
  })();

  const avatarLetter = adminName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">

      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="brand-logo"><span>F</span></div>
        <span className="brand-text">Foo<strong>die</strong></span>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        {NAV.map(({ group, items }) => (
          <div className="nav-group" key={group}>
            <p className="nav-label">{group}</p>
            {items.map(({ label, path, icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                end
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-text">{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="footer-avatar">{avatarLetter}</div>
        <div className="footer-info">
          <p className="footer-name">{adminName}</p>
          <p className="footer-role">Super Admin</p>
        </div>
        <button
          className="footer-logout"
          title="Logout"
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>
      </div>

    </aside>
  );
}

/* ── Icons ── */
function GridIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function ChartIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function StoreIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 21V9M19 9v12H5"/><rect x="9" y="14" width="6" height="7" rx="1"/></svg>; }
function BoxIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function UsersIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function TagIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
// ── NEW ──
function TruckIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
// ────────
function GearIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function LogIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
