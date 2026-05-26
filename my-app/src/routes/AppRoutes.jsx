import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ── Customer ── */
import Home              from "../pages/customer/Home";
import RestaurantDetails from "../pages/customer/RestaurantDetails";
import Cart              from "../pages/customer/Cart";
import Checkout          from "../pages/customer/Checkout";
import OrderSuccess      from "../pages/customer/OrderSuccess";
import CustomerOrders    from "../pages/customer/CustomerOrders";

/* ── Auth ── */
import Login             from "../pages/auth/Login";
import Signup            from "../pages/auth/Signup";

/* ── Merchant ── */
import MerchantRegistration from "../pages/merchant/MerchantRegistration";
import WaitingApproval   from "../pages/merchant/WaitingApproval";
import MerchantDashboard from "../pages/merchant/MerchantDashboard";

/* ── Admin ── */
import AdminLayout       from "../pages/admin/AdminLayout";
import AdminHome         from "../pages/admin/Home";
import AdminDashboard    from "../pages/admin/AdminDashboard";
import AdminCustomers    from "../pages/admin/AdminCustomers";

/* ── 404 ── */
function NotFound() {
  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#fff9f4", fontFamily: "'Plus Jakarta Sans', sans-serif", gap: 12
    }}>
      <span style={{ fontSize: "4rem" }}>🍽</span>
      <h1 style={{ fontSize: "3rem", fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>404</h1>
      <p style={{ color: "#8b8fa8" }}>This page doesn't exist.</p>
      <a href="/" style={{
        marginTop: 8, padding: "10px 24px", borderRadius: 100,
        background: "linear-gradient(135deg,#ff6b2b,#ff3b7a,#7c3aed)",
        color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: ".9rem"
      }}>Go Home</a>
    </div>
  );
}

/* ── Routes ── */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Customer ── */}
        <Route path="/"                       element={<Home />} />
        <Route path="/restaurant/:merchantId" element={<RestaurantDetails />} />
        <Route path="/cart"                   element={<Cart />} />
        <Route path="/my-orders"              element={<CustomerOrders />} />
        <Route path="/checkout"               element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />

        {/* ── Auth ── */}
        <Route path="/login"                  element={<Login />} />
        <Route path="/signup"                 element={<Signup />} />

        {/* ── Merchant ── */}
        <Route path="/merchant-registration"  element={<MerchantRegistration />} />
        <Route path="/waiting-approval"       element={<WaitingApproval />} />
        <Route path="/merchant/dashboard"     element={<MerchantDashboard />} />

        {/* ── Admin — nested inside AdminLayout (sidebar + outlet) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index              element={<AdminHome />} />
          <Route path="merchants"   element={<AdminDashboard />} />
          <Route path="customers"   element={<AdminCustomers />} />
          {/* add more admin pages here as you build them */}
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}