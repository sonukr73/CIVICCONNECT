import { Link } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>{t("home_hero_title")}</h1>
        <p>{t("home_hero_subtitle")}</p>
        <Link to="/track-complaint" className="btn hero-btn">
          {t("home_hero_btn")}
        </Link>
      </div>
    </div>
  );
};

export default Hero;
