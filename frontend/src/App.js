import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Notifications from "./pages/Notifications";
import Bills from "./pages/Bills";

function App() {
  const [notifications, setNotifications] = useState([]);

  // Function to add new notifications
  const addNotification = (message) => {
    setNotifications((prev) => [...prev, message]);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications notifications={notifications} />} />
        <Route path="/goals" element={<Goals addNotification={addNotification} />} />
        <Route path="/bills" element={<Bills />} />
      </Routes>
    </Router>
  );
}

export default App;
