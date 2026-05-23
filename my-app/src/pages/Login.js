import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { ArrowBack } from "@mui/icons-material";
import "./Login.css";
import axios from "axios";

export default function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!email || !password || (isRegister && !username)) {
      alert("Please fill all the fields."); return false;
    }
    if (isRegister && /[^a-zA-Z0-9]/.test(username)) {
      alert("Usernames should only contain letters and numbers."); return false;
    }
    if (!email.includes("@")) {
      alert("Enter a valid email address."); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    try {
      const url = isRegister ? "https://blog-platform-erux.onrender.com/register" : "https://blog-platform-erux.onrender.com/login";
      const data = isRegister ? { username, email, password } : { email, password };
      const result = await axios.post(url, data);
      if (result.data.success) {
        alert(result.data.message);
        if (isRegister) { setIsRegister(false); }
        else { onLogin(result.data.user); navigate("/choose-role"); }
      } else { alert(result.data.message); }
    } catch (err) { alert("Something went wrong. Please try again."); }
  };

  return (
    <div className="l-page">
      <div className="l-container">
        <div className="l-glow g1"></div>
        <div className="l-glow g2"></div>
        <div className="l-card">
          <button className="l-back-btn" onClick={() => navigate("/")}><ArrowBack /></button>
          <img src="/blogLogo.png" alt="Fusion Diaries" className="l-logo-img" />
          <div className="l-brand">Fusion Diaries</div>
          <h2 className="l-heading">{isRegister ? "Create Account" : "Welcome Back"}</h2>
          <p className="l-sub">{isRegister ? "Join our blogging community" : "Sign in to continue"}</p>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <input type="text" placeholder="Username" className="l-input" value={username} onChange={(e) => setUsername(e.target.value)} />
            )}
            <input type="email" placeholder="Email" className="l-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="l-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="l-btn">{isRegister ? "CREATE ACCOUNT" : "SIGN IN"}</button>
          </form>
          <p className="l-toggle" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}