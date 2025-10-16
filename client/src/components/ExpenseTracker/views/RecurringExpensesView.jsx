// client/src/components/ExpenseTracker/views/RecurringExpensesView.jsx
import React, { useState } from "react";

const RecurringExpensesView = ({ recurringExpenses, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      amount: expense.amount,
      paidBy: expense.paidBy,
      description: expense.description,
      paymentMethod: expense.paymentMethod || "",
      bankAccount: expense.bankAccount || "",
      category: expense.category,
      recurrence: expense.recurrence,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    const result = await onUpdate(editingId, editForm);
    if (result.success) {
      alert("Dépense récurrente modifiée !");
      setEditingId(null);
      setEditForm({});
    } else {
      alert(result.error || "Erreur lors de la modification");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette dépense récurrente ?"
      )
    ) {
      const result = await onDelete(id);
      if (result.success) {
        alert("Dépense récurrente supprimée !");
      } else {
        alert(result.error || "Erreur lors de la suppression");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔄 Dépenses récurrentes
      </h2>
      <div className="space-y-4">
        {recurringExpenses.map((exp) =>
          editingId === exp._id ? (
            // Mode édition
            <div
              key={exp._id}
              className="p-4 bg-blue-50 rounded-xl border-2 border-blue-300"
            >
              <div className="space-y-3">
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Description"
                />
                <input
                  type="number"
                  name="amount"
                  value={editForm.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Montant"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    ✓ Enregistrer
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    ✕ Annuler
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Mode affichage
            <div
              key={exp._id}
              className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{exp.description}</p>
                  <p className="text-sm text-gray-600">
                    {exp.amount.toFixed(2)} € • {exp.paidBy} • {exp.recurrence}
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-semibold">
                  {exp.category}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-blue-500 hover:text-blue-700 text-xl"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        )}
        {recurringExpenses.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Aucune dépense récurrente
          </p>
        )}
      </div>
    </div>
  );
};

export default RecurringExpensesView;
