import React from "react";
import "./Footer.css";

import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="app-footer">
      <div className="footer-top">
        <div className="footer-brand-section">
          <img src="/blogLogo.png" alt="Fusion Diaries" className="footer-logo" />
          <p className="footer-tagline">A platform to read, write, and share your stories with the world.</p>
        </div>
        <div className="footer-links-section">
          <div className="footer-col">
            <h4>Platform</h4>
            <span onClick={() => navigate("/reader")}>Read Blogs</span>
            <span onClick={() => navigate("/blogger")}>Write Blogs</span>
            <span onClick={() => navigate("/reader")}>Categories</span>
            <span onClick={() => navigate("/reader")}>Trending</span>
          </div>
          <div className="footer-col">
            <h4>Features</h4>
            <span onClick={() => navigate("/reader")}>Like & Comment</span>
            <span onClick={() => navigate("/reader")}>Bookmark Posts</span>
            <span onClick={() => navigate("/choose-role")}>View Analytics</span>
            <span onClick={() => navigate("/profile")}>User Profiles</span>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <span onClick={() => navigate("/")}>About Us</span>
            <span onClick={() => alert("Help Center coming soon!")}>Help Center</span>
            <span onClick={() => alert("Privacy Policy coming soon!")}>Privacy Policy</span>
            <span onClick={() => alert("Terms of Service coming soon!")}>Terms of Service</span>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <span onClick={() => window.open("https://twitter.com", "_blank")}>Twitter / X</span>
            <span onClick={() => window.open("https://linkedin.com", "_blank")}>LinkedIn</span>
            <span onClick={() => window.open("https://github.com", "_blank")}>GitHub</span>
            <span onClick={() => alert("Contact us at support@fusiondiaries.com")}>Contact Us</span>
          </div>
        </div>
      </div>
      <div className="footer-divider"></div>
      <div className="footer-bottom">
        <p className="footer-copy">&copy; {new Date().getFullYear()} Fusion Diaries. All rights reserved.</p>
        <p className="footer-tech">Built with React • Node.js • MongoDB • Express</p>
      </div>
    </footer>
  );
}
