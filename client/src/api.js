const API_URL = "http://localhost:5000";

export async function fetchItems() {
  const response = await fetch(`${API_URL}/api/items`);
  return response.json();
}

export async function createItem(name) {
  const response = await fetch(`${API_URL}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return response.json();
}
