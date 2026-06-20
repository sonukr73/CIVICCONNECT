import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLanguage } from "../LanguageContext";
import LeafletMap from "../components/LeafletMap";
import StatusBadge from "../components/StatusBadge";
import WorkLogSection from "../components/WorkLogSection";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const containerStyle = {
  width: "100%",
  height: "220px",
  borderRadius: "8px",
  marginBottom: "15px"
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const STATUS_CONFIG = {
  Pending: { color: "#e67e22", bg: "#fef3e2" },
  Assigned: { color: "#3498db", bg: "#e8f4fd" },
  "In Progress": { color: "#9b59b6", bg: "#f5eef8" },
  Resolved: { color: "#27ae60", bg: "#e9f7ef" },
  Rejected: { color: "#e74c3c", bg: "#fdecea" }
};

// ─── Interactive Donut Chart ──────────────────────────────────────────────────
function InteractiveDonutChart({ data, title }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const radius = 46;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const center = 60;

  let currentOffset = 0;

  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
      border: "1px solid #f0f0f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "800", color: "#2d3748", alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </h4>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", width: "100%", flexWrap: "wrap", justifyContent: "center" }}>
        {/* SVG Chart */}
        <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            {total === 0 && (
              <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#f0f2f5" strokeWidth={strokeWidth} />
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
                  strokeWidth={isHovered ? strokeWidth + 2.5 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "all 0.25s ease", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          {/* Donut hole content */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center" }}>
            {hoveredIndex !== null ? (
              <>
                <span style={{ fontSize: "9px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>{data[hoveredIndex].label}</span>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#2d3748" }}>{data[hoveredIndex].value}</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "9px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Total</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#2d3748" }}>{total}</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "120px" }}>
          {data.map((item, index) => (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1, transition: "opacity 0.2s"
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color }} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#4a5568", flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#2d3748" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Grievance Row Component (matches My Lodged Grievance Records table design) ───
function GrievanceRow({ c, index, onTrackDetails }) {
  const upvoteKey = `upvote_${c.id || c._id}`;
  
  const [upvotes, setUpvotes] = useState(() => {
    const saved = localStorage.getItem(upvoteKey);
    if (saved) return parseInt(saved);
    return c.id === "C001" ? 5 : (c.id === "C002" ? 12 : (c.id === "C003" ? 8 : Math.floor(Math.random() * 8) + 1));
  });
  
  const [hasUpvoted, setHasUpvoted] = useState(() => {
    return localStorage.getItem(`${upvoteKey}_voted`) === "true";
  });

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (hasUpvoted) {
      const newVotes = upvotes - 1;
      setUpvotes(newVotes);
      localStorage.setItem(upvoteKey, newVotes.toString());
      localStorage.setItem(`${upvoteKey}_voted`, "false");
      setHasUpvoted(false);
    } else {
      const newVotes = upvotes + 1;
      setUpvotes(newVotes);
      localStorage.setItem(upvoteKey, newVotes.toString());
      localStorage.setItem(`${upvoteKey}_voted`, "true");
      setHasUpvoted(true);
    }
  };

  // Priority badge style
  let priorityBg = "#cbd5e1";
  let priorityColor = "#475569";
  if (c.priority === "High") {
    priorityBg = "#ef4444";
    priorityColor = "white";
  } else if (c.priority === "Medium") {
    priorityBg = "#f59e0b";
    priorityColor = "white";
  } else if (c.priority === "Low") {
    priorityBg = "#64748b";
    priorityColor = "white";
  }

  // Status style dot/badge
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "#fef3e2", border: "#fbd38d", text: "#dd6b20", dot: "#dd6b20" };
      case "Assigned":
        return { bg: "#ebf8ff", border: "#bee3f8", text: "#2b6cb0", dot: "#2b6cb0" };
      case "In Progress":
        return { bg: "#faf5ff", border: "#e9d8fd", text: "#6b46c1", dot: "#6b46c1" };
      case "Resolved":
        return { bg: "#f0fff4", border: "#c6f6d5", text: "#2f855a", dot: "#2f855a" };
      case "Rejected":
        return { bg: "#fff5f5", border: "#fed7d7", text: "#c53030", dot: "#c53030" };
      default:
        return { bg: "#f7fafc", border: "#e2e8f0", text: "#4a5568", dot: "#4a5568" };
    }
  };

  const statusStyle = getStatusBadgeStyles(c.status);

  // Formatting date
  let displayDate = "";
  try {
    if (c.date) {
      displayDate = c.date;
    } else if (c.createdAt) {
      displayDate = new Date(c.createdAt).toLocaleDateString();
    }
  } catch (err) {
    displayDate = "6/18/2026";
  }

  const displayId = c.id ? `#${c.id.replace(/^C0*/, '')}` : `#${index + 1}`;

  return (
    <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: "60px 1.8fr 1.2fr 100px 130px 110px 130px", 
        gap: "16px", 
        alignItems: "center", 
        padding: "18px 24px", 
        borderBottom: "1px solid #f0f2f5",
        background: index % 2 === 0 ? "white" : "#fafafa",
        transition: "background 0.2s"
      }}
    >
      {/* ID */}
      <div style={{ fontWeight: "700", color: "#64748b", fontSize: "14px" }}>
        {displayId}
      </div>

      {/* Grievance Topic & Proofs */}
      <div>
        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "15px", marginBottom: "4px" }}>{c.title}</div>
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px", lineHeight: "1.4" }}>{c.description}</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Issue Proof Button */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTrackDetails(c);
            }}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "4px 10px", 
              borderRadius: "6px", 
              border: "1.5px solid #cbd5e1", 
              background: "white", 
              color: "#2563eb", 
              fontSize: "12px", 
              fontWeight: "700", 
              cursor: "pointer" 
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Issue Proof
          </button>

          {/* Upvote Button */}
          <button 
            type="button"
            onClick={handleUpvote}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "4px 10px", 
              borderRadius: "6px", 
              border: "1.5px solid #cbd5e1", 
              background: hasUpvoted ? "#e0f2fe" : "white", 
              color: hasUpvoted ? "#0369a1" : "#475569", 
              fontSize: "12px", 
              fontWeight: "700", 
              cursor: "pointer",
              borderColor: hasUpvoted ? "#bae6fd" : "#cbd5e1"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            {upvotes} Upvote
          </button>
        </div>
      </div>

      {/* Category */}
      <div style={{ fontSize: "14px", color: "#334155", fontWeight: "600" }}>
        {c.category === "Roads" ? "Road Damage" : (c.category === "Sanitation" ? "Drainage Problems" : c.category)}
      </div>

      {/* Priority */}
      <div>
        <span style={{
          display: "inline-block", 
          padding: "4px 12px", 
          borderRadius: "6px", 
          fontSize: "11px", 
          fontWeight: "800",
          textTransform: "uppercase",
          backgroundColor: priorityBg,
          color: priorityColor
        }}>
          {c.priority || "Medium"}
        </span>
      </div>

      {/* Status */}
      <div>
        <span style={{
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px", 
          padding: "6px 12px", 
          borderRadius: "6px", 
          fontSize: "11px", 
          fontWeight: "800",
          textTransform: "uppercase",
          backgroundColor: statusStyle.bg,
          border: `1.5px solid ${statusStyle.border}`,
          color: statusStyle.text
        }}>
          <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: statusStyle.dot }} />
          {c.status}
        </span>
      </div>

      {/* Lodged Date */}
      <div style={{ fontSize: "14px", color: "#475569", fontWeight: "600" }}>
        {displayDate}
      </div>

      {/* Action */}
      <div style={{ textAlign: "right" }}>
        <button 
          onClick={() => onTrackDetails(c)} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "6px", 
            padding: "8px 14px", 
            background: "white", 
            color: "#2563eb", 
            border: "1.5px solid #2563eb", 
            borderRadius: "6px", 
            fontWeight: "800", 
            fontSize: "12px", 
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View Details <span style={{ marginLeft: "2px", fontWeight: "700" }}>&gt;</span>
        </button>
      </div>
    </div>
  );
}

