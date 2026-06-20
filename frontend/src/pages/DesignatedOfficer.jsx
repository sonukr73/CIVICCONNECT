import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Predefined officers fallback
const MOCK_OFFICERS = [
  { id: "o1", name: "Rajesh Sharma", department: "Roads" },
  { id: "o2", name: "Priya Mehta", department: "Water Supply" },
  { id: "o3", name: "Amit Singh", department: "Electricity" },
  { id: "o4", name: "Sunita Rao", department: "Sanitation" },
  { id: "o5", name: "Vikram Patel", department: "Other" },
];

export default function DesignatedOfficer() {
  const [officers, setOfficers] = useState(MOCK_OFFICERS);
  const [publicFilterDept, setPublicFilterDept] = useState("All");

  const fetchOfficers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/authorities`);
      if (res.data && res.data.success) {
        const list = res.data.authorities.filter(auth => auth.department !== "Admin");
        setOfficers(list);
      }
    } catch (err) {
      console.warn("Could not fetch officers.", err);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const departments = ["All", "Roads", "Water Supply", "Electricity", "Sanitation", "Other"];
  const filteredOfficers = officers.filter(
    o => publicFilterDept === "All" || o.department === publicFilterDept
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 60px", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Directory Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>
          Designated Departmental Officers
        </h1>
        <p style={{ color: "#64748b", marginTop: "10px", fontSize: "16px", fontWeight: "500", maxWidth: "600px", margin: "10px auto 0" }}>
          Meet the municipal officers responsible for resolving grievances in your sector/locality. Select a department to view the designated field officer.
        </p>
      </div>

      {/* Department Filter Pills */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setPublicFilterDept(dept)}
            style={{
              padding: "10px 24px",
              borderRadius: "30px",
              border: "none",
              fontWeight: "750",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.25s ease",
              background: publicFilterDept === dept ? "#3498db" : "white",
              color: publicFilterDept === dept ? "white" : "#64748b",
              boxShadow: publicFilterDept === dept ? "0 4px 12px rgba(52, 152, 219, 0.25)" : "0 4px 10px rgba(0,0,0,0.03)",
              border: "1px solid " + (publicFilterDept === dept ? "#3498db" : "#e2e8f0")
            }}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Officers Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {filteredOfficers.map(o => {
          let badgeBg = "#e8f4fd";
          let badgeColor = "#3498db";
          if (o.department === "Water Supply") {
            badgeBg = "#e8fdf4";
            badgeColor = "#2ecc71";
          } else if (o.department === "Electricity") {
            badgeBg = "#fffde8";
            badgeColor = "#f1c40f";
          } else if (o.department === "Sanitation") {
            badgeBg = "#fbe8fd";
            badgeColor = "#9b59b6";
          } else if (o.department === "Other") {
            badgeBg = "#f0f2f5";
            badgeColor = "#95a5a6";
          }

          const email = o.email || `${o.name.toLowerCase().replace(/\s+/g, ".")}@civicconnect.gov.in`;
          const phone = o.phone || `+91 98765 000${o._id || o.id}`;

          return (
            <div
              key={o._id || o.id}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "28px 24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.03)",
                border: "1.5px solid #eef2f6",
                textAlign: "center",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#3498db44";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.03)";
                e.currentTarget.style.borderColor = "#eef2f6";
              }}
            >
              {/* Avatar Initials with beautiful gradient */}
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3498db, #9b59b6)",
                color: "white",
                fontSize: "24px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 4px 10px rgba(52, 152, 219, 0.2)"
              }}>
                {o.name[0]}
              </div>

              {/* Name */}
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1a1a2e", margin: "0 0 8px 0" }}>
                {o.name}
              </h3>

              {/* Department/Sector Badge */}
              <span style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: "20px",
                backgroundColor: badgeBg,
                color: badgeColor,
                fontSize: "12px",
                fontWeight: "750",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "20px",
                border: `1px solid ${badgeColor}22`
              }}>
                {o.department}
              </span>

              <hr style={{ border: "none", borderTop: "1.5px solid #f1f5f9", margin: "0 0 16px 0" }} />

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left", fontSize: "13px", color: "#64748b" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>✉️</span>
                  <span style={{ fontWeight: "600", color: "#334155" }}>{email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2ecc71" }}></span>
                  <span style={{ fontWeight: "700", color: "#2ecc71", fontSize: "11px", textTransform: "uppercase" }}>Active / On Duty</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}