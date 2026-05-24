import Header from "../../components/customer/Header";
import SearchBar from "../../components/customer/SearchBar";
import CategorySection from "../../components/customer/CategorySection";
import RestaurantCard from "../../components/customer/RestaurantCard";

import "./Home.css";

function Home() {
  return (
    <div className="home">
      <Header />
      <SearchBar />

      <CategorySection />

      <div className="restaurant-section">

        <RestaurantCard />

        <RestaurantCard />

        <RestaurantCard />

      </div>

    </div>
  );
}

export default Home;