// client/src/components/ExpenseTracker/views/AddExpenseView.jsx
import React, { useState } from "react";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  RECURRENCE_OPTIONS,
} from "../../../utils/constants";
import { getTodayISO } from "../../../utils/dateUtils";

const AddExpenseView = ({ users, currentUser, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: "",
    date: getTodayISO(),
    paidBy: "",
    description: "",
    paymentMethod: "",
    bankAccount: "",
    category: "",
    isRecurring: false,
    recurrence: "mensuelle",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.paidBy || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      addedBy: currentUser,
    };

    const result = await onSubmit(expenseData);
    if (result.success) {
      alert("Dépense ajoutée avec succès !");
      // Réinitialiser le formulaire
      setFormData({
        amount: "",
        date: getTodayISO(),
        paidBy: "",
        description: "",
        paymentMethod: "",
        bankAccount: "",
        category: "",
        isRecurring: false,
        recurrence: "mensuelle",
      });
    } else {
      alert(result.error || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ➕ Ajouter une dépense
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Montant (€) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payé par *
          </label>
          <select
            name="paidBy"
            value={formData.paidBy}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="">Sélectionner...</option>
            {users.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            placeholder="Ex: Courses"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Méthode
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(formData.paymentMethod === "CB" ||
          formData.paymentMethod === "Prélèvement" ||
          formData.paymentMethod === "Virement") && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Banque / Compte (optionnel)
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="Ex: Compte joint, Banque Populaire, etc."
            />
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleInputChange}
            className="w-5 h-5"
            id="isRecurring"
          />
          <label
            htmlFor="isRecurring"
            className="font-semibold text-gray-700 cursor-pointer"
          >
            Dépense récurrente
          </label>
        </div>

        {formData.isRecurring && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fréquence de récurrence
            </label>
            <select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
        >
          Ajouter la dépense
        </button>
      </form>
    </div>
  );
};

export default AddExpenseView;
