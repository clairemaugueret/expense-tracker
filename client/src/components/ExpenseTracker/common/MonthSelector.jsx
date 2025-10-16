// client/src/components/ExpenseTracker/common/MonthSelector.jsx
import React from "react";
import { MONTH_NAMES } from "../../../utils/constants";
import { isCurrentMonth } from "../../../utils/dateUtils";

const MonthSelector = ({
  selectedMonth,
  selectedYear,
  onPrevious,
  onNext,
  onCurrent,
}) => {
  const isCurrent = isCurrentMonth(selectedMonth, selectedYear);

  const goToPrevious = () => {
    if (selectedMonth === 0) {
      onPrevious(11, selectedYear - 1);
    } else {
      onPrevious(selectedMonth - 1, selectedYear);
    }
  };

  const goToNext = () => {
    if (isCurrent) {
      alert("Vous êtes déjà sur le mois en cours");
      return;
    }

    if (selectedMonth === 11) {
      onNext(0, selectedYear + 1);
    } else {
      onNext(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </h2>
          {isCurrent ? (
            <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              📅 Mois en cours
            </span>
          ) : (
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              📚 Historique
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={goToPrevious}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
          >
            ← Précédent
          </button>
          {!isCurrent && (
            <button
              onClick={onCurrent}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
            >
              📅 Actuel
            </button>
          )}
          <button
            onClick={goToNext}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:opacity-50"
            disabled={isCurrent}
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;
