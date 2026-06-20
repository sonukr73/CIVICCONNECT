import { useState } from "react";
import InputBox from "../components/InputBox";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Citizen");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError(t("error_fill_fields"));
    setError("");
    setIsLoading(true);

    try {
      const isCitizen = role === "Citizen";
      const endpoint = isCitizen ? "/api/users/login" : "/api/authorities/login";
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        email,
        password,
        role: role.toLowerCase()
      });

      // Save user info locally
      const loggedInUser = isCitizen ? response.data.user : response.data.authority;
      if (!loggedInUser.role) {
        loggedInUser.role = role.toLowerCase();
      }
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      
      const targetPath = loggedInUser.role === "admin" ? "/admin-dashboard" : (loggedInUser.role === "departmental officer" ? "/officer-dashboard" : "/");
      navigate(targetPath);
      // Force refresh to update Navbar (easy trick)
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card">
        <h2>{t("login_title")}</h2>
        {error && <p style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, padding: "10px 5px", fontSize: "13px", backgroundColor: role === "Citizen" ? "#3498db" : "#ecf0f1", color: role === "Citizen" ? "white" : "#333", border: role === "Citizen" ? "none" : "1px solid #ccc" }}
              onClick={() => setRole("Citizen")}
            >
              Citizen
            </button>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, padding: "10px 5px", fontSize: "13px", backgroundColor: role === "Admin" ? "#3498db" : "#ecf0f1", color: role === "Admin" ? "white" : "#333", border: role === "Admin" ? "none" : "1px solid #ccc" }}
              onClick={() => setRole("Admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, padding: "10px 5px", fontSize: "13px", backgroundColor: role === "Departmental Officer" ? "#3498db" : "#ecf0f1", color: role === "Departmental Officer" ? "white" : "#333", border: role === "Departmental Officer" ? "none" : "1px solid #ccc" }}
              onClick={() => setRole("Departmental Officer")}
            >
              Officer
            </button>
          </div>
          <InputBox 
            label={role === "Citizen" ? t("login_email_label") : "Login ID"} 
            type="text" 
            placeholder={role === "Citizen" ? t("login_email_placeholder") : "name.gov.in"} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputBox 
            label={t("login_pass_label")} 
            type="password" 
            placeholder={role === "Citizen" ? t("login_pass_placeholder") : "name@123"} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {role !== "Citizen" && (
            <p style={{ fontSize: "12px", color: "#64748b", margin: "-10px 0 20px 0", textAlign: "left", fontStyle: "italic" }}>
              💡 Hint: Enter your ID (e.g. name.gov.in) and password (e.g. name@123).
            </p>
          )}
          
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? t("login_btn_loading") : t("login_btn")}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
          {t("login_no_account")} <Link to="/register">{t("login_signup_link")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
