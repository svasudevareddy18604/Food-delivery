import { useState } from "react";
import "./MerchantDashboard.css";
import MerchantSidebar from "../../components/merchant/MerchantSidebar";
import MerchantTopbar from "../../components/merchant/MerchantTopbar";
import MerchantHome from "./MerchantHome";
import MerchantFoods from "./MerchantFoods";
import MerchantOrders from "./MerchantOrders";
import MerchantAnalytics from "./MerchantAnalytics";
import MerchantSettings from "./MerchantSettings";

const TABS = {
  home:      <MerchantHome />,      // ✅ added
  foods:     <MerchantFoods />,
  orders:    <MerchantOrders />,
  analytics: <MerchantAnalytics />,
  settings:  <MerchantSettings />,
};

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState("home");  // ✅ changed from "foods"

  return (
    <div className="merchant-dashboard">
      <MerchantSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="merchant-main">
        <MerchantTopbar />
        <div className="merchant-content">
          {TABS[activeTab]}          {/* ✅ removed broken fallback */}
        </div>
      </div>
    </div>
  );
}