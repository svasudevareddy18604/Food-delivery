import React, { useState } from "react";
import "./Sidebar.css";

const navItems = [
  { icon: "⊞", label: "Dashboard", id: "dashboard" },
  { icon: "📦", label: "Orders", id: "orders", badge: 5 },
  { icon: "🛵", label: "Deliveries", id: "deliveries" },
  { icon: "🤝", label: "Partners", id: "partners" },
  { icon: "📊", label: "Analytics", id: "analytics" },
  { icon: "💬", label: "Messages", id: "messages", badge: 2 },
  { icon: "🗓️", label: "Schedule", id: "schedule" },
];

const bottomItems = [
  { icon: "⚙️", label: "Settings", id: "settings" },
  { icon: "🔒", label: "Logout", id: "logout" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🛵</span>
        </div>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">OmniRetail</span>
            <span className="sidebar__brand-sub">Delivery Hub</span>
          </div>
        )}
        <button className="sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <span className={`sidebar__toggle-arrow ${collapsed ? "sidebar__toggle-arrow--right" : ""}`}>‹</span>
        </button>
      </div>

      {/* Status Chip */}
      {!collapsed && (
        <div className="sidebar__status">
          <span className="sidebar__status-dot" />
          <span className="sidebar__status-text">Status: Approved</span>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar__item ${active === item.id ? "sidebar__item--active" : ""}`}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : ""}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="sidebar__badge">{item.badge}</span>
                )}
                {collapsed && item.badge && (
                  <span className="sidebar__badge sidebar__badge--dot" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="sidebar__bottom">
        <ul className="sidebar__list">
          {bottomItems.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar__item sidebar__item--muted ${active === item.id ? "sidebar__item--active" : ""}`}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : ""}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {!collapsed && (
          <div className="sidebar__profile">
            <div className="sidebar__avatar">RD</div>
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">Ravi D.</span>
              <span className="sidebar__profile-role">Delivery Partner</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}