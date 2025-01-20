import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import "../App.css"; // Import the CSS file
import { Link } from "react-router-dom";

export default function InventoryPage() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState(user ? "my-items" : "all-items"); // Default tab
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const endpoint =
        activeTab === "my-items"
          ? "http://localhost:5000/api/items/mine"
          : "http://localhost:5000/api/items";
      try {
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, [activeTab]);

  return (
    <div className="form">
      <h1 className="heading">Inventory</h1>
      <div className="tabs">
        <button
          className={`tabButton ${activeTab === "all-items" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("all-items")}
        >
          All Items
        </button>
        {user && (
          <button
            className={`tabButton ${activeTab === "my-items" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("my-items")}
          >
            My Items
          </button>
        )}
      </div>
      <div className="items-list">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="item-card">
              <h2 className="itemName">{item.itemName}</h2>
              <p className="description">
                {item.description.length > 100
                  ? `${item.description.slice(0, 100)}...`
                  : item.description}
              </p>
              <p className="itemQuantity">
                <span className="quantityLabel">Quantity:</span> {item.quantity}
              </p>
              <Link to={`/items/${item.id}`} className="viewDetailsButton">
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="noItems">No items found.</p>
        )}
      </div>
    </div>
  );
}
