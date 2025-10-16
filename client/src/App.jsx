// client/src/App.jsx
import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ExpenseTracker from "./components/ExpenseTracker";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUsers = localStorage.getItem("users");
    const savedCurrentUser = localStorage.getItem("currentUser");

    // Si jamais la liste n'existe pas, on l'initialise vide
    if (!savedUsers) {
      localStorage.setItem("users", JSON.stringify([]));
    }

    if (savedCurrentUser) setCurrentUser(savedCurrentUser);
    setLoading(false);
  }, []);

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    // On ne garde rien de l'auth locale
    localStorage.removeItem("currentUser");
    localStorage.removeItem("users");
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Chargement...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return <ExpenseTracker user={currentUser} onLogout={handleLogout} />;
}

export default App;