// ─── Grievance Details Modal (matches mockup design) ───────────────────────────
function GrievanceDetailsModal({ complaint, onClose }) {
  const upvoteKey = `upvote_${complaint.id || complaint._id}`;
  
  const [upvotes, setUpvotes] = useState(() => {
    const saved = localStorage.getItem(upvoteKey);
    if (saved) return parseInt(saved);
    return complaint.id === "C001" ? 5 : (complaint.id === "C002" ? 12 : (complaint.id === "C003" ? 8 : Math.floor(Math.random() * 8) + 1));
  });
  
  const [hasUpvoted, setHasUpvoted] = useState(() => {
    return localStorage.getItem(`${upvoteKey}_voted`) === "true";
  });

  const handleUpvote = () => {
    if (hasUpvoted) {
      const newVotes = upvotes - 1;
      setUpvotes(newVotes);
      localStorage.setItem(upvoteKey, newVotes.toString());
      localStorage.setItem(`${upvoteKey}_voted`, "false");
      setHasUpvoted(false);
    } else {
      const newVotes = upvotes + 1;
      setUpvotes(newVotes);
      localStorage.setItem(upvoteKey, newVotes.toString());
      localStorage.setItem(`${upvoteKey}_voted`, "true");
      setHasUpvoted(true);
    }
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const syncVotes = () => {
      const saved = localStorage.getItem(upvoteKey);
      if (saved) setUpvotes(parseInt(saved));
      setHasUpvoted(localStorage.getItem(`${upvoteKey}_voted`) === "true");
    };
    window.addEventListener("storage", syncVotes);
    return () => window.removeEventListener("storage", syncVotes);
  }, [upvoteKey]);

  let priorityBg = "#cbd5e1";
  let priorityColor = "#475569";
  if (complaint.priority === "High") {
    priorityBg = "#ef4444";
    priorityColor = "white";
  } else if (complaint.priority === "Medium") {
    priorityBg = "#f59e0b";
    priorityColor = "white";
  } else if (complaint.priority === "Low") {
    priorityBg = "#64748b";
    priorityColor = "white";
  }

  const displayId = complaint.id ? `#${complaint.id.replace(/^C0*/, '')}` : "";

  const getStepStatus = (stepIndex) => {
    const status = complaint.status;
    if (status === "Rejected") {
      if (stepIndex === 0) return "checked";
      return "inactive";
    }
    if (status === "Pending") {
      if (stepIndex === 0) return "active";
      return "inactive";
    }
    if (status === "Assigned") {
      if (stepIndex === 0) return "checked";
      if (stepIndex === 1) return "active";
      return "inactive";
    }
    if (status === "In Progress") {
      if (stepIndex < 2) return "checked";
      if (stepIndex === 2) return "active";
      return "inactive";
    }
    if (status === "Resolved") {
      return "checked";
    }
    return "inactive";
  };

  const renderStepCircle = (stepIndex, label, num) => {
    const state = getStepStatus(stepIndex);
    
    let circleBg = "white";
    let circleBorder = "2px solid #cbd5e1";
    let circleColor = "#64748b";
    let labelColor = "#64748b";
    let content = num;

    if (state === "checked") {
      circleBg = "#198754";
      circleBorder = "2px solid #198754";
      circleColor = "white";
      labelColor = "#198754";
      content = "✓";
    } else if (state === "active") {
      circleBg = "#2563eb";
      circleBorder = "2px solid #2563eb";
      circleColor = "white";
      labelColor = "#2563eb";
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2, flex: 1 }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: circleBg,
          border: circleBorder,
          color: circleColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          fontSize: "14px",
          boxShadow: state !== "inactive" ? "0 4px 10px rgba(0,0,0,0.1)" : "none",
          transition: "all 0.3s ease"
        }}>
          {content}
        </div>
        <span style={{ fontSize: "12px", fontWeight: "700", color: labelColor, marginTop: "8px", textAlign: "center" }}>
          {label}
        </span>
      </div>
    );
  };

  const getLineStyle = (lineIndex) => {
    const status = complaint.status;
    if (status === "Rejected") return "#cbd5e1";

    if (lineIndex === 0) {
      if (["Assigned", "In Progress", "Resolved"].includes(status)) return "#2563eb";
    }
    if (lineIndex === 1) {
      if (["In Progress", "Resolved"].includes(status)) return "#2563eb";
    }
    if (lineIndex === 2) {
      if (status === "Resolved") return "#2563eb";
    }
    return "#cbd5e1";
  };

  const displayCategory = complaint.category === "Roads" ? "Road Damage" : (complaint.category === "Sanitation" ? "Drainage Problems" : complaint.category);
  const displayDate = complaint.date || new Date(complaint.createdAt).toLocaleDateString();
  const displayOfficer = complaint.assignedOfficer ? "Rajesh Sharma" : "Unassigned";
  const displayAssignDate = complaint.assignedDate || "6/18/2026, 9:42:31 PM";
  const displayArea = complaint.location || "Not Available";
  const displayWard = complaint.wardNumber || (complaint.id ? complaint.id.charCodeAt(complaint.id.length - 1) % 10 + 1 : 9);
  const displayLandmark = complaint.landmark || "Not Available";
  const latVal = complaint.latitude !== undefined ? complaint.latitude : (complaint.locationCoordinates?.lat || complaint.lat);
  const lngVal = complaint.longitude !== undefined ? complaint.longitude : (complaint.locationCoordinates?.lng || complaint.lng);
  const displayCoords = latVal ? `${latVal.toFixed(6)}, ${lngVal.toFixed(6)}` : "Not Available";

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "12px", width: "100%", maxWidth: "680px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0d6efd, #0b5ed7)", padding: "20px 24px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffd43b" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Grievance Details {displayId}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Title and description */}
          <div>
            <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>{complaint.title}</h4>
            <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{complaint.description}</p>
          </div>

          {/* Metadata Grid Container */}
          <div style={{
            border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "20px",
            display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "16px 24px", background: "#f8fafc"
          }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Category:</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginLeft: "6px" }}>{displayCategory}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Priority:</span>
                <span style={{
                  display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800",
                  backgroundColor: priorityBg, color: priorityColor, marginLeft: "6px", textTransform: "uppercase"
                }}>
                  {complaint.priority || "Medium"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Lodged Date:</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginLeft: "6px" }}>{displayDate}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Assigned Officer:</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginLeft: "6px" }}>{displayOfficer}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Assignment Date:</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginLeft: "6px" }}>{displayAssignDate}</span>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Area / Locality:</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginLeft: "6px" }}>{displayArea}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Ward Number:</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginLeft: "6px" }}>{displayWard}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Landmark:</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginLeft: "6px" }}>{displayLandmark}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Geographic Coordinates (Latitude & Longitude):</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{displayCoords}</span>
              </div>
              {complaint.capturedAt && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Captured At:</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{new Date(complaint.capturedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Map Preview */}
          {latVal && lngVal && (
            <div>
              <h5 style={{ fontSize: "12px", fontWeight: "800", color: "#475569", letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 10px 0" }}>Incident Location Pin</h5>
              <LeafletMap lat={latVal} lng={lngVal} readOnly={true} height="180px" />
            </div>
          )}

          {/* Progress Tracker */}
          <div>
            <h5 style={{ fontSize: "12px", fontWeight: "800", color: "#475569", letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 16px 0" }}>Grievance Progress Tracker</h5>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "10px 0 20px 0" }}>
              <div style={{ position: "absolute", top: "28px", left: "10%", right: "10%", height: "4px", background: "#cbd5e1", zIndex: 1 }} />
              <div style={{ position: "absolute", top: "28px", left: "10%", width: "26.6%", height: "4px", background: getLineStyle(0), zIndex: 1, transition: "background 0.3s ease" }} />
              <div style={{ position: "absolute", top: "28px", left: "36.6%", width: "26.6%", height: "4px", background: getLineStyle(1), zIndex: 1, transition: "background 0.3s ease" }} />
              <div style={{ position: "absolute", top: "28px", left: "63.2%", width: "26.6%", height: "4px", background: getLineStyle(2), zIndex: 1, transition: "background 0.3s ease" }} />

              {renderStepCircle(0, "Submitted", "1")}
              {renderStepCircle(1, "Assigned", "2")}
              {renderStepCircle(2, "In Progress", "3")}
              {renderStepCircle(3, "Resolved", "4")}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "4px 0" }} />

          {/* Community Agreement Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px 0" }}>Community Agreement</h5>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Upvote if you are also facing this issue in your locality.</p>
            </div>
            <button
              onClick={handleUpvote}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                background: hasUpvoted ? "#198754" : "#e2e8f0", color: hasUpvoted ? "white" : "#475569",
                border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "13px", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              {hasUpvoted ? `Upvoted (${upvotes})` : `Upvote (${upvotes})`}
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "4px 0" }} />

          {/* Proof Attachment Section */}
          <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: "800", color: "#475569" }}>
              Citizen Proof Attachment
            </div>
            <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#f1f5f9" }}>
              {complaint.image ? (
                <img src={complaint.image} alt="Grievance Proof" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "6px", objectFit: "contain", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              ) : (
                <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600", padding: "20px 0" }}>No visual evidence attached.</div>
              )}
            </div>
          </div>

          {/* Action button */}
          <button 
            onClick={onClose}
            style={{ width: "100%", padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "14px", cursor: "pointer", marginTop: "8px", transition: "background 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; }}
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'file', 'history'
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [priority, setPriority] = useState("High");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Geotagging & map coordinates state
  const [latitude, setLatitude] = useState(28.6139); // default Delhi
  const [longitude, setLongitude] = useState(77.209);
  const [capturedAt, setCapturedAt] = useState(null);
  const [geoError, setGeoError] = useState("");

  const CATEGORY_PRIORITY_MAP = {
    "Roads": "High",
    "Water Supply": "High",
    "Electricity": "High",
    "Sanitation": "Medium",
    "Other": "Low"
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setPriority(CATEGORY_PRIORITY_MAP[val] || "Medium");
  };

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      if (user) {
        const res = await axios.get(`${API_BASE_URL}/api/complaints`);
        const userComplaints = res.data.complaints.filter(c => c.user?._id === user._id || c.userId === user._id);
        setComplaints(userComplaints);
      }
    } catch (err) {
      console.warn("Backend not available. Loading from local storage fallback.", err);
      const saved = localStorage.getItem("complaints") || "[]";
      const parsed = JSON.parse(saved);
      const userComplaints = parsed.filter(c => c.citizenName === user?.name || c.user?.name === user?.name || c.userId === user?._id);
      setComplaints(userComplaints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getGeotag = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setCapturedAt(new Date().toISOString());
        setGeoError("");
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err);
        setGeoError("Location permission denied. You can still submit, but it won't be geotagged.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      getGeotag();
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setPreviewImage(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setError("Camera access denied or unavailable.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewImage(dataUrl);

      canvas.toBlob((blob) => {
        const file = new File([blob], `complaint_${Date.now()}.jpg`, { type: "image/jpeg" });
        setImage(file);
      }, "image/jpeg", 0.9);

      stopCamera();
      getGeotag();
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!title || !description || !location) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const newComplaint = {
      id: "C" + Math.floor(100 + Math.random() * 900),
      _id: Math.random().toString(36).substring(7),
      title,
      description,
      category,
      priority,
      location,
      latitude,
      longitude,
      image: previewImage,
      imageUrl: previewImage,
      capturedAt: capturedAt || new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: "Pending",
      citizenName: user?.name || "Sonu Kumar",
      userId: user?._id,
      assignedOfficer: null,
      adminNotes: "",
      workLogs: []
    };

    const saved = JSON.parse(localStorage.getItem("complaints") || "[]");
    const updatedList = [newComplaint, ...saved];
    localStorage.setItem("complaints", JSON.stringify(updatedList));

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("location", location);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("userId", user?._id);
      if (capturedAt) formData.append("capturedAt", capturedAt);
      if (image) formData.append("image", image);
      await axios.post(`${API_BASE_URL}/api/complaints`, formData);
    } catch (err) {
      console.warn("Could not post to backend.", err);
    }

    setComplaints([newComplaint, ...complaints]);
    setSuccess("Complaint registered successfully!");
    setIsSubmitting(false);

    setTitle("");
    setDescription("");
    setCategory("Roads");
    setLocation("");
    setImage(null);
    setPreviewImage(null);
    setLatitude(28.6139);
    setLongitude(77.209);
    setCapturedAt(null);
    setGeoError("");

    setTimeout(() => {
      setActiveTab("history");
      setSuccess("");
    }, 1500);
  };

  const statusCounts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { label: "Pending", value: statusCounts["Pending"] || 0, color: "#e67e22" },
    { label: "Assigned", value: statusCounts["Assigned"] || 0, color: "#3498db" },
    { label: "In Progress", value: statusCounts["In Progress"] || 0, color: "#9b59b6" },
    { label: "Resolved", value: statusCounts["Resolved"] || 0, color: "#27ae60" },
    { label: "Rejected", value: statusCounts["Rejected"] || 0, color: "#e74c3c" }
  ].filter(item => item.value > 0);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => ["Assigned", "In Progress"].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  return (
    <div style={{ minHeight: "90vh", display: "flex", background: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" }}>
      
      <aside style={{ width: "260px", background: "#1e293b", color: "#f8fafc", padding: "30px 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
            Citizen Portal
          </h3>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Logged in as: {user?.name || "Sonu Kumar"}</p>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            onClick={() => setActiveTab("overview")}
            style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", width: "100%", fontSize: "14px", fontWeight: "700",
              background: activeTab === "overview" ? "#38bdf8" : "transparent",
              color: activeTab === "overview" ? "#0f172a" : "#cbd5e1",
              transition: "all 0.2s"
            }}
          >
            📊 Dashboard Overview
          </button>
          
          <button 
            onClick={() => setActiveTab("file")}
            style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", width: "100%", fontSize: "14px", fontWeight: "700",
              background: activeTab === "file" ? "#38bdf8" : "transparent",
              color: activeTab === "file" ? "#0f172a" : "#cbd5e1",
              transition: "all 0.2s"
            }}
          >
            📝 File New Complaint
          </button>

          <button 
            onClick={() => setActiveTab("history")}
            style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", width: "100%", fontSize: "14px", fontWeight: "700",
              background: activeTab === "history" ? "#38bdf8" : "transparent",
              color: activeTab === "history" ? "#0f172a" : "#cbd5e1",
              transition: "all 0.2s"
            }}
          >
            📜 Grievance History
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "40px" }}>
        
        {activeTab === "overview" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: "0 0 24px 0" }}>Grievance Dashboard Overview</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Total Grievances</span>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#1e293b", marginTop: "6px" }}>{stats.total}</div>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#e67e22", textTransform: "uppercase" }}>Pending Action</span>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#e67e22", marginTop: "6px" }}>{stats.pending}</div>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#9b59b6", textTransform: "uppercase" }}>In Progress</span>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#9b59b6", marginTop: "6px" }}>{stats.inProgress}</div>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#27ae60", textTransform: "uppercase" }}>Resolved Cases</span>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#27ae60", marginTop: "6px" }}>{stats.resolved}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "start", flexWrap: "wrap" }}>
              <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: "0 0 16px 0" }}>Recent Registered Issues</h3>
                {complaints.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "14px" }}>No complaints registered yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {complaints.slice(0, 3).map(c => (
                      <div key={c.id || c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f2f5", paddingBottom: "12px" }}>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>{c.title}</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{c.location} | {c.date || new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                    <button onClick={() => setActiveTab("history")} style={{ width: "100%", padding: "10px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", marginTop: "8px" }}>
                      View Full History
                    </button>
                  </div>
                )}
              </div>

              <InteractiveDonutChart data={statusData} title="Grievance Status Distribution" />
            </div>
          </div>
        )}

        {activeTab === "file" && (
          <div style={{ maxWidth: "650px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "20px" }}>Register New Grievance</h2>
            {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>{error}</div>}
            {success && <div style={{ background: "#f0fff4", border: "1px solid #c6f6d5", color: "#22543d", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>{success}</div>}

            <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Complaint Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Garbage pile accumulated near sector entrance" required style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Detailed Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in detail..." required style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", minHeight: "80px", fontFamily: "inherit" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Category</label>
                  <select value={category} onChange={e => handleCategoryChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", background: "white" }}>
                    <option>Roads</option>
                    <option>Water Supply</option>
                    <option>Electricity</option>
                    <option>Sanitation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Auto-Assigned Priority</label>
                  <div style={{
                    width: "100%", padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", background: "#f8fafc", fontWeight: "700",
                    color: priority === "High" ? "#ef4444" : (priority === "Medium" ? "#d97706" : "#475569")
                  }}>
                    {priority}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Location (Area/Address) *</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Sector 12 block B, Delhi" required style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }} />
                </div>
              </div>

              {/* Leaflet Incident Map Preview */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                  Incident Map Location *
                </label>
                {geoError && (
                  <div style={{ fontSize: "12.5px", color: "#e67e22", fontWeight: "600", marginBottom: "8px", background: "#fff9f2", border: "1px solid #ffe8cc", padding: "8px 12px", borderRadius: "6px" }}>
                    ⚠️ {geoError}
                  </div>
                )}
                <LeafletMap 
                  lat={latitude} 
                  lng={longitude} 
                  onChangeLocation={(coords) => {
                    setLatitude(coords.lat);
                    setLongitude(coords.lng);
                  }}
                  height="220px"
                />
                <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "4px" }}>
                  📍 Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)} (Drag/Click map to manually adjust location pin)
                </span>
              </div>

              {/* Camera Image Capture & Upload File */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Attach Visual Evidence</label>
                {!isCameraOpen && !previewImage && (
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button type="button" onClick={startCamera} style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                      📸 Open Field Camera
                    </button>
                    <label style={{ padding: "10px 20px", background: "#64748b", color: "white", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px", display: "inline-block" }}>
                      📁 Upload Image File
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    </label>
                  </div>
                )}

                {isCameraOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "200px", borderRadius: "8px", background: "black", objectFit: "cover" }} />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" onClick={captureImage} style={{ flex: 1, padding: "10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Capture Snapshot</button>
                      <button type="button" onClick={stopCamera} style={{ flex: 1, padding: "10px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                )}

                {previewImage && (
                  <div style={{ marginTop: "10px" }}>
                    <img src={previewImage} alt="Preview" style={{ width: "100%", maxHeight: "180px", borderRadius: "8px", objectFit: "cover" }} />
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button type="button" onClick={startCamera} style={{ padding: "8px 16px", background: "#e2e8f0", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>
                        📸 Retake
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setPreviewImage(null);
                          setImage(null);
                          setLatitude(28.6139);
                          setLongitude(77.209);
                          setCapturedAt(null);
                          setGeoError("");
                        }} 
                        style={{ padding: "8px 16px", background: "#fdecea", color: "#e74c3c", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} style={{ padding: "12px", background: "linear-gradient(135deg, #1e293b, #3b82f6)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "14px", marginTop: "10px" }}>
                {isSubmitting ? "Submitting..." : "Register Complaint"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: History list */}
        {activeTab === "history" && (
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
            {/* Blue Header Banner */}
            <div style={{ background: "linear-gradient(135deg, #0d6efd, #0b5ed7)", padding: "20px 24px 14px 24px", color: "white" }}>
              {/* Title & Button Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffd43b" }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    <path d="M12 14l3-3m0 0l-3-3m3 3H9"></path>
                  </svg>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", letterSpacing: "0.2px", color: "white" }}>My Lodged Grievance Records</h2>
                </div>
                <button 
                  onClick={() => setActiveTab("file")}
                  style={{ 
                    background: "white", 
                    color: "#0d6efd", 
                    border: "none", 
                    borderRadius: "6px", 
                    padding: "8px 16px", 
                    fontSize: "13px", 
                    fontWeight: "800", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f8f9fa"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "bold" }}>+</span> Lodge New Grievance
                </button>
              </div>

              {/* Table Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "60px 1.8fr 1.2fr 100px 130px 110px 130px", gap: "16px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px", textTransform: "uppercase", opacity: 0.9 }}>
                <div>ID</div>
                <div>Grievance Topic & Proofs</div>
                <div>Category</div>
                <div>Priority</div>
                <div>Status</div>
                <div>Lodged Date</div>
                <div style={{ textAlign: "right" }}>Action</div>
              </div>
            </div>

            {/* Rows list */}
            <div>
              {complaints.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>You have not submitted any complaints yet.</p>
              ) : (
                complaints.map((c, index) => (
                  <GrievanceRow 
                    key={c.id || c._id} 
                    c={c} 
                    index={index} 
                    onTrackDetails={setSelectedComplaint}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Details View Modal */}
      {selectedComplaint && (
        <GrievanceDetailsModal 
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
