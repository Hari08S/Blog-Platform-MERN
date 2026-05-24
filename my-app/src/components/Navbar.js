import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { ArrowBack, NotificationsNone, ChatBubbleOutline } from "@mui/icons-material";
import axios from "axios";
import "./Navbar.css";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Navbar({ user, showBack, backTo, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`https://blog-platform-erux.onrender.com/notifications?email=${user.email}`);
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenNotifications = async () => {
    setNotifOpen(!notifOpen);
    setDropdownOpen(false);
    if (!notifOpen && unreadCount > 0) {
      try {
        await axios.post("https://blog-platform-erux.onrender.com/mark-notifications-read", { email: user.email });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) { /* silent */ }
    }
  };

  return (
    <header className="app-navbar">
      <div className="nav-left">
        {showBack && (
          <button className="nav-back-btn" onClick={() => navigate(backTo || "/choose-role")}>
            <ArrowBack style={{ fontSize: 20 }} />
          </button>
        )}
        <div className="nav-brand" onClick={() => navigate(user ? "/choose-role" : "/")}>
          <img src="/blogLogo.png" alt="Fusion Diaries" className="nav-logo" />
          <span className="nav-title">Fusion Diaries</span>
        </div>
      </div>
      <div className="nav-right">
        {user && <span className="nav-welcome">Hi, <strong>{user.username}</strong></span>}
        {user && (
          <div className="nav-notif-wrap" onClick={handleOpenNotifications}>
            <NotificationsNone style={{ fontSize: 26, color: "rgba(255,255,255,0.8)", cursor: "pointer" }} />
            {unreadCount > 0 && <span className="nav-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            {notifOpen && (
              <div className="nav-notif-dropdown" onClick={e => e.stopPropagation()}>
                <div className="nav-notif-header">
                  <span>Notifications</span>
                  {notifications.length > 0 && <span className="nav-notif-count">{notifications.length}</span>}
                </div>
                <div className="nav-notif-list">
                  {notifications.length > 0 ? notifications.map((n, i) => (
                    <div key={i} className={`nav-notif-item ${!n.read ? "unread" : ""}`}>
                      <div className="nav-notif-icon">
                        <ChatBubbleOutline style={{ fontSize: 16 }} />
                      </div>
                      <div className="nav-notif-content">
                        <p><strong>{n.fromUser}</strong> commented on <strong>"{n.blogTitle}"</strong></p>
                        {n.commentText && <span className="nav-notif-preview">"{n.commentText}"</span>}
                        <span className="nav-notif-time">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="nav-notif-empty">No notifications yet</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {user && (
          <div className="nav-profile" onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}>
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.username} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
            ) : (
              <AccountCircleIcon style={{ fontSize: 34, color: "#fff" }} />
            )}
            {dropdownOpen && (
              <div className="nav-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="nav-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>My Profile</div>
                <div className="nav-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/choose-role"); }}>Dashboard</div>
                <div className="nav-dropdown-item nav-dropdown-logout" onClick={() => { setDropdownOpen(false); onLogout && onLogout(); }}>Log Out</div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
