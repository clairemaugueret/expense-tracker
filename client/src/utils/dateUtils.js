// client/src/utils/dateUtils.js
import { MONTH_NAMES } from "./constants";

/**
 * Obtient la date actuelle au format ISO (YYYY-MM-DD)
 */
export const getTodayISO = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Vérifie si la date sélectionnée est le mois en cours
 */
export const isCurrentMonth = (selectedMonth, selectedYear) => {
  const now = new Date();
  return selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
};

/**
 * Obtient les dates de début et fin d'un mois
 */
export const getMonthDateRange = (selectedMonth, selectedYear) => {
  const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
  const endDate = new Date(
    selectedYear,
    selectedMonth + 1,
    0,
    23,
    59,
    59
  ).toISOString();

  return { startDate, endDate };
};

/**
 * Filtre les dépenses d'un mois donné
 */
export const filterExpensesByMonth = (
  expenses,
  selectedMonth,
  selectedYear
) => {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });
};

/**
 * Exporte les dépenses au format CSV
 */
export const exportToCSV = (expenses, user, selectedMonth, selectedYear) => {
  const csvContent = [
    [
      "Date",
      "Description",
      "Montant",
      "Payé par",
      "Catégorie",
      "Méthode",
      "Compte",
    ].join(","),
    ...expenses.map((exp) =>
      [
        new Date(exp.date).toLocaleDateString("fr-FR"),
        exp.description,
        exp.amount,
        exp.paidBy,
        exp.category || "N/A",
        exp.paymentMethod || "-",
        exp.bankAccount || "-",
      ].join(",")
    ),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `depenses-${
    MONTH_NAMES[selectedMonth]
  }-${selectedYear}_${user}_export-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();
};
