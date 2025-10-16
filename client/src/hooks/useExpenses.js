// client/src/hooks/useExpenses.js
import { useState, useEffect } from "react";
import { expensesAPI, recurringAPI } from "../utils/api";
import { getMonthDateRange } from "../utils/dateUtils";

export const useExpenses = (selectedMonth, selectedYear) => {
  const [expenses, setExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chargement initial des dépenses
  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const loadExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const { startDate, endDate } = getMonthDateRange(
        selectedMonth,
        selectedYear
      );

      const [expensesRes, recurringRes] = await Promise.all([
        expensesAPI.getAll({ startDate, endDate }),
        recurringAPI.getAll(),
      ]);

      if (expensesRes.success) setExpenses(expensesRes.data);
      if (recurringRes.success) setRecurringExpenses(recurringRes.data);
    } catch (err) {
      setError("Erreur de chargement des dépenses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await expensesAPI.create(expenseData);
      if (response.success) {
        await loadExpenses();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors de l'ajout" };
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await expensesAPI.delete(id);
      if (response.success) {
        await loadExpenses();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors de la suppression" };
    }
  };

  const updateRecurringExpense = async (id, data) => {
    try {
      const response = await recurringAPI.update(id, data);
      if (response.success) {
        await loadExpenses();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }
  };

  const deleteRecurringExpense = async (id) => {
    try {
      const response = await recurringAPI.delete(id);
      if (response.success) {
        await loadExpenses();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors de la suppression" };
    }
  };

  return {
    expenses,
    recurringExpenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    refreshExpenses: loadExpenses,
  };
};
