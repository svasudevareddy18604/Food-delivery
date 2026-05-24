import "./FoodItem.css";

import { useNavigate } from "react-router-dom";

function FoodItem(props) {

  const navigate = useNavigate();

  return (
    <div className="food-item">

      <img
        src={props.image}
        alt="food"
        className="food-image"
      />

      <div className="food-details">

        <h2>{props.name}</h2>

        <p>{props.description}</p>

        <div className="food-bottom">

          <span className="food-price">
            ₹ {props.price}
          </span>

          <button
            className="add-btn"
            onClick={() => navigate("/cart")}
          >
            Add
          </button>

        </div>

      </div>

    </div>
  );
}

export default FoodItem;