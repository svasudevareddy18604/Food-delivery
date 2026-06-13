import { Navigate } from "react-router-dom";

export default function DeliveryProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "delivery") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
