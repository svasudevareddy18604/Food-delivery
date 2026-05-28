import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import axios                   from "axios";
import MerchantSidebar         from "../../components/merchant/MerchantSidebar";
import MerchantTopbar          from "../../components/merchant/MerchantTopbar";
import "./MerchantBookings.css";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_TABS = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

const STATUS_META = {
  pending:   { label: "Pending",   color: "#b45309", bg: "#fef3c7" },
  confirmed: { label: "Confirmed", color: "#047857", bg: "#d1fae5" },
  cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" },
  completed: { label: "Completed", color: "#4338ca", bg: "#e0e7ff" },
};

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[Number(m) - 1]} ${y}`;
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

/* ══════════════════════════════
   CANCEL REASON MODAL
══════════════════════════════ */
function CancelModal({ booking, onConfirm, onClose }) {
  const [reason, setReason]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(booking._id, reason.trim());
    setLoading(false);
  };

  return (
    <div className="mb-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mb-cancel-modal">
        <div className="mb-cancel-modal__head">
          <div className="mb-cancel-modal__icon">🚫</div>
          <div>
            <h3>Cancel Reservation</h3>
            <p>
              {booking.customerId?.name || "Guest"} ·{" "}
              {formatDate(booking.date)} at {formatTime(booking.time)}
            </p>
          </div>
          <button className="mb-cancel-modal__close" onClick={onClose}>✕</button>
        </div>

        <label className="mb-cancel-modal__label">
          Reason for cancellation <span>*</span>
          <textarea
            rows={3}
            placeholder="e.g. Restaurant is fully booked, kitchen closed for maintenance…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>

        <div className="mb-cancel-modal__actions">
          <button className="mb-btn-ghost" onClick={onClose}>Go Back</button>
          <button
            className="mb-btn-cancel-confirm"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
          >
            {loading ? <span className="mb-spinner" /> : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   BOOKING CARD
══════════════════════════════ */
function BookingCard({ booking, onConfirm, onCancel }) {
  const meta        = STATUS_META[booking.status] || STATUS_META.pending;
  const canAct      = booking.status === "pending";
  const canComplete = booking.status === "confirmed";

  return (
    <div className={`mb-card mb-card--${booking.status}`}>

      {/* ── LEFT: customer info ── */}
      <div className="mb-card__customer">
        <div className="mb-card__avatar">
          {getInitials(booking.customerId?.name)}
        </div>
        <div className="mb-card__customer-info">
          <p className="mb-card__customer-name">
            {booking.customerId?.name || "Guest"}
          </p>
          {booking.customerId?.email && (
            <p className="mb-card__contact">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {booking.customerId.email}
            </p>
          )}
          {booking.customerId?.phoneNumber && (
            <p className="mb-card__contact">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {booking.customerId.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* ── MIDDLE: booking details ── */}
      <div className="mb-card__details">
        <div className="mb-card__detail-row">
          <span className="mb-card__detail-icon">📅</span>
          <span>{formatDate(booking.date)}</span>
        </div>
        <div className="mb-card__detail-row">
          <span className="mb-card__detail-icon">🕐</span>
          <span>{formatTime(booking.time)}</span>
        </div>
        <div className="mb-card__detail-row">
          <span className="mb-card__detail-icon">👥</span>
          <span>{booking.guests} guest{booking.guests !== 1 ? "s" : ""}</span>
        </div>
        {booking.note && (
          <div className="mb-card__note">
            <span className="mb-card__detail-icon">📝</span>
            <span>{booking.note}</span>
          </div>
        )}
        {booking.cancelReason && (
          <div className="mb-card__cancel-reason">
            <span className="mb-card__detail-icon">⚠️</span>
            <span>{booking.cancelReason}</span>
          </div>
        )}
      </div>

      {/* ── RIGHT: status + actions ── */}
      <div className="mb-card__right">
        <div className="mb-card__status-row">
          <span
            className="mb-card__status"
            style={{ color: meta.color, background: meta.bg }}
          >
            {meta.label}
          </span>
          <p className="mb-card__booked-on">
            {new Date(booking.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short",
            })}
          </p>
        </div>

        <div className="mb-card__actions">
          {canAct && (
            <>
              <button className="mb-btn-confirm" onClick={() => onConfirm(booking._id)}>
                ✓ Confirm
              </button>
              <button className="mb-btn-cancel" onClick={() => onCancel(booking)}>
                ✕ Cancel
              </button>
            </>
          )}
          {canComplete && (
            <button className="mb-btn-complete" onClick={() => onConfirm(booking._id, "completed")}>
              ✓ Mark Complete
            </button>
          )}
          {!canAct && !canComplete && (
            <span className="mb-card__no-action">No actions available</span>
          )}
        </div>
      </div>

    </div>
  );
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function MerchantBookings() {
  const navigate = useNavigate();

  const merchantId   = localStorage.getItem("merchantId");
  const merchantName = localStorage.getItem("merchantName") || "My Restaurant";

  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setFilter]       = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    if (!merchantId) { navigate("/login"); return; }
    fetchBookings();
  }, [merchantId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/reservations/merchant/${merchantId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBookings(data.reservations || []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Confirm OR mark complete */
  const handleConfirm = async (id, overrideStatus = "confirmed") => {
    try {
      await axios.patch(
        `${API_URL}/api/reservations/${id}/status`,
        { status: overrideStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: overrideStatus } : b))
      );
      showToast(
        overrideStatus === "completed" ? "Booking marked as completed ✓" : "Booking confirmed ✓",
        "success"
      );
    } catch {
      showToast("Failed to update booking", "error");
    }
  };

  /* Cancel with reason */
  const handleCancelConfirm = async (id, reason) => {
    try {
      await axios.patch(
        `${API_URL}/api/reservations/${id}/status`,
        { status: "cancelled", cancelReason: reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "cancelled", cancelReason: reason } : b
        )
      );
      setCancelTarget(null);
      showToast("Booking cancelled", "info");
    } catch {
      showToast("Failed to cancel booking", "error");
      setCancelTarget(null);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* Stats */
  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  /* Filtered list */
  const filtered =
    activeFilter === "All"
      ? bookings
      : bookings.filter((b) => b.status === activeFilter.toLowerCase());

  return (
    <div className="mb-page">

      {/* ── SIDEBAR — pass navigate so home/menu/etc. works ── */}
      <MerchantSidebar
        activeTab="bookings"
        setActiveTab={(tab) => {
          // Map tab ids to their routes
          const routes = {
            home:      "/merchant/dashboard",
            foods:     "/merchant/foods",
            orders:    "/merchant/orders",
            analytics: "/merchant/analytics",
            settings:  "/merchant/settings",
          };
          if (routes[tab]) navigate(routes[tab]);
        }}
        merchantName={merchantName}
      />

      <main className="mb-main">

        {/* ── TOPBAR ── */}
        <MerchantTopbar />

        {/* ── CONTENT (padded area below topbar) ── */}
        <div className="mb-content">

        {/* ── HEADER ── */}
        <div className="mb-header">
          <div>
            <h1 className="mb-header__title">Table Reservations</h1>
            <p className="mb-header__sub">Manage all customer bookings for your restaurant</p>
          </div>
          <button className="mb-btn-refresh" onClick={fetchBookings}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── STATS BAR ── */}
        <div className="mb-stats">
          <div className="mb-stat">
            <span className="mb-stat__value">{stats.total}</span>
            <span className="mb-stat__label">Total</span>
          </div>
          <div className="mb-stat mb-stat--pending">
            <span className="mb-stat__value">{stats.pending}</span>
            <span className="mb-stat__label">Pending</span>
          </div>
          <div className="mb-stat mb-stat--confirmed">
            <span className="mb-stat__value">{stats.confirmed}</span>
            <span className="mb-stat__label">Confirmed</span>
          </div>
          <div className="mb-stat mb-stat--cancelled">
            <span className="mb-stat__value">{stats.cancelled}</span>
            <span className="mb-stat__label">Cancelled</span>
          </div>
          <div className="mb-stat mb-stat--completed">
            <span className="mb-stat__value">{stats.completed}</span>
            <span className="mb-stat__label">Completed</span>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="mb-filters">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`mb-filter ${activeFilter === tab ? "mb-filter--active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
              <span className="mb-filter__count">
                {tab === "All"
                  ? stats.total
                  : bookings.filter((b) => b.status === tab.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="mb-skeletons">
            {[1, 2, 3, 4].map((i) => <div key={i} className="mb-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mb-empty">
            <span>📅</span>
            <h3>No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} bookings</h3>
            <p>
              {activeFilter === "Pending"
                ? "No new reservations waiting for your approval."
                : "Reservations will appear here once customers book tables."}
            </p>
          </div>
        ) : (
          <div className="mb-list">
            {filtered.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                onConfirm={handleConfirm}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}
        </div> {/* end mb-content */}
      </main>

      {/* ── CANCEL MODAL ── */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`mb-toast mb-toast--${toast.type}`}>
          {toast.type === "success" && "✅"}
          {toast.type === "error"   && "❌"}
          {toast.type === "info"    && "ℹ️"}
          {toast.msg}
        </div>
      )}
    </div>
  );
}