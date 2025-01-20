const fetch = require("node-fetch");

const generateItems = async () => {
  for (let i = 1; i <= 100; i++) {
    const itemData = {
      itemName: `Item ${i}`,
      description: `This is a description for item ${i} with random data: ${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      quantity: Math.floor(Math.random() * 100) + 1,
    };

    try {
      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJmaXJzdC5sYXN0QGVtYWlsLmNvbSIsImZpcnN0TmFtZSI6IkZpcnN0IiwiaWF0IjoxNzM3MzM3MjQ4LCJleHAiOjE3MzczNDA4NDh9.JB18_x4twN-DX68I7x4PJS5gT626LzAQFhVd-sT0lZM", // Replace with your token
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        console.log(`Item ${i} created successfully`);
      } else {
        console.error(`Failed to create item ${i}`);
      }
    } catch (err) {
      console.error("Error creating item:", err);
    }
  }
};

generateItems();
