import { Link } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const IssueCard = ({ title, description, imageUrl }) => {
  const { t } = useLanguage();

  return (
    <div className="card issue-card">
      <img 
        src={imageUrl} 
        alt={title} 
        className="issue-card-img" 
        onError={(e) => { e.target.src = "https://placehold.co/600x400/2c3e50/ffffff?text=Civic+Issue" }}
      />
      <div className="issue-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
        <Link to="/dashboard" className="btn" style={{ textAlign: "center", textDecoration: "none" }}>
          {t("issue_report_btn")}
        </Link>
      </div>
    </div>
  );
};

export default IssueCard;
