import React from "react";

const STATUS_CLASSES = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Assigned: "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

// Styling fallback inline styles in case Tailwind is not fully set up or parsed
const STATUS_STYLES = {
  Pending: { bg: "#fef3e2", color: "#e67e22", border: "1px solid #fbd38d" },
  Assigned: { bg: "#e8f4fd", color: "#3498db", border: "1px solid #bee3f8" },
  "In Progress": { bg: "#f5eef8", color: "#9b59b6", border: "1px solid #e9d8fd" },
  Resolved: { bg: "#e9f7ef", color: "#27ae60", border: "1px solid #c6f6d5" },
  Rejected: { bg: "#fdecea", color: "#e74c3c", border: "1px solid #fed7d7" },
};

export default function StatusBadge({ status }) {
  const badgeClass = STATUS_CLASSES[status] || STATUS_CLASSES.Pending;
  const inlineStyle = STATUS_STYLES[status] || STATUS_STYLES.Pending;

  return (
    <span 
      className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${badgeClass}`}
      style={{
        backgroundColor: inlineStyle.bg,
        color: inlineStyle.color,
        borderColor: inlineStyle.border,
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.3px",
        whiteSpace: "nowrap"
      }}
    >
      {status}
    </span>
  );
}
