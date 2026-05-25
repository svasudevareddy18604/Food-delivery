import {

  useEffect,
  useState

} from "react";

import {

  useNavigate,
  useParams

} from "react-router-dom";

import axios
from "axios";

import "./RestaurantDetails.css";

function RestaurantDetails() {

  /* =========================
     NAVIGATION
  ========================= */

  const navigate =
    useNavigate();

  /* =========================
     GET PARAMS
  ========================= */

  const { merchantId } =
    useParams();

  /* =========================
     STATES
  ========================= */

  const [foods, setFoods] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     FETCH FOODS
  ========================= */

  useEffect(() => {

    if (merchantId) {

      fetchFoods();
    }

  }, [merchantId]);

  const fetchFoods =
    async () => {

      try {

        const response =
          await axios.get(

            `http://localhost:5000/api/merchant-food/foods/${merchantId}`
          );

        setFoods(

          response.data.foods || []
        );

      } catch (error) {

        console.log(
          "Food Fetch Error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart =
    (food) => {

      let cart =
        JSON.parse(

          localStorage.getItem("cart")
        ) || [];

      const existingFood =
        cart.find(

          (item) =>
            item._id === food._id
        );

      if (existingFood) {

        existingFood.quantity += 1;

      } else {

        cart.push({

          ...food,

          quantity: 1
        });
      }

      localStorage.setItem(

        "cart",

        JSON.stringify(cart)
      );

      alert(
        "Food Added To Cart"
      );

      navigate("/cart");
    };

  return (

    <div className="restaurant-details-page">

      {/* HEADER */}

      <div className="restaurant-header">

        <h1>
          Restaurant Foods
        </h1>

        <p>
          Explore delicious meals
        </p>

      </div>

      {/* FOODS */}

      {

        loading ? (

          <div className="loading">

            <h2>
              Loading Foods...
            </h2>

          </div>

        ) : foods.length === 0 ? (

          <div className="empty-foods">

            <h2>
              No Foods Available
            </h2>

          </div>

        ) : (

          <div className="food-grid">

            {

              foods.map((food) => (

                <div

                  className="food-card"

                  key={food._id}
                >

                  {/* IMAGE */}

                  <img

                    src={

                      food.image

                      ? `http://localhost:5000${food.image}`

                      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
                    }

                    alt={food.name}
                  />

                  {/* DETAILS */}

                  <div className="food-info">

                    <h3>
                      {food.name}
                    </h3>

                    <p className="food-category">

                      {food.category}

                    </p>

                    <p className="food-description">

                      {food.description}

                    </p>

                    <div className="food-bottom">

                      <span>

                        ₹ {food.price}

                      </span>

                      <button

                        onClick={() =>
                          addToCart(food)
                        }
                      >

                        Add To Cart

                      </button>

                    </div>

                  </div>

                </div>
              ))
            }

          </div>
        )
      }

    </div>
  );
}

export default RestaurantDetails;