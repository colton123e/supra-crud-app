// client/src/pages/loginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerMessage from '../components/BannerMessage';
import "../App.css"; // Import the CSS file
import { UserContext } from "../context/UserContext";

export default function LoginPage() {
  const [email,  setemail]  = useState('');
  const [password,  setPassword]  = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Call the API endpoint /api/auth/login
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage or a cookie
        setMessage("Login successful!");
        setMessageType("success");
        localStorage.setItem("authToken", data.token);
        setUser({
          id: data.user.id,
          firstName: data.user.firstName,
          email: data.user.email,
        }); // Set the user context
        setTimeout(() => navigate("/inventory"), 2000); // Redirect after 2 seconds
      } else {
        setMessage("Username or password is incorrect. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("An unexpected error occurred.");
      setMessageType("error");
    }
  };

  return (
    <div className="form">
      <BannerMessage
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
      />
      <h1>Login</h1>
      <input 
        className='input'
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={e => setemail(e.target.value)}
      />
      <input 
        className='input'
        type="password"
        placeholder="Password" 
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
