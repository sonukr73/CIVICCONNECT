import { useState } from "react";
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
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

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

  const smartFeatures = [
    {
      id: 1,
      title: t("smart_feature_ai_title"),
      description: t("smart_feature_ai_desc"),
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#3498db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t("smart_feature_gps_title"),
      description: t("smart_feature_gps_desc"),
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      id: 3,
      title: t("smart_feature_alerts_title"),
      description: t("smart_feature_alerts_desc"),
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8" />
          <path d="M8 14h6" />
        </svg>
      )
    },
    {
      id: 4,
      title: t("smart_feature_analytics_title"),
      description: t("smart_feature_analytics_desc"),
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M21 12H3" />
          <path d="M12 3v18" />
        </svg>
      )
    },
    {
      id: 5,
      title: t("smart_feature_duplicate_title"),
      description: t("smart_feature_duplicate_desc"),
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#9b59b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )
    },
    {
      id: 6,
      title: t("smart_feature_feedback_title"),
      description: t("smart_feature_feedback_desc"),
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 6l-9.5 9.5-5-5L1 18" />
          <path d="M17 6h6v6" />
        </svg>
      )
    }
  ];

  const faqs = [
    {
      id: 1,
      question: t("faq_q1_title"),
      answer: t("faq_q1_desc")
    },
    {
      id: 2,
      question: t("faq_q2_title"),
      answer: t("faq_q2_desc")
    },
    {
      id: 3,
      question: t("faq_q3_title"),
      answer: t("faq_q3_desc")
    },
    {
      id: 4,
      question: t("faq_q4_title"),
      answer: t("faq_q4_desc")
    },
    {
      id: 5,
      question: t("faq_q5_title"),
      answer: t("faq_q5_desc")
    }
  ];

  return (
    <div>
      <Hero />
      
      {/* Intro & Quote Section */}
      <div className="container" style={{ marginTop: "48px", marginBottom: "48px", textAlign: "left", maxWidth: "800px", margin: "48px auto" }}>
        <h1 style={{ fontSize: "40px", fontWeight: "300", color: "#2c3e50", margin: "0 0 4px 0", fontFamily: "sans-serif" }}>
          CivicConnect
        </h1>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#3b82f6", margin: "0 0 24px 0", fontFamily: "sans-serif" }}>
          Community Issue Reporting & Resolution Platform
        </h2>

        {/* Quote Card */}
        <div style={{
          background: "#fafaf6",
          border: "1px solid #f0f0e8",
          borderRadius: "8px",
          padding: "20px 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          marginBottom: "24px"
        }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#2d3748", fontFamily: "sans-serif" }}>
            "जिम्मेदार नागरिक, बेहतर शहर।"
          </div>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#718096", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            RESPONSIBLE CITIZENS. BETTER COMMUNITIES.
          </div>
        </div>

        <p style={{ fontSize: "15px", color: "#718096", lineHeight: "1.6", margin: 0 }}>
          CivicConnect helps residents report local civic issues such as road damage, drainage problems, sanitation concerns, water supply issues and street-light faults.
        </p>
      </div>

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
            <div key={step.id} className="step-card">
              <div className="step-number">0{step.id}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ marginBottom: "60px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#2c3e50" }}>
          {t("smart_features_title")}
        </h2>

        <div className="smart-features-grid" aria-label={t("smart_features_title")}>
          {smartFeatures.map((feature) => (
            <div key={feature.id} className="smart-feature-card">
              <div className="smart-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ marginBottom: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "35px", color: "#2c3e50" }}>
          {t("stats_title")}
        </h2>
        <div className="stats-grid" aria-label={t("stats_title")}>
          <div className="stat-card registered">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="stat-number">{t("stats_registered_value")}</div>
            <div className="stat-label">{t("stats_registered_title")}</div>
          </div>

          <div className="stat-card resolved">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-number">{t("stats_resolved_value")}</div>
            <div className="stat-label">{t("stats_resolved_title")}</div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-number">{t("stats_pending_value")}</div>
            <div className="stat-label">{t("stats_pending_title")}</div>
          </div>

          <div className="stat-card departments">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                <line x1="12" y1="12" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="stat-number">{t("stats_departments_value")}</div>
            <div className="stat-label">{t("stats_departments_title")}</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "35px", color: "#2c3e50" }}>
          {t("faq_title")}
        </h2>

        <div className="faq-list" aria-label={t("faq_title")}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button 
                  className="faq-question-btn" 
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>
                <div className="faq-answer-wrapper">
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
