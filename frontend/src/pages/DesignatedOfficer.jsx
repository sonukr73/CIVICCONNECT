const DesignatedOfficer = () => {
  return (
    <section className="container page-section">
      <div className="page-hero">
        <h1>Designated Officer</h1>
        <p>
          The designated officer is responsible for reviewing incoming complaints,
          assigning them to the correct department, and monitoring resolution updates.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-tile">
          <h3>Responsibilities</h3>
          <ul>
            <li>Review and verify complaint details</li>
            <li>Forward issues to the correct civic department</li>
            <li>Track complaint status until closure</li>
          </ul>
        </article>
        <article className="info-tile">
          <h3>Contact</h3>
          <p>Email: support@civicconnect.local</p>
          <p>Phone: +91 00000 00000</p>
          <p>Office hours: Monday to Friday, 9:00 AM to 5:00 PM</p>
        </article>
      </div>
    </section>
  );
};

export default DesignatedOfficer;