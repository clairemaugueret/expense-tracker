// client/src/components/ExpenseTracker/ExpenseTracker.jsx
import React, { useState, useEffect } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { usePersonalDebts } from "../../hooks/usePersonalDebts";
import {
  calculateBalance,
  calculatePersonalDebts,
  getExpensesByCategory,
} from "../../utils/calculations";

// Import des composants
import MonthSelector from "./common/MonthSelector";
import NavigationTabs from "./common/NavigationTabs";
import DashboardView from "./views/DashboardView";
import AddExpenseView from "./views/AddExpenseView";
import ExpenseListView from "./views/ExpenseListView";
import PartnerDetailsView from "./views/PartnerDetailsView";
import RecurringExpensesView from "./views/RecurringExpensesView";
import PersonalDebtView from "./views/PersonalDebtView";
import ReimbursementView from "./views/ReimbursementView";

const ExpenseTracker = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Custom hooks pour gérer les données
  const {
    expenses,
    recurringExpenses,
    loading: expensesLoading,
    error: expensesError,
    addExpense,
    deleteExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useExpenses(selectedMonth, selectedYear);

  const {
    personalDebts,
    reimbursements,
    loading: debtsLoading,
    error: debtsError,
    addPersonalDebt,
    markDebtAsPaid,
    addReimbursement,
  } = usePersonalDebts();

  // Chargement des utilisateurs depuis localStorage
  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(localUsers);
  }, []);

  // Calculs des données pour le dashboard
  const balance = calculateBalance(
    expenses,
    users,
    selectedMonth,
    selectedYear,
    personalDebts,
    reimbursements
  );
  const personalDebtsBalance = calculatePersonalDebts(
    personalDebts,
    users,
    selectedMonth,
    selectedYear
  );
  const categoryData = getExpensesByCategory(
    expenses,
    selectedMonth,
    selectedYear
  );

  // Gestion de la navigation du mois
  const handlePreviousMonth = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleNextMonth = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  };

  // Affichage des erreurs
  if (expensesError || debtsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>{expensesError || debtsError}</p>
        </div>
      </div>
    );
  }

  // Affichage du chargement
  if (expensesLoading || debtsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {/* En-tête avec bouton de déconnexion */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              💰 Suivi des dépenses
            </h1>
            <p className="text-gray-600 font-semibold italic">
              Connecté(e) en tant que {user}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Sélecteur de mois */}
      <div className="max-w-7xl mx-auto px-4">
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          onCurrent={handleCurrentMonth}
        />
      </div>

      {/* Navigation entre les vues */}
      <NavigationTabs activeView={view} onViewChange={setView} />

      {/* Contenu principal selon la vue active */}
      <div className="max-w-7xl mx-auto px-4">
        {view === "dashboard" && (
          <DashboardView
            balance={balance}
            personalDebtsBalance={personalDebtsBalance}
            categoryData={categoryData}
          />
        )}

        {view === "add" && (
          <AddExpenseView
            users={users}
            currentUser={user}
            onSubmit={addExpense}
          />
        )}

        {view === "list" && (
          <ExpenseListView
            expenses={expenses}
            currentUser={user}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDelete={deleteExpense}
          />
        )}

        {view === "details" && (
          <PartnerDetailsView
            expenses={expenses}
            currentUser={user}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        )}

        {view === "recurring" && (
          <RecurringExpensesView
            recurringExpenses={recurringExpenses}
            onUpdate={updateRecurringExpense}
            onDelete={deleteRecurringExpense}
          />
        )}

        {view === "personalDebt" && (
          <PersonalDebtView
            users={users}
            personalDebts={personalDebts}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSubmit={addPersonalDebt}
            onMarkPaid={markDebtAsPaid}
          />
        )}

        {view === "reimburse" && (
          <ReimbursementView
            users={users}
            reimbursements={reimbursements}
            onSubmit={addReimbursement}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
