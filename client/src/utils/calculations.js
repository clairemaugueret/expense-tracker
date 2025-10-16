// client/src/utils/calculations.js

/**
 * Calcule la balance entre deux utilisateurs pour une période donnée
 * MODIFIÉ : inclut les avances du mois en cours + avances précédentes non payées
 */
export const calculateBalance = (
  expenses,
  users,
  selectedMonth,
  selectedYear,
  personalDebts = [],
  reimbursements = []
) => {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  const monthlyExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });

  const monthlyReimbursements = reimbursements.filter((reimb) => {
    const reimbDate = new Date(reimb.date);
    return reimbDate >= startDate && reimbDate <= endDate;
  });

  // MODIFICATION ICI : Filtrer les avances pour inclure :
  // - Les avances du mois en cours (payées ou non)
  // - Les avances des mois précédents NON PAYÉES uniquement
  const monthlyUnpaidDebts = personalDebts.filter((debt) => {
    const debtDate = new Date(debt.date);
    const isCurrentMonth = debtDate >= startDate && debtDate <= endDate;
    const isPreviousMonth = debtDate < startDate;

    // Inclure si : (mois actuel) OU (mois précédent ET non payé)
    return isCurrentMonth || (isPreviousMonth && !debt.isPaid);
  });

  const user1Name = users[0] || "";
  const user2Name = users[1] || "";

  const person1Total = monthlyExpenses
    .filter((exp) => exp.paidBy === user1Name)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const person2Total = monthlyExpenses
    .filter((exp) => exp.paidBy === user2Name)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const reimbursementAdjustment = monthlyReimbursements.reduce((sum, reimb) => {
    if (reimb.from === user1Name) return sum - reimb.amount;
    if (reimb.from === user2Name) return sum + reimb.amount;
    return sum;
  }, 0);

  const debtAdjustment = monthlyUnpaidDebts.reduce((sum, debt) => {
    if (debt.owedBy === user1Name) return sum - debt.amount;
    if (debt.owedBy === user2Name) return sum + debt.amount;
    return sum;
  }, 0);

  const totalExpenses = person1Total + person2Total;
  const halfExpenses = totalExpenses / 2;
  const difference =
    person1Total - halfExpenses + reimbursementAdjustment + debtAdjustment;

  const owedBy = difference > 0 ? user2Name : user1Name;
  const owedTo = difference > 0 ? user1Name : user2Name;

  return {
    person1Total,
    person2Total,
    totalExpenses,
    owedAmount: Math.abs(difference),
    owedBy,
    owedTo,
    user1: user1Name,
    user2: user2Name,
  };
};

/**
 * Calcule les dettes personnelles entre les utilisateurs
 * MODIFIÉ : filtre selon le mois sélectionné
 */
export const calculatePersonalDebts = (
  personalDebts,
  users,
  selectedMonth,
  selectedYear
) => {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  // Filtrer pour inclure :
  // - Les avances du mois en cours (payées ou non)
  // - Les avances des mois précédents NON PAYÉES uniquement
  const relevantDebts = personalDebts.filter((debt) => {
    const debtDate = new Date(debt.date);
    const isCurrentMonth = debtDate >= startDate && debtDate <= endDate;
    const isPreviousMonth = debtDate < startDate;

    return isCurrentMonth || (isPreviousMonth && !debt.isPaid);
  });

  const user1Name = users[0] || "";
  const user2Name = users[1] || "";

  const person1Owes = relevantDebts
    .filter((debt) => debt.owedBy === user1Name && !debt.isPaid)
    .reduce((sum, debt) => sum + debt.amount, 0);

  const person2Owes = relevantDebts
    .filter((debt) => debt.owedBy === user2Name && !debt.isPaid)
    .reduce((sum, debt) => sum + debt.amount, 0);

  return { person1Owes, person2Owes };
};

/**
 * Regroupe les dépenses par catégorie pour une période donnée
 */
export const getExpensesByCategory = (
  expenses,
  selectedMonth,
  selectedYear
) => {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  const monthlyExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });

  const categoryTotals = {};
  monthlyExpenses.forEach((exp) => {
    const cat = exp.category || "Autre";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
  });

  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));
};

/**
 * Nouvelle fonction utilitaire pour filtrer les avances à afficher
 */
export const filterPersonalDebtsForDisplay = (
  personalDebts,
  selectedMonth,
  selectedYear,
  isPaid = false
) => {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  return personalDebts.filter((debt) => {
    if (debt.isPaid !== isPaid) return false;

    const debtDate = new Date(debt.date);
    const isCurrentMonth = debtDate >= startDate && debtDate <= endDate;
    const isPreviousMonth = debtDate < startDate;

    if (isPaid) {
      // Pour les avances remboursées : seulement celles du mois en cours
      return isCurrentMonth;
    } else {
      // Pour les avances non remboursées : mois actuel OU mois précédents
      return isCurrentMonth || isPreviousMonth;
    }
  });
};
