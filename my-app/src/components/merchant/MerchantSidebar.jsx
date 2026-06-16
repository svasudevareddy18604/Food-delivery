import { useNavigate } from "react-router-dom";
import "./MerchantSidebar.css";

const MENUS = [
  { id: "home",      label: "Home",       icon: "🏠", badge: null,  route: null },
  { id: "foods",     label: "Food Items", icon: "🍽",  badge: null,  route: null },
  { id: "orders",    label: "Orders",     icon: "📦", badge: "New", route: null },
  { id: "bookings",  label: "Bookings",   icon: "📅", badge: null,  route: "/merchant/bookings" },
  { id: "analytics", label: "Analytics",  icon: "📊", badge: null,  route: null },
  { id: "settings",  label: "Settings",   icon: "⚙️", badge: null,  route: null },
];

export default function MerchantSidebar({
  activeTab,
  setActiveTab,
  merchantName = "My Restaurant",
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("merchantId");
    localStorage.removeItem("merchantName");
    navigate("/login");
  };

  const handleMenu = (m) => {
    if (m.route) {
      navigate(m.route);
    } else {
      setActiveTab(m.id);
    }
  };

  const initials = merchantName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="ms">
      {/* BRAND */}
      <div className="ms__brand">
        <div className="ms__brand-icon">F</div>
        <div>
          <span className="ms__brand-name">Foodie</span>
          <span className="ms__brand-sub">Merchant Portal</span>
        </div>
      </div>

      {/* MERCHANT PILL */}
      <div className="ms__merchant">
        <div className="ms__avatar">{initials}</div>
        <div className="ms__merchant-info">
          <p className="ms__merchant-name">{merchantName}</p>
          <p className="ms__merchant-role">Owner · Active</p>
        </div>
        <span className="ms__online" title="Online" />
      </div>

      {/* NAV */}
      <p className="ms__section-label">Navigation</p>
      <nav className="ms__nav">
        {MENUS.map((m) => (
          <button
            key={m.id}
            className={`ms__item ${activeTab === m.id ? "ms__item--active" : ""}`}
            onClick={() => handleMenu(m)}
          >
            <span className="ms__icon">{m.icon}</span>
            <span className="ms__label">{m.label}</span>
            {m.badge && <span className="ms__badge">{m.badge}</span>}
            {activeTab === m.id && !m.badge && <span className="ms__dot" />}
          </button>
        ))}
      </nav>

      {/* DIVIDER */}
      <div className="ms__divider" />

      {/* BOTTOM */}
      <div className="ms__bottom">
        <button className="ms__logout" onClick={handleLogout}>
          <span className="ms__icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
