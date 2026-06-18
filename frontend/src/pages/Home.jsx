import { Fragment } from "react";
import Hero from "../components/Hero";
import IssueCard from "../components/IssueCard";
import { useLanguage } from "../LanguageContext";

// Local image assets
import potholeImg from "../assets/pothole.jpg";
import waterImg from "../assets/water.jpg";
import garbageImg from "../assets/garbage.jpg";
import streetlightImg from "../assets/streetlight.jpg";
import drainageImg from "../assets/Drai.png";

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
    {
      id: 5,
      title: t("issue_drainage_title"),
      description: t("issue_drainage_desc"),
      imageUrl: drainageImg,
    },
    {
      id: 6,
      title: t("issue_other_title"),
      description: t("issue_other_desc"),
      imageUrl: "https://placehold.co/600x400/2c3e50/ffffff?text=Other",
    },
  ];

  const howItWorksSteps = [
    {
      id: 1,
      title: t("how_it_works_step_1_title"),
      description: t("how_it_works_step_1_desc"),
    },
    {
      id: 2,
      title: t("how_it_works_step_2_title"),
      description: t("how_it_works_step_2_desc"),
    },
    {
      id: 3,
      title: t("how_it_works_step_3_title"),
      description: t("how_it_works_step_3_desc"),
    },
    {
      id: 4,
      title: t("how_it_works_step_4_title"),
      description: t("how_it_works_step_4_desc"),
    },
    {
      id: 5,
      title: t("how_it_works_step_5_title"),
      description: t("how_it_works_step_5_desc"),
    },
    {
      id: 6,
      title: t("how_it_works_step_6_title"),
      description: t("how_it_works_step_6_desc"),
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

      <div className="container" style={{ marginBottom: "60px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#2c3e50" }}>
          {t("how_it_works_title")}
        </h2>

        <div className="step-flow" aria-label={t("how_it_works_title")}>
          {howItWorksSteps.map((step) => (
            <Fragment key={step.id}>
              <div key={step.id} className="step-card">
                <div className="step-number">0{step.id}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {step.id !== howItWorksSteps.length && (
                <div className="step-arrow" aria-hidden="true">
                  →
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
