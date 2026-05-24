import "./Login.css";

import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login-page">

      <div className="login-box">

        <h1>Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
        />

        <input
          type="password"
          placeholder="Enter Password"
        />

        <button className="login-submit-btn">
          Login
        </button>

        <p>
          Don't have an account?
          <Link to="/signup"> Signup</Link>
        </p>

      </div>

    </div>
  );
}

export default Login;