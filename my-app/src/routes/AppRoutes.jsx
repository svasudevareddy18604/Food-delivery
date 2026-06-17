import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ── Customer ── */
import Home                 from "../pages/customer/Home";
import RestaurantDetails    from "../pages/customer/RestaurantDetails";
import Cart                 from "../pages/customer/Cart";
import Checkout             from "../pages/customer/Checkout";
import OrderSuccess         from "../pages/customer/OrderSuccess";
import CustomerOrders       from "../pages/customer/CustomerOrders";
import Profile              from "../pages/customer/Profile";
import CustomerReservations from "../pages/customer/CustomerReservation";
import CustomerProtectedRoute from "./CustomerProtectedRoute";

/* ── Auth ── */
import Login          from "../pages/auth/Login";
import Signup         from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

/* ── Merchant ── */
import MerchantRegistration   from "../pages/merchant/MerchantRegistration";
import WaitingApproval        from "../pages/merchant/WaitingApproval";
import MerchantDashboard      from "../pages/merchant/MerchantDashboard";
import MerchantBookings       from "../pages/merchant/MerchantBookings";
import MerchantProtectedRoute from "./MerchantProtectedRoute";

/* ── Delivery ── */
import DeliveryRegistration   from "../pages/delivery boy/DeliveryRegistration";
import DeliveryReview         from "../pages/delivery boy/DeliveryReview";
import DeliveryRejected       from "../pages/delivery boy/DeliveryRejected";
import DeliveryDashboard      from "../pages/delivery boy/DeliveryDashboard";
import DeliveryPartnerOrders  from "../pages/delivery boy/DeliveryPartnerOrders";
import AvailableOrders        from "../pages/delivery boy/AvailableOrders";
import DeliveryProtectedRoute from "./DeliveryProtectedRoute";

/* ── Admin ── */
import AdminLayout    from "../pages/admin/AdminLayout";
import AdminHome      from "../pages/admin/Home";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminDelivery  from "../pages/admin/AdminDelivery";
import AdminSettings  from "../pages/admin/AdminSettings";
import AdminProtectedRoute from "./AdminProtectedRoute";
import Analytics from "../pages/admin/Analytics";
import Logs from "../pages/admin/Logs";

/* ══════════════════════════════
   404
══════════════════════════════ */
function NotFound() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff9f4", fontFamily: "'Plus Jakarta Sans', sans-serif", gap: 12 }}>
      <span style={{ fontSize: "4rem" }}>🍽</span>
      <h1 style={{ fontSize: "3rem", fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>404</h1>
      <p style={{ color: "#8b8fa8" }}>This page doesn't exist.</p>
      <a href="/" style={{ marginTop: 8, padding: "10px 24px", borderRadius: 100, background: "linear-gradient(135deg,#ff6b2b,#ff3b7a,#7c3aed)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: ".9rem" }}>
        Go Home
      </a>
    </div>
  );
}

/* ══════════════════════════════
   APP ROUTES
══════════════════════════════ */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Auth (public) ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Registration / status pages (public) ── */}
        <Route path="/merchant-registration"        element={<MerchantRegistration />} />
        <Route path="/waiting-approval"             element={<WaitingApproval />} />
        <Route path="/deliverypartner-registration" element={<DeliveryRegistration />} />
        <Route path="/delivery-review"              element={<DeliveryReview />} />
        <Route path="/delivery-rejected"            element={<DeliveryRejected />} />

        {/* ── Customer PUBLIC routes ── */}
        <Route path="/"                       element={<Home />} />
        <Route path="/restaurant/:merchantId" element={<RestaurantDetails />} />

        {/* ── Customer PROTECTED routes ── */}
        <Route path="/cart" element={<CustomerProtectedRoute><Cart /></CustomerProtectedRoute>} />
        <Route path="/checkout" element={<CustomerProtectedRoute><Checkout /></CustomerProtectedRoute>} />
        <Route path="/order-success/:orderId" element={<CustomerProtectedRoute><OrderSuccess /></CustomerProtectedRoute>} />
        <Route path="/my-orders" element={<CustomerProtectedRoute><CustomerOrders /></CustomerProtectedRoute>} />
        <Route path="/profile" element={<CustomerProtectedRoute><Profile /></CustomerProtectedRoute>} />
        <Route path="/reservations" element={<CustomerProtectedRoute><CustomerReservations /></CustomerProtectedRoute>} />

        {/* ── Merchant (ALL protected) ── */}
        <Route path="/merchant/dashboard" element={<MerchantProtectedRoute><MerchantDashboard /></MerchantProtectedRoute>} />
        <Route path="/merchant/bookings"  element={<MerchantProtectedRoute><MerchantBookings /></MerchantProtectedRoute>} />

        {/* ── Delivery (ALL protected) ── */}
        <Route path="/delivery/dashboard" element={<DeliveryProtectedRoute><DeliveryDashboard /></DeliveryProtectedRoute>} />
        <Route path="/partner/orders/available" element={<DeliveryProtectedRoute><AvailableOrders /></DeliveryProtectedRoute>} />
        <Route path="/partner/orders"    element={<DeliveryProtectedRoute><DeliveryPartnerOrders /></DeliveryProtectedRoute>} />
        {/* ── Admin — nested inside AdminLayout (ALL protected) ── */}
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index        element={<AdminHome />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="logs"      element={<Logs />} />
          <Route path="merchants" element={<AdminDashboard />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="delivery"  element={<AdminDelivery />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}