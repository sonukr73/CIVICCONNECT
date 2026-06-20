import { useState } from "react";
import InputBox from "../components/InputBox";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Register = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError(t("error_fill_fields"));
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name,
        email,
        phone,
        password,
      });

      // Do NOT log them in automatically. Redirect to login.
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card">
        <h2>{t("register_title")}</h2>
        {error && <p style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{error}</p>}
        
        <form onSubmit={handleRegister}>
          <InputBox label={t("register_name_label")} placeholder={t("register_name_placeholder")} value={name} onChange={(e) => setName(e.target.value)} />
          <InputBox label={t("login_email_label")} type="email" placeholder={t("login_email_placeholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputBox label={t("register_phone_label")} type="tel" placeholder={t("register_phone_placeholder")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <InputBox label={t("login_pass_label")} type="password" placeholder={t("register_pass_placeholder")} value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? t("register_btn_loading") : t("register_btn")}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
          {t("register_has_account")} <Link to="/login">{t("register_signin_link")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
