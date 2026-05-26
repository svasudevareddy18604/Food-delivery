import "./MerchantRegistration.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RESTAURANT_TYPES = [
  { value: "veg",    label: "🌿 Pure Veg" },
  { value: "nonveg", label: "🍖 Non Veg" },
  { value: "both",   label: "🍽 Veg & Non Veg" },
];

const API_URL = import.meta.env.VITE_API_URL;

export default function MerchantRegistration() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    restaurantName:    "",
    phoneNumber:       "",
    restaurantAddress: "",
    restaurantType:    "",
    openingTime:       "",
    closingTime:       "",
  });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.restaurantName.trim())    e.restaurantName    = "Restaurant name is required";
    if (!form.phoneNumber.trim())       e.phoneNumber       = "Phone number is required";
    if (!form.restaurantAddress.trim()) e.restaurantAddress = "Address is required";
    if (!form.restaurantType)           e.restaurantType    = "Please select a type";
    if (!form.openingTime)              e.openingTime       = "Required";
    if (!form.closingTime)              e.closingTime       = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { navigate("/login"); return; }

    try {
      setLoading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("restaurantImage", image);

      const res = await fetch(
        `${API_URL}/api/merchant/register/${user._id}`,
        { method: "PUT", body: fd }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/waiting-approval");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mr-page">

      {/* ── LEFT PANEL ── */}
      <div className="mr-left">
        <div className="mr-left__overlay">
          <div className="mr-left__content">
            <div className="mr-left__badge">Partner Program</div>
            <h1 className="mr-left__heading">
              Grow your<br />restaurant<br />with us.
            </h1>
            <p className="mr-left__sub">
              Join Foodie and reach thousands of hungry customers.
              Smart delivery, real-time analytics, and zero hassle.
            </p>
            <div className="mr-left__stats">
              <div className="mr-left__stat"><strong>200+</strong><span>Restaurants</span></div>
              <div className="mr-left__stat"><strong>50K+</strong><span>Orders/month</span></div>
              <div className="mr-left__stat"><strong>4.9★</strong><span>Avg rating</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="mr-right">
        <div className="mr-box">

          {/* Header */}
          <div className="mr-box__header">
            <div className="mr-box__icon">🍽</div>
            <h2>Restaurant Registration</h2>
            <p>Complete your merchant onboarding</p>
          </div>

          {/* ── IMAGE UPLOAD ── */}
          <div className="mr-upload" onClick={() => document.getElementById("imgInput").click()}>
            {preview
              ? <img src={preview} alt="Restaurant preview" className="mr-upload__preview" />
              : (
                <div className="mr-upload__placeholder">
                  <span className="mr-upload__icon">📷</span>
                  <span className="mr-upload__label">Upload Restaurant Photo</span>
                  <span className="mr-upload__hint">JPG, PNG or WebP · Max 5MB</span>
                </div>
              )
            }
            <input
              id="imgInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImage}
            />
            {preview && (
              <div className="mr-upload__change">Change Photo</div>
            )}
          </div>

          {/* ── FORM FIELDS ── */}
          <div className="mr-fields">

            {/* Restaurant Name */}
            <div className={`mr-field ${errors.restaurantName ? "mr-field--error" : ""}`}>
              <label>Restaurant Name</label>
              <input
                type="text"
                placeholder="e.g. Spice Garden"
                value={form.restaurantName}
                onChange={e => set("restaurantName", e.target.value)}
              />
              {errors.restaurantName && <span className="mr-field__err">{errors.restaurantName}</span>}
            </div>

            {/* Phone */}
            <div className={`mr-field ${errors.phoneNumber ? "mr-field--error" : ""}`}>
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phoneNumber}
                onChange={e => set("phoneNumber", e.target.value)}
              />
              {errors.phoneNumber && <span className="mr-field__err">{errors.phoneNumber}</span>}
            </div>

            {/* Address */}
            <div className={`mr-field mr-field--full ${errors.restaurantAddress ? "mr-field--error" : ""}`}>
              <label>Restaurant Address</label>
              <textarea
                placeholder="Full address with street, city and pincode"
                value={form.restaurantAddress}
                onChange={e => set("restaurantAddress", e.target.value)}
              />
              {errors.restaurantAddress && <span className="mr-field__err">{errors.restaurantAddress}</span>}
            </div>

            {/* Type */}
            <div className={`mr-field mr-field--full ${errors.restaurantType ? "mr-field--error" : ""}`}>
              <label>Restaurant Type</label>
              <div className="mr-type-btns">
                {RESTAURANT_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`mr-type-btn ${form.restaurantType === t.value ? "mr-type-btn--active" : ""}`}
                    onClick={() => set("restaurantType", t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {errors.restaurantType && <span className="mr-field__err">{errors.restaurantType}</span>}
            </div>

            {/* Timings */}
            <div className={`mr-field ${errors.openingTime ? "mr-field--error" : ""}`}>
              <label>Opening Time</label>
              <input
                type="time"
                value={form.openingTime}
                onChange={e => set("openingTime", e.target.value)}
              />
              {errors.openingTime && <span className="mr-field__err">{errors.openingTime}</span>}
            </div>

            <div className={`mr-field ${errors.closingTime ? "mr-field--error" : ""}`}>
              <label>Closing Time</label>
              <input
                type="time"
                value={form.closingTime}
                onChange={e => set("closingTime", e.target.value)}
              />
              {errors.closingTime && <span className="mr-field__err">{errors.closingTime}</span>}
            </div>

          </div>

          {/* ── SUBMIT ── */}
          <button
            className={`mr-submit ${loading ? "mr-submit--loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><span className="mr-submit__spinner" /> Submitting…</>
            ) : (
              "Submit Registration →"
            )}
          </button>

          <p className="mr-note">
            Your application will be reviewed within 24 hours.
          </p>

        </div>
      </div>
    </div>
  );
}