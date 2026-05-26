import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCustomers.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  /* ── fetch ── */
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/customers");
      setCustomers(res.data.customers);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  /* ── block / unblock ── */
  const handleBlock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/customers/block/${id}`);
      fetchCustomers();
    } catch (err) { console.log(err); }
  };

  const handleUnblock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/customers/unblock/${id}`);
      fetchCustomers();
    } catch (err) { console.log(err); }
  };

  /* ── counts ── */
  const counts = {
    all:     customers.length,
    active:  customers.filter((c) => !c.isBlocked).length,
    blocked: customers.filter((c) =>  c.isBlocked).length,
  };

  /* ── filtered + searched ── */
  const filtered = customers
    .filter((c) => {
      if (filter === "active")  return !c.isBlocked;
      if (filter === "blocked") return  c.isBlocked;
      return true;
    })
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phoneNumber?.toLowerCase().includes(q)
      );
    });

  /* ── avatar initials ── */
  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  /* ── join date ── */
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const TABS = [
    { key: "all",     label: "All Customers" },
    { key: "active",  label: "Active" },
    { key: "blocked", label: "Blocked" },
  ];

  return (
    <div className="cust-content">

      {/* ── Header ── */}
      <div className="cust-header">
        <div>
          <h1 className="cust-title">Customers</h1>
          <p className="cust-sub">Manage all registered users on the platform.</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="cust-stats">
        <div className="cst-card cst-blue">
          <UsersIcon />
          <div>
            <span className="cst-num">{counts.all}</span>
            <span className="cst-lbl">Total</span>
          </div>
        </div>
        <div className="cst-card cst-green">
          <CheckIcon />
          <div>
            <span className="cst-num">{counts.active}</span>
            <span className="cst-lbl">Active</span>
          </div>
        </div>
        <div className="cst-card cst-red">
          <BlockIcon />
          <div>
            <span className="cst-num">{counts.blocked}</span>
            <span className="cst-lbl">Blocked</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar: tabs + search ── */}
      <div className="cust-toolbar">
        <div className="cust-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`ctab ${filter === key ? "ctab-active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="ctab-count">{counts[key] ?? customers.length}</span>
            </button>
          ))}
        </div>

        <div className="cust-search-wrap">
          <SearchIcon />
          <input
            className="cust-search"
            type="text"
            placeholder="Search by name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="cust-loading">Loading customers…</div>
      ) : (
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id} className={c.isBlocked ? "row-blocked" : ""}>
                  <td className="td-num">{i + 1}</td>

                  {/* Avatar + name */}
                  <td>
                    <div className="cust-identity">
                      <div className={`cust-avatar ${c.isBlocked ? "avatar-blocked" : ""}`}>
                        {initials(c.name)}
                      </div>
                      <span className="cust-name">{c.name}</span>
                    </div>
                  </td>

                  <td className="td-muted">{c.email}</td>
                  <td className="td-muted">{c.phoneNumber || "—"}</td>
                  <td className="td-muted">{formatDate(c.createdAt)}</td>

                  {/* Status badge */}
                  <td>
                    <span className={`cbadge ${c.isBlocked ? "cbadge-blocked" : "cbadge-active"}`}>
                      {c.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    {c.isBlocked ? (
                      <button
                        className="btn-unblock"
                        onClick={() => handleUnblock(c._id)}
                      >
                        <UnlockIcon /> Unblock
                      </button>
                    ) : (
                      <button
                        className="btn-block"
                        onClick={() => handleBlock(c._id)}
                      >
                        <LockIcon /> Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="cust-empty">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Icons ── */
function UsersIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CheckIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>; }
function BlockIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function LockIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UnlockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>; }

export default AdminCustomers;