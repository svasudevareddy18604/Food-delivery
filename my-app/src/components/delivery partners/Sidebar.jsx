import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    label: "Dashboard",
    path: "/partner/dashboard",
    id: "dashboard",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
      </svg>
    ),
    label: "Orders",
    path: "/partner/orders",
    id: "orders",
    badgeKey: "orderCount",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    label: "Deliveries",
    path: "/partner/deliveries",
    id: "deliveries",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    label: "Earnings",
    path: "/partner/earnings",
    id: "earnings",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" opacity="0"/><path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    label: "Analytics",
    path: "/partner/analytics",
    id: "analytics",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: "Support",
    path: "/partner/support",
    id: "support",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    label: "Go Online",
    path: "/partner/status",
    id: "status",
  },
];

const BOTTOM_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    label: "Profile",
    path: "/partner/profile",
    id: "profile",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    label: "Settings",
    path: "/partner/settings",
    id: "settings",
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("deliveryPartner");
      try { setPartner(stored ? JSON.parse(stored) : null); }
      catch { setPartner(null); }
    };
    load();
    window.addEventListener("partner-updated", load);
    return () => window.removeEventListener("partner-updated", load);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/partner/login");
  };

  const initials = partner?.name
    ?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "FP";

  const activeId = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.id
    || BOTTOM_ITEMS.find(n => location.pathname.startsWith(n.path))?.id
    || "dashboard";

  return (
    <aside className={`sb ${collapsed ? "sb--collapsed" : ""}`}>

      {/* ── Brand ── */}
      <div className="sb__brand">
        <div className="sb__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1.5"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>

        {!collapsed && (
          <div className="sb__brand-text">
            <span className="sb__brand-name">Foodie</span>
            <span className="sb__brand-sub">Delivery Partners</span>
          </div>
        )}

        <button
          className="sb__toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`sb__toggle-icon ${collapsed ? "sb__toggle-icon--flipped" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      {/* ── Online status pill ── */}
      {!collapsed && partner && (
        <div className="sb__status">
          <span className="sb__status-dot" />
          <span className="sb__status-text">
            {partner.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="sb__nav">
        <ul className="sb__list">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`sb__item ${isActive ? "sb__item--active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sb__item-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sb__item-label">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom section ── */}
      <div className="sb__bottom">
        <ul className="sb__list">
          {BOTTOM_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`sb__item ${isActive ? "sb__item--active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sb__item-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sb__item-label">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}

          {/* Logout */}
          <li>
            <button
              className="sb__item sb__item--logout"
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
            >
              <span className="sb__item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </span>
              {!collapsed && <span className="sb__item-label">Logout</span>}
            </button>
          </li>
        </ul>

        {/* Partner card */}
        {!collapsed && partner && (
          <div className="sb__profile">
            <div className="sb__avatar">{initials}</div>
            <div className="sb__profile-info">
              <span className="sb__profile-name">{partner.name}</span>
              <span className="sb__profile-role">
                {partner.rating ? `⭐ ${Number(partner.rating).toFixed(1)} · ` : ""}Delivery Partner
              </span>
            </div>
          </div>
        )}

        {collapsed && partner && (
          <div className="sb__avatar sb__avatar--center">{initials}</div>
        )}
      </div>

    </aside>
  );
}