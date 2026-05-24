import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ChooseRole from "./pages/ChooseRole";
import Profile from "./pages/profile";
import Reader from "./pages/Reader";
import Blogger from "./pages/Blogger";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <Routes>
      <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
      <Route path="/login" element={user ? <Navigate to="/choose-role" /> : <Login onLogin={handleLogin} />} />
      <Route
        path="/choose-role"
        element={user ? <ChooseRole user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route path="/reader" element={user ? <Reader user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/blogger" element={user ? <Blogger user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route
        path="/profile"
        element={user ? <Profile user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to={user ? "/choose-role" : "/login"} />} />
    </Routes>
  );
}

export default App;