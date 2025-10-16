// client/src/components/ExpenseTracker/views/ExpenseListView.jsx
import React from "react";
import { filterExpensesByMonth, exportToCSV } from "../../../utils/dateUtils";

const ExpenseListView = ({
  expenses,
  currentUser,
  selectedMonth,
  selectedYear,
  onDelete,
}) => {
  const userExpenses = filterExpensesByMonth(
    expenses,
    selectedMonth,
    selectedYear
  ).filter((exp) => exp.paidBy === currentUser);

  const handleExport = () => {
    exportToCSV(expenses, currentUser, selectedMonth, selectedYear);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      const result = await onDelete(id);
      if (result.success) {
        alert("Dépense supprimée avec succès !");
      } else {
        alert(result.error || "Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Mes dépenses</h2>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition"
        >
          📥 CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Description
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Catégorie
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Méthode
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Compte
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Montant
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userExpenses
              .slice()
              .reverse()
              .map((exp) => (
                <tr key={exp._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(exp.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {exp.description}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      {exp.category || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {exp.paymentMethod || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {exp.bankAccount || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold">
                    {exp.amount.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {userExpenses.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Aucune dépense pour ce mois
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseListView;
