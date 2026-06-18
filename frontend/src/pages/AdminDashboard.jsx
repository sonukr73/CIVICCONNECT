import { useState, useEffect } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_OFFICERS = [
  { id: "o1", name: "Rajesh Sharma", department: "Roads" },
  { id: "o2", name: "Priya Mehta", department: "Water Supply" },
  { id: "o3", name: "Amit Singh", department: "Electricity" },
  { id: "o4", name: "Sunita Rao", department: "Sanitation" },
  { id: "o5", name: "Vikram Patel", department: "Other" },
];

const MOCK_COMPLAINTS = [
  { id: "C001", title: "Pothole on MG Road", description: "Large pothole causing accidents near MG Road junction.", category: "Roads", location: "MG Road, Delhi", date: "2026-06-15", status: "Pending", assignedOfficer: null, citizenName: "Rahul Gupta", adminNotes: "" },
  { id: "C002", title: "No water supply for 3 days", description: "Our entire colony has had no water for 3 consecutive days.", category: "Water Supply", location: "Sector 14, Dwarka", date: "2026-06-16", status: "Assigned", assignedOfficer: "o2", citizenName: "Meena Agarwal", adminNotes: "" },
  { id: "C003", title: "Street light not working", description: "3 street lights on Park Street are broken since 2 weeks.", category: "Electricity", location: "Park Street, Rohini", date: "2026-06-16", status: "In Progress", assignedOfficer: "o3", citizenName: "Suresh Kumar", adminNotes: "Officer visited site on 17th." },
  { id: "C004", title: "Garbage not collected", description: "Garbage collection has been skipped for the past week.", category: "Sanitation", location: "Lajpat Nagar", date: "2026-06-17", status: "Resolved", assignedOfficer: "o4", citizenName: "Anita Desai", adminNotes: "Resolved after 2 visits." },
  { id: "C005", title: "Open drain near school", description: "Open sewage drain is a health hazard next to Delhi Public School.", category: "Sanitation", location: "DPS Road, Mayur Vihar", date: "2026-06-17", status: "Pending", assignedOfficer: null, citizenName: "Ramesh Jain", adminNotes: "" },
  { id: "C006", title: "Broken water pipe flooding road", description: "A burst pipe is flooding the main road and wasting water.", category: "Water Supply", location: "Model Town, Delhi", date: "2026-06-18", status: "Pending", assignedOfficer: null, citizenName: "Pooja Sharma", adminNotes: "" },
  { id: "C007", title: "Encroachment on footpath", description: "Illegal shops have blocked the entire footpath forcing pedestrians onto road.", category: "Other", location: "Chandni Chowk", date: "2026-06-18", status: "Assigned", assignedOfficer: "o5", citizenName: "Dinesh Verma", adminNotes: "" },
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
              <p style={{ fontSize: "12px", opacity: 0.75, marginBottom: "4px" }}>Rejecting #{complaint.id}</p>
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
              onClick={() => onConfirm(complaint.id, reason, customNote)}
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div style={{
      background: "white", borderRadius: "14px", padding: "22px 24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)", display: "flex",
      alignItems: "center", gap: "18px", transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
    >
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon path={icon} size={26} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "13px", color: "#888", marginTop: "5px", fontWeight: "600" }}>{label}</div>
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
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem("complaints");
    return saved ? JSON.parse(saved) : MOCK_COMPLAINTS;
  });

  useEffect(() => {
    localStorage.setItem("complaints", JSON.stringify(complaints));
  }, [complaints]);

  const [editTarget, setEditTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => ["Assigned", "In Progress"].includes(c.status)).length,
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

  const handleReject = (id, reason, note) => {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status: "Rejected", rejectReason: reason, adminNotes: note || c.adminNotes } : c
    ));
    setRejectTarget(null);
  };

  const handleSave = (updated) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditTarget(null);
  };

  const handleMarkResolved = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "Resolved" } : c));
  };

  const filtered = complaints
    .filter(c => filterStatus === "All" || c.status === filterStatus)
    .filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getOfficerName = (id) => {
    if (!id) return <span style={{ color: "#bbb", fontStyle: "italic" }}>Unassigned</span>;
    const o = MOCK_OFFICERS.find(o => o.id === id);
    return o ? o.name : "—";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px 40px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>Admin Command Center</h1>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px", fontWeight: "500" }}>Manage civic complaints, assign officers & track resolutions</p>
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

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <StatCard label="Total Registered" value={stats.total} color="#3498db" bg="#e8f4fd" icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
        <StatCard label="Pending" value={stats.pending} color="#e67e22" bg="#fef3e2" icon="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        <StatCard label="In Progress" value={stats.inProgress} color="#9b59b6" bg="#f5eef8" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
        <StatCard label="Resolved" value={stats.resolved} color="#27ae60" bg="#e9f7ef" icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        <StatCard label="Rejected" value={stats.rejected} color="#e74c3c" bg="#fdecea" icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </div>

      {/* Pie Charts Side-by-Side */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
        <InteractiveDonutChart data={categoryData} title="Complaints by Category" />
        <InteractiveDonutChart data={statusData} title="Complaints by Status" />
      </div>

      {/* Filters & Search */}
      <div style={{ background: "white", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["All", "Pending", "Assigned", "In Progress", "Resolved", "Rejected"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
              fontWeight: "700", fontSize: "13px", transition: "all 0.2s",
              background: filterStatus === s ? (s === "Rejected" ? "#e74c3c" : "#3498db") : "#f0f2f5",
              color: filterStatus === s ? "white" : "#555"
            }}>{s}</button>
          ))}
        </div>
        <input
          placeholder="Search by title, citizen, or location…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ padding: "10px 16px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", width: "280px", outline: "none", background: "#fafafa" }}
        />
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
                {["ID", "Complaint", "Category", "Location", "Date", "Assigned Officer", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: "15px" }}>No complaints found.</td></tr>
              )}
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderTop: "1px solid #f5f5f5", background: i % 2 === 0 ? "white" : "#fafafa", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa"}
                >
                  <td style={{ padding: "14px 16px", fontWeight: "700", color: "#3498db", fontSize: "13px", whiteSpace: "nowrap" }}>{c.id}</td>
                  <td style={{ padding: "14px 16px", maxWidth: "200px" }}>
                    <div style={{ fontWeight: "700", color: "#1a1a2e", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>By {c.citizenName}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", whiteSpace: "nowrap" }}>{c.category}</td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.location}</td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#888", whiteSpace: "nowrap" }}>{c.date}</td>
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
                      {c.status !== "Resolved" && c.status !== "Rejected" && (
                        <button
                          onClick={() => handleMarkResolved(c.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officers Panel */}
      <div style={{ marginTop: "24px", background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>Departmental Officers</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          {MOCK_OFFICERS.map(o => {
            const assigned = complaints.filter(c => c.assignedOfficer === o.id && c.status !== "Resolved").length;
            return (
              <div key={o.id} style={{ padding: "16px", border: "1.5px solid #f0f0f0", borderRadius: "12px", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3498db"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(52,152,219,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "none"; }}
              >
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

      {/* Edit Modal */}
      {editTarget && (
        <ComplaintModal
          complaint={editTarget}
          officers={MOCK_OFFICERS}
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
    </div>
  );
};

export default AdminDashboard;
