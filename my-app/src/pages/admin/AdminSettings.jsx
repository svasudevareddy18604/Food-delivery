import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminSettings.css";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    storeOpen: true,
    acceptOrders: true,
    acceptCOD: true,
    acceptOnlinePayments: true,
    deliveryAvailable: true,
    minimumOrderAmount: 0,
    deliveryRadiusKm: 10,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(
        `${API}/api/admin/settings`
      );

      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await axios.put(
        `${API}/api/admin/settings`,
        settings
      );

      alert("Settings updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading...</div>;
  }

  return (
    <div className="admin-settings">

      <h2>Website Settings</h2>

      <div className="settings-card">

        <div className="setting-row">
          <span>Maintenance Mode</span>

          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={() =>
              handleToggle("maintenanceMode")
            }
          />
        </div>

        <div className="setting-row">
          <span>Store Open</span>

          <input
            type="checkbox"
            checked={settings.storeOpen}
            onChange={() =>
              handleToggle("storeOpen")
            }
          />
        </div>

        <div className="setting-row">
          <span>Accept Orders</span>

          <input
            type="checkbox"
            checked={settings.acceptOrders}
            onChange={() =>
              handleToggle("acceptOrders")
            }
          />
        </div>

        <div className="setting-row">
          <span>Accept COD</span>

          <input
            type="checkbox"
            checked={settings.acceptCOD}
            onChange={() =>
              handleToggle("acceptCOD")
            }
          />
        </div>

        <div className="setting-row">
          <span>Accept Online Payments</span>

          <input
            type="checkbox"
            checked={settings.acceptOnlinePayments}
            onChange={() =>
              handleToggle("acceptOnlinePayments")
            }
          />
        </div>

        <div className="setting-row">
          <span>Delivery Available</span>

          <input
            type="checkbox"
            checked={settings.deliveryAvailable}
            onChange={() =>
              handleToggle("deliveryAvailable")
            }
          />
        </div>

        <div className="setting-row">
          <span>Minimum Order Amount</span>

          <input
            type="number"
            value={settings.minimumOrderAmount}
            onChange={(e) =>
              setSettings({
                ...settings,
                minimumOrderAmount:
                  Number(e.target.value),
              })
            }
          />
        </div>

        <div className="setting-row">
          <span>Delivery Radius (KM)</span>

          <input
            type="number"
            value={settings.deliveryRadiusKm}
            onChange={(e) =>
              setSettings({
                ...settings,
                deliveryRadiusKm:
                  Number(e.target.value),
              })
            }
          />
        </div>

        <button
          className="save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

      </div>
    </div>
  );
}