import { useState } from "react";
import axios from "axios";
import { useLanguage } from "../LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TrackComplaint = () => {
  const { t } = useLanguage();
  const [searchMode, setSearchMode] = useState("email"); // "email" or "complaintId"
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError(t("track_error_empty"));
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const params = searchMode === "email"
        ? { email: searchValue.trim() }
        : { complaintId: searchValue.trim() };

      const res = await axios.get(`${API_BASE_URL}/api/complaints/track`, { params });
      setResults(res.data.complaints || []);
    } catch (err) {
      // If backend is not available, show demo data for UI preview
      if (err.code === "ERR_NETWORK" || err.response?.status === 404) {
        setResults([]);
      } else {
        setError(err.response?.data?.message || t("track_error_generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved": return "#2ecc71";
      case "in progress": return "#3498db";
      case "under review": return "#f39c12";
      case "pending": return "#e67e22";
      case "submitted": return "#95a5a6";
      default: return "#7f8c8d";
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved": return "#eafaf1";
      case "in progress": return "#ebf5fb";
      case "under review": return "#fef9e7";
      case "pending": return "#fdf2e9";
      case "submitted": return "#f2f3f4";
      default: return "#f2f3f4";
    }
  };

  const statusSteps = ["Submitted", "Under Review", "In Progress", "Resolved"];

  const getStepIndex = (status) => {
    const idx = statusSteps.findIndex(
      (s) => s.toLowerCase() === status?.toLowerCase()
    );
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="track-complaint-page">
      {/* Hero Banner */}
      <div className="track-hero">
        <div className="container">
          <div className="track-hero-content">
            <div className="track-hero-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h1>{t("track_page_title")}</h1>
            <p>{t("track_page_subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search Card */}
        <div className="track-search-card">
          {/* Mode Toggle */}
          <div className="track-mode-toggle">
            <button
              type="button"
              className={`track-mode-btn ${searchMode === "email" ? "active" : ""}`}
              onClick={() => { setSearchMode("email"); setSearchValue(""); setResults([]); setSearched(false); setError(""); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {t("track_by_email")}
            </button>
            <button
              type="button"
              className={`track-mode-btn ${searchMode === "complaintId" ? "active" : ""}`}
              onClick={() => { setSearchMode("complaintId"); setSearchValue(""); setResults([]); setSearched(false); setError(""); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h16v3" />
                <path d="M9 20h6" />
                <path d="M12 4v16" />
              </svg>
              {t("track_by_id")}
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="track-search-form">
            <div className="track-input-wrapper">
              <div className="track-input-icon">
                {searchMode === "email" ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                )}
              </div>
              <input
                type={searchMode === "email" ? "email" : "text"}
                className="track-search-input"
                placeholder={searchMode === "email" ? t("track_email_placeholder") : t("track_id_placeholder")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                id="track-search-input"
              />
            </div>
            <button type="submit" className="track-search-btn" disabled={loading} id="track-search-btn">
              {loading ? (
                <span className="track-spinner"></span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  {t("track_search_btn")}
                </>
              )}
            </button>
          </form>

          {error && <p className="track-error">{error}</p>}
        </div>

        {/* Results */}
        <div className="track-results-section">
          {loading && (
            <div className="track-loading">
              <div className="track-loading-spinner"></div>
              <p>{t("track_searching")}</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="track-no-results">
              <div className="track-no-results-icon">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#bdc3c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h3>{t("track_no_results_title")}</h3>
              <p>{t("track_no_results_desc")}</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="track-results-header">
                <h3>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {t("track_results_found").replace("{count}", results.length)}
                </h3>
              </div>

              <div className="track-results-list">
                {results.map((complaint) => {
                  const currentStep = getStepIndex(complaint.status);
                  return (
                    <div key={complaint._id} className="track-result-card" id={`complaint-${complaint._id}`}>
                      <div className="track-result-header">
                        <div className="track-result-meta">
                          <span className="track-complaint-id">#{complaint._id?.slice(-8).toUpperCase() || "N/A"}</span>
                          <span
                            className="track-status-badge"
                            style={{
                              backgroundColor: getStatusBg(complaint.status),
                              color: getStatusColor(complaint.status),
                              borderColor: getStatusColor(complaint.status),
                            }}
                          >
                            <span className="track-status-dot" style={{ backgroundColor: getStatusColor(complaint.status) }}></span>
                            {complaint.status || "Submitted"}
                          </span>
                        </div>
                        <span className="track-date">
                          {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                      </div>

                      <h4 className="track-result-title">{complaint.title}</h4>
                      <p className="track-result-desc">{complaint.description}</p>

                      <div className="track-result-info">
                        <span className="track-info-item">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18" />
                          </svg>
                          {complaint.category}
                        </span>
                        <span className="track-info-item">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {complaint.location}
                        </span>
                      </div>

                      {/* Status Timeline */}
                      <div className="track-timeline">
                        {statusSteps.map((step, idx) => (
                          <div key={step} className={`track-timeline-step ${idx <= currentStep ? "completed" : ""} ${idx === currentStep ? "current" : ""}`}>
                            <div className="track-timeline-dot">
                              {idx < currentStep ? (
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : idx === currentStep ? (
                                <span className="track-dot-pulse"></span>
                              ) : null}
                            </div>
                            {idx < statusSteps.length - 1 && <div className="track-timeline-line"></div>}
                            <span className="track-timeline-label">{step}</span>
                          </div>
                        ))}
                      </div>

                      {complaint.image && (
                        <div className="track-result-image">
                          <img src={complaint.image} alt="Complaint evidence" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackComplaint;
