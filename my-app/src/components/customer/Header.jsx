import "./Header.css";

import { useNavigate } from "react-router-dom";

function Header() {

  const navigate = useNavigate();

  return (
    <header className="header">

      <div className="logo">
        OmniRetail
      </div>

      <div className="location">
        📍 Chennai
      </div>

      <button
        className="login-btn"
        onClick={() => navigate("/login")}
      >
        Login
      </button>

    </header>
  );
}

export default Header;