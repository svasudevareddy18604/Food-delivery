import { useNavigate } from "react-router-dom";

export default function DeliveryRejected() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff1f2",
      fontFamily: "'Sora', sans-serif",
      gap: 16,
      padding: "2rem",
      textAlign: "center",
    }}>
      <span style={{ fontSize: "4rem" }}>❌</span>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1c1917" }}>
        Application Rejected
      </h1>
      <p style={{ color: "#78716c", maxWidth: 420, lineHeight: 1.6 }}>
        Unfortunately your delivery partner application was not approved.
        This may be due to incomplete documents or eligibility criteria.
        Please re-register with correct details.
      </p>
      <button
        onClick={() => navigate("/delivery-registration")}
        style={{
          marginTop: 8,
          padding: "0.7rem 1.75rem",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 99,
          fontWeight: 700,
          fontSize: "0.875rem",
          cursor: "pointer",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        Re-Register
      </button>
    </div>
  );
}