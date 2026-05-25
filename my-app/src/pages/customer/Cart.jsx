import {

  useEffect,
  useState

} from "react";

import {

  useNavigate

} from "react-router-dom";

import "./Cart.css";

function Cart() {

  const navigate =
    useNavigate();

  /* =========================
     STATES
  ========================= */

  const [cartItems, setCartItems] =
    useState([]);

  /* =========================
     LOAD CART
  ========================= */

  useEffect(() => {

    const cart =
      JSON.parse(

        localStorage.getItem("cart")
      ) || [];

    setCartItems(cart);

  }, []);

  /* =========================
     INCREASE QUANTITY
  ========================= */

  const increaseQuantity =
    (id) => {

      const updatedCart =
        cartItems.map((item) =>

          item._id === id

          ? {

              ...item,

              quantity:
                item.quantity + 1
            }

          : item
        );

      setCartItems(updatedCart);

      localStorage.setItem(

        "cart",

        JSON.stringify(updatedCart)
      );
    };

  /* =========================
     DECREASE QUANTITY
  ========================= */

  const decreaseQuantity =
    (id) => {

      const updatedCart =
        cartItems.map((item) =>

          item._id === id

          ? {

              ...item,

              quantity:
                item.quantity - 1
            }

          : item
        )

        .filter(
          (item) =>
            item.quantity > 0
        );

      setCartItems(updatedCart);

      localStorage.setItem(

        "cart",

        JSON.stringify(updatedCart)
      );
    };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem =
    (id) => {

      const updatedCart =
        cartItems.filter(

          (item) =>
            item._id !== id
        );

      setCartItems(updatedCart);

      localStorage.setItem(

        "cart",

        JSON.stringify(updatedCart)
      );
    };

  /* =========================
     TOTAL
  ========================= */

  const total =
    cartItems.reduce(

      (acc, item) =>

        acc +

        item.price *

        item.quantity,

      0
    );

  return (

    <div className="cart-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="cart-header">

        <h1>
          My Cart
        </h1>

        <p>
          Review your selected foods
        </p>

      </div>

      {/* =========================
          EMPTY CART
      ========================= */}

      {

        cartItems.length === 0 ? (

          <div className="empty-cart">

            <h2>
              Cart Is Empty
            </h2>

          </div>

        ) : (

          <>

            {/* =========================
                CART ITEMS
            ========================= */}

            <div className="cart-items">

              {

                cartItems.map((item) => (

                  <div

                    className="cart-card"

                    key={item._id}
                  >

                    {/* IMAGE */}

                    <img

                      src={

                        item.image

                        ? `http://localhost:5000${item.image}`

                        : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
                      }

                      alt={item.name}
                    />

                    {/* DETAILS */}

                    <div className="cart-info">

                      <h2>
                        {item.name}
                      </h2>

                      <p>
                        {item.category}
                      </p>

                      <h3>
                        ₹ {item.price}
                      </h3>

                      {/* QUANTITY */}

                      <div className="quantity-section">

                        <button

                          onClick={() =>
                            decreaseQuantity(
                              item._id
                            )
                          }
                        >

                          -

                        </button>

                        <span>

                          {item.quantity}

                        </span>

                        <button

                          onClick={() =>
                            increaseQuantity(
                              item._id
                            )
                          }
                        >

                          +

                        </button>

                      </div>

                      {/* REMOVE */}

                      <button

                        className="remove-btn"

                        onClick={() =>
                          removeItem(
                            item._id
                          )
                        }
                      >

                        Remove

                      </button>

                    </div>

                  </div>
                ))
              }

            </div>

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="cart-summary">

              <h2>
                Cart Summary
              </h2>

              <div className="summary-row">

                <span>
                  Total Items
                </span>

                <span>

                  {cartItems.length}

                </span>

              </div>

              <div className="summary-row">

                <span>
                  Delivery Fee
                </span>

                <span>
                  ₹ 40
                </span>

              </div>

              <div className="summary-row total-row">

                <span>
                  Grand Total
                </span>

                <span>

                  ₹ {total + 40}

                </span>

              </div>

              {/* CHECKOUT */}

              <button

                className="checkout-btn"

                onClick={() =>
                  navigate("/checkout")
                }
              >

                Proceed To Checkout

              </button>

            </div>

          </>
        )
      }

    </div>
  );
}

export default Cart;