// client/src/App.jsx

/**
 * Main component that holds routes and top-level navigation.
 * This uses React Router (v6).
 */

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/registerPage';
import LoginPage from './pages/loginPage';
import InventoryPage from './pages/inventoryPage';
import ItemDetailPage from './pages/itemDetailPage';
import CreateItemPage from './pages/createItemPage';
import HomePage from "./pages/homePage";
import Navbar from './components/Navbar';
import { UserProvider } from "./context/UserContext";
import './App.css'

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data); // Save user data (e.g., { id, firstName, email })
        } else {
          console.error("Failed to fetch user details.");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <UserProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/items/create" element={<CreateItemPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}