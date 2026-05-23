import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <nav className="navbar">

        <h2 className="logo">
          Foodie
        </h2>

        <button className="login-btn">
          Login
        </button>

      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">

        <div className="hero-left">

          <h1>
            Fast & Fresh <br />
            Food Delivery
          </h1>

          <p>
            Delicious meals delivered to your doorstep.
          </p>

          <button className="order-btn">
            Order Now
          </button>

        </div>

        <div className="hero-right">

          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
            alt="food"
          />

        </div>

      </section>

    </div>
  )
}

export default Dashboard