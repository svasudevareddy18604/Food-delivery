export default function DeliveryReview() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fffbeb",
      fontFamily: "'Sora', sans-serif",
      gap: 16,
      padding: "2rem",
      textAlign: "center",
    }}>
      <span style={{ fontSize: "4rem" }}>⏳</span>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1c1917" }}>
        Application Under Review
      </h1>
      <p style={{ color: "#78716c", maxWidth: 420, lineHeight: 1.6 }}>
        Your delivery partner profile has been submitted successfully.
        Our team is reviewing your documents and will notify you within
        24–48 hours.
      </p>
      <div style={{
        marginTop: 8,
        padding: "0.6rem 1.5rem",
        background: "#f59e0b",
        color: "#1c1917",
        borderRadius: 99,
        fontWeight: 700,
        fontSize: "0.875rem",
      }}>
        Status: Pending Approval
      </div>
    </div>
  );
}