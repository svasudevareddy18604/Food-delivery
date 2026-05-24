import "./OrderSuccess.css";

import Header from "../../components/customer/Header";

function OrderSuccess() {
  return (
    <div className="success-page">

      <Header />

      <div className="success-container">

        <div className="success-box">

          <h1>✅ Order Placed Successfully</h1>

          <p>
            Your food is being prepared and will arrive soon.
          </p>

          <h2>Order ID: #ORD12345</h2>

        </div>

      </div>

    </div>
  );
}

export default OrderSuccess;