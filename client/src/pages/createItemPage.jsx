// client/src/pages/createItemPage.jsx

/**
 * This page allows the user to create a new item.
 * A form captures item name, description, and quantity,
 * then sends a POST request to the server's /api/items endpoint.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerMessage from '../components/BannerMessage';
import { getApiBaseUrl } from '../utils/config';
import "../App.css"; // Import the CSS file


export default function CreateItemPage() {
  // State variables for the form inputs
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const navigate = useNavigate();

  // Handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Construct the payload
    const newItem = { 
      itemName: itemName.trim(),  //Ensure itemName is not empty
      description: description || "", //Provide default blank value if empty
      quantity: quantity || 1 // Default to 1 if not provided
     };

    try {
      const apiBaseUrl = getApiBaseUrl();
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiBaseUrl}/api/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token in the Authorization header
        },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();

      if (response.ok) {
        // If the item was created successfully,
        // navigate to the inventory page.
        setMessage("Item created successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/inventory"), 2000); // Redirect after 2 seconds
      } else {
        // If the response is not OK, show an error.
        setMessage(`Failed to create item: ${data.message}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error creating item:', error);
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
      <h1>Create Item</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="itemName">Item Name:</label>
          <input
            className="input"
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="description">Description:</label>
          <textarea
            name="description"
            className="textarea"
            id="description"
            value={description}
            maxLength={255}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label className="label" htmlFor="quantity">Quantity:</label>
          <input
            className="input"
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <button className="button" type="submit">Create Item</button>
      </form>
    </div>
  );
}

