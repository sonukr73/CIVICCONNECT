import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  
  // Safe check if user is in localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload(); // Refresh the state
  };

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          CivicConnect
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">{t("nav_home")}</Link>
          
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
            <>
              <Link to="/login" className="nav-link">{t("nav_login")}</Link>
              <Link to="/register" className="nav-link">{t("nav_register")}</Link>
            </>
          )}

          {/* Language Toggle Button */}
          <button 
            onClick={toggleLanguage} 
            className="btn" 
            style={{ padding: "5px", marginTop: "0", marginLeft: "10px", width: "auto", backgroundColor: "#34495e", border: "1px solid #7f8c8d" }}
          >
            {language === 'en' ? 'HI' : 'EN'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
