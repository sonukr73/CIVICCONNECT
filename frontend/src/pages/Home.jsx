import Hero from "../components/Hero";
import IssueCard from "../components/IssueCard";
import { useLanguage } from "../LanguageContext";

// Local image assets
import potholeImg from "../assets/pothole.jpg";
import waterImg from "../assets/water.jpg";
import garbageImg from "../assets/garbage.jpg";
import streetlightImg from "../assets/streetlight.jpg";

const Home = () => {
  const { t } = useLanguage();

  // Mock data utilizing local assets for Indian civic context
  const civicIssues = [
    {
      id: 1,
      title: t("issue_potholes_title"),
      description: t("issue_potholes_desc"),
      imageUrl: potholeImg, 
    },
    {
      id: 2,
      title: t("issue_water_title"),
      description: t("issue_water_desc"),
      imageUrl: waterImg, 
    },
    {
      id: 3,
      title: t("issue_garbage_title"),
      description: t("issue_garbage_desc"),
      imageUrl: garbageImg, 
    },
    {
      id: 4,
      title: t("issue_street_title"),
      description: t("issue_street_desc"),
      imageUrl: streetlightImg,
    },
  ];

  return (
    <div>
      <Hero />
      <div className="container" style={{ marginTop: "40px", marginBottom: "60px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#2c3e50" }}>
          {t("home_issues_title")}
        </h2>
        
        <div className="grid-layout">
          {civicIssues.map((issue) => (
            <IssueCard 
              key={issue.id} 
              title={issue.title} 
              description={issue.description} 
              imageUrl={issue.imageUrl} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
