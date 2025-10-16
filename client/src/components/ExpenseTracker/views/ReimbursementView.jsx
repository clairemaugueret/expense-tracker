// client/src/components/ExpenseTracker/views/ReimbursementView.jsx
import React from "react";
import { getTodayISO } from "../../../utils/dateUtils";

const ReimbursementView = ({ users, reimbursements, onSubmit }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const reimbursementData = {
      from: formData.get("from"),
      to: formData.get("to"),
      amount: parseFloat(formData.get("amount")),
      date: formData.get("date"),
    };

    const result = await onSubmit(reimbursementData);
    if (result.success) {
      alert("Remboursement enregistré !");
      e.target.reset();
    } else {
      alert(result.error || "Erreur lors du remboursement");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        💸 Remboursement
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              De
            </label>
            <select
              name="from"
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
              À
            </label>
            <select
              name="to"
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
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Montant
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              defaultValue={getTodayISO()}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
        >
          Enregistrer le remboursement
        </button>
      </form>

      <h3 className="text-xl font-bold mb-4 text-gray-800">
        📜 Historique des remboursements
      </h3>
      <div className="space-y-3">
        {reimbursements.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Aucun remboursement</p>
        ) : (
          reimbursements
            .slice()
            .reverse()
            .map((reimb) => (
              <div
                key={reimb._id}
                className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">
                      {reimb.from} → {reimb.to}
                    </p>
                    <p className="text-xs text-gray-500">
                      Le {new Date(reimb.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {reimb.amount.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ReimbursementView;
