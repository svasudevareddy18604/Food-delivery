import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "../../components/admin/sidebar";
import Header from "../../components/admin/header";

import Home from "./Home";
import AdminDashboard from "./AdminDashboard";
import AdminCustomers from "./AdminCustomers";
import AdminDelivery from "./AdminDelivery";
import AdminSettings from "./AdminSettings";

import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-page">
      <Sidebar />

      <div className="admin-main">
        <Routes>

          {/* Dashboard */}
          <Route
            path="/"
            element={
              <>
                <Header title="Dashboard" />
                <Home />
              </>
            }
          />

          {/* Merchant Approvals */}
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

          {/* Delivery Partners */}
          <Route
            path="/delivery"
            element={
              <>
                <Header title="Delivery Partners" />
                <AdminDelivery />
              </>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <>
                <Header title="Website Settings" />
                <AdminSettings />
              </>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/admin" replace />}
          />

        </Routes>
      </div>
    </div>
  );
}