// client/src/components/Auth.jsx
import React, { useState } from "react";

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      // Stocker le token et les infos utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          💰 ExpenseShare
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isLogin ? "Connexion" : "Créer un compte"}
        </p>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Personne 1"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            {loading
              ? "Chargement..."
              : isLogin
              ? "Se connecter"
              : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isLogin ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
