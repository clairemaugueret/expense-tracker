// client/src/components/ExpenseTracker/common/NavigationTabs.jsx
import React from "react";

const NavigationTabs = ({ activeView, onViewChange }) => {
  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "add", label: "➕ Ajouter" },
    { id: "list", label: "📋 Mes dépenses" },
    { id: "details", label: "🔍 Partenaire" },
    { id: "recurring", label: "🔄 Récurrentes" },
    { id: "personalDebt", label: "💳 Avances" },
    { id: "reimburse", label: "💸 Rembourser" },
  ];

  const getTabClasses = (tabId) => {
    const baseClasses =
      "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition";
    const activeClasses =
      "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg";
    const inactiveClasses = "bg-white text-gray-700 hover:bg-gray-50";

    return `${baseClasses} ${
      activeView === tabId ? activeClasses : inactiveClasses
    }`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={getTabClasses(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;
