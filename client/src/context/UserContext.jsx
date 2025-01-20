// client/src/context/UserContext.jsx

/**
 * A simple context to handle the user information
 * to be used throughout the app.
 */

import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds the current user data

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
