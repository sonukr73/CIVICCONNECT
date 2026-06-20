import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const authMenuRef = useRef(null);
  const languageMenuRef = useRef(null);
  const emergencyMenuRef = useRef(null);

  // Safe check if user is in localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (authMenuRef.current && !authMenuRef.current.contains(event.target)) {
        setShowAuthMenu(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
      if (emergencyMenuRef.current && !emergencyMenuRef.current.contains(event.target)) {
        setShowEmergencyMenu(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload(); // Refresh the state
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "bn", label: "বাংলা" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "mr", label: "मराठी" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container" style={{ padding: '0 60px' }}>
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="CivicConnect Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontFamily: 'cursive', fontWeight: 'bold', fontSize: '26px' }}>CivicConnect</span>
        </Link>
        <div className="nav-links nav-links-center" style={{ gap: "18px" }}>
          <NavLink to="/" end className="nav-link">{t("nav_home")}</NavLink>
          <NavLink to="/track-complaint" className="nav-link">{t("nav_track_complaint")}</NavLink>
          <NavLink to="/contact-us" className="nav-link">{t("nav_contact_us")}</NavLink>
          <NavLink to="/designated-officer" className="nav-link">{t("nav_designated_officer")}</NavLink>
          <NavLink to="/site-map" className="nav-link">{t("nav_sitemap")}</NavLink>
          <div className="nav-auth-menu" ref={emergencyMenuRef}>
            <button
              type="button"
              className="nav-link"
              style={{ color: "#e74c3c", fontWeight: "bold", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}
              onClick={() => setShowEmergencyMenu((value) => !value)}
            >
              Emergency Contacts ▼
            </button>
            {showEmergencyMenu && (
              <div 
                className="nav-dropdown" 
                style={{ 
                  left: "0", 
                  right: "auto", 
                  width: "380px", 
                  padding: 0, 
                  borderRadius: "12px", 
                  overflow: "hidden", 
                  boxShadow: "0 15px 45px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                  zIndex: 2000,
                  background: "#f8fafc"
                }}
              >
                {/* Header Banner */}
                <div style={{ background: "#dc3545", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.27 1.11Z"/>
                    </svg>
                    <span style={{ fontWeight: "800", fontSize: "15px" }}>Emergency Helpline Contacts</span>
                  </div>
                  <button 
                    onClick={() => setShowEmergencyMenu(false)}
                    style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ✕
                  </button>
                </div>

                {/* Dropdown Body */}
                <div style={{ padding: "12px", maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    {
                      title: "National Emergency Number",
                      category: "PRIMARY",
                      tel: "112",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#dc3545" }}>
                          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.27 1.11Z"/>
                        </svg>
                      )
                    },
                    {
                      title: "Police Emergency",
                      category: "POLICE",
                      tel: "112",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#dc3545" }}>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                        </svg>
                      )
                    },
                    {
                      title: "Ambulance",
                      category: "MEDICAL",
                      tel: "108",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#dc3545" }}>
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      )
                    },
                    {
                      title: "Fire Brigade",
                      category: "FIRE",
                      tel: "101",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#dc3545" }}>
                          <path d="M12 2c-.41 0-.8.17-1.08.48C9.37 4.25 8 6.96 8 9.5c0 2.2 1.8 4 4 4s4-1.8 4-4c0-2.54-1.37-5.25-2.92-7.02C12.8 2.17 12.41 2 12 2Z"/>
                        </svg>
                      )
                    },
                    {
                      title: "Women Helpline",
                      category: "WOMEN",
                      tel: "1091",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#dc3545" }}>
                          <circle cx="12" cy="9" r="5"></circle>
                          <line x1="12" y1="14" x2="12" y2="22"></line>
                          <line x1="9" y1="18" x2="15" y2="18"></line>
                        </svg>
                      )
                    },
                    {
                      title: "Child Helpline",
                      category: "CHILD",
                      tel: "1098",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#dc3545" }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                      )
                    },
                    {
                      title: "Disaster Management",
                      category: "DISASTER",
                      tel: "1078",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#dc3545" }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      )
                    }
                  ].map((contact, i) => (
                    <div 
                      key={i}
                      style={{
                        background: "white",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                        gap: "10px"
                      }}
                    >
                      {/* Left: Icon */}
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#fff5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {contact.icon}
                      </div>

                      {/* Middle: Details */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#1e293b" }}>{contact.title}</div>
                        <div style={{ fontSize: "9.5px", fontWeight: "800", color: "#888", letterSpacing: "0.5px" }}>{contact.category}</div>
                      </div>

                      {/* Right: Call Action */}
                      <a 
                        href={`tel:${contact.tel}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 14px",
                          border: "1.5px solid #dc3545",
                          borderRadius: "20px",
                          color: "#dc3545",
                          background: "white",
                          fontWeight: "800",
                          fontSize: "12px",
                          textDecoration: "none",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fff5f5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        {contact.tel}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {user && user.role?.toLowerCase() === "citizen" && (
            <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          )}
          {user && user.role?.toLowerCase() === "admin" && (
            <NavLink to="/admin-dashboard" className="nav-link">Admin Dashboard</NavLink>
          )}
          {user && user.role?.toLowerCase() === "departmental officer" && (
            <NavLink to="/officer-dashboard" className="nav-link">Officer Dashboard</NavLink>
          )}
        </div>

        <div className="nav-links nav-links-right">
          {user ? (
            <div className="nav-auth-menu" ref={authMenuRef} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="nav-link" style={{ fontWeight: 'bold' }}>{user.name}</span>
              <button
                type="button"
                className="nav-icon-button"
                onClick={() => setShowAuthMenu((value) => !value)}
                aria-label="Open profile options"
                aria-expanded={showAuthMenu}
                style={{ backgroundColor: "#3498db", border: "none" }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="white">
                  <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                </svg>
              </button>
              {showAuthMenu && (
                <div className="nav-dropdown" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                  <div className="nav-dropdown-link" style={{ cursor: 'default', color: '#7f8c8d', borderBottom: '1px solid #ecf0f1', paddingBottom: '10px', marginBottom: '5px', fontSize: '12px' }}>
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="nav-dropdown-link"
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold' }}
                  >
                    {t("nav_logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-menu" ref={authMenuRef}>
              <button
                type="button"
                className="nav-icon-button"
                onClick={() => setShowAuthMenu((value) => !value)}
                aria-label="Open authentication options"
                aria-expanded={showAuthMenu}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                </svg>
              </button>
              {showAuthMenu && (
                <div className="nav-dropdown">
                  <Link to="/login" className="nav-dropdown-link" onClick={() => setShowAuthMenu(false)}>
                    {t("nav_login")}
                  </Link>
                  <Link to="/register" className="nav-dropdown-link" onClick={() => setShowAuthMenu(false)}>
                    {t("nav_register")}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nav-controls">
          <button
            type="button"
            className="nav-icon-button"
            aria-label="Notifications"
            onClick={() => alert("No new notifications")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
          </button>
          <div className="nav-language-menu" ref={languageMenuRef}>
            <button
              type="button"
              className="nav-icon-button nav-language-button"
              onClick={() => setShowLanguageMenu((value) => !value)}
              aria-label="Open language options"
              aria-expanded={showLanguageMenu}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm6.93 9h-2.9a15.74 15.74 0 0 0-1.12-5A8.03 8.03 0 0 1 18.93 11ZM12 4.06A13.5 13.5 0 0 1 13.61 11h-3.22A13.5 13.5 0 0 1 12 4.06ZM4.07 13h2.9a15.74 15.74 0 0 0 1.12 5A8.03 8.03 0 0 1 4.07 13ZM6.97 11h-2.9a8.03 8.03 0 0 1 4.02-5 15.74 15.74 0 0 0-1.12 5Zm2.29 0a13.5 13.5 0 0 1 1.61-6.94A13.5 13.5 0 0 1 12.48 11H9.26Zm0 2h3.22A13.5 13.5 0 0 1 12 19.94 13.5 13.5 0 0 1 9.26 13Zm2.19 6.94A15.74 15.74 0 0 0 12.57 13h3.22a13.5 13.5 0 0 1-1.61 6.94Zm5.44-1.94a15.74 15.74 0 0 0 1.12-5h2.9a8.03 8.03 0 0 1-4.02 5Zm1.12-7a15.74 15.74 0 0 0-1.12-5 8.03 8.03 0 0 1 4.02 5Z" />
              </svg>
            </button>
            {showLanguageMenu && (
              <div className="nav-dropdown nav-language-dropdown">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={item.code === language ? "nav-dropdown-link nav-dropdown-active" : "nav-dropdown-link"}
                    onClick={() => {
                      changeLanguage(item.code);
                      setShowLanguageMenu(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
