// client/src/pages/registerPage.jsx
import React, { useState } from 'react';
import BannerMessage from '../components/BannerMessage';
import "../App.css"; // Import the CSS file
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordValid, setPasswordValid] = useState({
    minlength: false,
    maxlength: false,
    uppercase: false,
    numbers: false,
    symbols: false,
    match: false,
  });

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const navigate = useNavigate();

  // Validate password requirements dynamically
  const validatePassword = (password, confirmPassword) => {
    const requirements = {
      minlength: password.length >= 12,
      maxlength: password.length <= 128,
      uppercase: /[A-Z]/.test(password) && password.match(/[A-Z]/g)?.length >= 2,
      numbers: /\d/.test(password) && password.match(/\d/g)?.length >= 2,
      symbols:
        /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
        password.match(/[!@#$%^&*(),.?":{}|<>]/g)?.length >= 2,
      match: password === confirmPassword,
    };
    setPasswordValid(requirements);
  };

  const validateField = (name, value) => {
    let error = null;
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      error = emailRegex.test(value) ? null : "Invalid email address.";
    }
    if (name === "firstName" || name === "lastName") {
      error = value.trim() ? null : "This field is required.";
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      validatePassword(
        name === "password" ? value : formData.password,
        name === "confirmPassword" ? value : formData.confirmPassword
      );
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);

    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
      }
    });

    if (!Object.values(passwordValid).every((req) => req)) {
      setMessage("Please ensure all password requirements are met.");
      setMessageType("error");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Registration successful! Redirecting to login...");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 409) {
        setMessage("This email is already in use. Please use a different one.");
        setMessageType("error");
      } else {
        setMessage("An unexpected error occurred.");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Failed to register. Please try again later.");
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
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          className={`input ${fieldErrors.firstName ? "error" : ""}`}
          type="text"
          placeholder="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
        />
        {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
        <input
          className={`input ${fieldErrors.lastName ? "error" : ""}`}
          type="text"
          placeholder="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
        />
        {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
        <input
          className={`input ${fieldErrors.email ? "error" : ""}`}
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
        />
        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        <input
          className="input"
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
        <div className="password-requirements">
          <p>Password must meet the following requirements:</p>
          <ul>
            <li
              className={
                passwordValid.minlength && passwordValid.maxlength
                  ? "valid"
                  : "invalid"
              }
            >
              At least 12 characters, but no more than 128
            </li>
            <li className={passwordValid.uppercase ? "valid" : "invalid"}>
              At least 2 uppercase letters
            </li>
            <li className={passwordValid.numbers ? "valid" : "invalid"}>
              At least 2 numbers
            </li>
            <li className={passwordValid.symbols ? "valid" : "invalid"}>
              At least 2 symbols
            </li>
            <li className={passwordValid.match ? "valid" : "invalid"}>
              Passwords match
            </li>
          </ul>
        </div>
        <button type="submit" disabled={!Object.values(passwordValid).every((req) => req)}>
          Register
        </button>
      </form>
    </div>
  );
}
