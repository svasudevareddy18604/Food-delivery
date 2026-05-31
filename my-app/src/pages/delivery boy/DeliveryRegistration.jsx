import "./DeliveryRegistration.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TOTAL_STEPS = 8;

const STEP_META = [
  { icon: "👤", label: "Personal" },
  { icon: "🏠", label: "Address" },
  { icon: "📄", label: "Documents" },
  { icon: "🛵", label: "Vehicle" },
  { icon: "🏦", label: "Banking" },
  { icon: "🆘", label: "Emergency" },
  { icon: "⚙️", label: "Work" },
  { icon: "✅", label: "Permissions" },
];

/* ── tiny file-upload button ── */
function FileField({ label, name, accept, file, onChange, preview }) {
  const ref = useRef();
  return (
    <div className="dr-field">
      <label>{label}</label>
      <div
        className={`dr-file-zone ${file ? "dr-file-zone--filled" : ""}`}
        onClick={() => ref.current.click()}
      >
        <input
          ref={ref}
          type="file"
          accept={accept || "image/*"}
          style={{ display: "none" }}
          onChange={(e) => onChange(name, e.target.files[0])}
        />
        {file ? (
          <div className="dr-file-preview">
            {preview && <img src={preview} alt={label} />}
            <span className="dr-file-name">{file.name}</span>
            <span className="dr-file-change">Change</span>
          </div>
        ) : (
          <div className="dr-file-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
            </svg>
            <span>Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeliveryRegistration() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token") || "";

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* text fields */
  const [form, setForm] = useState({
    userId: user._id || "",
    fullName: "",
    mobile: "",
    email: user.email || "",
    dob: "",
    gender: "",
    houseNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    aadhaarNumber: "",
    drivingLicenseNumber: "",
    vehicleType: "",
    vehicleNumber: "",
    bankHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    workType: "",
    preferredArea: "",
    workingHours: "",
    locationPermission: false,
    termsAccepted: false,
  });

  /* file fields */
  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarFront: null,
    aadhaarBack: null,
    drivingLicenseImage: null,
    vehicleRC: null,
  });

  /* previews */
  const [previews, setPreviews] = useState({});

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const setFile = (key, file) => {
    if (!file) return;
    setFiles((p) => ({ ...p, [key]: file }));
    const url = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [key]: url }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  /* ── per-step validation ── */
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim())   e.fullName = "Full name is required";
      if (!form.mobile.trim())     e.mobile   = "Mobile number is required";
      else if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit number";
      if (!form.email.trim())      e.email    = "Email is required";
      if (!form.dob)               e.dob      = "Date of birth is required";
      if (!form.gender)            e.gender   = "Please select gender";
    }
    if (step === 2) {
      if (!form.houseNo.trim())  e.houseNo  = "Required";
      if (!form.street.trim())   e.street   = "Required";
      if (!form.city.trim())     e.city     = "Required";
      if (!form.state.trim())    e.state    = "Required";
      if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = "Valid 6-digit pincode required";
    }
    if (step === 3) {
      if (!form.aadhaarNumber.trim() || !/^\d{12}$/.test(form.aadhaarNumber))
        e.aadhaarNumber = "Valid 12-digit Aadhaar required";
      if (!files.aadhaarFront)  e.aadhaarFront  = "Aadhaar front photo required";
      if (!files.aadhaarBack)   e.aadhaarBack   = "Aadhaar back photo required";
      if (!form.drivingLicenseNumber.trim()) e.drivingLicenseNumber = "License number required";
      if (!files.drivingLicenseImage) e.drivingLicenseImage = "License photo required";
    }
    if (step === 4) {
      if (!form.vehicleType)          e.vehicleType   = "Select vehicle type";
      if (!form.vehicleNumber.trim()) e.vehicleNumber = "Vehicle number required";
      if (!files.vehicleRC)           e.vehicleRC     = "RC document required";
    }
    if (step === 5) {
      if (!form.bankHolderName.trim()) e.bankHolderName = "Account holder name required";
      if (!form.bankName.trim())       e.bankName       = "Bank name required";
      if (!form.accountNumber.trim())  e.accountNumber  = "Account number required";
      if (!form.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode))
        e.ifscCode = "Valid IFSC code required (e.g. SBIN0001234)";
    }
    if (step === 6) {
      if (!form.emergencyName.trim())  e.emergencyName  = "Contact name required";
      if (!form.emergencyRelation.trim()) e.emergencyRelation = "Relationship required";
      if (!form.emergencyPhone.trim() || !/^\d{10}$/.test(form.emergencyPhone))
        e.emergencyPhone = "Valid 10-digit number required";
    }
    if (step === 7) {
      if (!form.workType)           e.workType    = "Select work type";
      if (!form.workingHours)       e.workingHours = "Select working hours";
    }
    if (step === 8) {
      if (!form.locationPermission) e.locationPermission = "Location permission is required";
      if (!form.termsAccepted)      e.termsAccepted      = "Please accept terms & conditions";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validate() && step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const fd = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      fd.append(k, v.toString());
    });

    Object.entries(files).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/delivery-partner/register`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubmitted(true);
      setTimeout(() => navigate("/delivery-review"), 2500);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Submission failed. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────── SUCCESS STATE ─────────────── */
  if (submitted) {
    return (
      <div className="dr-success-page">
        <div className="dr-success-card">
          <div className="dr-success-icon">🎉</div>
          <h2>Registration Submitted!</h2>
          <p>Your profile is under review. We'll notify you once approved.</p>
          <div className="dr-success-loader" />
        </div>
      </div>
    );
  }

  /* ─────────────── MAIN RENDER ─────────────── */
  return (
    <div className="dr-page">

      {/* ── LEFT PANEL ── */}
      <div className="dr-left">
        <div className="dr-left-inner">
          <div className="dr-brand">
            <div className="dr-brand-logo">🛵</div>
            <span>Foodie Delivery</span>
          </div>

          <div className="dr-hero-text">
            <h1>Deliver.<br /><em>Earn.</em><br />Grow.</h1>
            <p>Join hundreds of delivery partners earning flexible income across the city.</p>
          </div>

          <div className="dr-stats">
            <div className="dr-stat"><strong>₹25K+</strong><span>Avg. Monthly Earnings</span></div>
            <div className="dr-stat"><strong>500+</strong><span>Active Partners</span></div>
            <div className="dr-stat"><strong>24/7</strong><span>Partner Support</span></div>
          </div>

          {/* Step sidebar */}
          <div className="dr-step-list">
            {STEP_META.map((s, i) => (
              <div
                key={i}
                className={`dr-step-item ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}
              >
                <div className="dr-step-dot">
                  {step > i + 1 ? (
                    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1 5.1-5.1L13 5z"/></svg>
                  ) : (
                    <span>{s.icon}</span>
                  )}
                </div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="dr-right">
        <div className="dr-card">

          {/* header */}
          <div className="dr-card-header">
            <div className="dr-card-step-badge">Step {step} / {TOTAL_STEPS}</div>
            <h2>{STEP_META[step - 1].icon} {STEP_META[step - 1].label}</h2>
            <div className="dr-progress-track">
              <div className="dr-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>
          </div>

          {/* ══ STEP 1 — PERSONAL ══ */}
          {step === 1 && (
            <div className="dr-section">
              <div className="dr-section-title">Personal Information</div>
              <div className="dr-grid-2">
                <FileField
                  label="Profile Photo"
                  name="profilePhoto"
                  accept="image/*"
                  file={files.profilePhoto}
                  preview={previews.profilePhoto}
                  onChange={setFile}
                />
                <div className="dr-field dr-field--full">
                  <label>Full Name <span className="req">*</span></label>
                  <input
                    placeholder="As on government ID"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={errors.fullName ? "err" : ""}
                  />
                  {errors.fullName && <span className="dr-err">{errors.fullName}</span>}
                </div>
                <div className="dr-field">
                  <label>Mobile Number <span className="req">*</span></label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                    className={errors.mobile ? "err" : ""}
                  />
                  {errors.mobile && <span className="dr-err">{errors.mobile}</span>}
                </div>
                <div className="dr-field">
                  <label>Email Address <span className="req">*</span></label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={errors.email ? "err" : ""}
                  />
                  {errors.email && <span className="dr-err">{errors.email}</span>}
                </div>
                <div className="dr-field">
                  <label>Date of Birth <span className="req">*</span></label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    className={errors.dob ? "err" : ""}
                  />
                  {errors.dob && <span className="dr-err">{errors.dob}</span>}
                </div>
                <div className="dr-field">
                  <label>Gender <span className="req">*</span></label>
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    className={errors.gender ? "err" : ""}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="dr-err">{errors.gender}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — ADDRESS ══ */}
          {step === 2 && (
            <div className="dr-section">
              <div className="dr-section-title">Address Details</div>
              <div className="dr-grid-2">
                {[
                  ["houseNo", "House / Flat No.", "text", "e.g. 42B"],
                  ["street",  "Street / Road",    "text", "e.g. MG Road"],
                  ["area",    "Area / Locality",   "text", "e.g. Koramangala"],
                  ["city",    "City",              "text", "e.g. Bengaluru"],
                  ["state",   "State",             "text", "e.g. Karnataka"],
                  ["pincode", "Pincode",           "text", "6-digit code"],
                ].map(([key, lbl, type, ph]) => (
                  <div className="dr-field" key={key}>
                    <label>{lbl} <span className="req">*</span></label>
                    <input
                      type={type}
                      placeholder={ph}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className={errors[key] ? "err" : ""}
                    />
                    {errors[key] && <span className="dr-err">{errors[key]}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ STEP 3 — DOCUMENTS ══ */}
          {step === 3 && (
            <div className="dr-section">
              <div className="dr-section-title">Identity Documents</div>

              <div className="dr-doc-block">
                <div className="dr-doc-heading">
                  <div className="dr-doc-icon">🪪</div>
                  <div>
                    <strong>Aadhaar Card</strong>
                    <p>Government-issued 12-digit ID</p>
                  </div>
                </div>
                <div className="dr-grid-2">
                  <div className="dr-field dr-field--full">
                    <label>Aadhaar Number <span className="req">*</span></label>
                    <input
                      placeholder="12-digit number"
                      value={form.aadhaarNumber}
                      onChange={(e) => set("aadhaarNumber", e.target.value)}
                      className={errors.aadhaarNumber ? "err" : ""}
                    />
                    {errors.aadhaarNumber && <span className="dr-err">{errors.aadhaarNumber}</span>}
                  </div>
                  <FileField label="Aadhaar Front *" name="aadhaarFront" file={files.aadhaarFront} preview={previews.aadhaarFront} onChange={setFile} />
                  <FileField label="Aadhaar Back *"  name="aadhaarBack"  file={files.aadhaarBack}  preview={previews.aadhaarBack}  onChange={setFile} />
                  {errors.aadhaarFront && <span className="dr-err">{errors.aadhaarFront}</span>}
                  {errors.aadhaarBack  && <span className="dr-err">{errors.aadhaarBack}</span>}
                </div>
              </div>

              <div className="dr-doc-block">
                <div className="dr-doc-heading">
                  <div className="dr-doc-icon">🪪</div>
                  <div>
                    <strong>Driving License</strong>
                    <p>Valid DL issued by RTO</p>
                  </div>
                </div>
                <div className="dr-grid-2">
                  <div className="dr-field dr-field--full">
                    <label>License Number <span className="req">*</span></label>
                    <input
                      placeholder="e.g. KA01 20230012345"
                      value={form.drivingLicenseNumber}
                      onChange={(e) => set("drivingLicenseNumber", e.target.value)}
                      className={errors.drivingLicenseNumber ? "err" : ""}
                    />
                    {errors.drivingLicenseNumber && <span className="dr-err">{errors.drivingLicenseNumber}</span>}
                  </div>
                  <FileField label="License Photo *" name="drivingLicenseImage" file={files.drivingLicenseImage} preview={previews.drivingLicenseImage} onChange={setFile} />
                  {errors.drivingLicenseImage && <span className="dr-err">{errors.drivingLicenseImage}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 4 — VEHICLE ══ */}
          {step === 4 && (
            <div className="dr-section">
              <div className="dr-section-title">Vehicle Details</div>

              <div className="dr-field">
                <label>Vehicle Type <span className="req">*</span></label>
                <div className="dr-vehicle-grid">
                  {[
                    { value: "Bike",    emoji: "🏍️" },
                    { value: "Scooter", emoji: "🛵" },
                    { value: "Cycle",   emoji: "🚲" },
                    { value: "EV",      emoji: "⚡" },
                  ].map(({ value, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      className={`dr-vehicle-btn ${form.vehicleType === value ? "selected" : ""}`}
                      onClick={() => set("vehicleType", value)}
                    >
                      <span className="dr-vehicle-emoji">{emoji}</span>
                      <span>{value}</span>
                    </button>
                  ))}
                </div>
                {errors.vehicleType && <span className="dr-err">{errors.vehicleType}</span>}
              </div>

              <div className="dr-grid-2" style={{ marginTop: "1.5rem" }}>
                <div className="dr-field">
                  <label>Vehicle Number <span className="req">*</span></label>
                  <input
                    placeholder="e.g. KA01AB1234"
                    value={form.vehicleNumber}
                    onChange={(e) => set("vehicleNumber", e.target.value.toUpperCase())}
                    className={errors.vehicleNumber ? "err" : ""}
                  />
                  {errors.vehicleNumber && <span className="dr-err">{errors.vehicleNumber}</span>}
                </div>
                <FileField label="RC Document *" name="vehicleRC" file={files.vehicleRC} preview={previews.vehicleRC} onChange={setFile} />
                {errors.vehicleRC && <span className="dr-err">{errors.vehicleRC}</span>}
              </div>
            </div>
          )}

          {/* ══ STEP 5 — BANK ══ */}
          {step === 5 && (
            <div className="dr-section">
              <div className="dr-section-title">Bank Details</div>
              <div className="dr-info-note">
                💡 Your earnings will be transferred to this account every week.
              </div>
              <div className="dr-grid-2">
                {[
                  ["bankHolderName", "Account Holder Name", "text",     "Full name as per bank"],
                  ["bankName",       "Bank Name",           "text",     "e.g. State Bank of India"],
                  ["accountNumber",  "Account Number",      "text",     "Enter account number"],
                  ["ifscCode",       "IFSC Code",           "text",     "e.g. SBIN0001234"],
                  ["upiId",          "UPI ID (optional)",   "text",     "e.g. name@upi"],
                ].map(([key, lbl, type, ph]) => (
                  <div className={`dr-field ${key === "bankHolderName" || key === "upiId" ? "dr-field--full" : ""}`} key={key}>
                    <label>{lbl}{key !== "upiId" && <span className="req"> *</span>}</label>
                    <input
                      type={type}
                      placeholder={ph}
                      value={form[key]}
                      onChange={(e) => set(key, key === "ifscCode" ? e.target.value.toUpperCase() : e.target.value)}
                      className={errors[key] ? "err" : ""}
                    />
                    {errors[key] && <span className="dr-err">{errors[key]}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ STEP 6 — EMERGENCY ══ */}
          {step === 6 && (
            <div className="dr-section">
              <div className="dr-section-title">Emergency Contact</div>
              <div className="dr-info-note">
                🆘 This person will be contacted in case of an emergency during delivery.
              </div>
              <div className="dr-grid-2">
                <div className="dr-field dr-field--full">
                  <label>Contact Name <span className="req">*</span></label>
                  <input
                    placeholder="e.g. Ramesh Kumar"
                    value={form.emergencyName}
                    onChange={(e) => set("emergencyName", e.target.value)}
                    className={errors.emergencyName ? "err" : ""}
                  />
                  {errors.emergencyName && <span className="dr-err">{errors.emergencyName}</span>}
                </div>
                <div className="dr-field">
                  <label>Relationship <span className="req">*</span></label>
                  <select
                    value={form.emergencyRelation}
                    onChange={(e) => set("emergencyRelation", e.target.value)}
                    className={errors.emergencyRelation ? "err" : ""}
                  >
                    <option value="">Select</option>
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.emergencyRelation && <span className="dr-err">{errors.emergencyRelation}</span>}
                </div>
                <div className="dr-field">
                  <label>Phone Number <span className="req">*</span></label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={form.emergencyPhone}
                    onChange={(e) => set("emergencyPhone", e.target.value)}
                    className={errors.emergencyPhone ? "err" : ""}
                  />
                  {errors.emergencyPhone && <span className="dr-err">{errors.emergencyPhone}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 7 — WORK PREFERENCES ══ */}
          {step === 7 && (
            <div className="dr-section">
              <div className="dr-section-title">Work Preferences</div>
              <div className="dr-field">
                <label>Work Type <span className="req">*</span></label>
                <div className="dr-toggle-group">
                  {["Full Time", "Part Time"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`dr-toggle-btn ${form.workType === v ? "selected" : ""}`}
                      onClick={() => set("workType", v)}
                    >
                      {v === "Full Time" ? "🕐 Full Time" : "⏱️ Part Time"}
                    </button>
                  ))}
                </div>
                {errors.workType && <span className="dr-err">{errors.workType}</span>}
              </div>

              <div className="dr-field" style={{ marginTop: "1.5rem" }}>
                <label>Preferred Delivery Area</label>
                <input
                  placeholder="e.g. Indiranagar, Koramangala"
                  value={form.preferredArea}
                  onChange={(e) => set("preferredArea", e.target.value)}
                />
              </div>

              <div className="dr-field" style={{ marginTop: "1.5rem" }}>
                <label>Preferred Working Hours <span className="req">*</span></label>
                <div className="dr-hours-grid">
                  {[
                    { value: "Morning",   emoji: "🌅", time: "6 AM – 12 PM" },
                    { value: "Afternoon", emoji: "☀️",  time: "12 PM – 5 PM" },
                    { value: "Evening",   emoji: "🌆", time: "5 PM – 10 PM" },
                    { value: "Night",     emoji: "🌙", time: "10 PM – 6 AM" },
                  ].map(({ value, emoji, time }) => (
                    <button
                      key={value}
                      type="button"
                      className={`dr-hour-btn ${form.workingHours === value ? "selected" : ""}`}
                      onClick={() => set("workingHours", value)}
                    >
                      <span className="dr-hour-emoji">{emoji}</span>
                      <strong>{value}</strong>
                      <small>{time}</small>
                    </button>
                  ))}
                </div>
                {errors.workingHours && <span className="dr-err">{errors.workingHours}</span>}
              </div>
            </div>
          )}

          {/* ══ STEP 8 — PERMISSIONS ══ */}
          {step === 8 && (
            <div className="dr-section">
              <div className="dr-section-title">Permissions & Agreement</div>

              <div className="dr-permission-card">
                <div className="dr-permission-icon">📍</div>
                <div className="dr-permission-body">
                  <strong>Location Access</strong>
                  <p>We need real-time location to assign nearby orders, track deliveries, and calculate earnings accurately.</p>
                </div>
                <label className="dr-switch">
                  <input
                    type="checkbox"
                    checked={form.locationPermission}
                    onChange={(e) => set("locationPermission", e.target.checked)}
                  />
                  <span className="dr-switch-thumb" />
                </label>
              </div>
              {errors.locationPermission && <span className="dr-err">{errors.locationPermission}</span>}

              <div className="dr-terms-card" style={{ marginTop: "1.5rem" }}>
                <label className="dr-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => set("termsAccepted", e.target.checked)}
                  />
                  <span className="dr-checkbox-box" />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" target="_blank">Terms & Conditions</a>
                    {" "}and{" "}
                    <a href="/privacy" target="_blank">Privacy Policy</a>
                    {" "}of Foodie Delivery Partner Program.
                  </span>
                </label>
              </div>
              {errors.termsAccepted && <span className="dr-err">{errors.termsAccepted}</span>}

              <div className="dr-review-summary">
                <div className="dr-review-title">📋 Review Your Details</div>
                <div className="dr-review-grid">
                  <div><span>Name</span><strong>{form.fullName || "—"}</strong></div>
                  <div><span>Mobile</span><strong>{form.mobile || "—"}</strong></div>
                  <div><span>City</span><strong>{form.city || "—"}</strong></div>
                  <div><span>Vehicle</span><strong>{form.vehicleType || "—"}</strong></div>
                  <div><span>Work Type</span><strong>{form.workType || "—"}</strong></div>
                  <div><span>Hours</span><strong>{form.workingHours || "—"}</strong></div>
                </div>
              </div>

              {errors.submit && (
                <div className="dr-submit-error">{errors.submit}</div>
              )}
            </div>
          )}

          {/* ── NAVIGATION ── */}
          <div className="dr-nav">
            {step > 1 && (
              <button className="dr-btn-back" onClick={prevStep}>
                ← Previous
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button className="dr-btn-next" onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button
                className={`dr-btn-submit ${submitting ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="dr-spinner" /> Submitting…</>
                ) : (
                  "🚀 Submit Registration"
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}