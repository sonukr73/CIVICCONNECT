import { useState, useEffect } from "react";
import axios from "axios";
import StatusBadge from "../components/StatusBadge";
import WorkLogSection from "../components/WorkLogSection";
import StatusUpdateModal from "../components/StatusUpdateModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Fallback officers if DB call fails
const MOCK_OFFICERS = [
  { id: "o1", name: "Rajesh Sharma", department: "Roads" },
  { id: "o2", name: "Priya Mehta", department: "Water Supply" },
  { id: "o3", name: "Amit Singh", department: "Electricity" },
  { id: "o4", name: "Sunita Rao", department: "Sanitation" },
  { id: "o5", name: "Vikram Patel", department: "Other" },
];

export default function OfficerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== "departmental officer") {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "450px", border: "1px solid #f0f0f0" }}>
          <span style={{ fontSize: "50px" }}>🔒</span>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e", marginTop: "20px" }}>Access Denied</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "10px", lineHeight: 1.5 }}>
            This workspace is private and restricted to municipal field officers. Please log in with officer credentials to continue.
          </p>
        </div>
      </div>
    );
  }

  const [officers, setOfficers] = useState(MOCK_OFFICERS);
  const [selectedOfficerId, setSelectedOfficerId] = useState(() => {
    return user ? (user._id || user.id) : MOCK_OFFICERS[0].id;
  });
  const [complaints, setComplaints] = useState([]);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [modalType, setModalType] = useState(null); // 'status' or 'details'
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/officer/complaints`, {
        params: { officerId: selectedOfficerId }
      });
      if (res.data && res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.warn("Backend API not reachable. Falling back to local storage.", err);
      const saved = localStorage.getItem("complaints");
      if (saved) {
        setComplaints(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchOfficers();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [selectedOfficerId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdateSave = async ({ complaintId, status, workNote, completionNote, rejectionReason }) => {
    const activeOfficer = officers.find(o => (o._id === selectedOfficerId || o.id === selectedOfficerId)) || { name: user?.name || "Officer" };
    const updatedData = {
      status,
      officerId: selectedOfficerId,
      completionNote,
      rejectionReason
    };

    try {
      await axios.patch(`${API_BASE_URL}/api/complaints/${complaintId}/status`, updatedData);
    } catch (err) {
      console.warn("Could not patch status to backend. Syncing locally.", err);
    }

    if (workNote) {
      try {
        await axios.patch(`${API_BASE_URL}/api/complaints/${complaintId}/log`, {
          note: workNote,
          officerId: selectedOfficerId
        });
      } catch (err) {
        console.warn("Could not post log to backend.", err);
      }
    }

    // Refresh complaints from backend
    fetchComplaints();
    setModalType(null);

    if (status === "Resolved") {
      showToast("✓ Complaint Resolved");
    } else if (status === "Rejected") {
      showToast("✓ Complaint Rejected");
    } else {
      showToast("✓ Status Updated Successfully");
    }
  };

  const selectedOfficer = officers.find(o => (o._id === selectedOfficerId || o.id === selectedOfficerId)) || { name: user.name, department: user.department };
  const assignedComplaints = complaints.filter(c => c.assignedOfficer === selectedOfficerId);

  const stats = {
    pending: assignedComplaints.filter(c => c.status === "Pending").length,
    assigned: assignedComplaints.filter(c => c.status === "Assigned").length,
    inProgress: assignedComplaints.filter(c => c.status === "In Progress").length,
    resolved: assignedComplaints.filter(c => c.status === "Resolved").length,
    rejected: assignedComplaints.filter(c => c.status === "Rejected").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px 40px", fontFamily: "'Segoe UI', sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: "80px", right: "40px", background: "#27ae60", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", boxShadow: "0 10px 30px rgba(39, 174, 96, 0.25)", zIndex: 2000, display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>Officer Workspace</h1>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px", fontWeight: "500" }}>Manage your assigned field complaints, update statuses and file progress reports</p>
        </div>

        {/* Dropdown switch to switch officers (only for testing convenience, defaults to logged-in user) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Testing Switch: Officer</span>
            <select 
              value={selectedOfficerId} 
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              style={{ padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: "700", color: "#333", background: "white", cursor: "pointer", marginTop: "4px" }}
            >
              {officers.map(o => (
                <option key={o._id || o.id} value={o._id || o.id}>{o.name} ({o.department})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Officer Details Card */}
      <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #3498db, #9b59b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "24px" }}>
          {selectedOfficer.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>{selectedOfficer.name}</h2>
          <p style={{ color: "#64748b", marginTop: "4px", fontSize: "13px", fontWeight: "600" }}>
            Department: <span style={{ color: "#3498db" }}>{selectedOfficer.department}</span> | Role: Field Officer
          </p>
        </div>
        <div style={{ background: "#e8f4fd", padding: "8px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: "700", color: "#3498db" }}>
          {assignedComplaints.length} Assignments
        </div>
      </div>

      {/* Metrics Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fef3e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#e67e22" }}>⏳</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{stats.pending}</div>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>Pending/New</div>
          </div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", color: "#3498db" }}>📌</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{stats.assigned}</div>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>Assigned</div>
          </div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f5eef8", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b59b6" }}>⚙️</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{stats.inProgress}</div>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>In Progress</div>
          </div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#e9f7ef", display: "flex", alignItems: "center", justifyContent: "center", color: "#27ae60" }}>✓</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{stats.resolved}</div>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>Resolved</div>
          </div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fdecea", display: "flex", alignItems: "center", justifyContent: "center", color: "#e74c3c" }}>✕</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{stats.rejected}</div>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Task Assignments Table */}
      <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #f0f0f0" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>Assigned Tasks ({assignedComplaints.length})</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                {["ID", "Complaint Title", "Citizen", "Location", "Reported Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading assignments...</td></tr>
              ) : assignedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "60px 40px", textAlign: "center", color: "#aaa" }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏖</div>
                    <div style={{ fontSize: "15px", fontWeight: "700" }}>No complaints assigned.</div>
                  </td>
                </tr>
              ) : (
                assignedComplaints.map((c, i) => (
                  <tr key={c.id || c._id} style={{ borderTop: "1px solid #f5f5f5", background: i % 2 === 0 ? "white" : "#fafafa", verticalAlign: "middle" }}>
                    <td style={{ padding: "16px", fontWeight: "700", color: "#3498db", fontSize: "13px" }}>{c.id || c._id}</td>
                    <td style={{ padding: "16px", maxWidth: "250px" }}>
                      <div style={{ fontWeight: "700", color: "#1a1a2e", fontSize: "14px" }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#1a1a2e", fontWeight: "600" }}>{c.citizenName || c.user?.name || "Citizen"}</td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#555", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.location}</td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#888" }}>{c.date || new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "16px" }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => { setActiveComplaint(c); setModalType("details"); }}
                          style={{ padding: "6px 12px", background: "#f0f2f5", color: "#4a5568", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                        >
                          View Details
                        </button>
                        {c.status !== "Resolved" && c.status !== "Rejected" ? (
                          <button
                            onClick={() => { setActiveComplaint(c); setModalType("status"); }}
                            style={{ padding: "6px 12px", background: "linear-gradient(135deg, #3498db, #2980b9)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                          >
                            Update Status
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: c.status === "Resolved" ? "#27ae60" : "#e74c3c", fontWeight: "800" }}>
                            {c.status === "Resolved" ? "✓ Work Completed" : "✕ Rejected"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      {modalType === "details" && activeComplaint && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "600px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: "linear-gradient(135deg, #2c3e50, #3498db)", padding: "20px 24px", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Complaint Details</h3>
                  <p style={{ fontSize: "11px", opacity: 0.75, margin: "2px 0 0 0" }}>ID: {activeComplaint.id || activeComplaint._id}</p>
                </div>
                <button onClick={() => setModalType(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", color: "white", fontSize: "16px" }}>✕</button>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#1a1a2e", marginBottom: "8px" }}>{activeComplaint.title}</h4>
              <p style={{ fontSize: "13.5px", color: "#4a5568", lineHeight: 1.6, marginBottom: "16px" }}>{activeComplaint.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Category</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#333", marginTop: "2px" }}>{activeComplaint.category}</div>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Location</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#333", marginTop: "2px" }}>{activeComplaint.location}</div>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Reporter</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#333", marginTop: "2px" }}>{activeComplaint.citizenName || activeComplaint.user?.name || "Citizen"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Reported Date</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#333", marginTop: "2px" }}>{activeComplaint.date || new Date(activeComplaint.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {activeComplaint.status === "Resolved" && (
                <div style={{ border: "1.5px solid #c6f6d5", background: "#f0fff4", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#22543d", textTransform: "uppercase", display: "block" }}>✓ Resolution details</span>
                  <div style={{ fontSize: "13px", color: "#2f855a", marginTop: "4px" }}>
                    <strong>Note:</strong> {activeComplaint.completionNote}
                  </div>
                  <div style={{ fontSize: "11px", color: "#48bb78", marginTop: "6px" }}>
                    Resolved at {new Date(activeComplaint.resolvedAt).toLocaleString()} by {activeComplaint.resolvedBy || selectedOfficer.name}
                  </div>
                </div>
              )}

              {activeComplaint.status === "Rejected" && (
                <div style={{ border: "1.5px solid #fed7d7", background: "#fff5f5", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#742a2a", textTransform: "uppercase", display: "block" }}>✕ Rejection Details</span>
                  <div style={{ fontSize: "13px", color: "#9b2c2c", marginTop: "4px" }}>
                    <strong>Reason:</strong> {activeComplaint.rejectionReason}
                  </div>
                  <div style={{ fontSize: "11px", color: "#e53e3e", marginTop: "6px" }}>
                    Rejected at {new Date(activeComplaint.rejectedAt).toLocaleString()} by {activeComplaint.rejectedBy || selectedOfficer.name}
                  </div>
                </div>
              )}

              <WorkLogSection logs={activeComplaint.workLogs} />

              <button onClick={() => setModalType(null)} style={{ width: "100%", padding: "12px", background: "#f0f2f5", color: "#4a5568", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginTop: "24px" }}>Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {modalType === "status" && activeComplaint && (
        <StatusUpdateModal 
          complaint={activeComplaint}
          onClose={() => setModalType(null)}
          onSave={handleStatusUpdateSave}
        />
      )}
    </div>
  );
}
