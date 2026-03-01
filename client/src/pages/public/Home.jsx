import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// Import local assets
import imgHomeRepair from '../../assets/images/home_repair.png';
import imgRenovations from '../../assets/images/renovations.png';
import imgEventPlanning from '../../assets/images/event_planning.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Expert Services by Masters & Apprentices.</h1>
          <p className="hero-subtitle">
            Reliable, high-quality home repairs, renovations, and event planning powered by generations of skill. Support intergenerational learning today.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Find a Service
            </button>
            <button className="btn-secondary" onClick={() => navigate('/register')}>
              Join as a Professional
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2 className="section-title">Start Your New Service Request</h2>
          <p className="section-subtitle">Select a service category below to get matched with a verified Master & Apprentice duo.</p>
        </div>

        <div className="cards-grid">

          {/* Card 1: Home Repair */}
          <div className="service-card" onClick={() => navigate('/login')}>
            <div className="card-image-wrap">
              <img src={imgHomeRepair} alt="Home Repair" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Home Repair</h3>
              <p className="card-desc">Expert tradespeople for repairs, plumbing, electrical, and general handiwork around the house.</p>
              <button className="card-btn">Select Service</button>
            </div>
          </div>

          {/* Card 2: Renovations */}
          <div className="service-card" onClick={() => navigate('/login')}>
            <div className="card-image-wrap">
              <img src={imgRenovations} alt="Renovations" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Renovations</h3>
              <p className="card-desc">Design and build your dream spaces with professional help, structural updates, and painting.</p>
              <button className="card-btn">Select Service</button>
            </div>
          </div>

          {/* Card 3: Event Planning */}
          <div className="service-card" onClick={() => navigate('/login')}>
            <div className="card-image-wrap">
              <img src={imgEventPlanning} alt="Event Planning" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Event Planning</h3>
              <p className="card-desc">Create memorable events with skilled planning, coordination, catering prep, and execution.</p>
              <button className="card-btn">Select Service</button>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title" style={{ color: 'white' }}>Trusted by Generations</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Hear from our community of Clients, Masters, and Apprentices.</p>
        </div>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <div className="rating-stars">★★★★★</div>
            <p className="testimonial-quote">"I needed my back deck repaired, and Frank (Master) not only fixed it perfectly but he taught a young apprentice the ropes the entire time. Incredible experience."</p>
            <div className="testimonial-author">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" alt="Sarah J." className="author-avatar" />
              <div className="author-info">
                <h4>Sarah Jenkins</h4>
                <p>Homeowner & Client</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <div className="rating-stars">★★★★★</div>
            <p className="testimonial-quote">"After retiring from 40 years of electrical work, I missed the trade. 70-30 lets me pass on my knowledge to the next generation while staying active."</p>
            <div className="testimonial-author">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop" alt="Arthur C." className="author-avatar" />
              <div className="author-info">
                <h4>Arthur Clemens</h4>
                <p>Master Electrician</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card">
            <div className="rating-stars">★★★★★</div>
            <p className="testimonial-quote">"I'm learning more from shadowing these senior masters on actual paid jobs than I ever did in a classroom. Plus, I'm getting paid while I learn."</p>
            <div className="testimonial-author">
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop" alt="Leo T." className="author-avatar" />
              <div className="author-info">
                <h4>Leo Torres</h4>
                <p>Apprentice Carpenter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
