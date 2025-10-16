// client/src/utils/calculations.js

/**
 * Calcule la balance entre deux utilisateurs pour une période donnée
 */
export const calculateBalance = (
  expenses,
  users,
  selectedMonth,
  selectedYear
) => {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  const monthlyExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });

  const user1Name = users[0] || "";
  const user2Name = users[1] || "";

  const person1Total = monthlyExpenses
    .filter((exp) => exp.paidBy === user1Name)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const person2Total = monthlyExpenses
    .filter((exp) => exp.paidBy === user2Name)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalExpenses = person1Total + person2Total;
  const difference = person1Total - person2Total;

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
 */
export const calculatePersonalDebts = (personalDebts, users) => {
  const unpaidDebts = personalDebts.filter((debt) => !debt.isPaid);
  const user1Name = users[0] || "";
  const user2Name = users[1] || "";

  const person1Owes = unpaidDebts
    .filter((debt) => debt.owedBy === user1Name)
    .reduce((sum, debt) => sum + debt.amount, 0);

  const person2Owes = unpaidDebts
    .filter((debt) => debt.owedBy === user2Name)
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
