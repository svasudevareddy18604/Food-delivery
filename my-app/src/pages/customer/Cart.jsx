import "./Cart.css";

import Header from "../../components/customer/Header";

import { useNavigate } from "react-router-dom";

function Cart() {

  const navigate = useNavigate();

  return (
    <div className="cart-page">

      <Header />

      <div className="cart-container">

        <h1>Your Cart</h1>

        <div className="cart-item">

          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
            alt="food"
          />

          <div className="cart-details">

            <h2>Chicken Burger</h2>

            <p>₹ 199</p>

          </div>

          <div className="quantity-section">

            <button>-</button>

            <span>1</span>

            <button>+</button>

          </div>

        </div>

        <div className="cart-total">

          <h2>Total: ₹ 199</h2>

          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed To Checkout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Cart;