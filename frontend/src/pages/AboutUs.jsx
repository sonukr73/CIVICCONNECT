const AboutUs = () => {
  return (
    <section className="container page-section">
      <div className="page-hero">
        <h1>About Us</h1>
        <p>
          CivicConnect helps residents report local civic issues, follow their progress,
          and stay connected with the teams responsible for public services.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-tile">
          <h3>Our mission</h3>
          <p>Make complaint reporting simple, transparent, and accessible for every citizen.</p>
        </article>
        <article className="info-tile">
          <h3>How it works</h3>
          <p>Residents submit an issue, officers review it, and status updates stay visible in one place.</p>
        </article>
        <article className="info-tile">
          <h3>What we support</h3>
          <p>Roads, sanitation, water supply, street lighting, and other everyday civic concerns.</p>
        </article>
      </div>
    </section>
  );
};

export default AboutUs;