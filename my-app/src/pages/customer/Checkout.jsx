import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import axios                   from "axios";
import Header                  from "../../components/customer/Header";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL;
const API     = `${API_URL}/api/checkout`;

/* ══════════════════════════════════════════
   RAZORPAY LOADER
══════════════════════════════════════════ */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s     = document.createElement("script");
    s.src       = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload    = () => resolve(true);
    s.onerror   = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ══════════════════════════════════════════
   STEPS INDICATOR
══════════════════════════════════════════ */
function Steps({ step }) {
  const labels = ["Delivery", "Payment", "Review"];
  return (
    <div className="ck-steps">
      {labels.map((l, i) => (
        <div key={l} className={`ck-step ${i < step ? "ck-step--done" : i === step ? "ck-step--active" : ""}`}>
          <div className="ck-step__circle">{i < step ? "✓" : i + 1}</div>
          <span>{l}</span>
          {i < labels.length - 1 && <div className="ck-step__line" />}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   ADDRESS CARD (saved address selector)
══════════════════════════════════════════ */
function AddressCard({ addr, selected, onSelect }) {
  const icons = {
    Work:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    Home:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Other: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  };
  const fullText = [addr.line1, addr.line2, addr.city, addr.pincode ? `- ${addr.pincode}` : ""]
    .filter(Boolean).join(", ");

  return (
    <button
      type="button"
      className={`ck-addr-card ${selected ? "ck-addr-card--selected" : ""}`}
      onClick={onSelect}
    >
      <div className="ck-addr-card__radio">
        <div className="ck-addr-card__radio-dot" />
      </div>
      <div className="ck-addr-card__icon">
        {icons[addr.label] || icons.Other}
      </div>
      <div className="ck-addr-card__body">
        <div className="ck-addr-card__top">
          <span className="ck-addr-card__label">{addr.label}</span>
          {addr.isDefault && <span className="ck-addr-card__default">Default</span>}
        </div>
        <p className="ck-addr-card__text">{fullText}</p>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════
   MAIN CHECKOUT
══════════════════════════════════════════ */
export default function Checkout() {
  const navigate = useNavigate();

  const [cart,      setCart]    = useState([]);
  const [user,      setUser]    = useState(null);
  const [step,      setStep]    = useState(0);
  const [loading,   setLoad]    = useState(false);
  const [error,     setError]   = useState("");
  const [mounted,   setMounted] = useState(false);
  const [payMethod, setPay]     = useState("COD");

  /* Delivery form fields */
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  /* Address mode: "saved" | "manual" */
  const [addrMode,     setAddrMode]     = useState("saved");
  const [savedAddrs,   setSavedAddrs]   = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null); // index into savedAddrs

  /* ── Init ── */
  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart")  || "[]");
    const u = JSON.parse(localStorage.getItem("user")  || "null");
    setCart(c);
    setUser(u);

    if (u) {
      setForm(f => ({ ...f, name: u.name || "", phone: u.phoneNumber || "" }));

      const addrs = u.deliveryAddresses || [];
      setSavedAddrs(addrs);

      if (addrs.length > 0) {
        /* Auto-select default, else first */
        const defIdx = addrs.findIndex(a => a.isDefault);
        const idx    = defIdx >= 0 ? defIdx : 0;
        setSelectedAddr(idx);
        setForm(f => ({ ...f, address: buildAddressString(addrs[idx]) }));
        setAddrMode("saved");
      } else {
        setAddrMode("manual");
      }
    }

    setTimeout(() => setMounted(true), 60);
  }, []);

  function buildAddressString(addr) {
    return [addr.line1, addr.line2, addr.city, addr.pincode]
      .filter(Boolean).join(", ");
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── When saved address is selected ── */
  function handleSelectSaved(idx) {
    setSelectedAddr(idx);
    setForm(f => ({ ...f, address: buildAddressString(savedAddrs[idx]) }));
  }

  /* ── Switch modes ── */
  function handleSetMode(mode) {
    setAddrMode(mode);
    if (mode === "saved" && selectedAddr !== null && savedAddrs[selectedAddr]) {
      setForm(f => ({ ...f, address: buildAddressString(savedAddrs[selectedAddr]) }));
    } else if (mode === "manual") {
      setForm(f => ({ ...f, address: "" }));
    }
  }

  /* ── Totals ── */
  const subtotal   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery   = cart.length ? 40 : 0;
  const total      = subtotal + delivery;
  const totalQty   = cart.reduce((s, i) => s + i.quantity, 0);
  const merchantId = cart[0]?.restaurantId || cart[0]?.merchantId || "";

  /* ── Validation ── */
  const validateDelivery = () => {
    if (!form.name.trim())    { setError("Please enter your full name.");    return false; }
    if (!form.phone.trim())   { setError("Please enter your phone number."); return false; }
    if (addrMode === "saved" && selectedAddr === null) {
      setError("Please select a delivery address."); return false;
    }
    if (!form.address.trim()) { setError("Please enter a delivery address."); return false; }
    return true;
  };

  /* ── Place order ── */
  const placeOrder = async () => {
    setError("");
    if (!validateDelivery()) return;
    if (!user?._id)  { setError("Please sign in to place an order."); return; }
    if (!merchantId) { setError("Cart is missing restaurant info."); return; }

    setLoad(true);
    try {
      const payload = {
        customerId:    user._id,
        merchantId,
        items:         cart.map(i => ({
          foodId: i._id, name: i.name, image: i.image,
          price:  i.price, quantity: i.quantity,
        })),
        address:       form.address,
        customerName:  form.name,
        customerPhone: form.phone,
        paymentMethod: payMethod,
        totalAmount:   total,
      };

      const { data } = await axios.post(`${API}/create-order`, payload);
      if (!data.success) throw new Error(data.message);

      if (payMethod === "COD") {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));
        navigate(`/order-success/${data.orderId}`);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Razorpay SDK failed to load.");

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        order_id:    data.razorpayOrderId,
        name:        "Foodie",
        description: `Order #${data.orderId}`,
        prefill:     { name: form.name, contact: form.phone, email: user.email || "" },
        theme:       { color: "#ff6b2b" },
        handler: async (response) => {
          try {
            const verify = await axios.post(`${API}/verify-payment`, {
              orderId:           data.orderId,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verify.data.success) {
              localStorage.removeItem("cart");
              window.dispatchEvent(new Event("cart-updated"));
              navigate(`/order-success/${data.orderId}`);
            } else {
              setError("Payment verification failed. Contact support.");
            }
          } catch { setError("Payment verification error."); }
        },
        modal: { ondismiss: () => setLoad(false) },
      };

      new window.Razorpay(options).open();
      return;
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Something went wrong.");
    }
    setLoad(false);
  };

  const imgSrc = (img) => img
    ? img.startsWith("http") ? img : `${API_URL}${img}`
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=120&auto=format&fit=crop";

  /* ── Empty cart ── */
  if (!cart.length) return (
    <div className="ck ck--in">
      <Header />
      <div className="ck__empty">
        <div className="ck__empty-ring">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items before checking out.</p>
        <button className="ck__empty-cta" onClick={() => navigate("/")}>
          Browse Restaurants
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`ck ${mounted ? "ck--in" : ""}`}>
      <Header />

      {/* ── HERO ── */}
      <div className="ck__hero">
        <div className="ck__hero-inner">
          <div>
            <div className="ck__badge">✦ Secure checkout</div>
            <h1 className="ck__title">Almost <em>there!</em></h1>
            <p className="ck__sub">{totalQty} item{totalQty > 1 ? "s" : ""} · Grand Total ₹{total.toLocaleString()}</p>
          </div>
          <div className="ck__stats">
            {[
              { v: totalQty,                        l: "Items"    },
              { v: `₹${subtotal.toLocaleString()}`, l: "Subtotal" },
              { v: "~30 min",                       l: "ETA"      },
            ].map(({ v, l }) => (
              <div className="ck__stat" key={l}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ck__wrap">
        <Steps step={step} />

        <div className="ck__layout">

          {/* ════════════════════════════════
              LEFT — FORM STEPS
          ════════════════════════════════ */}
          <div className="ck__form">

            {/* ── STEP 0 — Delivery Details ── */}
            <div className={`ck__card ${step === 0 ? "ck__card--active" : ""}`}>
              <div className="ck__card-head" onClick={() => setStep(0)}>
                <div className="ck__card-num">{step > 0 ? "✓" : "1"}</div>
                <h2>Delivery Details</h2>
                {step > 0 && <span className="ck__card-edit">Edit</span>}
              </div>

              {step === 0 && (
                <div className="ck__card-body">

                  {/* Name + Phone */}
                  <div className="ck__row">
                    <label>Full Name *
                      <input
                        value={form.name}
                        onChange={e => set("name", e.target.value)}
                        placeholder="John Doe"
                      />
                    </label>
                    <label>Phone *
                      <input
                        value={form.phone}
                        onChange={e => set("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </label>
                  </div>

                  {/* ── ADDRESS SECTION ── */}
                  <div className="ck__addr-section">
                    <div className="ck__addr-section-label">Delivery Address *</div>

                    {/* Mode toggle — only show if user has saved addresses */}
                    {savedAddrs.length > 0 && (
                      <div className="ck__addr-toggle">
                        <button
                          type="button"
                          className={`ck__addr-toggle-btn ${addrMode === "saved" ? "ck__addr-toggle-btn--active" : ""}`}
                          onClick={() => handleSetMode("saved")}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5"/>
                          </svg>
                          Saved Addresses
                        </button>
                        <button
                          type="button"
                          className={`ck__addr-toggle-btn ${addrMode === "manual" ? "ck__addr-toggle-btn--active" : ""}`}
                          onClick={() => handleSetMode("manual")}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Enter Manually
                        </button>
                      </div>
                    )}

                    {/* Saved addresses list */}
                    {addrMode === "saved" && savedAddrs.length > 0 && (
                      <div className="ck__addr-list">
                        {savedAddrs.map((addr, idx) => (
                          <AddressCard
                            key={addr._id || idx}
                            addr={addr}
                            selected={selectedAddr === idx}
                            onSelect={() => handleSelectSaved(idx)}
                          />
                        ))}
                        <button
                          type="button"
                          className="ck__addr-add-new"
                          onClick={() => handleSetMode("manual")}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          Use a different address
                        </button>
                      </div>
                    )}

                    {/* Manual textarea */}
                    {(addrMode === "manual" || savedAddrs.length === 0) && (
                      <textarea
                        className="ck__addr-manual"
                        rows={3}
                        value={form.address}
                        onChange={e => set("address", e.target.value)}
                        placeholder="House no., street, area, city, pincode…"
                      />
                    )}
                  </div>

                  {error && <p className="ck__error">{error}</p>}

                  <button
                    className="ck__btn"
                    onClick={() => { if (validateDelivery()) { setError(""); setStep(1); } }}
                  >
                    Continue to Payment
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* ── STEP 1 — Payment ── */}
            <div className={`ck__card ${step === 1 ? "ck__card--active" : ""} ${step < 1 ? "ck__card--locked" : ""}`}>
              <div className="ck__card-head" onClick={() => step >= 1 && setStep(1)}>
                <div className="ck__card-num">{step > 1 ? "✓" : "2"}</div>
                <h2>Payment Method</h2>
                {step > 1 && <span className="ck__card-edit">Edit</span>}
              </div>
              {step === 1 && (
                <div className="ck__card-body">
                  <div className="ck__pay-opts">
                    {[
                      { id: "COD",    icon: "💵", label: "Cash on Delivery", sub: "Pay when your order arrives"           },
                      { id: "ONLINE", icon: "💳", label: "Pay Online",        sub: "UPI, Cards, Net Banking via Razorpay" },
                    ].map(opt => (
                      <button key={opt.id}
                        className={`ck__pay-opt ${payMethod === opt.id ? "ck__pay-opt--active" : ""}`}
                        onClick={() => setPay(opt.id)}>
                        <span className="ck__pay-icon">{opt.icon}</span>
                        <div>
                          <strong>{opt.label}</strong>
                          <small>{opt.sub}</small>
                        </div>
                        <div className="ck__pay-radio" />
                      </button>
                    ))}
                  </div>
                  <button className="ck__btn" onClick={() => setStep(2)}>
                    Review Order
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* ── STEP 2 — Review ── */}
            <div className={`ck__card ${step === 2 ? "ck__card--active" : ""} ${step < 2 ? "ck__card--locked" : ""}`}>
              <div className="ck__card-head" onClick={() => step >= 2 && setStep(2)}>
                <div className="ck__card-num">3</div>
                <h2>Review &amp; Place Order</h2>
              </div>
              {step === 2 && (
                <div className="ck__card-body">
                  <div className="ck__review-row">
                    <span>📍 Delivering to</span>
                    <strong>{form.address}</strong>
                  </div>
                  <div className="ck__review-row">
                    <span>📞 Contact</span>
                    <strong>{form.name} · {form.phone}</strong>
                  </div>
                  <div className="ck__review-row">
                    <span>💳 Payment</span>
                    <strong>{payMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}</strong>
                  </div>

                  <p className="ck__items-label">Your Items</p>
                  <div className="ck__items">
                    {cart.map(i => (
                      <div className="ck__item" key={i._id}>
                        <img src={imgSrc(i.image)} alt={i.name} />
                        <span className="ck__item-name">{i.name}</span>
                        <span className="ck__item-qty">×{i.quantity}</span>
                        <span className="ck__item-price">₹{(i.price * i.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {error && <p className="ck__error">{error}</p>}

                  <button className="ck__btn ck__btn--place" onClick={placeOrder} disabled={loading}>
                    {loading && <span className="ck__spinner" />}
                    {loading ? "Processing…" : payMethod === "COD" ? "Place Order" : `Pay ₹${total.toLocaleString()}`}
                  </button>
                </div>
              )}
            </div>

          </div>{/* end .ck__form */}

          {/* ════════════════════════════════
              RIGHT — ORDER SUMMARY
          ════════════════════════════════ */}
          <aside className="ck__summary">
            <div className="ck__summary-inner">
              <h2 className="ck__summary-title">Order Summary</h2>
              <div className="ck__summary-items">
                {cart.map(i => (
                  <div className="ck__summary-item" key={i._id}>
                    <span className="ck__summary-name">{i.name} <em>×{i.quantity}</em></span>
                    <span>₹{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="ck__summary-divider" />
              <div className="ck__summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="ck__summary-row"><span>Delivery fee</span><span>₹{delivery}</span></div>
              <div className="ck__summary-divider" />
              <div className="ck__summary-total">
                <span>Grand Total</span>
                <span className="ck__summary-amount">₹{total.toLocaleString()}</span>
              </div>
              <div className="ck__trust">
                {["🔒 Secure checkout", "🚀 Fast delivery", "✅ Easy returns"].map(b => (
                  <span key={b}>{b}</span>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}