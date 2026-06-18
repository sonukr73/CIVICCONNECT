import React from "react";

export default function WorkLogSection({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-gray-400 italic text-sm mt-2" style={{ color: "#aaa", fontStyle: "italic", fontSize: "13px", marginTop: "8px" }}>
        No work logs filed yet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3" style={{ marginTop: "16px" }}>
      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2" style={{ fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
        Work Logs / Progress Updates
      </h5>
      <div className="relative border-l-2 border-blue-500 pl-4 space-y-4" style={{ position: "relative", borderLeft: "2px solid #3498db", paddingLeft: "16px" }}>
        {logs.map((log, index) => (
          <div key={index} className="relative mb-4" style={{ marginBottom: "16px" }}>
            {/* Timeline dot */}
            <div 
              className="absolute -left-[21px] top-1.5 w-2.5 height-2.5 bg-blue-500 rounded-full" 
              style={{
                position: "absolute",
                left: "-21px",
                top: "6px",
                width: "10px",
                height: "10px",
                backgroundColor: "#3498db",
                borderRadius: "50%"
              }}
            />
            <div className="text-sm text-gray-700 font-medium" style={{ fontSize: "13.5px", color: "#2d3748", fontWeight: "600" }}>
              {log.note}
            </div>
            <div className="text-xs text-gray-400 mt-1" style={{ fontSize: "11px", color: "#a0aec0", marginTop: "4px" }}>
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
