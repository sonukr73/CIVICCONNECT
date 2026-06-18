import { Link } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const SiteMap = () => {
  const { t } = useLanguage();

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/track-complaint", label: t("nav_track_complaint") },
    { to: "/contact-us", label: t("nav_contact_us") },
    { to: "/designated-officer", label: t("nav_designated_officer") },
    { to: "/site-map", label: t("nav_sitemap") },
    { to: "/login", label: t("nav_login") },
    { to: "/register", label: t("nav_register") },
  ];

  return (
    <section className="container page-section">
      <div className="page-hero">
        <h1>SiteMap</h1>
        <p>Quick links to the main sections of CivicConnect.</p>
      </div>

      <div className="info-tile">
        <ul className="info-list">
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SiteMap;