import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════
   CENTER MARQUEE — single brand scroll
══════════════════════════════════════ */
function CenterMarquee() {
  const ITEM = "🏍️  Foodie Delivery Partners";
  const copies = Array(12).fill(ITEM);

  return (
    <div className="dp-topbar__marquee-wrap" aria-label="Foodie Delivery Partners">
      <div className="dp-topbar__marquee">
        {copies.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   NOTIFICATION PANEL
══════════════════════════════════════ */
function NotifPanel({ notifications, onMarkAll, panelRef }) {
  return (
    <div className="dp-notif-panel" ref={panelRef}>
      <div className="dp-notif-panel__head">
        <span className="dp-notif-panel__title">Notifications</span>
        <button className="dp-notif-panel__mark" onClick={onMarkAll}>
          Mark all read
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="dp-notif-panel__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <ul className="dp-notif-panel__list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`dp-notif-panel__item${n.unread ? " dp-notif-panel__item--unread" : ""}`}
            >
              <div className="dp-notif-panel__icon">{n.icon}</div>
              <div className="dp-notif-panel__body">
                <p className="dp-notif-panel__text">{n.text}</p>
                <span className="dp-notif-panel__time">{n.time}</span>
              </div>
              {n.unread && <span className="dp-notif-panel__dot" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   USER DROPDOWN
══════════════════════════════════════ */
function UserDropdown({ partner, onClose, menuRef }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    onClose();
    navigate("/partner/login");
  };

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const initials = partner?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dp-dropdown" ref={menuRef}>
      {/* Card */}
      <div className="dp-dropdown__card">
        <div className="dp-dropdown__avatar">{initials}</div>
        <div className="dp-dropdown__info">
          <p className="dp-dropdown__name">{partner?.name}</p>
          <p className="dp-dropdown__email">{partner?.email}</p>
          {partner?.partnerId && (
            <p className="dp-dropdown__pid">ID: {partner.partnerId}</p>
          )}
        </div>
      </div>

      <div className="dp-dropdown__divider" />

      <ul className="dp-dropdown__list">
        <li onClick={() => go("/partner/profile")}>
          <span className="dp-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </span>
          <span>My Profile</span>
          <span className="dp-dropdown__arrow">›</span>
        </li>
        <li onClick={() => go("/partner/earnings")}>
          <span className="dp-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <span>Earnings</span>
          <span className="dp-dropdown__arrow">›</span>
        </li>
        <li onClick={() => go("/partner/deliveries")}>
          <span className="dp-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </span>
          <span>My Deliveries</span>
          <span className="dp-dropdown__arrow">›</span>
        </li>
        <li onClick={() => go("/partner/support")}>
          <span className="dp-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span>Support</span>
          <span className="dp-dropdown__arrow">›</span>
        </li>
      </ul>

      <div className="dp-dropdown__divider" />

      <button className="dp-dropdown__logout" onClick={logout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN HEADER
══════════════════════════════════════ */
export default function DeliveryHeader() {
  const navigate = useNavigate();

  const [partner, setPartner]         = useState(null);
  const [showMenu, setShowMenu]       = useState(false);
  const [showNotif, setShowNotif]     = useState(false);
  const [notifications, setNotifications] = useState([]);

  const menuRef  = useRef();
  const notifRef = useRef();

  /* ── Load partner from localStorage ── */
  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("deliveryPartner");
      try { setPartner(stored ? JSON.parse(stored) : null); }
      catch { setPartner(null); }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("partner-updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("partner-updated", load);
    };
  }, []);

  /* ── Outside click closes dropdowns ── */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const unreadCount = notifications.filter((n) => n.unread).length;

  const initials = partner?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dp-topbar">
      {/* LEFT — date */}
      <div className="dp-topbar__date">
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </div>

      {/* CENTER — scrolling brand */}
      <CenterMarquee />

      {/* RIGHT — notif + avatar */}
      <div className="dp-topbar__right">
        {/* Notification bell — only when logged in */}
        {partner && (
          <div className="dp-topbar__notif-wrap" ref={notifRef}>
            <button
              className="dp-topbar__icon-btn"
              onClick={() => { setShowNotif((v) => !v); setShowMenu(false); }}
              aria-label="Notifications"
              aria-expanded={showNotif}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="dp-topbar__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            {showNotif && (
              <NotifPanel
                notifications={notifications}
                onMarkAll={markAllRead}
                panelRef={notifRef}
              />
            )}
          </div>
        )}

        {/* Avatar + dropdown — only when logged in */}
        {partner && (
          <div className="dp-topbar__user" ref={menuRef}>
            <button
              className="dp-topbar__avatar"
              onClick={() => { setShowMenu((v) => !v); setShowNotif(false); }}
              aria-label="Open partner menu"
              aria-expanded={showMenu}
            >
              <span>{initials}</span>
            </button>
            <div className="dp-topbar__user-info">
              <span className="dp-topbar__username">{partner.name?.split(" ")[0]}</span>
              {partner.rating && (
                <span className="dp-topbar__rating">
                  ⭐ {Number(partner.rating).toFixed(1)}
                </span>
              )}
            </div>
            {showMenu && (
              <UserDropdown
                partner={partner}
                onClose={() => setShowMenu(false)}
                menuRef={menuRef}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}