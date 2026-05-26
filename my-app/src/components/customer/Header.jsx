import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

/* ── Location Modal ── */
function LocationModal({ onClose, onSelect }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [detecting, setDetect]= useState(false);
  const RECENT = JSON.parse(localStorage.getItem("foodie_recent") || "[]");

  const search = async (q) => {
    setQuery(q);
    if (!q) return setResults([]);
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
      );
      setResults(data);
    } catch { setResults([]); }
  };

  const detectLocation = () => {
    setDetect(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        onSelect({ label: data.display_name?.split(",").slice(0, 3).join(", "), lat, lon });
      } catch { onSelect({ label: "Current Location", lat, lon }); }
      setDetect(false);
    }, () => setDetect(false));
  };

  const pick = (r) =>
    onSelect({ label: r.display_name.split(",").slice(0, 3).join(", "), lat: r.lat, lon: r.lon });

  return (
    <div className="loc-overlay" onClick={onClose}>
      <div className="loc-modal" onClick={e => e.stopPropagation()}>
        <div className="loc-modal__head">
          <h3>Set delivery location</h3>
          <button className="loc-close" onClick={onClose}>✕</button>
        </div>
        <div className="loc-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
          <input placeholder="Search area, street, city…" value={query} onChange={e => search(e.target.value)} autoFocus />
        </div>
        <button className="loc-detect" onClick={detectLocation} disabled={detecting}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round"/></svg>
          {detecting ? "Detecting…" : "Use my current location"}
        </button>
        {results.length > 0 && (
          <ul className="loc-list">
            {results.map((r, i) => (
              <li key={i} onClick={() => pick(r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {r.display_name.split(",").slice(0, 3).join(", ")}
              </li>
            ))}
          </ul>
        )}
        {!query && RECENT.length > 0 && (
          <>
            <p className="loc-label">Recent</p>
            <ul className="loc-list">
              {RECENT.map((r, i) => (
                <li key={i} onClick={() => onSelect(r)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                  {r.label}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Cart Icon ── */
function CartIcon() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const sync = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
  };

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("cart-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("cart-updated", sync);
    };
  }, []);

  return (
    <button className="header__cart" onClick={() => navigate("/cart")} aria-label="View cart">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {count > 0 && <span className="header__cart-badge">{count > 99 ? "99+" : count}</span>}
    </button>
  );
}

/* ── Header ── */
export default function Header() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [location, setLocation] = useState(null);
  const [showLoc, setShowLoc]   = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    const loc = localStorage.getItem("foodie_location");
    if (loc) setLocation(JSON.parse(loc));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem("foodie_location", JSON.stringify(loc));
    const recent = JSON.parse(localStorage.getItem("foodie_recent") || "[]");
    localStorage.setItem("foodie_recent", JSON.stringify(
      [loc, ...recent.filter(r => r.label !== loc.label)].slice(0, 4)
    ));
    setShowLoc(false);
  };

  const logout = () => { localStorage.clear(); setUser(null); navigate("/login"); };
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <header className="header">

        {/* ── Brand ── */}
        <div className="header__brand" onClick={() => navigate("/")}>
          <span className="header__logo">🍽</span>
          <span className="header__name">Foodie</span>
        </div>

        {/* ── Location pill ── */}
        <button className="header__loc" onClick={() => setShowLoc(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span>{location ? location.label : "Set location"}</span>
          <svg className="header__loc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Right ── */}
        <div className="header__right">
          <CartIcon />

          {user ? (
            <div className="header__user" ref={menuRef}>
              <button className="header__avatar" onClick={() => setShowMenu(v => !v)}>
                <span>{initials}</span>
              </button>
              <span className="header__username">{user.name?.split(" ")[0]}</span>
              {showMenu && (
                <div className="header__dropdown">
                  <p className="header__dropdown-email">{user.email}</p>
                  <a onClick={() => navigate("/profile")}>My Profile</a>
                  <a onClick={() => navigate("/my-orders")}>My Orders</a>
                  <a onClick={() => navigate("/reservations")}>Reservations</a>
                  <hr />
                  <a className="header__dropdown-logout" onClick={logout}>Sign out</a>
                </div>
              )}
            </div>
          ) : (
            <button className="header__login" onClick={() => navigate("/login")}>
              Sign in
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} onSelect={handleLocation} />}
    </>
  );
}