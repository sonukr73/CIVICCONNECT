import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const authMenuRef = useRef(null);
  const languageMenuRef = useRef(null);
  
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
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          CivicConnect
        </Link>
        <div className="nav-links nav-links-center">
          <Link to="/" className="nav-link">{t("nav_home")}</Link>
          <Link to="/track-complaint" className="nav-link">{t("nav_track_complaint")}</Link>
          <Link to="/about-us" className="nav-link">{t("nav_about_us")}</Link>
          <Link to="/designated-officer" className="nav-link">{t("nav_designated_officer")}</Link>
          <Link to="/site-map" className="nav-link">{t("nav_sitemap")}</Link>
        </div>

        <div className="nav-links nav-links-right">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">{t("nav_dashboard")}</Link>
              <span className="nav-link" style={{ fontWeight: 'bold' }}>{t("nav_welcome")}, {user.name}</span>
              <button 
                onClick={handleLogout} 
                className="btn" 
                style={{ padding: "5px 10px", marginTop: "0", display: "inline-block", width: "auto" }}
              >
                {t("nav_logout")}
              </button>
            </>
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
