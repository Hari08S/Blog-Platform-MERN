import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./profile.css";

export default function Profile({ user, onUserUpdate }) {
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setGender(user.gender || "Not specified");
      setBio(user.bio || "");
      setProfileImage(user.profileImage || null);
    } else { navigate("/login"); }
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      const fd = new FormData();
      fd.append("email", user.email);
      fd.append("gender", gender);
      fd.append("bio", bio);
      if (selectedImage) fd.append("profileImage", selectedImage);
      const res = await axios.post("https://blog-platform-erux.onrender.com/update-user", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        alert("Profile updated!");
        setEditMode(false);
        onUserUpdate(res.data.user);
      } else { alert("Failed: " + res.data.message); }
    } catch (err) { alert("Failed to update."); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  if (!user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Recently";

  return (
    <div className="p-page">
      <Navbar user={user} showBack={true} backTo="/choose-role" onLogout={handleLogout} />

      <div className="p-container">
        <div className="p-card">
          <div className="p-img-wrap">
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className="p-avatar" />
            ) : (
              <div className="p-avatar-empty">{user.username?.[0]?.toUpperCase() || "?"}</div>
            )}
          </div>

          {editMode && (
            <div className="p-upload-section">
              <input type="file" accept="image/*" id="fileUpload" onChange={handleImageUpload} hidden />
              <label htmlFor="fileUpload" className="p-upload-btn">📸 Choose Photo</label>
              {selectedImage && <span className="p-file-name">Photo selected</span>}
            </div>
          )}

          <h2 className="p-username">{user.username}</h2>
          <p className="p-email">{user.email}</p>

          <div className="p-info-grid">
            <div className="p-info-item">
              <span className="p-info-label">Joined</span>
              <span className="p-info-value">{formattedDate}</span>
            </div>
            <div className="p-info-item">
              <span className="p-info-label">Gender</span>
              {editMode ? (
                <div className="p-radio-group">
                  <label className="p-radio"><input type="radio" value="Male" checked={gender === "Male"} onChange={() => setGender("Male")} /> Male</label>
                  <label className="p-radio"><input type="radio" value="Female" checked={gender === "Female"} onChange={() => setGender("Female")} /> Female</label>
                </div>
              ) : (
                <span className="p-info-value">{gender}</span>
              )}
            </div>
            <div className="p-info-item full-width">
              <span className="p-info-label">Bio</span>
              {editMode ? (
                <textarea className="p-bio-input" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} />
              ) : (
                <span className="p-info-value">{bio || "No bio yet"}</span>
              )}
            </div>
          </div>

          <div className="p-btn-group">
            {editMode ? (
              <>
                <button className="p-save-btn" onClick={handleSave}>Save Changes</button>
                <button className="p-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="p-edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}