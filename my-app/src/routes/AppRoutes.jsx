import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/customer/Home";
import RestaurantDetails from "../pages/customer/RestaurantDetails";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import OrderSuccess from "../pages/customer/OrderSuccess";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/restaurant"
          element={<RestaurantDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
  path="/login"
  element={<Login />}
/>

<Route
  path="/signup"
  element={<Signup />}
/>

      </Routes>



    </BrowserRouter>
  );
}

export default AppRoutes;