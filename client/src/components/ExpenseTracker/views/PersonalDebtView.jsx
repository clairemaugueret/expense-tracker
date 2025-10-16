// client/src/components/ExpenseTracker/views/PersonalDebtView.jsx
import React from "react";
import { filterPersonalDebtsForDisplay } from "../../../utils/calculations";

const PersonalDebtView = ({
  users,
  personalDebts,
  selectedMonth,
  selectedYear,
  onSubmit,
  onMarkPaid,
}) => {
  const unpaidDebts = filterPersonalDebtsForDisplay(
    personalDebts,
    selectedMonth,
    selectedYear,
    false
  );
  const paidDebts = filterPersonalDebtsForDisplay(
    personalDebts,
    selectedMonth,
    selectedYear,
    true
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const paidBy = e.target.paidBy.value;
    const owedBy = e.target.owedBy.value;
    const description = e.target.description.value;
    const date = e.target.date.value;

    if (!amount || !paidBy || !owedBy || !description) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (paidBy === owedBy) {
      alert("Le payeur et le débiteur doivent être différents");
      return;
    }

    await onSubmit({ amount, paidBy, owedBy, description, date });
    e.target.reset();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        💳 Avance personnelle{" "}
        <span className="text-base font-semibold italic">
          (hors pot commun)
        </span>
      </h2>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Montant (€)
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
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
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Qui a avancé ?
            </label>
            <select
              name="paidBy"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            >
              <option value="">Sélectionner</option>
              {users.map((userName, idx) => (
                <option key={idx} value={userName}>
                  {userName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Qui doit ?
            </label>
            <select
              name="owedBy"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            >
              <option value="">Sélectionner</option>
              {users.map((userName, idx) => (
                <option key={idx} value={userName}>
                  {userName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            placeholder="Ex: Courses, Restaurant..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-700 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition"
        >
          💾 Enregistrer l'avance
        </button>
      </form>

      {/* Section des avances non remboursées */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">⏳ À rembourser</h3>
      <div className="space-y-3">
        {unpaidDebts.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Aucune avance</p>
        ) : (
          unpaidDebts
            .slice()
            .reverse()
            .map((debt) => {
              const debtDate = new Date(debt.date);
              const currentMonthStart = new Date(
                selectedYear,
                selectedMonth,
                1
              );
              const isPreviousMonth = debtDate < currentMonthStart;

              return (
                <div
                  key={debt._id}
                  className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {debt.description}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        📅 {debtDate.toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {debt.paidBy} → {debt.owedBy}
                      </p>
                      {isPreviousMonth && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          📚 Mois précédent
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {debt.amount.toFixed(2)} €
                      </p>
                      <button
                        onClick={() => onMarkPaid(debt._id)}
                        className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-600 transition"
                      >
                        ✓ Payé ?
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Section des avances remboursées (uniquement du mois actuel) */}
      <h3 className="text-xl font-bold mb-4 mt-8 text-gray-800">
        ✅ Remboursées ce mois
      </h3>
      <div className="space-y-3">
        {paidDebts.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Aucune</p>
        ) : (
          paidDebts
            .slice()
            .reverse()
            .map((debt) => (
              <div
                key={debt._id}
                className="p-4 bg-green-50 rounded-xl border-2 border-green-200 opacity-60"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      {debt.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 {new Date(debt.date).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {debt.paidBy} → {debt.owedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {debt.amount.toFixed(2)} €
                    </p>
                    {debt.paidAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        ✓ {new Date(debt.paidAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default PersonalDebtView;
