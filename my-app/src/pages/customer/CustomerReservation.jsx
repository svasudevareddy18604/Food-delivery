import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/customer/Header";
import "./CustomerReservation.css";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_TABS = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

const STATUS_META = {
  pending:   { label: "Pending",   color: "#ea580c", bg: "rgba(255,107,43,.1)",  border: "rgba(255,107,43,.25)" },
  confirmed: { label: "Confirmed", color: "#059669", bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.25)" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.25)"  },
  completed: { label: "Completed", color: "#7c3aed", bg: "rgba(124,58,237,.1)",  border: "rgba(124,58,237,.25)" },
};

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[Number(m) - 1]} ${y}`;
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ══════════════════════════════
   RESERVATION CARD
══════════════════════════════ */
function ReservationCard({ reservation, idx }) {
  const meta = STATUS_META[reservation.status] || STATUS_META.pending;
  const restaurant = reservation.merchantId;

  return (
    <div
      className={`rb-card rb-card--${reservation.status}`}
      style={{ animationDelay: `${idx * 70}ms` }}
    >
      {/* ── CARD HEADER ── */}
      <div className="rb-card__head">
        <span className="rb-card__id">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          #{reservation._id?.slice(-8).toUpperCase()}
        </span>
        <span
          className="rb-card__status"
          style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
        >
          <span className="rb-card__status-dot" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>

      {/* ── RESTAURANT ROW ── */}
      <div className="rb-card__restaurant">
        <div className="rb-card__icon">🍽</div>
        <div className="rb-card__rest-info">
          <p className="rb-card__name">
            {restaurant?.restaurantName || restaurant?.name || "Restaurant"}
          </p>
          <p className="rb-card__booked">Booked {timeAgo(reservation.createdAt)}</p>
        </div>
      </div>

      {/* ── DETAIL GRID ── */}
      <div className="rb-card__details">
        <div className="rb-card__detail">
          <span className="rb-card__detail-icon">📅</span>
          <span className="rb-card__detail-val">{formatDate(reservation.date)}</span>
          <span className="rb-card__detail-key">Date</span>
        </div>
        <div className="rb-card__detail">
          <span className="rb-card__detail-icon">🕐</span>
          <span className="rb-card__detail-val">{formatTime(reservation.time)}</span>
          <span className="rb-card__detail-key">Time</span>
        </div>
        <div className="rb-card__detail">
          <span className="rb-card__detail-icon">👥</span>
          <span className="rb-card__detail-val">
            {reservation.guests} {reservation.guests === 1 ? "Guest" : "Guests"}
          </span>
          <span className="rb-card__detail-key">Party size</span>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="rb-card__divider" />

      {/* ── BOTTOM ROW ── */}
      <div className="rb-card__foot">
        <div className="rb-card__note-wrap">
          {reservation.cancelReason ? (
            <p className="rb-card__cancel-reason">
              <span>⚠️</span>
              <span>Cancelled: {reservation.cancelReason}</span>
            </p>
          ) : reservation.note ? (
            <p className="rb-card__note">
              <span>📝</span>
              <span>{reservation.note}</span>
            </p>
          ) : (
            <p className="rb-card__no-note">No special requests</p>
          )}
        </div>

        {reservation.status === "completed" && (
          <div className="rb-card__badge rb-card__badge--completed">✓ Visit completed</div>
        )}
        {reservation.status === "confirmed" && (
          <div className="rb-card__badge rb-card__badge--confirmed">🎉 Table confirmed!</div>
        )}
        {reservation.status === "pending" && (
          <div className="rb-card__badge rb-card__badge--pending">⏳ Awaiting confirmation</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function CustomerReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setFilter]       = useState("All");
  const [error, setError]               = useState(null);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { navigate("/login"); return; }
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_URL}/api/reservations/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(data.reservations || data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load your reservations.");
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 60);
    }
  };

  /* Stats */
  const stats = {
    total:     reservations.length,
    pending:   reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
    completed: reservations.filter(r => r.status === "completed").length,
  };

  /* Filtered list — newest first */
  const filtered = (
    activeFilter === "All"
      ? reservations
      : reservations.filter(r => r.status === activeFilter.toLowerCase())
  ).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return (
    <div className={`rb rb--in`}>
      <Header />
      <div className="rb__state">
        <div className="rb__spinner" />
        <p className="rb__state-text">Loading your bookings…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rb rb--in">
      <Header />
      <div className="rb__state">
        <p className="rb__state-text rb__state-text--err">⚠ {error}</p>
        <button className="rb__retry" onClick={fetchReservations}>Try again</button>
      </div>
    </div>
  );

  return (
    <div className={`rb ${mounted ? "rb--in" : ""}`}>
      <Header />

      {/* ══ HERO ══ */}
      <div className="rb__hero">
        <div className="rb__hero-inner">
          <div>
            <button className="rb__hero-back" onClick={() => navigate(-1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
            <div className="rb__badge">✦ Table bookings</div>
            <h1 className="rb__title">
              My <em>Reservations</em>
            </h1>
            <p className="rb__sub">Track and manage all your restaurant table bookings in one place.</p>
          </div>

          {reservations.length > 0 && (
            <div className="rb__stats">
              {[
                { v: stats.total,     l: "Bookings"  },
                { v: stats.confirmed, l: "Confirmed"  },
                { v: stats.pending,   l: "Pending"    },
                { v: stats.completed, l: "Completed"  },
              ].map(({ v, l }) => (
                <div className="rb__stat" key={l}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="rb__wrap">

        {/* Filter tabs */}
        <div className="rb__filters">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              className={`rb__filter ${activeFilter === tab ? "rb__filter--active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
              <span className="rb__filter-count">
                {tab === "All"
                  ? stats.total
                  : reservations.filter(r => r.status === tab.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="rb__empty">
            <div className="rb__empty-ring">📅</div>
            <h2>
              {activeFilter === "All"
                ? "No reservations yet"
                : `No ${activeFilter.toLowerCase()} reservations`}
            </h2>
            <p>
              {activeFilter === "All"
                ? "Book a table at your favourite restaurant and it'll show up here."
                : `You don't have any ${activeFilter.toLowerCase()} bookings right now.`}
            </p>
            {activeFilter === "All" && (
              <button className="rb__empty-cta" onClick={() => navigate("/")}>
                Explore Restaurants
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="rb__list">
            {filtered.map((r, idx) => (
              <ReservationCard key={r._id} reservation={r} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}