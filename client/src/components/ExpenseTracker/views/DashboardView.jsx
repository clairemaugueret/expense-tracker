// client/src/components/ExpenseTracker/views/DashboardView.jsx
import React from "react";
import CategoryPieChart from "../charts/CategoryPieChart";

const DashboardView = ({ balance, personalDebtsBalance, categoryData }) => {
  return (
    <div className="space-y-6">
      {/* Section Balance Pot Commun */}
      <div className="bg-gradient-to-r from-zinc-500 to-slate-600 rounded-2xl p-6 shadow-lg text-white">
        <h3 className="text-xl font-bold mb-4">📋 Dépenses - pot commun</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Total {balance.user1}
            </h3>
            <p className="text-3xl font-bold text-slate-600">
              {balance.person1Total.toFixed(2)} €
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Total {balance.user2}
            </h3>
            <p className="text-3xl font-bold text-slate-600">
              {balance.person2Total.toFixed(2)} €
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Total du mois
            </h3>
            <p className="text-3xl font-bold text-slate-600">
              {balance.totalExpenses.toFixed(2)} €
            </p>
          </div>
        </div>
      </div>

      {/* Section Avances personnelles */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 shadow-lg text-white">
        <h3 className="text-xl font-bold mb-4 text-white">
          💳 Avances personnelles
        </h3>
        {personalDebtsBalance.person1Owes === 0 &&
        personalDebtsBalance.person2Owes === 0 ? (
          <p className="text-center text-green-600 font-bold text-xl py-6">
            🎉 Aucune avance en cours !
          </p>
        ) : (
          <div className="space-y-4">
            {personalDebtsBalance.person1Owes > 0 && (
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-gray-700">
                  <span className="font-bold">{balance.user1}</span> doit{" "}
                  <span className="font-bold text-xl text-orange-600">
                    {personalDebtsBalance.person1Owes.toFixed(2)} €
                  </span>
                </p>
              </div>
            )}
            {personalDebtsBalance.person2Owes > 0 && (
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-gray-700">
                  <span className="font-bold">{balance.user2}</span> doit{" "}
                  <span className="font-bold text-xl text-orange-600">
                    {personalDebtsBalance.person2Owes.toFixed(2)} €
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Balance */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
        <h3 className="text-xl font-bold mb-4 text-white">
          💰 Balance du mois
        </h3>
        {balance.owedAmount === 0 ? (
          <p className="text-center text-green-600 font-bold text-xl py-6">
            ✅ Tout est équilibré !
          </p>
        ) : (
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <p className="text-lg text-gray-700">
              <span className="font-bold">{balance.owedBy}</span> doit{" "}
              <span className="font-bold text-2xl text-green-600">
                {balance.owedAmount.toFixed(2)} €
              </span>{" "}
              à <span className="font-bold">{balance.owedTo}</span>
            </p>
          </div>
        )}
      </div>

      {/* Graphique par catégorie */}
      <CategoryPieChart data={categoryData} />
    </div>
  );
};

export default DashboardView;
