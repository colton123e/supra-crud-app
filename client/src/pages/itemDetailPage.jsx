// client/src/pages/itemDetailPage.jsx

/**
 * Displays full information for a single item.
 * Allows editing or deleting the item.
 */

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from "../context/UserContext";
import { getApiBaseUrl } from '../utils/config';
import BannerMessage from '../components/BannerMessage';
import DeleteConfirmation from '../components/DeleteConfirmation';
import "../App.css"; // Import the CSS file

export default function ItemDetailPage() {
  const { id } = useParams();            // Get "id" from the URL path (e.g., /items/:id)
  const [item, setItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState({ itemName: "", description: "", quantity: 0 });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Fetch item details on mount or whenever "id" changes
  useEffect(() => {
    // Fetch item details
    const fetchItem = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/items/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        setItem(data);
        setEditedItem({ itemName: data.itemName, description: data.description, quantity: data.quantity });
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchItem();
  }, [id]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({ ...editedItem, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(editedItem),
      });
  
      let data;
      try {
        data = await response.json(); // Attempt to parse JSON response
      } catch (parseError) {
        data = {}; // Default to an empty object if parsing fails
      }
  
      if (response.ok) {
        // Success case
        setItem(data.item); // Update the item state with the updated item
        setEditMode(false); // Exit edit mode
  
        setMessage("Item updated successfully!");
        setMessageType("success");
      } else if (response.status === 403) {
        // Unauthorized case
        setMessage("You do not have permission to edit this item.");
        setMessageType("error");
        setEditMode(false); // Exit edit mode
      } else {
        // General failure case
        setMessage(data.message || "Failed to update item.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An unexpected error occurred while updating the item.");
      setMessageType("error");
    }
  };

  const cancelEdit = () => {
    setEditedItem({ itemName: item.itemName, description: item.description, quantity: item.quantity });
    setEditMode(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true); // Show confirmation modal
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false); // Hide confirmation modal
  };

  // Handle delete action
  const confirmDelete = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
  
      let data;
      try {
        data = await response.json(); // Attempt to parse JSON response
      } catch (parseError) {
        data = {}; // Default to an empty object if parsing fails
      }
  
      if (response.ok) {
        // Success case
        setMessage("Item deleted successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/inventory"), 1000); // Redirect after 1 second
      } else if (response.status === 403) {
        // Unauthorized case
        setShowDeleteConfirmation(false);
        setMessage("You do not have permission to delete this item.");
        setMessageType("error");
      } else {
        // General failure case
        setMessage(data.message || "Failed to delete item.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setMessage("An unexpected error occurred while deleting the item.");
      setMessageType("error");
    }
  };

  // Render loading state if item hasn't been fetched yet
  if (!item) {
    return <div className="container">Loading item details...</div>;
  }

  return (
    <div className="container">
      <BannerMessage
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
      />
      <h1 className="heading">Item Details</h1>
      <div>
      <label className="itemName">Item Name:</label>
        {editMode ? (
          <input
            type="text"
            name="itemName"
            className="input"
            value={editedItem.itemName}
            onChange={handleInputChange}
            required
          />
        ) : (
          <p>{item.itemName}</p>
        )}
      </div>
      <div>
        <label className="descriptionLabel">Description:</label>
        {editMode ? (
          <textarea
            name="description"
            id="description"
            className="textarea"
            value={editedItem.description}
            maxLength={255}
            onChange={handleInputChange}
          />
        ) : (
          <p className='description'>{item.description}</p>
        )}
      </div>
      <div>
        <label className="quantityLabelDetail">Quantity:</label>
        {editMode ? (
          <input
            type="number"
            name="quantity"
            id="quantity"
            className="input"
            value={editedItem.quantity}
            onChange={handleInputChange}
            required
          />
        ) : (
          <p>{item.quantity}</p>
        )}
      </div>

      {user && (
      <div className="actions">
        {editMode ? (
          // Edit Mode Buttons
          <>
            <button className="button" onClick={handleSubmit}>
              Save Changes
            </button>
            <button className="button cancel" onClick={cancelEdit}>
              Cancel
            </button>
          </>
        ) : (
          // Default Buttons
          <>
            <button className="button" onClick={handleEditToggle}>
              Edit Item
            </button>
            <button className="deleteButton" onClick={handleDelete}>
              Delete Item
            </button>
          </>
        )}
        {/* Delete Confirmation */}
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this item?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    )}
    </div>
  );
}
