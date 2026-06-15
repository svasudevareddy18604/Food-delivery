import "./header.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminHeader({ title = "Dashboard" }) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [admin,    setAdmin]      = useState({ name: "", email: "", role: "" });
  const navigate                  = useNavigate();

  /* ── Load admin from localStorage ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setAdmin(JSON.parse(stored));
    } catch {
      console.error("Failed to parse admin from localStorage");
    }
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".topbar__avatar-wrap")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ── Avatar initials (e.g. "John Doe" → "JD") ── */
  const getInitials = (name = "") =>
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join("");

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
          {["Foodie Admin", "Foodie Admin", "Foodie Admin", "Foodie Admin", "Foodie Admin"].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
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

          <div className="topbar__avatar">
            {getInitials(admin.name) || "A"}
          </div>

          <div className="topbar__user-info">
            <span className="topbar__user-name">
              {admin.name || "Admin"}
            </span>
            <span className="topbar__user-role">
              {admin.role || "Super Admin"}
            </span>
          </div>

          <svg
            className={`topbar__chevron ${menuOpen ? "open" : ""}`}
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>

          {/* Dropdown */}
          {menuOpen && (
            <div className="topbar__dropdown">

              {/* Profile card inside dropdown */}
              <div className="topbar__drop-profile">
                <div className="topbar__drop-avatar">
                  {getInitials(admin.name) || "A"}
                </div>
                <div className="topbar__drop-info">
                  <span className="topbar__drop-name">
                    {admin.name || "Admin"}
                  </span>
                  <span className="topbar__drop-email">
                    {admin.email || "—"}
                  </span>
                  <span className="topbar__drop-role-badge">
                    {admin.role || "Super Admin"}
                  </span>
                </div>
              </div>

              <div className="topbar__drop-divider" />

              {/* Menu items */}
              <button className="topbar__drop-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </button>

              <button className="topbar__drop-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>

              <div className="topbar__drop-divider" />

              <button className="topbar__drop-item topbar__drop-item--logout" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminHeader;
