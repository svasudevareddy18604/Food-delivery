export default function DeliveryDashboard() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0fdf4",
      fontFamily: "'Sora', sans-serif",
      gap: 16,
      padding: "2rem",
      textAlign: "center",
    }}>
      <span style={{ fontSize: "4rem" }}>🛵</span>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1c1917" }}>
        Delivery Dashboard
      </h1>
      <p style={{ color: "#78716c", maxWidth: 420, lineHeight: 1.6 }}>
        Welcome! Your account is approved. Dashboard coming soon.
      </p>
      <div style={{
        padding: "0.6rem 1.5rem",
        background: "#22c55e",
        color: "#fff",
        borderRadius: 99,
        fontWeight: 700,
        fontSize: "0.875rem",
      }}>
        Status: Approved ✓
      </div>
    </div>
  );
}