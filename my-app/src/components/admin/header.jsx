import "./header.css";
import { useState } from "react";

function AdminHeader({ title = "Dashboard" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="topbar">

      {/* LEFT — page title */}
      <div className="topbar__left">
        <span className="topbar__page">{title}</span>
        <span className="topbar__date">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </span>
      </div>

      {/* CENTER — brand marquee */}
      <div className="topbar__marquee-wrap">
        <div className="topbar__marquee">
          <span>Foodie Admin</span>
          <span>Foodie Admin</span>
          <span>Foodie Admin</span>
          <span>Foodie Admin</span>
          <span>Foodie Admin</span>
        </div>
      </div>

      {/* RIGHT — actions + avatar */}
      <div className="topbar__right">

        {/* Search */}
        <button className="topbar__icon-btn" title="Search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Notifications */}
        <button className="topbar__icon-btn topbar__notif" title="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="topbar__badge">3</span>
        </button>

        {/* Avatar dropdown */}
        <div className="topbar__avatar-wrap" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="topbar__avatar">A</div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">Admin</span>
            <span className="topbar__user-role">Super Admin</span>
          </div>
          <svg className={`topbar__chevron ${menuOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>

          {menuOpen && (
            <div className="topbar__dropdown">
              {["Profile", "Settings", "Sign out"].map((item) => (
                <button key={item} className="topbar__drop-item">{item}</button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminHeader;