import React from 'react';
import { useLanguage } from "../LanguageContext";

const ContactUs = () => {
  const { t } = useLanguage();
  return (
    <section className="container page-section">
      <div className="page-hero">
        <h1>{t("nav_contact_us", "Contact Us")}</h1>
        <p>
          We're here to help. Reach out to us for any queries or support regarding CivicConnect.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-tile" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
          <h3>Our Office</h3>
          <p>
            <strong>Address:</strong> 123, Civic Center, Connaught Place, New Delhi, Delhi 110001
          </p>
          <p>
            <strong>Landline:</strong> +91 11 2345 6789
          </p>
          <p>
            <strong>Email:</strong> support@civicconnect.in
          </p>
        </article>
      </div>

      <div className="info-grid" style={{ marginTop: "30px" }}>
        <article className="info-tile" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Service Resolution Priority</h3>
          <p style={{ textAlign: "center", marginBottom: "20px" }}>Expected task completion times based on issue priority:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '15px', border: '1px solid #e74c3c', borderRadius: '8px', background: '#fdf0ed', textAlign: 'center' }}>
              <h4 style={{ color: '#c0392b', marginBottom: '8px', fontSize: '18px' }}>High Priority</h4>
              <p style={{ margin: 0, fontSize: '16px' }}>Resolution within <strong style={{ color: '#c0392b' }}>24 Hours</strong></p>
              <small style={{ color: '#777', display: 'block', marginTop: '8px' }}>Water supply, severe road damage, etc.</small>
            </div>
            <div style={{ padding: '15px', border: '1px solid #f39c12', borderRadius: '8px', background: '#fef5e7', textAlign: 'center' }}>
              <h4 style={{ color: '#d68910', marginBottom: '8px', fontSize: '18px' }}>Medium Priority</h4>
              <p style={{ margin: 0, fontSize: '16px' }}>Resolution within <strong style={{ color: '#d68910' }}>3-5 Days</strong></p>
              <small style={{ color: '#777', display: 'block', marginTop: '8px' }}>Street lighting, garbage collection, etc.</small>
            </div>
            <div style={{ padding: '15px', border: '1px solid #3498db', borderRadius: '8px', background: '#ebf5fb', textAlign: 'center' }}>
              <h4 style={{ color: '#2980b9', marginBottom: '8px', fontSize: '18px' }}>Low Priority</h4>
              <p style={{ margin: 0, fontSize: '16px' }}>Resolution within <strong style={{ color: '#2980b9' }}>7-14 Days</strong></p>
              <small style={{ color: '#777', display: 'block', marginTop: '8px' }}>Park maintenance, minor repairs, etc.</small>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default ContactUs;
