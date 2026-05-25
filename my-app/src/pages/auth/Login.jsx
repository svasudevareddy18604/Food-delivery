import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

/* =========================
   TOAST SYSTEM
========================= */

let toastId = 0;

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type} ${t.exiting ? "toast--exit" : "toast--enter"}`}
        >
          <span className="toast__icon">
            {t.type === "success" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {t.type === "error" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
            )}
            {t.type === "info" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span className="toast__message">{t.message}</span>
          <button className="toast__close" onClick={() => removeToast(t.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
          <div className="toast__bar" />
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 400);
    }, duration);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  };

  return {
    toasts,
    removeToast,
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };
}

/* =========================
   FLOATING FOOD ICONS
========================= */

const FOOD_ICONS = ["🍕", "🍣", "🥗", "🍜", "🥐", "🍓", "🫐", "🥩", "🍷", "🧁"];

function FloatingFoods() {
  return (
    <div className="floating-foods" aria-hidden="true">
      {FOOD_ICONS.map((icon, i) => (
        <span key={i} className="food-bubble" style={{ "--i": i }}>
          {icon}
        </span>
      ))}
    </div>
  );
}

/* =========================
   MAIN LOGIN COMPONENT
========================= */

function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  /* =========================
     HANDLE LOGIN
  ========================= */

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields before continuing.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Signing you in…", 2500);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const user  = response.data.user;
      const token = response.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      if (user.role === "merchant") {
        localStorage.setItem("merchantId", user._id);
      }

      toast.success(`Welcome back! 🎉`);

      setTimeout(() => {
        if (user.role === "customer") navigate("/");
        else if (user.role === "delivery") navigate("/delivery/dashboard");
        else if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "merchant") {
          if (!user.registrationCompleted) navigate("/merchant-registration");
          else if (!user.isApproved) navigate("/waiting-approval");
          else navigate("/merchant/dashboard");
        }
      }, 1200);

    } catch (error) {
      console.error(error);
      if (error.response) {
        toast.error(error.response.data.message || "Login failed. Please try again.");
      } else {
        toast.error("Unable to reach the server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      <div className={`login-page ${mounted ? "login-page--mounted" : ""}`}>

        {/* ===== LEFT PANEL ===== */}
        <div className="login-left">
          <FloatingFoods />

          <div className="login-left__content">
            <div className="brand">
              <div className="brand__logo">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
                  <path d="M12 28c0-6 4-10 8-10s8 4 8 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M20 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 14l4-4 4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="brand__name">OmniRetail</span>
            </div>

            <div className="hero-text">
              <h1>
                Fresh from
                <br />
                <em>the kitchen</em>
                <br />
                to your door.
              </h1>
              <p>
                Premium ingredients, chef-crafted meals,
                delivered at the speed of hunger.
              </p>
            </div>

            <div className="stat-pills">
              <div className="pill">
                <strong>50K+</strong>
                <span>Happy Diners</span>
              </div>
              <div className="pill">
                <strong>200+</strong>
                <span>Restaurants</span>
              </div>
              <div className="pill">
                <strong>4.9★</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>

          <div className="left-decoration" aria-hidden="true">
            <div className="deco-ring deco-ring--1" />
            <div className="deco-ring deco-ring--2" />
            <div className="deco-ring deco-ring--3" />
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="login-right">
          <div className="login-card">

            <div className="card-header">
              <div className="card-badge">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 9.5l-4-2.5V5h1v2.7l3.5 2.1-.5.7z" />
                </svg>
                Quick Sign In
              </div>
              <h2>Welcome back</h2>
              <p>Sign in to your account and start ordering</p>
            </div>

            {/* DIVIDER */}
            <div className="social-divider">
              <span>or continue with email</span>
            </div>

            <div className="form-fields">

              {/* EMAIL */}
              <div className="field-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="M2 8l10 6 10-6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="field-group">
                <label htmlFor="password">
                  Password
                  <Link to="/forgot-password" className="forgot-link" tabIndex={-1}>
                    Forgot password?
                  </Link>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              className={`login-btn ${loading ? "login-btn--loading" : ""}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            {/* SIGNUP */}
            <p className="signup-prompt">
              New to OmniRetail?{" "}
              <Link to="/signup">Create a free account →</Link>
            </p>

            <p className="terms-note">
              By signing in you agree to our{" "}
              <a href="/terms">Terms of Service</a> &amp;{" "}
              <a href="/privacy">Privacy Policy</a>.
            </p>

          </div>
        </div>

      </div>
    </>
  );
}

export default Login;