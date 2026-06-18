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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError(t("error_fill_fields"));
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password,
      });

      // Save user info locally
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Navigate to the complaint tracker
      navigate("/track-complaint");
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
          <InputBox 
            label={t("login_email_label")} 
            type="email" 
            placeholder={t("login_email_placeholder")} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputBox 
            label={t("login_pass_label")} 
            type="password" 
            placeholder={t("login_pass_placeholder")} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
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
