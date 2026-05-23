import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MenuBook, Create, Favorite, ChatBubbleOutline, Visibility } from "@mui/icons-material";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ChooseRole.css";

function ChooseRole({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.email) {
      axios.get(`https://blog-platform-erux.onrender.com/dashboard-stats?email=${user.email}`)
        .then(res => { if (res.data.success) setStats(res.data.stats); })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); onLogout && onLogout(); };

  return (
    <div className="cr-container">
      <Navbar user={user} showBack={true} backTo="/" onLogout={handleLogout} />

      <div className="cr-content">
        <div className="cr-hero">
          <div className="cr-hero-glow"></div>
          <h1 className="cr-title">Welcome back, <span className="cr-name">{user?.username}</span></h1>
          <p className="cr-subtitle">What would you like to do today?</p>
        </div>

        {stats && (
          <div className="cr-stats-grid">
            <div className="cr-stat-card">
              <div className="cr-stat-icon" style={{background:"rgba(102,126,234,0.15)"}}><Create style={{color:"#667eea"}}/></div>
              <div className="cr-stat-value">{stats.totalBlogs}</div>
              <div className="cr-stat-label">Blogs Written</div>
            </div>
            <div className="cr-stat-card">
              <div className="cr-stat-icon" style={{background:"rgba(245,87,108,0.15)"}}><Favorite style={{color:"#f5576c"}}/></div>
              <div className="cr-stat-value">{stats.totalLikes}</div>
              <div className="cr-stat-label">Likes Received</div>
            </div>
            <div className="cr-stat-card">
              <div className="cr-stat-icon" style={{background:"rgba(67,206,162,0.15)"}}><ChatBubbleOutline style={{color:"#43cea2"}}/></div>
              <div className="cr-stat-value">{stats.totalComments}</div>
              <div className="cr-stat-label">Comments</div>
            </div>
            <div className="cr-stat-card">
              <div className="cr-stat-icon" style={{background:"rgba(255,167,38,0.15)"}}><Visibility style={{color:"#ffa726"}}/></div>
              <div className="cr-stat-value">{stats.totalViews}</div>
              <div className="cr-stat-label">Total Views</div>
            </div>
          </div>
        )}

        <div className="cr-roles">
          <div className="cr-role-card" onClick={() => navigate("/reader")}>
            <div className="cr-role-icon-wrap reader-icon"><MenuBook style={{fontSize:48}}/></div>
            <h2>Reader</h2>
            <p>Discover and explore blogs from the community. Like, comment, and save your favorites.</p>
            <span className="cr-role-action">Start Reading →</span>
          </div>
          <div className="cr-role-card" onClick={() => navigate("/blogger")}>
            <div className="cr-role-icon-wrap blogger-icon"><Create style={{fontSize:48}}/></div>
            <h2>Blogger</h2>
            <p>Write, edit and manage your blog posts. Share your ideas with the world.</p>
            <span className="cr-role-action">Start Writing →</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ChooseRole;