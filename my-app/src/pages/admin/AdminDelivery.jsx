import { useEffect, useState } from "react";

const API = "http://localhost:5000";

/* ── Status badge ── */
function Badge({ status }) {
  const map = {
    Pending:  { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    Approved: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    Rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
    Blocked:  { bg: "#f3f4f6", color: "#374151", dot: "#6b7280" },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

/* ── Image viewer ── */
function DocImg({ src, label }) {
  if (!src) return null;
  const url = `${API}/${src.replace(/\\/g, "/")}`;
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
      <img
        src={url} alt={label}
        onClick={() => window.open(url, "_blank")}
        style={{ width: "100%", maxWidth: 260, borderRadius: 10, border: "1px solid #e5e7eb", cursor: "zoom-in", objectFit: "cover" }}
        onError={e => { e.target.style.display = "none"; }}
      />
    </div>
  );
}

/* ═══════════════════════════════
   PROFILE MODAL
═══════════════════════════════ */
function ProfileModal({ partner, onClose, onAction }) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const avatar = partner.profilePhoto
    ? `${API}/${partner.profilePhoto.replace(/\\/g, "/")}`
    : null;

  const Row = ({ label, val }) => (
    <div style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ minWidth: 160, fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#111827", fontWeight: 500, wordBreak: "break-all" }}>{val || "—"}</span>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 720,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,.2)",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#1e293b,#334155)",
          borderRadius: "20px 20px 0 0", padding: "28px 32px",
          display: "flex", alignItems: "center", gap: 20,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {avatar
            ? <img src={avatar} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,.3)" }} onError={e => e.target.style.display = "none"} />
            : <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b2b,#ff3b7a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>{partner.fullName?.[0]}</div>
          }
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 700 }}>{partner.fullName}</h2>
            <p style={{ color: "#94a3b8", margin: "2px 0 6px", fontSize: 13 }}>{partner.mobile} · {partner.email}</p>
            <Badge status={partner.isActive === false ? "Blocked" : partner.approvalStatus} />
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* LEFT */}
          <div>
            <Section title="Personal Details">
              <Row label="Full Name"   val={partner.fullName} />
              <Row label="Mobile"      val={partner.mobile} />
              <Row label="Email"       val={partner.email} />
              <Row label="DOB"         val={partner.dob} />
              <Row label="Gender"      val={partner.gender} />
            </Section>

            <Section title="Address">
              <Row label="House No"  val={partner.address?.houseNo} />
              <Row label="Street"    val={partner.address?.street} />
              <Row label="Area"      val={partner.address?.area} />
              <Row label="City"      val={partner.address?.city} />
              <Row label="State"     val={partner.address?.state} />
              <Row label="Pincode"   val={partner.address?.pincode} />
            </Section>

            <Section title="Work Details">
              <Row label="Work Type"      val={partner.workType} />
              <Row label="Working Hours"  val={partner.workingHours} />
              <Row label="Preferred Area" val={partner.preferredArea} />
              <Row label="Location Perm." val={partner.locationPermission ? "Granted" : "Denied"} />
            </Section>

            <Section title="Emergency Contact">
              <Row label="Name"     val={partner.emergencyName} />
              <Row label="Relation" val={partner.emergencyRelation} />
              <Row label="Phone"    val={partner.emergencyPhone} />
            </Section>

            <Section title="Bank Details">
              <Row label="Account Holder" val={partner.bankHolderName} />
              <Row label="Bank Name"      val={partner.bankName} />
              <Row label="Account No."    val={partner.accountNumber} />
              <Row label="IFSC Code"      val={partner.ifscCode} />
              <Row label="UPI ID"         val={partner.upiId} />
            </Section>

            <Section title="Vehicle Details">
              <Row label="Vehicle Type"   val={partner.vehicleType} />
              <Row label="Vehicle Number" val={partner.vehicleNumber} />
              <Row label="Aadhaar No."    val={partner.aadhaarNumber} />
              <Row label="DL Number"      val={partner.drivingLicenseNumber} />
            </Section>

            <Section title="Meta">
              <Row label="Partner ID"  val={partner._id} />
              <Row label="User ID"     val={partner.userId} />
              <Row label="Registered"  val={new Date(partner.createdAt).toLocaleString()} />
              <Row label="Last Login"  val={partner.lastLogin ? new Date(partner.lastLogin).toLocaleString() : "Never"} />
            </Section>

            {partner.rejectionReason && (
              <div style={{ background: "#fee2e2", borderRadius: 10, padding: "12px 16px", marginTop: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>Rejection Reason:</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7f1d1d" }}>{partner.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Documents */}
          <div>
            <Section title="Documents">
              <DocImg src={partner.profilePhoto}       label="Profile Photo" />
              <DocImg src={partner.aadhaarFront}       label="Aadhaar Front" />
              <DocImg src={partner.aadhaarBack}        label="Aadhaar Back" />
              <DocImg src={partner.drivingLicenseImage} label="Driving License" />
              <DocImg src={partner.vehicleRC}          label="Vehicle RC" />
            </Section>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 32px 28px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {partner.approvalStatus === "Pending" && (
            <>
              <ActionBtn color="#10b981" onClick={() => onAction(partner._id, "approve")}>✓ Approve</ActionBtn>
              <ActionBtn color="#ef4444" onClick={() => setShowReject(v => !v)}>✕ Reject</ActionBtn>
            </>
          )}
          {partner.approvalStatus === "Approved" && (
            <ActionBtn color="#ef4444" onClick={() => setShowReject(v => !v)}>✕ Reject</ActionBtn>
          )}
          {partner.isActive !== false
            ? <ActionBtn color="#6b7280" onClick={() => onAction(partner._id, "block")}>⊘ Block</ActionBtn>
            : <ActionBtn color="#f59e0b" onClick={() => onAction(partner._id, "unblock")}>↺ Unblock</ActionBtn>
          }
        </div>

        {showReject && (
          <div style={{ padding: "0 32px 28px" }}>
            <textarea
              placeholder="Enter rejection reason..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              style={{ width: "100%", borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "10px 14px", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <ActionBtn color="#ef4444" onClick={() => { onAction(partner._id, "reject", reason); setShowReject(false); }}>
              Confirm Rejection
            </ActionBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b7280" }}>{title}</p>
      {children}
    </div>
  );
}

function ActionBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 20px", borderRadius: 10, border: "none",
      background: color, color: "#fff", fontWeight: 600, fontSize: 13,
      cursor: "pointer", transition: "opacity .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════
   MAIN COMPONENT
═══════════════════════════════ */
export default function AdminDelivery() {
  const [partners, setPartners]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState(null);

  /* ── Fetch ── */
  const fetchPartners = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/delivery-partners`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPartners(data.partners || data || []);
    } catch (e) {
      showToast("Failed to load delivery partners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  /* ── Toast ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Actions ── */
  const handleAction = async (id, action, reason = "") => {
    const endpointMap = {
      approve: `/api/admin/delivery-partners/${id}/approve`,
      reject:  `/api/admin/delivery-partners/${id}/reject`,
      block:   `/api/admin/delivery-partners/${id}/block`,
      unblock: `/api/admin/delivery-partners/${id}/unblock`,
    };

    try {
      const res = await fetch(`${API}${endpointMap[action]}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(action === "reject" ? { rejectionReason: reason } : {}),
      });

      if (!res.ok) throw new Error();

      showToast(`Partner ${action}d successfully`);
      setSelected(null);
      fetchPartners();
    } catch {
      showToast(`Failed to ${action} partner`, "error");
    }
  };

  /* ── Filter ── */
  const FILTERS = ["All", "Pending", "Approved", "Rejected", "Blocked"];

  const filtered = partners.filter(p => {
    const status = p.isActive === false ? "Blocked" : p.approvalStatus;
    const matchFilter = filter === "All" || status === filter;
    const matchSearch = !search ||
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile?.includes(search) ||
      p.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All"
      ? partners.length
      : partners.filter(p => (p.isActive === false ? "Blocked" : p.approvalStatus) === f).length;
    return acc;
  }, {});

  /* ── Render ── */
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "#10b981",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontWeight: 600, fontSize: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,.15)",
          animation: "slideIn .2s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Delivery Partners</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
          Manage registrations, approvals, and access control
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 16px", borderRadius: 100, border: "1.5px solid",
            borderColor: filter === f ? "#1e293b" : "#e2e8f0",
            background: filter === f ? "#1e293b" : "#fff",
            color: filter === f ? "#fff" : "#475569",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {f} <span style={{ opacity: .7 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: "relative", maxWidth: 360 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔍</span>
        <input
          placeholder="Search by name, mobile, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 }}>Loading partners…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 }}>No partners found.</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Partner", "Mobile", "Vehicle", "Work Type", "Status", "Registered", "Actions"].map(h => (
                  <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const status = p.isActive === false ? "Blocked" : p.approvalStatus;
                const avatarUrl = p.profilePhoto ? `${API}/${p.profilePhoto.replace(/\\/g, "/")}` : null;
                return (
                  <tr key={p._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Partner */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {avatarUrl
                          ? <img src={avatarUrl} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} onError={e => e.target.style.display = "none"} />
                          : <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b2b,#ff3b7a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>{p.fullName?.[0]}</div>
                        }
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{p.fullName}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: 14, color: "#334155" }}>{p.mobile}</td>
                    <td style={{ padding: "14px 18px", fontSize: 14, color: "#334155" }}>
                      {p.vehicleType} <span style={{ color: "#94a3b8" }}>· {p.vehicleNumber}</span>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: "#334155" }}>{p.workType}</td>
                    <td style={{ padding: "14px 18px" }}><Badge status={status} /></td>
                    <td style={{ padding: "14px 18px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => setSelected(p)} style={btnStyle("#1e293b")}>View</button>
                        {p.approvalStatus === "Pending" && p.isActive !== false && (
                          <>
                            <button onClick={() => handleAction(p._id, "approve")} style={btnStyle("#10b981")}>✓</button>
                            <button onClick={() => { setSelected(p); }} style={btnStyle("#ef4444")}>✕</button>
                          </>
                        )}
                        {p.isActive !== false
                          ? <button onClick={() => handleAction(p._id, "block")}   style={btnStyle("#6b7280")}>⊘</button>
                          : <button onClick={() => handleAction(p._id, "unblock")} style={btnStyle("#f59e0b")}>↺</button>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <ProfileModal
          partner={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}

      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

function btnStyle(bg) {
  return {
    padding: "5px 12px", borderRadius: 7, border: "none",
    background: bg, color: "#fff", fontSize: 12, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
  };
}