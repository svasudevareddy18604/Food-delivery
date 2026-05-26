import { useEffect, useState } from "react";
import "./MerchantOrders.css";

const STATUS_OPTIONS = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const STATUS_LABEL = {
  PLACED:           "Placed",
  PREPARING:        "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED:        "Delivered",
  CANCELLED:        "Cancelled",
};

function MerchantOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const merchant = JSON.parse(localStorage.getItem("user"));
      if (!merchant?._id) { setError("Merchant not logged in."); setLoading(false); return; }

      const res  = await fetch(`http://localhost:5000/api/orders/merchant/${merchant._id}`);
      const data = await res.json();
      data.success ? setOrders(data.orders) : setError(data.message);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      data.success ? fetchOrders() : alert(data.message);
    } catch {
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="mo-page"><div className="mo-spinner" /></div>;
  if (error)   return <div className="mo-page"><p className="mo-error">{error}</p></div>;

  return (
    <div className="mo-page">

      <div className="mo-header">
        <h1 className="mo-title">Customer Orders</h1>
        <span className="mo-count">{orders.length} order{orders.length !== 1 && "s"}</span>
      </div>

      {orders.length === 0 ? (
        <div className="mo-empty">
          <span className="mo-empty-icon">📭</span>
          <p>No orders yet. They'll appear here once customers start ordering.</p>
        </div>
      ) : (
        <div className="mo-grid">
          {orders.map(order => (
            <div key={order._id} className={`mo-card mo-card--${order.orderStatus.toLowerCase()}`}>

              {/* TOP ROW */}
              <div className="mo-card-top">
                <div>
                  <p className="mo-card-customer">{order.customerName || "Customer"}</p>
                  <p className="mo-card-phone">📞 {order.customerPhone || "No contact"}</p>
                  <p className="mo-card-id">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <span className={`mo-status mo-status--${order.orderStatus.toLowerCase()}`}>
                  {STATUS_LABEL[order.orderStatus] || order.orderStatus}
                </span>
              </div>

              {/* ADDRESS */}
              <p className="mo-card-address">📍 {order.address}</p>

              {/* ITEMS */}
              <div className="mo-items">
                {order.items.map((item, i) => (
                  <div key={i} className="mo-item-row">
                    <span className="mo-item-name">{item.name}</span>
                    <span className="mo-item-qty">×{item.quantity}</span>
                    <span className="mo-item-price">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mo-card-footer">
                <div className="mo-payment">
                  <span className="mo-pay-method">{order.paymentMethod}</span>
                  <span className={`mo-pay-status mo-pay-status--${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="mo-footer-right">
                  <p className="mo-total">₹{order.totalAmount}</p>
                  <select
                    className="mo-select"
                    value={order.orderStatus}
                    onChange={e => updateStatus(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default MerchantOrders;