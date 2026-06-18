import React, { useState } from "react";

export default function StatusUpdateModal({ complaint, onClose, onSave }) {
  const currentStatus = complaint.status || "Assigned";
  const [status, setStatus] = useState(currentStatus);
  const [workNote, setWorkNote] = useState("");
  const [completionNote, setCompletionNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("Duplicate complaint");
  const [error, setError] = useState("");

  const allowedStatuses = (() => {
    if (currentStatus === "Pending" || currentStatus === "Assigned") {
      return ["Assigned", "In Progress"];
    }
    if (currentStatus === "In Progress") {
      return ["In Progress", "Resolved", "Rejected"];
    }
    return [currentStatus];
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Enforce workflow validation
    if (status === "In Progress" && currentStatus !== "Assigned" && currentStatus !== "Pending") {
      setError("Invalid transition: Status must be Assigned or Pending to start progress.");
      return;
    }
    if ((status === "Resolved" || status === "Rejected") && currentStatus !== "In Progress") {
      setError("Invalid transition: Complaint must be In Progress before resolving or rejecting.");
      return;
    }

    // Require completion note for Resolved
    if (status === "Resolved" && !completionNote.trim()) {
      setError("Completion Note is required to resolve this complaint.");
      return;
    }

    // Require rejection reason for Rejected
    if (status === "Rejected" && !rejectionReason.trim()) {
      setError("Rejection Reason is required.");
      return;
    }

    // Send update back
    onSave({
      complaintId: complaint.id || complaint._id,
      status,
      workNote: workNote.trim(),
      completionNote: status === "Resolved" ? completionNote.trim() : undefined,
      rejectionReason: status === "Rejected" ? rejectionReason : undefined,
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px", width: "100%", maxWidth: "500px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #2c3e50, #3498db)", padding: "20px 24px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "11px", opacity: 0.75, marginBottom: "2px" }}>Updating Tasks for #{complaint.id || complaint._id}</p>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Update Status & Log Notes</h3>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", color: "white", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Current Status display */}
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#4a5568", textTransform: "uppercase" }}>Current Status</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#2d3748" }}>{currentStatus}</span>
          </div>

          {/* Status Dropdown */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase" }}>New Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontWeight: "600", outline: "none", background: "#f8fafc" }}
            >
              {allowedStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Conditional Input based on Selected status */}
          {status === "Resolved" ? (
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase" }}>Completion Note <span style={{ color: "#e53e3e" }}>*</span></label>
              <textarea 
                value={completionNote} 
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="Enter completion details (e.g. Water supply restored, road patch completed)..."
                required
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", minHeight: "80px", fontFamily: "inherit" }}
              />

              <div style={{ marginTop: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase" }}>Upload Proof Image (Optional)</label>
                <input type="file" accept="image/*" style={{ fontSize: "12px" }} />
              </div>
            </div>
          ) : status === "Rejected" ? (
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase" }}>Rejection Reason <span style={{ color: "#e53e3e" }}>*</span></label>
              <select 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontWeight: "600", outline: "none", background: "#f8fafc" }}
              >
                <option value="Duplicate complaint">Duplicate complaint</option>
                <option value="Invalid complaint">Invalid complaint</option>
                <option value="Location not found">Location not found</option>
              </select>
            </div>
          ) : (
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase" }}>Work Log / Notes (Optional)</label>
              <textarea 
                value={workNote} 
                onChange={(e) => setWorkNote(e.target.value)}
                placeholder="Describe current activities (e.g. Visited location, pipeline inspected, repair work started)..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", minHeight: "80px", fontFamily: "inherit" }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button 
              type="submit" 
              style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #2c3e50, #3498db)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
            >
              Save Changes
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ flex: 1, padding: "12px", background: "#f0f2f5", color: "#4a5568", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
