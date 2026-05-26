import './App.css'

function App() {
  return (
    <div className="container">

      <nav className="navbar">
        <h2>Foodie</h2>

        <button>Login</button>
      </nav>

      <section className="hero">

        <div className="left">

          <h1>
            Fast Food <br />
            Delivery
          </h1>

          <p>
            Order tasty food from your favorite restaurants.
          </p>

          <button className="order-btn">
            Order Now
          </button>

        </div>

        <div className="right">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
            alt="food"
          />
        </div>

      </section>

    </div>
  )
}

export default App
