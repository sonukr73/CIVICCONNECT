import { Link } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-brand-sec">
          <Link to="/" className="footer-logo">
            CIVICCONNECT
          </Link>
          <p className="footer-description">
            {t("footer_desc")}
          </p>
        </div>

        <div className="footer-links-sec">
          <h3>{t("footer_links_title")}</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/">{t("nav_home")}</Link>
            </li>
            <li>
              <Link to="/track-complaint">{t("nav_track_complaint")}</Link>
            </li>
            <li>
              <Link to="/contact-us">{t("nav_contact_us")}</Link>
            </li>
            <li>
              <Link to="/designated-officer">{t("nav_designated_officer")}</Link>
            </li>
            <li>
              <Link to="/site-map">{t("nav_sitemap")}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact-sec">
          <h3>{t("footer_contact_title")}</h3>
          <p className="footer-contact-item">
            <strong>{t("footer_helpline")}</strong>
          </p>
          <p className="footer-contact-item">
            {t("footer_email")}
          </p>
          <div className="footer-social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t("footer_copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
