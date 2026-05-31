import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar        from "../../components/admin/sidebar";
import Header         from "../../components/admin/header";
import Home           from "./Home";
import AdminDashboard from "./AdminDashboard";
import AdminCustomers from "./AdminCustomers";
import AdminDelivery  from "./AdminDelivery";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-page">
      <Sidebar />

      <div className="admin-main">
        <Routes>

          {/* Overview */}
          <Route
            path="/"
            element={
              <>
                <Header title="Dashboard" />
                <Home />
              </>
            }
          />

          {/* Merchants */}
          <Route
            path="/merchants"
            element={
              <>
                <Header title="Merchant Approvals" />
                <AdminDashboard />
              </>
            }
          />

          {/* Customers */}
          <Route
            path="/customers"
            element={
              <>
                <Header title="Customers" />
                <AdminCustomers />
              </>
            }
          />

          {/* Delivery Boys */}
          <Route
            path="/delivery"
            element={
              <>
                <Header title="Delivery Partners" />
                <AdminDelivery />
              </>
            }
          />

          {/* Fallback → redirect to /admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />

        </Routes>
      </div>
    </div>
  );
}