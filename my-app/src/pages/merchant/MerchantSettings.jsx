import { useEffect, useState, useRef } from "react";
import "./MerchantSettings.css";

const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/api/merchant-settings`;

const TYPE_OPTIONS = [
  { value: "veg",    label: "🌿 Pure Veg" },
  { value: "nonveg", label: "🍖 Non Veg" },
  { value: "both",   label: "🍽 Veg & Non Veg" },
];

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function Avatar({ src, name }) {
  if (src) return <img src={`${API_URL}${src}`} alt={name} className="ms-avatar__img" />;
  const initials = (name || "R").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return <div className="ms-avatar__fallback">{initials}</div>;
}

export default function MerchantSettings() {
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const fileRef = useRef();

  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [togglingTable, setTogglingTable] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");

  const [form, setForm]       = useState({});
  const [imgFile, setImg]     = useState(null);
  const [preview, setPreview] = useState(null);

  /* ── Fetch merchant data ── */
  useEffect(() => {
    if (!user._id) return;
    fetch(`${API}/settings/${user._id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setMerchant(d.merchant); setForm(d.merchant); }
        else setError("Failed to load settings.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [user._id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ── Save edits ── */
  const handleSave = async () => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const fd = new FormData();
      ["restaurantName","phoneNumber","restaurantAddress",
       "restaurantType","openingTime","closingTime",
       "tableReservationEnabled","totalTables","maxGuestsPerTable",
       "reservationSlotDuration","advanceBookingDays"
      ].forEach(k => {
        if (form[k] !== undefined) fd.append(k, form[k]);
      });
      if (imgFile) fd.append("restaurantImage", imgFile);

      const res  = await fetch(`${API}/settings/${user._id}`, { method: "PUT", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMerchant(data.merchant);
      localStorage.setItem("user", JSON.stringify({ ...user, ...data.merchant }));
      setEditing(false); setImg(null); setPreview(null);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally { setSaving(false); }
  };

  /* ── Toggle online / offline ── */
  const handleToggle = async () => {
    setToggling(true);
    try {
      const res  = await fetch(`${API}/settings/${user._id}/online`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isOnline: !merchant.isOnline }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMerchant(p => ({ ...p, isOnline: data.isOnline }));
    } catch (err) {
      setError(err.message || "Toggle failed.");
    } finally { setToggling(false); }
  };

  /* ── Toggle table reservation ── */
  const handleTableToggle = async () => {
    setTogglingTable(true);
    try {
      const res = await fetch(`${API}/settings/${user._id}/table-reservation`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tableReservationEnabled: !merchant.tableReservationEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMerchant(p => ({ ...p, tableReservationEnabled: data.tableReservationEnabled }));
    } catch (err) {
      setError(err.message || "Toggle failed.");
    } finally { setTogglingTable(false); }
  };

  const cancelEdit = () => {
    setForm(merchant);
    setImg(null); setPreview(null);
    setEditing(false);
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="ms-loading">
      <div className="ms-spinner" />
      <p>Loading settings…</p>
    </div>
  );

  if (!merchant) return (
    <div className="ms-loading">
      <p className="ms-error-text">⚠️ {error || "Could not load merchant data."}</p>
    </div>
  );

  const typeLabel = TYPE_OPTIONS.find(t => t.value === merchant.restaurantType)?.label || merchant.restaurantType || "—";

  /* ── Render ── */
  return (
    <div className="ms-wrap">

      {/* ── Toast messages ── */}
      {success && <div className="ms-toast ms-toast--success">✅ {success}</div>}
      {error   && <div className="ms-toast ms-toast--error">⚠️ {error}</div>}

      {/* ══════════════════════════════
          PROFILE HERO CARD
      ══════════════════════════════ */}
      <div className="ms-hero">
        <div className="ms-avatar">
          <Avatar src={merchant.restaurantImage} name={merchant.restaurantName} />
        </div>

        <div className="ms-hero__info">
          <h1 className="ms-hero__name">{merchant.restaurantName || "Your Restaurant"}</h1>
          <p className="ms-hero__email">{merchant.email}</p>
          <div className="ms-hero__tags">
            <span className={`ms-tag ${merchant.isApproved ? "ms-tag--green" : "ms-tag--amber"}`}>
              {merchant.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
            </span>
            <span className="ms-tag ms-tag--gray">
              ID: {merchant._id?.slice(-8).toUpperCase()}
            </span>
            <span className="ms-tag ms-tag--blue">
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Online / Offline toggle */}
        <div className="ms-online-wrap">
          <span className="ms-online__label">
            {merchant.isOnline ? "🟢 Online" : "🔴 Offline"}
          </span>
          <button
            className={`ms-toggle ${merchant.isOnline ? "ms-toggle--on" : ""} ${toggling ? "ms-toggle--busy" : ""}`}
            onClick={handleToggle}
            disabled={toggling}
            title={merchant.isOnline ? "Go Offline" : "Go Online"}
          >
            <span className="ms-toggle__knob" />
          </button>
          <span className="ms-online__hint">
            {merchant.isOnline ? "Accepting orders" : "Not accepting orders"}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════
          TABLE RESERVATION SECTION
      ══════════════════════════════ */}
      <div className="ms-section ms-section--table">
        <div className="ms-section__head">
          <div className="ms-section__head-left">
            <span className="ms-section__icon">🪑</span>
            <div>
              <h2>Table Reservations</h2>
              <p className="ms-section__sub">
                {merchant.tableReservationEnabled
                  ? "Customers can book tables at your restaurant"
                  : "Table bookings are currently disabled"}
              </p>
            </div>
          </div>
          <div className="ms-table-toggle-wrap">
            <span className={`ms-table-status ${merchant.tableReservationEnabled ? "ms-table-status--on" : "ms-table-status--off"}`}>
              {merchant.tableReservationEnabled ? "Enabled" : "Disabled"}
            </span>
            <button
              className={`ms-toggle ms-toggle--lg ${merchant.tableReservationEnabled ? "ms-toggle--on" : ""} ${togglingTable ? "ms-toggle--busy" : ""}`}
              onClick={handleTableToggle}
              disabled={togglingTable}
              title={merchant.tableReservationEnabled ? "Disable Table Reservations" : "Enable Table Reservations"}
            >
              <span className="ms-toggle__knob" />
            </button>
          </div>
        </div>

        {/* Table reservation details — shown only when enabled */}
        {merchant.tableReservationEnabled && !editing && (
          <div className="ms-table-info">
            <div className="ms-info-grid ms-info-grid--table">
              <div className="ms-info-card">
                <span className="ms-info-card__icon">🪑</span>
                <div>
                  <p className="ms-info-card__label">Total Tables</p>
                  <p className="ms-info-card__value">{merchant.totalTables || "—"}</p>
                </div>
              </div>

              <div className="ms-info-card">
                <span className="ms-info-card__icon">👥</span>
                <div>
                  <p className="ms-info-card__label">Max Guests / Table</p>
                  <p className="ms-info-card__value">{merchant.maxGuestsPerTable || "—"}</p>
                </div>
              </div>

              <div className="ms-info-card">
                <span className="ms-info-card__icon">⏱</span>
                <div>
                  <p className="ms-info-card__label">Slot Duration</p>
                  <p className="ms-info-card__value">
                    {merchant.reservationSlotDuration ? `${merchant.reservationSlotDuration} min` : "—"}
                  </p>
                </div>
              </div>

              <div className="ms-info-card">
                <span className="ms-info-card__icon">📅</span>
                <div>
                  <p className="ms-info-card__label">Advance Booking</p>
                  <p className="ms-info-card__value">
                    {merchant.advanceBookingDays ? `Up to ${merchant.advanceBookingDays} days` : "—"}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="ms-btn ms-btn--outline ms-btn--sm"
              onClick={() => setEditing(true)}
              style={{ marginTop: "1rem" }}
            >
              ✏️ Edit Reservation Settings
            </button>
          </div>
        )}

        {/* Placeholder when disabled */}
        {!merchant.tableReservationEnabled && (
          <div className="ms-table-disabled-hint">
            <p>Toggle the switch above to start accepting table reservations. You can then configure the number of tables, guest limits, and booking slots.</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          INFO GRID (View mode)
      ══════════════════════════════ */}
      {!editing && (
        <div className="ms-section">
          <div className="ms-section__head">
            <h2>Restaurant Details</h2>
            <button className="ms-btn ms-btn--outline" onClick={() => setEditing(true)}>
              ✏️ Edit Details
            </button>
          </div>

          <div className="ms-info-grid">

            <div className="ms-info-card">
              <span className="ms-info-card__icon">🏷</span>
              <div>
                <p className="ms-info-card__label">Restaurant Name</p>
                <p className="ms-info-card__value">{merchant.restaurantName || "—"}</p>
              </div>
            </div>

            <div className="ms-info-card">
              <span className="ms-info-card__icon">📞</span>
              <div>
                <p className="ms-info-card__label">Phone Number</p>
                <p className="ms-info-card__value">{merchant.phoneNumber || "—"}</p>
              </div>
            </div>

            <div className="ms-info-card ms-info-card--full">
              <span className="ms-info-card__icon">📍</span>
              <div>
                <p className="ms-info-card__label">Address</p>
                <p className="ms-info-card__value">{merchant.restaurantAddress || "—"}</p>
              </div>
            </div>

            <div className="ms-info-card">
              <span className="ms-info-card__icon">🍽</span>
              <div>
                <p className="ms-info-card__label">Restaurant Type</p>
                <p className="ms-info-card__value">{typeLabel}</p>
              </div>
            </div>

            <div className="ms-info-card">
              <span className="ms-info-card__icon">🕐</span>
              <div>
                <p className="ms-info-card__label">Opening Hours</p>
                <p className="ms-info-card__value">
                  {formatTime(merchant.openingTime)} — {formatTime(merchant.closingTime)}
                </p>
              </div>
            </div>

            <div className="ms-info-card">
              <span className="ms-info-card__icon">📅</span>
              <div>
                <p className="ms-info-card__label">Registered On</p>
                <p className="ms-info-card__value">
                  {new Date(merchant.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>

            <div className="ms-info-card">
              <span className="ms-info-card__icon">🆔</span>
              <div>
                <p className="ms-info-card__label">Merchant ID</p>
                <p className="ms-info-card__value ms-info-card__value--mono">{merchant._id}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════
          EDIT FORM
      ══════════════════════════════ */}
      {editing && (
        <div className="ms-section">
          <div className="ms-section__head">
            <h2>Edit Details</h2>
            <button className="ms-btn ms-btn--ghost" onClick={cancelEdit}>✕ Cancel</button>
          </div>

          {/* Image upload */}
          <div
            className="ms-img-upload"
            onClick={() => fileRef.current.click()}
          >
            {(preview || merchant.restaurantImage) ? (
              <img
                src={preview || `${API_URL}${merchant.restaurantImage}`}
                alt="Preview"
                className="ms-img-upload__preview"
              />
            ) : (
              <div className="ms-img-upload__placeholder">
                <span>📷</span>
                <p>Upload Restaurant Photo</p>
                <small>JPG, PNG or WebP · Max 5 MB</small>
              </div>
            )}
            <div className="ms-img-upload__overlay">Change Photo</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImage}
            />
          </div>

          {/* Fields grid */}
          <div className="ms-edit-grid">

            <div className="ms-field">
              <label>Restaurant Name</label>
              <input
                type="text"
                value={form.restaurantName || ""}
                onChange={e => set("restaurantName", e.target.value)}
                placeholder="e.g. Spice Garden"
              />
            </div>

            <div className="ms-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber || ""}
                onChange={e => set("phoneNumber", e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="ms-field ms-field--full">
              <label>Address</label>
              <textarea
                value={form.restaurantAddress || ""}
                onChange={e => set("restaurantAddress", e.target.value)}
                placeholder="Full address with street, city, pincode"
              />
            </div>

            <div className="ms-field ms-field--full">
              <label>Restaurant Type</label>
              <div className="ms-type-btns">
                {TYPE_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`ms-type-btn ${form.restaurantType === t.value ? "ms-type-btn--active" : ""}`}
                    onClick={() => set("restaurantType", t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ms-field">
              <label>Opening Time</label>
              <input
                type="time"
                value={form.openingTime || ""}
                onChange={e => set("openingTime", e.target.value)}
              />
            </div>

            <div className="ms-field">
              <label>Closing Time</label>
              <input
                type="time"
                value={form.closingTime || ""}
                onChange={e => set("closingTime", e.target.value)}
              />
            </div>

          </div>

          {/* ── Table Reservation Edit Fields ── */}
          {form.tableReservationEnabled && (
            <>
              <div className="ms-edit-divider">
                <span>🪑 Table Reservation Settings</span>
              </div>

              <div className="ms-edit-grid">

                <div className="ms-field">
                  <label>Total Tables</label>
                  <input
                    type="number"
                    min="1"
                    value={form.totalTables || ""}
                    onChange={e => set("totalTables", e.target.value)}
                    placeholder="e.g. 20"
                  />
                </div>

                <div className="ms-field">
                  <label>Max Guests per Table</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxGuestsPerTable || ""}
                    onChange={e => set("maxGuestsPerTable", e.target.value)}
                    placeholder="e.g. 4"
                  />
                </div>

                <div className="ms-field">
                  <label>Slot Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={form.reservationSlotDuration || ""}
                    onChange={e => set("reservationSlotDuration", e.target.value)}
                    placeholder="e.g. 60"
                  />
                  <small className="ms-field__hint">How long each reservation lasts</small>
                </div>

                <div className="ms-field">
                  <label>Advance Booking Days</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={form.advanceBookingDays || ""}
                    onChange={e => set("advanceBookingDays", e.target.value)}
                    placeholder="e.g. 7"
                  />
                  <small className="ms-field__hint">How many days ahead customers can book</small>
                </div>

              </div>
            </>
          )}

          {/* Save */}
          <div className="ms-save-row">
            <button className="ms-btn ms-btn--ghost" onClick={cancelEdit}>Cancel</button>
            <button
              className={`ms-btn ms-btn--primary ${saving ? "ms-btn--loading" : ""}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><span className="ms-spin" /> Saving…</> : "💾 Save Changes"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}