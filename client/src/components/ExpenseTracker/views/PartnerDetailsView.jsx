// client/src/components/ExpenseTracker/views/PartnerDetailsView.jsx
import React from "react";
import { filterExpensesByMonth } from "../../../utils/dateUtils";

const PartnerDetailsView = ({
  expenses,
  currentUser,
  selectedMonth,
  selectedYear,
}) => {
  const partnerExpenses = filterExpensesByMonth(
    expenses,
    selectedMonth,
    selectedYear
  ).filter((exp) => exp.paidBy !== currentUser);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔍 Dépenses du partenaire
      </h2>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {partnerExpenses
              .slice()
              .reverse()
              .map((exp) => (
                <tr key={exp._id} className="hover:bg-blue-50">
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
                </tr>
              ))}
          </tbody>
        </table>
        {partnerExpenses.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune dépense</p>
        )}
      </div>
    </div>
  );
};

export default PartnerDetailsView;
