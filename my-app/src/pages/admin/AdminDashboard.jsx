import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [merchants, setMerchants] = useState([]);
  const [filter, setFilter]       = useState("all");

  const fetchMerchants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/merchants`);
      setMerchants(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/approve/${id}`);
      fetchMerchants();
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/reject/${id}`);
      fetchMerchants();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { fetchMerchants(); }, []);

  const filtered = merchants.filter((m) => {
    if (filter === "approved") return m.isApproved === true;
    if (filter === "pending")  return m.isApproved === false;
    return true;
  });

  const counts = {
    all:      merchants.length,
    approved: merchants.filter((m) =>  m.isApproved).length,
    pending:  merchants.filter((m) => !m.isApproved).length,
  };

  return (
    <div className="admin-content">

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{counts.all}</span>
          <span className="stat-lbl">Total Merchants</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-num">{counts.approved}</span>
          <span className="stat-lbl">Approved</span>
        </div>
        <div className="stat-card stat-amber">
          <span className="stat-num">{counts.pending}</span>
          <span className="stat-lbl">Pending</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {["all", "approved", "pending"].map((f) => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? "tab-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="merchant-table-wrap">
        <table className="merchant-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Restaurant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((merchant, i) => (
              <tr key={merchant._id}>
                <td className="row-num">{i + 1}</td>
                <td className="row-name">{merchant.restaurantName}</td>
                <td className="row-muted">{merchant.email}</td>
                <td className="row-muted">{merchant.phoneNumber}</td>
                <td>
                  <span className={merchant.isApproved ? "badge-approved" : "badge-pending"}>
                    {merchant.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-approve" onClick={() => handleApprove(merchant._id)}>Approve</button>
                    <button className="btn-reject"  onClick={() => handleReject(merchant._id)}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No merchants found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminDashboard;