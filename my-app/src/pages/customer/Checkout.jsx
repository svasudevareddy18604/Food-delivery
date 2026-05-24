import "./Checkout.css";

import Header from "../../components/customer/Header";

import { useNavigate } from "react-router-dom";

function Checkout() {

  const navigate = useNavigate();

  return (
    <div className="checkout-page">

      <Header />

      <div className="checkout-container">

        <h1>Checkout</h1>

        <div className="checkout-box">

          <input
            type="text"
            placeholder="Full Name"
          />

          <input
            type="text"
            placeholder="Phone Number"
          />

          <textarea
            placeholder="Delivery Address"
          ></textarea>

          <div className="payment-section">

            <h2>Payment Method</h2>

            <button>Cash On Delivery</button>

            <button>UPI</button>

            <button>Card</button>

          </div>

          <div className="place-order-section">

            <h2>Total: ₹ 199</h2>

            <button
              className="place-order-btn"
              onClick={() => navigate("/order-success")}
            >
              Place Order
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;