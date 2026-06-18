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
        <div className="nav-links nav-links-center">
          <NavLink to="/" end className="nav-link">{t("nav_home")}</NavLink>
          <NavLink to="/track-complaint" className="nav-link">{t("nav_track_complaint")}</NavLink>
          <NavLink to="/contact-us" className="nav-link">{t("nav_contact_us")}</NavLink>
          <NavLink to="/designated-officer" className="nav-link">{t("nav_designated_officer")}</NavLink>
          <NavLink to="/site-map" className="nav-link">{t("nav_sitemap")}</NavLink>
          <div className="nav-auth-menu" ref={emergencyMenuRef} style={{ marginLeft: "10px" }}>
            <button
              type="button"
              className="nav-link"
              style={{ color: "#e74c3c", fontWeight: "bold", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}
              onClick={() => setShowEmergencyMenu((value) => !value)}
            >
              Emergency Contacts ▼
            </button>
            {showEmergencyMenu && (
              <div className="nav-dropdown" style={{ left: "0", right: "auto", minWidth: "220px" }}>
                <a href="tel:112" className="nav-dropdown-link" style={{ color: "#e74c3c" }}>National Emergency: 112</a>
                <a href="tel:100" className="nav-dropdown-link">Police: 100</a>
                <a href="tel:101" className="nav-dropdown-link">Fire: 101</a>
                <a href="tel:102" className="nav-dropdown-link">Ambulance: 102</a>
                <a href="tel:108" className="nav-dropdown-link">Disaster Management: 108</a>
                <a href="tel:1091" className="nav-dropdown-link">Women Helpline: 1091</a>
                <a href="tel:1098" className="nav-dropdown-link">Child Helpline: 1098</a>
                <a href="tel:14567" className="nav-dropdown-link">Senior Citizen: 14567</a>
                <a href="tel:1930" className="nav-dropdown-link">Cyber Crime: 1930</a>
                <a href="tel:1073" className="nav-dropdown-link">Road Accident: 1073</a>
              </div>
            )}
          </div>
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
