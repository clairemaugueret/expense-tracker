// client/src/hooks/usePersonalDebts.js
import { useState, useEffect } from "react";
import { personalDebtsAPI, reimbursementsAPI } from "../utils/api";

export const usePersonalDebts = () => {
  const [personalDebts, setPersonalDebts] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    setLoading(true);
    setError("");
    try {
      const [debtsRes, reimbursementsRes] = await Promise.all([
        personalDebtsAPI.getAll(),
        reimbursementsAPI.getAll(),
      ]);

      if (debtsRes.success) setPersonalDebts(debtsRes.data);
      if (reimbursementsRes.success) setReimbursements(reimbursementsRes.data);
    } catch (err) {
      setError("Erreur de chargement des dettes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPersonalDebt = async (debtData) => {
    try {
      const response = await personalDebtsAPI.create(debtData);
      if (response.success) {
        await loadDebts();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors de l'ajout" };
    }
  };

  const markDebtAsPaid = async (id) => {
    try {
      const response = await personalDebtsAPI.markPaid(id);
      if (response.success) {
        await loadDebts();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors du marquage" };
    }
  };

  const addReimbursement = async (reimbursementData) => {
    try {
      const response = await reimbursementsAPI.create(reimbursementData);
      if (response.success) {
        await loadDebts();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Erreur lors du remboursement" };
    }
  };

  return {
    personalDebts,
    reimbursements,
    loading,
    error,
    addPersonalDebt,
    markDebtAsPaid,
    addReimbursement,
    refreshDebts: loadDebts,
  };
};
