import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "./Home.css";

function Home({ user }) {
  return (
    <div className="h-container">
      <header className="h-navbar">
        <div className="h-nav-brand">
          <img src="/blogLogo.png" alt="Fusion Diaries" className="h-nav-logo" />
          <span className="h-logo">Fusion Diaries</span>
        </div>
        <div className="h-nav-links">
          <Link to={user ? "/choose-role" : "/login"} className="h-link">About</Link>
          <Link to={user ? "/blogger" : "/login"} className="h-link">Write</Link>
          {user ? (
            <>
              <Link to="/choose-role" className="h-link">Dashboard</Link>
              <Link to="/profile" className="h-link">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="h-link">Sign In</Link>
              <Link to="/login"><button className="h-cta-btn">Get Started</button></Link>
            </>
          )}
        </div>
      </header>
 
      <div className="h-hero">
        <div className="h-hero-glow g1"></div>
        <div className="h-hero-glow g2"></div>
        <div className="h-hero-content">
          <span className="h-badge">✨ Your stories matter</span>
          <h1 className="h-title">Human stories<br/>& <span className="h-gradient">ideas</span></h1>
          <p className="h-subtitle">A place to read, write, and deepen your understanding. Share your perspective with a community that cares.</p>
          <div className="h-hero-btns">
            <Link to={user ? "/reader" : "/login"}><button className="h-start-btn">Start Reading</button></Link>
            <Link to={user ? "/blogger" : "/login"}><button className="h-write-btn">Start Writing</button></Link>
          </div>
          <div className="h-hero-stats">
            <div className="h-hero-stat"><strong>10K+</strong><span>Active Readers</span></div>
            <div className="h-stat-divider"></div>
            <div className="h-hero-stat"><strong>5K+</strong><span>Blog Posts</span></div>
            <div className="h-stat-divider"></div>
            <div className="h-hero-stat"><strong>2K+</strong><span>Writers</span></div>
          </div>
        </div>
      </div>

      <div className="h-features">
        <div className="h-feature-card">
          <div className="h-feature-icon">📖</div>
          <h3>Read & Discover</h3>
          <p>Explore blogs across categories like Technology, Lifestyle, Travel, and more.</p>
        </div>
        <div className="h-feature-card">
          <div className="h-feature-icon">✍️</div>
          <h3>Write & Publish</h3>
          <p>Create beautiful blog posts with images, categories, and reach a wider audience.</p>
        </div>
        <div className="h-feature-card">
          <div className="h-feature-icon">💬</div>
          <h3>Engage & Connect</h3>
          <p>Like, comment, bookmark, and interact with posts from writers around the world.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;