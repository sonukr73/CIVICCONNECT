import { useState, useEffect, useRef } from "react";
import axios from "axios";
import LeafletMap from "../components/LeafletMap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";




const MOCK_COMPLAINTS = [
  { id: "#1", title: "Broken Water Main", description: "Water is leaking continuously from the main pipe.", category: "Water Supply", priority: "Medium", location: "Vasant Kunj", wardNumber: "2", lat: 28.6139, lng: 77.209, date: "6/17/2026", status: "Resolved", assignedOfficer: "o6", citizenName: "Amit Sharma", citizenEmail: "amit.sharma@example.com", adminNotes: "" },
  { id: "C001", title: "Pothole on MG Road", description: "Large pothole causing accidents near MG Road junction.", category: "Roads", priority: "High", location: "MG Road, Delhi", date: "2026-06-15", status: "Pending", assignedOfficer: null, citizenName: "Rahul Gupta", adminNotes: "" },
  { id: "C002", title: "No water supply for 3 days", description: "Our entire colony has had no water for 3 consecutive days.", category: "Water Supply", priority: "High", location: "Sector 14, Dwarka", date: "2026-06-16", status: "Assigned", assignedOfficer: "o2", citizenName: "Meena Agarwal", adminNotes: "" },
  { id: "C003", title: "Street light not working", description: "3 street lights on Park Street are broken since 2 weeks.", category: "Electricity", priority: "High", location: "Park Street, Rohini", date: "2026-06-16", status: "In Progress", assignedOfficer: "o3", citizenName: "Suresh Kumar", adminNotes: "Officer visited site on 17th." },
  { id: "C004", title: "Garbage not collected", description: "Garbage collection has been skipped for the past week.", category: "Sanitation", priority: "Medium", location: "Lajpat Nagar", date: "2026-06-17", status: "Resolved", assignedOfficer: "o4", citizenName: "Anita Desai", adminNotes: "Resolved after 2 visits." },
  { id: "C005", title: "Open drain near school", description: "Open sewage drain is a health hazard next to Delhi Public School.", category: "Sanitation", priority: "Medium", location: "DPS Road, Mayur Vihar", date: "2026-06-17", status: "Pending", assignedOfficer: null, citizenName: "Ramesh Jain", adminNotes: "" },
  { id: "C006", title: "Broken water pipe flooding road", description: "A burst pipe is flooding the main road and wasting water.", category: "Water Supply", priority: "High", location: "Model Town, Delhi", date: "2026-06-18", status: "Pending", assignedOfficer: null, citizenName: "Pooja Sharma", adminNotes: "" },
  { id: "C007", title: "Encroachment on footpath", description: "Illegal shops have blocked the entire footpath forcing pedestrians onto road.", category: "Other", priority: "Low", location: "Chandni Chowk", date: "2026-06-18", status: "Assigned", assignedOfficer: "o5", citizenName: "Dinesh Verma", adminNotes: "" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: { color: "#e67e22", bg: "#fef3e2", label: "Pending" },
  Assigned: { color: "#3498db", bg: "#e8f4fd", label: "Assigned" },
  "In Progress": { color: "#9b59b6", bg: "#f5eef8", label: "In Progress" },
  Resolved: { color: "#27ae60", bg: "#e9f7ef", label: "Resolved" },
  Rejected: { color: "#e74c3c", bg: "#fdecea", label: "Rejected" },
};

const REJECT_REASONS = [
  "False / Fabricated Complaint",
  "Duplicate Complaint",
  "Outside Jurisdiction",
  "Insufficient Information",
  "Already Resolved Previously",
  "Other",
];

// ─── Reject Confirmation Modal ────────────────────────────────────────────────
function RejectModal({ complaint, onClose, onConfirm }) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [customNote, setCustomNote] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px", width: "100%", maxWidth: "460px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden"
      }}>
        <div style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)", padding: "22px 28px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "12px", opacity: 0.75, marginBottom: "4px" }}>Rejecting #{complaint.id || complaint._id}</p>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Reject Complaint</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", color: "white", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "28px" }}>
          <div style={{ background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#c0392b", fontWeight: "600" }}>⚠ This action will notify the citizen and close the complaint as rejected.</p>
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Rejection Reason</label>
            <select style={inputStyle} value={reason} onChange={e => setReason(e.target.value)}>
              {REJECT_REASONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Additional Notes (Optional)</label>
            <textarea style={{ ...inputStyle, height: "70px", resize: "vertical" }} placeholder="Explain further if needed…" value={customNote} onChange={e => setCustomNote(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => onConfirm(complaint.id || complaint._id, reason, customNote)}
              style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #c0392b, #e74c3c)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}
            >
              Confirm Rejection
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationModal({ complaint, onClose }) {
  const latVal = complaint.latitude !== undefined ? complaint.latitude : (complaint.locationCoordinates?.lat || complaint.lat || 28.6139);
  const lngVal = complaint.longitude !== undefined ? complaint.longitude : (complaint.locationCoordinates?.lng || complaint.lng || 77.209);
  const timestamp = complaint.capturedAt || complaint.createdAt;
  const imageUrl = complaint.image || complaint.imageUrl;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px", width: "100%", maxWidth: "600px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", padding: "22px 28px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "12px", opacity: 0.75, marginBottom: "4px" }}>Geotagged Location - Complaint #{complaint.id || complaint._id}</p>
              <h2 style={{ margin: 0, fontSize: "18px" }}>{complaint.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", color: "white", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Info grid */}
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Locality / Address</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{complaint.location}</p>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Coordinates</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{latVal.toFixed(6)}, {lngVal.toFixed(6)}</p>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Captured At</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
              </p>
            </div>
            {complaint.category && (
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Category</span>
                <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{complaint.category}</p>
              </div>
            )}
          </div>

          {/* Leaflet Map */}
          <div>
            <LeafletMap lat={latVal} lng={lngVal} readOnly={true} height="220px" />
          </div>

          {/* Image evidence */}
          {imageUrl && (
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: "800", color: "#475569" }}>
                Attached Visual Evidence
              </div>
              <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#f1f5f9" }}>
                <img src={imageUrl} alt="Grievance Proof" style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "6px", objectFit: "contain" }} />
              </div>
            </div>
          )}

          {/* Close button */}
          <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: "20px",
      backgroundColor: cfg.bg, color: cfg.color, fontSize: "12px",
      fontWeight: "700", letterSpacing: "0.3px", whiteSpace: "nowrap"
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// ─── Edit/Assign Modal ────────────────────────────────────────────────────────
function ComplaintModal({ complaint, officers, onClose, onSave }) {
  const [form, setForm] = useState({ ...complaint });

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px", width: "100%", maxWidth: "620px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg, #2c3e50, #3498db)", padding: "24px 28px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>Complaint #{form.id}</p>
              <h2 style={{ margin: 0, fontSize: "20px" }}>{form.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", color: "white", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "28px" }}>
          {/* Citizen Info */}
          <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div><span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Citizen</span><p style={{ fontWeight: "600", marginTop: "2px" }}>{form.citizenName}</p></div>
            <div><span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</span><p style={{ fontWeight: "600", marginTop: "2px" }}>{form.location}</p></div>
            <div><span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reported On</span><p style={{ fontWeight: "600", marginTop: "2px" }}>{form.date}</p></div>
            <div><span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</span><p style={{ fontWeight: "600", marginTop: "2px" }}>{form.category}</p></div>
            <div>
              <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Priority Badge</span>
              <div style={{ marginTop: "2px" }}>
                <span style={{
                  display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                  backgroundColor: form.priority === "High" ? "#fee2e2" : (form.priority === "Medium" ? "#fef3c7" : "#f1f5f9"),
                  color: form.priority === "High" ? "#ef4444" : (form.priority === "Medium" ? "#d97706" : "#475569")
                }}>
                  {form.priority || "Medium"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Complaint Title</label>
            <input style={inputStyle} value={form.title} onChange={e => handleChange("title", e.target.value)} />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }} value={form.description} onChange={e => handleChange("description", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => {
                const newCat = e.target.value;
                const CATEGORY_PRIORITY_MAP = {
                  "Roads": "High",
                  "Water Supply": "High",
                  "Electricity": "High",
                  "Sanitation": "Medium",
                  "Other": "Low"
                };
                handleChange("category", newCat);
                handleChange("priority", CATEGORY_PRIORITY_MAP[newCat] || "Medium");
              }}>
                <option>Roads</option>
                <option>Water Supply</option>
                <option>Electricity</option>
                <option>Sanitation</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} value={form.priority || "Medium"} onChange={e => handleChange("priority", e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => handleChange("status", e.target.value)}>
                <option>Pending</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Rejected</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assign Officer</label>
              <select style={inputStyle} value={form.assignedOfficer || ""} onChange={e => handleChange("assignedOfficer", e.target.value || null)}>
                <option value="">— Unassigned —</option>
                {officers.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Admin Notes</label>
            <textarea style={{ ...inputStyle, height: "70px", resize: "vertical" }} placeholder="Add internal notes…" value={form.adminNotes} onChange={e => handleChange("adminNotes", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => onSave(form)} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #3498db, #2980b9)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Save Changes
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = { width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", color: "#333", outline: "none", background: "#fafafa", fontFamily: "inherit", transition: "border-color 0.2s" };

// ─── Solid Colored Stat Card ──────────────────────────────────────────────────
function SolidStatCard({ label, value, icon, gradient, iconColor }) {
  return (
    <div style={{
      background: gradient, 
      borderRadius: "16px", 
      padding: "24px 16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center", 
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      cursor: "pointer",
      color: "white",
      textAlign: "center"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)"; }}
    >
      <div style={{ 
        width: "48px", 
        height: "48px", 
        borderRadius: "50%", 
        background: "white", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        marginBottom: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>
        <Icon path={icon} size={22} color={iconColor} />
      </div>
      <div style={{ fontSize: "13px", fontWeight: "700", opacity: 0.9, letterSpacing: "0.2px" }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: "900", marginTop: "6px", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Secondary Analytics Card ─────────────────────────────────────────────────
function SecondaryAnalyticsCard({ label, value, valueColor, icon, circleBg }) {
  return (
    <div style={{
      background: "white", 
      borderRadius: "14px", 
      padding: "18px 20px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)", 
      border: "1.5px solid #eef2f6",
      display: "flex",
      alignItems: "center", 
      gap: "14px",
      transition: "transform 0.2s, box-shadow 0.2s",
      flex: 1,
      minWidth: "220px"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ 
        width: "44px", 
        height: "44px", 
        borderRadius: "50%", 
        background: circleBg, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
        <div style={{ fontSize: "17px", fontWeight: "800", color: valueColor, marginTop: "2px" }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Category Colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Roads": "#3498db",
  "Water Supply": "#2ecc71",
  "Electricity": "#f1c40f",
  "Sanitation": "#9b59b6",
  "Other": "#95a5a6"
};

// ─── Interactive Donut Chart ──────────────────────────────────────────────────
function InteractiveDonutChart({ data, title }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const center = 70;

  let currentOffset = 0;

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      flex: 1,
      minWidth: "280px",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      border: "1px solid #f0f0f0"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
    >
      <h4 style={{ margin: "0 0 20px 0", fontSize: "15px", fontWeight: "800", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </h4>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", width: "100%", flexWrap: "wrap" }}>
        {/* SVG Chart */}
        <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0, margin: "0 auto" }}>
          <svg width="100%" height="100%" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
            {total === 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#f0f2f5"
                strokeWidth={strokeWidth}
              />
            )}
            {data.map((item, index) => {
              if (item.value === 0) return null;
              const percentage = item.value / total;
              const dashLength = percentage * circumference;
              const strokeDasharray = `${dashLength} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += dashLength;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={item.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: "all 0.25s ease-in-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          {/* Inner Display (Donut hole) */}
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center"
          }}>
            {hoveredIndex !== null ? (
              <>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {data[hoveredIndex].label}
                </span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#1a1a2e", marginTop: "2px", lineHeight: 1 }}>
                  {data[hoveredIndex].value}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: data[hoveredIndex].color, marginTop: "2px" }}>
                  {((data[hoveredIndex].value / total) * 100).toFixed(0)}%
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total
                </span>
                <span style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a2e", marginTop: "2px", lineHeight: 1 }}>
                  {total}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minWidth: "140px" }}>
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  background: isHovered ? "rgba(0, 0, 0, 0.04)" : "transparent",
                  transition: "all 0.2s ease",
                  opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#444", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#1a1a2e", background: "#f0f2f5", padding: "2px 8px", borderRadius: "20px" }}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const kpiContainerRef = useRef(null);

  const scrollKPI = (direction) => {
    if (kpiContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      kpiContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem("complaints");
    let list = saved ? JSON.parse(saved) : MOCK_COMPLAINTS;
    if (!list.some(c => c.id === "#1")) {
      list = [
        { id: "#1", title: "Broken Water Main", description: "Water is leaking continuously from the main pipe.", category: "Water Supply", priority: "Medium", location: "Vasant Kunj", wardNumber: "2", lat: 28.6139, lng: 77.209, date: "6/17/2026", status: "Resolved", assignedOfficer: "o6", citizenName: "Amit Sharma", citizenEmail: "amit.sharma@example.com", adminNotes: "" },
        ...list.filter(c => c.id !== "#1")
      ];
    }
    return list;
  });

  const [officers, setOfficers] = useState([]);
  const [newOfficerName, setNewOfficerName] = useState("");
  const [newOfficerDept, setNewOfficerDept] = useState("Roads");
  const [officerError, setOfficerError] = useState("");
  const [officerSuccess, setOfficerSuccess] = useState("");
  const [activeQueuePage, setActiveQueuePage] = useState(0);

  const getDerivedCredentials = (name) => {
    if (!name) return { email: "", password: "" };
    const firstName = name.trim().split(/\s+/)[0].toLowerCase();
    return {
      email: firstName ? `${firstName}.gov.in` : "",
      password: firstName ? `${firstName}@123` : ""
    };
  };

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

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    if (!newOfficerName.trim()) {
      setOfficerError("Officer name is required.");
      return;
    }
    const { email, password } = getDerivedCredentials(newOfficerName);
    if (!email || !password) {
      setOfficerError("Could not derive credentials from name.");
      return;
    }

    setOfficerError("");
    setOfficerSuccess("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/authorities/register`, {
        name: newOfficerName.trim(),
        email,
        password,
        department: newOfficerDept
      });

      if (res.data && res.data.success) {
        setOfficerSuccess(`Added successfully! ID: ${email}, Pass: ${password}`);
        setNewOfficerName("");
        fetchOfficers();
      }
    } catch (err) {
      setOfficerError(err.response?.data?.message || "Failed to add officer.");
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this officer?")) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/authorities/${id}`);
      if (res.data && res.data.success) {
        fetchOfficers();
      }
    } catch (err) {
      console.error("Failed to delete officer:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/complaints`);
      if (res.data && res.data.success) {
        const dbComplaints = res.data.complaints;
        const localSaved = localStorage.getItem("complaints");
        const localList = localSaved ? JSON.parse(localSaved) : MOCK_COMPLAINTS;
        
        const combined = [...dbComplaints];
        localList.forEach(lc => {
          const exists = dbComplaints.some(dc => 
            dc.id === lc.id || 
            dc._id === lc.id || 
            dc.id === lc._id ||
            (dc.title === lc.title && dc.description === lc.description)
          );
          if (!exists) {
            combined.push(lc);
          }
        });
        setComplaints(combined);
      }
    } catch (err) {
      console.warn("Could not fetch complaints from backend. Using local storage.", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
  }, []);

  useEffect(() => {
    localStorage.setItem("complaints", JSON.stringify(complaints));
  }, [complaints]);

  const [editTarget, setEditTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewLocationTarget, setViewLocationTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterLocality, setFilterLocality] = useState("All");
  const [filterWard, setFilterWard] = useState("All");
  const [filterAssignment, setFilterAssignment] = useState("All");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    assigned: complaints.filter(c => c.status === "Assigned").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    rejected: complaints.filter(c => c.status === "Rejected").length,
  };

  // Compile datasets for Pie Charts
  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map(cat => ({
    label: cat,
    value: categoryCounts[cat],
    color: CATEGORY_COLORS[cat] || "#95a5a6"
  }));

  const statusCounts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.keys(STATUS_CONFIG).map(status => ({
    label: status,
    value: statusCounts[status] || 0,
    color: STATUS_CONFIG[status].color
  })).filter(item => item.value > 0);

  const apiPatch = async (id, updatedFields) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (isMongoId) {
      try {
        await axios.patch(`${API_BASE_URL}/api/complaints/${id}`, updatedFields);
      } catch (err) {
        console.error("Failed to patch update to backend:", err);
      }
    }
  };

  const handleReject = async (id, reason, note) => {
    const updatedFields = { status: "Rejected", rejectionReason: reason, adminNotes: note };
    await apiPatch(id, updatedFields);
    setComplaints(prev => prev.map(c =>
      (c.id === id || c._id === id) ? { ...c, ...updatedFields } : c
    ));
    setRejectTarget(null);
  };

  const handleSave = async (updated) => {
    const targetId = updated.id || updated._id;
    await apiPatch(targetId, updated);
    setComplaints(prev => prev.map(c => (c.id === targetId || c._id === targetId) ? updated : c));
    setEditTarget(null);
  };

  const handleMarkResolved = async (id) => {
    const updatedFields = { status: "Resolved" };
    await apiPatch(id, updatedFields);
    setComplaints(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...updatedFields } : c));
  };

  const filtered = complaints
    .filter(c => filterStatus === "All" || c.status === filterStatus)
    .filter(c => filterCategory === "All" || c.category === filterCategory)
    .filter(c => filterPriority === "All" || c.priority === filterPriority)
    .filter(c => filterLocality === "All" || c.location?.toLowerCase().includes(filterLocality.toLowerCase()))
    .filter(c => {
      const checkId = c.id || c._id;
      const wardNum = c.wardNumber || (checkId ? checkId.toString().charCodeAt(checkId.toString().length - 1) % 10 + 1 : 9);
      return filterWard === "All" || wardNum.toString() === filterWard;
    })
    .filter(c => {
      if (filterAssignment === "All") return true;
      if (filterAssignment === "Assigned") return !!c.assignedOfficer;
      if (filterAssignment === "Unassigned") return !c.assignedOfficer;
      return true;
    })
    .filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getOfficerName = (id) => {
    if (!id) return <span style={{ color: "#bbb", fontStyle: "italic" }}>Unassigned</span>;
    const mockMap = {
      o1: "Rajesh Sharma",
      o2: "Priya Mehta",
      o3: "Amit Singh",
      o4: "Sunita Rao",
      o5: "Vikram Patel",
      o6: "Officer Ramesh"
    };
    if (mockMap[id]) return mockMap[id];
    const o = officers.find(o => o._id === id || o.id === id);
    return o ? o.name : "—";
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "Rejected") {
      const complaint = complaints.find(c => c.id === id || c._id === id);
      setRejectTarget(complaint);
    } else {
      const updatedFields = { status: newStatus };
      await apiPatch(id, updatedFields);
      setComplaints(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...updatedFields } : c));
    }
  };

  const handleAssignOfficer = async (id, officerId) => {
    const complaint = complaints.find(c => c.id === id || c._id === id);
    const newStatus = complaint && complaint.status === "Pending" && officerId ? "Assigned" : (complaint ? complaint.status : "Pending");
    const updatedFields = { assignedOfficer: officerId, status: newStatus };
    await apiPatch(id, updatedFields);
    setComplaints(prev => prev.map(c => {
      if (c.id === id || c._id === id) {
        return {
          ...c,
          ...updatedFields
        };
      }
      return c;
    }));
  };

  const uniqueLocalities = ["All", ...new Set(complaints.map(c => c.location ? c.location.split(",")[0].trim() : "Other"))];
  const wards = ["All", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  const pageSize = 1; // 1 record per page for the queue
  const maxPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const currentPage = Math.min(activeQueuePage, maxPage);
  const paginatedItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const filterLabelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px"
  };

  const filterInputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#334155",
    outline: "none",
    background: "#f8fafc",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    cursor: "pointer"
  };

  const queueThStyle = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "800",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap"
  };

  const queueTdStyle = {
    padding: "16px",
    verticalAlign: "middle",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#334155"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px 40px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>Admin Control Console</h1>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px", fontWeight: "500" }}>Monitor real-time civic complaints, review analytics, verify duplicates, and dispatch resolving officers.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "white", padding: "8px 16px", borderRadius: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ background: "linear-gradient(135deg, #3498db, #2980b9)", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "15px" }}>
            {user?.name?.[0] || "A"}
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "#1a1a2e" }}>{user?.name || "Admin"}</div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Administrator</div>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "32px", flexWrap: "wrap" }}>
        <SecondaryAnalyticsCard 
          label="Resolution Rate" 
          value={stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) + "%" : "0.0%"} 
          valueColor="#2e7d32" 
          circleBg="#e8f5e9"
          icon={
            <span style={{ fontSize: "18px", fontWeight: "900", color: "#2e7d32" }}>%</span>
          } 
        />
        <SecondaryAnalyticsCard 
          label="Avg Resolution" 
          value="27.0 Hours" 
          valueColor="#0288d1" 
          circleBg="#e1f5fe"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0288d1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          } 
        />
        <SecondaryAnalyticsCard 
          label="Average Rating" 
          value="Not Available" 
          valueColor="#f57c00" 
          circleBg="#fff8e1"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#f57c00" }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          } 
        />
        <SecondaryAnalyticsCard 
          label="Total Feedbacks" 
          value="0" 
          valueColor="#00838f" 
          circleBg="#e0f7fa"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00838f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          } 
        />
      </div>

      {/* Pie Charts Side-by-Side */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
        <InteractiveDonutChart data={categoryData} title="Complaints by Category" />
        <InteractiveDonutChart data={statusData} title="Complaints by Status" />
      </div>

      {/* KPI Cards */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Left Scroll Button */}
        <button 
          onClick={() => scrollKPI("left")}
          style={{ 
            position: "absolute", left: "-18px", top: "50%", transform: "translateY(-50%)", 
            width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(51, 51, 51, 0.85)", 
            color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", 
            cursor: "pointer", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#111"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(51, 51, 51, 0.85)"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Scrollable Cards Wrapper */}
        <div 
          ref={kpiContainerRef}
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(5, 1fr)", 
            gap: "20px", 
            overflowX: "auto", 
            scrollBehavior: "smooth",
            padding: "4px 0",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
          className="hide-scrollbar"
        >
          <SolidStatCard label="Total Registered" value={stats.total} gradient="linear-gradient(135deg, #0d6efd, #0b5ed7)" iconColor="#0d6efd" icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
          <SolidStatCard label="Pending Dispatch" value={stats.pending} gradient="linear-gradient(135deg, #e65100, #d84315)" iconColor="#e65100" icon="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <SolidStatCard label="Assigned" value={stats.assigned} gradient="linear-gradient(135deg, #0288d1, #007cba)" iconColor="#0288d1" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
          <SolidStatCard label="In Progress" value={stats.inProgress} gradient="linear-gradient(135deg, #7b1fa2, #6a1b9a)" iconColor="#7b1fa2" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
          <SolidStatCard label="Resolved" value={stats.resolved} gradient="linear-gradient(135deg, #2e7d32, #1b5e20)" iconColor="#2e7d32" icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </div>

        {/* Right Scroll Button */}
        <button 
          onClick={() => scrollKPI("right")}
          style={{ 
            position: "absolute", right: "-18px", top: "50%", transform: "translateY(-50%)", 
            width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(51, 51, 51, 0.85)", 
            color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", 
            cursor: "pointer", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#111"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(51, 51, 51, 0.85)"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Dynamic Filters Card */}
      <div style={{
        background: "white",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #f0f0f0"
      }}>
        {/* Row 1: Search, Status, Category */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Search */}
          <div>
            <label style={filterLabelStyle}>SEARCH TITLE, CITIZEN OR KEYWORD...</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search title, citizen or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ ...filterInputStyle, paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={filterLabelStyle}>FILTER BY STATUS</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={filterInputStyle}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label style={filterLabelStyle}>FILTER BY CATEGORY</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={filterInputStyle}>
              <option value="All">All Categories</option>
              <option value="Roads">Roads</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 2: Priority, Area/Locality, Ward, Assignment Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          {/* Priority */}
          <div>
            <label style={filterLabelStyle}>PRIORITY</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={filterInputStyle}>
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Area/Locality */}
          <div>
            <label style={filterLabelStyle}>FILTER BY AREA / LOCALITY</label>
            <select value={filterLocality} onChange={e => setFilterLocality(e.target.value)} style={filterInputStyle}>
              <option value="All">All Localities</option>
              {uniqueLocalities.filter(loc => loc !== "All").map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Ward Number */}
          <div>
            <label style={filterLabelStyle}>FILTER BY WARD NUMBER</label>
            <select value={filterWard} onChange={e => setFilterWard(e.target.value)} style={filterInputStyle}>
              <option value="All">All Wards</option>
              {wards.filter(w => w !== "All").map(w => (
                <option key={w} value={w}>Ward {w}</option>
              ))}
            </select>
          </div>

          {/* Assignment Status */}
          <div>
            <label style={filterLabelStyle}>ASSIGNMENT STATUS</label>
            <select value={filterAssignment} onChange={e => setFilterAssignment(e.target.value)} style={filterInputStyle}>
              <option value="All">All Assignments</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Grievance Redressal Queue Table */}
      <div style={{ position: "relative", marginBottom: "28px" }}>
        {/* Left Arrow Button */}
        <button
          onClick={() => setActiveQueuePage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          style={{
            position: "absolute",
            left: "-18px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: currentPage === 0 ? "#e2e8f0" : "rgba(51, 51, 51, 0.85)",
            color: currentPage === 0 ? "#cbd5e1" : "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { if (currentPage > 0) e.currentTarget.style.backgroundColor = "#111"; }}
          onMouseLeave={e => { if (currentPage > 0) e.currentTarget.style.backgroundColor = "rgba(51, 51, 51, 0.85)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Active Queue Card */}
        <div style={{ background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #eef2f6", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "850", color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
              Active Grievance Redressal Queue
            </h3>
            <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
              Found {filtered.length} {filtered.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d6efd", color: "white" }}>
                  <th style={queueThStyle}>ID</th>
                  <th style={queueThStyle}>CITIZEN DETAILS</th>
                  <th style={queueThStyle}>GRIEVANCE DETAILS</th>
                  <th style={queueThStyle}>PRIORITY & CATEGORY</th>
                  <th style={queueThStyle}>STATUS ACTION</th>
                  <th style={queueThStyle}>DISPATCH PROJECT RESOLVER</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: "14px", background: "#f8fafc" }}>
                      No active grievances matching the filters.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((c) => {
                    const targetId = c.id || c._id;
                    const citizenEmail = c.citizenEmail || (c.citizenName ? c.citizenName.toLowerCase().replace(/\s+/g, ".") + "@example.com" : "citizen@example.com");
                    const ward = c.wardNumber || (targetId ? targetId.toString().charCodeAt(targetId.toString().length - 1) % 10 + 1 : 1);
                    const lat = c.lat || "28.6139";
                    const lng = c.lng || "77.209";

                    // Status pill decoration
                    let statusLabel = c.status.toUpperCase();
                    let statusBg = "#fef3e2";
                    let statusColor = "#e67e22";
                    let statusIcon = "⏳";

                    if (c.status === "Resolved") {
                      statusBg = "#e9f7ef";
                      statusColor = "#27ae60";
                      statusIcon = "✔️";
                    } else if (c.status === "Assigned") {
                      statusBg = "#e8f4fd";
                      statusColor = "#3498db";
                      statusIcon = "👤";
                    } else if (c.status === "In Progress") {
                      statusBg = "#f5eef8";
                      statusColor = "#9b59b6";
                      statusIcon = "⚙️";
                    } else if (c.status === "Rejected") {
                      statusBg = "#fdecea";
                      statusColor = "#e74c3c";
                      statusIcon = "❌";
                    }

                    const officer = officers.find(o => o._id === c.assignedOfficer || o.id === c.assignedOfficer);

                    return (
                      <tr key={targetId} style={{ background: "#f8fafc" }}>
                        <td style={{ ...queueTdStyle, fontWeight: "800", color: "#1e293b", fontSize: "14px" }}>
                          {targetId}
                        </td>
                        <td style={queueTdStyle}>
                          <div style={{ fontWeight: "750", color: "#1e293b" }}>{c.citizenName}</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{citizenEmail}</div>
                        </td>
                        <td style={{ ...queueTdStyle, maxWidth: "250px" }}>
                          <div style={{ fontWeight: "750", color: "#1e293b" }}>{c.title}</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.description}>
                            {c.description}
                          </div>
                          <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px", fontWeight: "600" }}>
                            Loc: {c.location}, Ward {ward} ({lat}, {lng})
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewLocationTarget(c)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "6px",
                              padding: "4px 8px",
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                              borderRadius: "6px",
                              fontWeight: "750",
                              fontSize: "11px",
                              cursor: "pointer"
                            }}
                          >
                            📍 View Location
                          </button>
                        </td>
                        <td style={queueTdStyle}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              backgroundColor: c.priority === "High" ? "#ef4444" : (c.priority === "Medium" ? "#f59e0b" : "#64748b"),
                              color: "white"
                            }}>
                              {c.priority || "Medium"}
                            </span>
                            <span style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "800",
                              backgroundColor: "#475569",
                              color: "white"
                            }}>
                              {c.category}
                            </span>
                          </div>
                        </td>
                        <td style={queueTdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "140px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              backgroundColor: statusBg,
                              color: statusColor,
                              fontSize: "11px",
                              fontWeight: "750",
                              border: `1px solid ${statusColor}33`
                            }}>
                              <span>{statusIcon}</span>
                              <span>{statusLabel}</span>
                            </span>
                            <select
                              value={c.status}
                              onChange={e => handleStatusChange(targetId, e.target.value)}
                              style={{
                                padding: "6px 10px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                fontSize: "12px",
                                outline: "none",
                                background: "white",
                                cursor: "pointer"
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                        <td style={queueTdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "180px" }}>
                            <select
                              value={c.assignedOfficer || ""}
                              onChange={e => handleAssignOfficer(targetId, e.target.value || null)}
                              style={{
                                padding: "6px 10px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                fontSize: "12px",
                                outline: "none",
                                background: "white",
                                cursor: "pointer"
                              }}
                            >
                              <option value="">— Unassigned —</option>
                              {officers.map(o => (
                                <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
                              ))}
                            </select>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                              {officer ? (
                                <span>Assigned: {officer.name} <br/> On: {c.date}</span>
                              ) : (
                                <span style={{ fontStyle: "italic", color: "#94a3b8" }}>Unassigned</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => setActiveQueuePage(prev => Math.min(maxPage, prev + 1))}
          disabled={currentPage >= maxPage}
          style={{
            position: "absolute",
            right: "-18px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: currentPage >= maxPage ? "#e2e8f0" : "rgba(51, 51, 51, 0.85)",
            color: currentPage >= maxPage ? "#cbd5e1" : "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentPage >= maxPage ? "not-allowed" : "pointer",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { if (currentPage < maxPage) e.currentTarget.style.backgroundColor = "#111"; }}
          onMouseLeave={e => { if (currentPage < maxPage) e.currentTarget.style.backgroundColor = "rgba(51, 51, 51, 0.85)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Complaints Table */}
      <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>All Complaints ({filtered.length})</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                {["ID", "Complaint", "Category", "Priority", "Location", "Date", "Assigned Officer", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: "15px" }}>No complaints found.</td></tr>
              )}
              {filtered.map((c, i) => {
                const targetId = c.id || c._id;
                const formattedDate = c.date || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "");
                const citizenName = c.citizenName || (c.user && c.user.name) || "Citizen";
                return (
                  <tr key={targetId} style={{ borderTop: "1px solid #f5f5f5", background: i % 2 === 0 ? "white" : "#fafafa", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa"}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "#3498db", fontSize: "13px", whiteSpace: "nowrap" }}>{targetId}</td>
                    <td style={{ padding: "14px 16px", maxWidth: "200px" }}>
                      <div style={{ fontWeight: "700", color: "#1a1a2e", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>By {citizenName}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", whiteSpace: "nowrap" }}>{c.category}</td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                        backgroundColor: c.priority === "High" ? "#fee2e2" : (c.priority === "Medium" ? "#fef3c7" : "#f1f5f9"),
                        color: c.priority === "High" ? "#ef4444" : (c.priority === "Medium" ? "#d97706" : "#475569")
                      }}>
                        {c.priority || "Medium"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.location}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#888", whiteSpace: "nowrap" }}>{formattedDate}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600", color: "#333", whiteSpace: "nowrap" }}>{getOfficerName(c.assignedOfficer)}</td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setEditTarget(c)}
                          style={{ padding: "7px 14px", background: "#e8f4fd", color: "#3498db", border: "none", borderRadius: "7px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewLocationTarget(c)}
                          style={{ padding: "7px 14px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: "7px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                        >
                          📍 Location
                        </button>
                        {c.status !== "Resolved" && c.status !== "Rejected" && (
                          <button
                            onClick={() => handleMarkResolved(targetId)}
                            title="Mark as Resolved"
                            style={{ padding: "7px 12px", background: "#e9f7ef", color: "#27ae60", border: "none", borderRadius: "7px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                          >
                            ✓ Resolve
                          </button>
                        )}
                        {c.status !== "Resolved" && c.status !== "Rejected" && (
                          <button
                            onClick={() => setRejectTarget(c)}
                            title="Reject Complaint"
                            style={{ padding: "7px 12px", background: "#fdecea", color: "#e74c3c", border: "none", borderRadius: "7px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                          >
                            ✕ Reject
                          </button>
                        )}
                        {c.status === "Rejected" && c.rejectReason && (
                          <span title={c.rejectReason} style={{ padding: "7px 10px", background: "#fdecea", color: "#e74c3c", borderRadius: "7px", fontSize: "11px", fontWeight: "600", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", whiteSpace: "nowrap", cursor: "help" }}>
                            {c.rejectReason}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officers Panel */}
      <div style={{ marginTop: "24px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Officers List Card */}
        <div style={{ flex: 2, minWidth: "300px", background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>Departmental Officers ({officers.length})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
            {officers.map(o => {
              const assigned = complaints.filter(c => (c.assignedOfficer === o._id || c.assignedOfficer === o.id) && c.status !== "Resolved").length;
              return (
                <div key={o._id || o.id} style={{ position: "relative", padding: "16px", border: "1.5px solid #f0f0f0", borderRadius: "12px", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#3498db"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(52,152,219,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <button 
                    onClick={() => handleDeleteOfficer(o._id || o.id)}
                    style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "#e74c3c", fontSize: "14px", cursor: "pointer", fontWeight: "bold" }}
                    title="Delete Officer"
                  >
                    ✕
                  </button>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #3498db, #9b59b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", marginBottom: "10px" }}>
                    {o.name[0]}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a2e" }}>{o.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{o.department}</div>
                  <div style={{ marginTop: "10px", display: "inline-block", padding: "3px 10px", borderRadius: "20px", background: assigned > 0 ? "#fef3e2" : "#e9f7ef", color: assigned > 0 ? "#e67e22" : "#27ae60", fontSize: "12px", fontWeight: "700" }}>
                    {assigned} active task{assigned !== 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Officer Form Card */}
        <div style={{ flex: 1, minWidth: "280px", background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>Add New Officer</h3>
          {officerError && <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>{officerError}</p>}
          {officerSuccess && <p style={{ color: "green", fontSize: "13px", marginBottom: "10px" }}>{officerSuccess}</p>}
          
          <form onSubmit={handleAddOfficer}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#555", marginBottom: "6px", textTransform: "uppercase" }}>Name</label>
              <input 
                type="text" 
                placeholder="e.g. Rahul Verma" 
                value={newOfficerName}
                onChange={e => setNewOfficerName(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>
            
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#555", marginBottom: "6px", textTransform: "uppercase" }}>Department</label>
              <select 
                value={newOfficerDept}
                onChange={e => setNewOfficerDept(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", background: "white", cursor: "pointer" }}
              >
                <option value="Roads">Roads</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {newOfficerName.trim() && (
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "6px", marginBottom: "16px", fontSize: "12px", border: "1px dashed #cbd5e1" }}>
                <span style={{ fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Derived Credentials:</span>
                <div><strong>Login ID:</strong> {getDerivedCredentials(newOfficerName).email}</div>
                <div><strong>Password:</strong> {getDerivedCredentials(newOfficerName).password}</div>
              </div>
            )}

            <button 
              type="submit" 
              style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #3498db, #2980b9)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
            >
              Add Officer
            </button>
          </form>
        </div>

      </div>

      {/* Edit Modal */}
      {editTarget && (
        <ComplaintModal
          complaint={editTarget}
          officers={officers}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          complaint={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {/* Location Modal */}
      {viewLocationTarget && (
        <LocationModal
          complaint={viewLocationTarget}
          onClose={() => setViewLocationTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
