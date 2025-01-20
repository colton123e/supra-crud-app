// client/src/components/Navbar.jsx

/**
 * A simple navigation bar for the app.
 */

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import '../App.css'

export default function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear the token
    setUser(null); // Clear the user context
    navigate("/login"); // Redirect to login page
    window.location.reload(); // Refresh to reset user state
  };

  return (
    <nav className="navbar">
    {/* Logo Section */}
    <div className="navbar-logo">
      <Link to="/" className="link">
        Inventory Pro
      </Link>
    </div>

    {/* Navigation Menu */}
    <ul className="navbar-menu">
      <li className="navItem">
        <Link to="/home" className="link">
          Home
        </Link>
      </li>
      <li className="navItem">
        <Link to="/inventory" className="link">
          Inventory
        </Link>
      </li>
      {user ? (
        <>
          <li className="navItem">
            <Link to="/items/create" className="link">
              Create Item
            </Link>
          </li>
          <li className="greeting">Hello, {user.firstName}!</li>
          <li className="navItem">
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="navItem">
            <Link to="/login" className="link">
              Login
            </Link>
          </li>
          <li className="navItem">
            <Link to="/register" className="link">
              Register
            </Link>
          </li>
        </>
      )}
    </ul>
  </nav>
  );
}