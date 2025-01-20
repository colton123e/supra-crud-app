// client/src/components/DeleteConfirmation.jsx
import React from "react";

const DeleteConfirmation = ({ message, onConfirm, onCancel }) => {
  if (!message) return null;

  const styles = {
    banner: {
      padding: "1rem",
      color: "#fff",
      backgroundColor: "#dc3545", // Red for delete confirmation
      marginBottom: "1rem",
      textAlign: "center",
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    buttonContainer: {
      marginTop: "1rem",
    },
    button: {
      margin: "0 0.5rem",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "4px",
      fontSize: "1rem",
      cursor: "pointer",
    },
    confirmButton: {
      backgroundColor: "#28a745", // Green for Yes
      color: "#fff",
      marginTop: "1rem",
    },
    cancelButton: {
      backgroundColor: "#6c757d", // Grey for No
      color: "#fff",
      marginTop: "1rem",
    },
  };

  return (
    <div style={styles.banner}>
      {message}
      <br></br>
      <button onClick={onConfirm} style={{ ...styles.button, ...styles.confirmButton }}>
        Yes
      </button>
      <button onClick={onCancel} style={{ ...styles.button, ...styles.cancelButton }}>
        No
      </button>
    </div>
  );
};

export default DeleteConfirmation;
