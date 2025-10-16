// client/src/components/Auth.jsx
import React from "react";
import { USERS } from "../utils/constants";

const Auth = ({ onLogin }) => {
  const selectUser = (username) => {
    // On fige la liste des users dans le localStorage
    localStorage.setItem("users", JSON.stringify(USERS));
    // On stocke l'utilisateur connecté
    localStorage.setItem("currentUser", username);
    onLogin(username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          💰 Suivi des dépenses
        </h1>
        <p className="text-center text-gray-600 mb-8">Coucou, c'est qui ?</p>

        <div className="grid gap-4">
          <button
            onClick={() => selectUser("Claire")}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Je suis Claire
          </button>
          <button
            onClick={() => selectUser("Stéphane")}
            className="w-full bg-gradient-to-r from-red-500 to-amber-600 text-white py-4 rounded-xl font-bold hover:from-red-600 hover:to-amber-700 transition-all shadow-lg"
          >
            Je suis Stéphane
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
