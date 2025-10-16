// server/src/jobs/recurringExpenses.js
import cron from "node-cron";
import RecurringExpense from "../models/RecurringExpense.js";
import Expense from "../models/Expense.js";

const getNextDate = (lastDate, recurrence) => {
  const date = new Date(lastDate);

  switch (recurrence) {
    case "hebdomadaire":
      date.setDate(date.getDate() + 7);
      break;
    case "mensuelle":
      date.setMonth(date.getMonth() + 1);
      break;
    case "trimestrielle":
      date.setMonth(date.getMonth() + 3);
      break;
    case "annuelle":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
};

export const startRecurringExpensesJob = () => {
  // Exécuter tous les jours à minuit
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Génération des dépenses récurrentes...");

    try {
      const recurringExpenses = await RecurringExpense.find({ isActive: true });
      const today = new Date();

      for (const recurring of recurringExpenses) {
        const lastGenerated = recurring.lastGenerated || recurring.startDate;
        const nextDate = getNextDate(lastGenerated, recurring.recurrence);

        // Si la prochaine date est passée, créer la dépense
        if (nextDate <= today) {
          await Expense.create({
            amount: recurring.amount,
            date: nextDate,
            paidBy: recurring.paidBy || "Inconnu",
            description: recurring.description,
            paymentMethod: recurring.paymentMethod,
            bankAccount: recurring.bankAccount,
            category: recurring.category,
            isRecurring: true,
            recurringId: recurring._id,
            addedBy: recurring.paidBy || "Inconnu",
          });

          // Mettre à jour la date de dernière génération
          recurring.lastGenerated = nextDate;
          await recurring.save();

          console.log(
            `✅ Dépense récurrente générée: ${recurring.description}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Erreur génération dépenses récurrentes:", error);
    }
  });

  console.log("✅ Job dépenses récurrentes démarré");
};
