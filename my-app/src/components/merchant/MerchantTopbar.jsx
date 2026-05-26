import "./MerchantTopbar.css";
import { useEffect, useState } from "react";

function MerchantTopbar() {
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchant();
  }, []);

  const fetchMerchant = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?._id) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/merchant-settings/settings/${user._id}`
      );
      const data = await response.json();

      if (data.success) {
        setMerchant(data.merchant);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/merchant-settings/settings/${merchant._id}/online`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: !merchant.isOnline }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setMerchant({ ...merchant, isOnline: data.isOnline });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const restaurantName =
    merchant?.restaurantName || merchant?.name || "My Restaurant";

  if (loading) {
    return (
      <div className="topbar">
        <div className="topbar__marquee-wrap">
          <span className="topbar__marquee-text">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="topbar">
      {/* LEFT — date */}
      <div className="topbar__date">
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </div>

      {/* CENTER — scrolling name */}
      <div className="topbar__marquee-wrap">
        <div className="topbar__marquee">
          <span>{restaurantName}</span>
          <span>{restaurantName}</span>
        </div>
      </div>

      {/* RIGHT — status toggle */}
      <button
        className={`topbar__status ${merchant?.isOnline ? "topbar__status--on" : "topbar__status--off"}`}
        onClick={toggleStatus}
      >
        <span className="topbar__status-dot" />
        {merchant?.isOnline ? "Online" : "Offline"}
      </button>
    </div>
  );
}

export default MerchantTopbar;