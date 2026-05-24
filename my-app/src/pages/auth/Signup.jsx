import "./Signup.css";

import { Link } from "react-router-dom";

function Signup() {
  return (
    <div className="signup-page">

      <div className="signup-box">

        <h1>Signup</h1>

        <input
          type="text"
          placeholder="Enter Name"
        />

        <input
          type="email"
          placeholder="Enter Email"
        />

        <input
          type="password"
          placeholder="Enter Password"
        />

        <button className="signup-btn">
          Signup
        </button>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;