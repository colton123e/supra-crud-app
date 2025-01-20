import React from "react";

const BannerMessage = ({ message, type, onClose }) => {
  if (!message) return null;

  const styles = {
    banner: {
      padding: "1rem",
      color: "#fff",
      backgroundColor: type === "success" ? "#28a745" : "#dc3545", // Green for success, red for error
      marginBottom: "1rem",
      textAlign: "center",
      position: "fixed",
      top: "var(--navbar-height)",
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    closeButton: {
      marginLeft: "1rem",
      color: "#fff",
      border: "none",
      background: "none",
      fontSize: "1rem",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.banner}>
      {message}
      <button onClick={onClose} style={styles.closeButton}>
        ✕
      </button>
    </div>
  );
};

export default BannerMessage;
