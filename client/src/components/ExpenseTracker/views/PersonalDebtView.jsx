// client/src/components/ExpenseTracker/views/PersonalDebtView.jsx
import React from "react";
import { getTodayISO } from "../../../utils/dateUtils";

const PersonalDebtView = ({ users, personalDebts, onSubmit, onMarkPaid }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const debtData = {
      amount: parseFloat(formData.get("amount")),
      date: formData.get("date"),
      paidBy: formData.get("paidBy"),
      owedBy: formData.get("owedBy"),
      description: formData.get("description"),
    };

    const result = await onSubmit(debtData);
    if (result.success) {
      alert("Avance enregistrée !");
      e.target.reset();
    } else {
      alert(result.error || "Erreur lors de l'enregistrement");
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm("Marquer cette avance comme payée ?")) {
      const result = await onMarkPaid(id);
      if (result.success) {
        alert("Avance marquée comme payée !");
      } else {
        alert(result.error || "Erreur");
      }
    }
  };

  const unpaidDebts = personalDebts.filter((debt) => !debt.isPaid);
  const paidDebts = personalDebts.filter((debt) => debt.isPaid);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        💳 Avance personnelle{" "}
        <span className="text-base font-semibold italic">
          (hors pot commun)
        </span>
      </h2>

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
              defaultValue={getTodayISO()}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Qui a avancé?
            </label>
            <select
              name="paidBy"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
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
              Qui doit?
            </label>
            <select
              name="owedBy"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            placeholder="Ex: Réparation vélo"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
        >
          Enregistrer
        </button>
      </form>

      <h3 className="text-xl font-bold mb-4 text-gray-800">💰 En cours</h3>
      <div className="space-y-3">
        {unpaidDebts.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Aucune avance en cours
          </p>
        ) : (
          unpaidDebts.map((debt) => (
            <div
              key={debt._id}
              className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{debt.description}</p>
                  <p className="text-sm text-gray-600">
                    {debt.paidBy} → {debt.owedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    Le {new Date(debt.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-orange-600">
                    {debt.amount.toFixed(2)} €
                  </p>
                  <button
                    onClick={() => handleMarkPaid(debt._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    ✓ Payé
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <h3 className="text-xl font-bold mb-4 mt-8 text-gray-800">
        ✅ Historique
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
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 line-through">
                      {debt.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {debt.paidBy} → {debt.owedBy}
                    </p>
                    <p className="text-xs text-gray-500">
                      Le {new Date(debt.paidAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {debt.amount.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default PersonalDebtView;
